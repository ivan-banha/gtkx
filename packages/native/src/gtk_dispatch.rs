//! Dispatching operations to the GTK thread.
//!
//! This module provides a cross-thread queue for dispatching operations from
//! the JS thread to the GTK thread.
//!
//! Two paths exist:
//! - Normal: `schedule()` uses `glib::idle_add_once` to let the GLib main loop process callbacks
//! - Re-entrant: `dispatch_pending()` processes queued callbacks synchronously when the GTK
//!   thread is blocked waiting for a JS callback result

use std::collections::VecDeque;
use std::sync::Mutex;
use std::sync::atomic::{AtomicBool, AtomicUsize, Ordering};

use gtk4::glib;

type Task = Box<dyn FnOnce() + Send + 'static>;

struct DispatchQueue {
    tasks: Mutex<VecDeque<Task>>,
    dispatch_scheduled: AtomicBool,
}

impl DispatchQueue {
    const fn new() -> Self {
        Self {
            tasks: Mutex::new(VecDeque::new()),
            dispatch_scheduled: AtomicBool::new(false),
        }
    }

    fn push(&self, task: Task) {
        self.tasks.lock().unwrap().push_back(task);
    }

    fn pop(&self) -> Option<Task> {
        self.tasks.lock().unwrap().pop_front()
    }

    fn is_empty(&self) -> bool {
        self.tasks.lock().unwrap().is_empty()
    }
}

static QUEUE: DispatchQueue = DispatchQueue::new();

static JS_WAIT_DEPTH: AtomicUsize = AtomicUsize::new(0);

/// Returns whether the JS thread is currently waiting for a GTK dispatch result.
///
/// When true, signal handlers should use `js_dispatch::queue()` for synchronous
/// processing. When false, they should use the Neon channel for async processing.
pub fn is_js_waiting() -> bool {
    JS_WAIT_DEPTH.load(Ordering::Acquire) > 0
}

/// Increments the JS wait depth counter.
///
/// Called when entering the wait loop in call.rs. Supports nested calls.
pub fn enter_js_wait() {
    JS_WAIT_DEPTH.fetch_add(1, Ordering::AcqRel);
}

/// Decrements the JS wait depth counter.
///
/// Called when exiting the wait loop in call.rs. Supports nested calls.
pub fn exit_js_wait() {
    JS_WAIT_DEPTH.fetch_sub(1, Ordering::AcqRel);
}

/// Schedules a task to be executed on the GTK thread.
///
/// The task is added to a queue and will be dispatched either:
/// 1. By the GTK main loop via an idle source (normal path)
/// 2. By `dispatch_pending()` during signal handling (re-entrant path)
pub fn schedule<F>(task: F)
where
    F: FnOnce() + Send + 'static,
{
    QUEUE.push(Box::new(task));

    if QUEUE
        .dispatch_scheduled
        .compare_exchange(false, true, Ordering::AcqRel, Ordering::Acquire)
        .is_ok()
    {
        glib::idle_add_once(dispatch_batch);
    }
}

fn dispatch_batch() {
    QUEUE.dispatch_scheduled.store(false, Ordering::Release);

    while let Some(task) = QUEUE.pop() {
        task();
    }

    if !QUEUE.is_empty()
        && QUEUE
            .dispatch_scheduled
            .compare_exchange(false, true, Ordering::AcqRel, Ordering::Acquire)
            .is_ok()
    {
        glib::idle_add_once(dispatch_batch);
    }
}

/// Dispatches all pending tasks without processing other GTK events.
///
/// This is called from the GTK thread's wait loop to process tasks that
/// were scheduled by JS during signal handling, without triggering the full
/// GTK main loop iteration.
///
/// Returns `true` if any tasks were dispatched.
pub fn dispatch_pending() -> bool {
    let mut dispatched = false;

    while let Some(task) = QUEUE.pop() {
        task();
        dispatched = true;
    }

    dispatched
}
