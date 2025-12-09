type FlushCallback = () => void;

const pendingFlushes = new Set<FlushCallback>();
let inCommit = false;

export const beginCommit = (): void => {
    inCommit = true;
};

export const endCommit = (): void => {
    inCommit = false;
    if (pendingFlushes.size > 0) {
        const callbacks = [...pendingFlushes];
        pendingFlushes.clear();
        queueMicrotask(() => {
            for (const callback of callbacks) {
                callback();
            }
        });
    }
};

export const scheduleFlush = (callback: FlushCallback): void => {
    if (inCommit) {
        pendingFlushes.add(callback);
    } else {
        callback();
    }
};
