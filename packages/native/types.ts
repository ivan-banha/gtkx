/** Integer type descriptor for FFI calls. */
type IntegerType = { type: "int"; size: 8 | 32 | 64; unsigned?: boolean };

/** Floating-point type descriptor for FFI calls. */
type FloatType = { type: "float"; size: 32 | 64 };

/** Boolean type descriptor for FFI calls. */
type BooleanType = { type: "boolean" };

/** String type descriptor for FFI calls. */
type StringType = { type: "string" };

/** GObject pointer type descriptor for FFI calls. */
type GObjectType = { type: "gobject"; borrowed?: boolean };

/** Boxed type descriptor for FFI calls. */
type BoxedType = { type: "boxed"; borrowed?: boolean; innerType: string; lib?: string };

/** Array type descriptor for FFI calls. */
type ArrayType = { type: "array"; itemType: Type };

/** Reference type descriptor for out/inout parameters. */
type RefType = { type: "ref"; innerType: Type };

/** Null type descriptor for FFI calls. */
type NullType = { type: "null" };

/** Undefined/void type descriptor for FFI calls. */
type UndefinedType = { type: "undefined" };

/** Callback type descriptor for signal handlers and callbacks. */
type CallbackType = { type: "callback"; argTypes?: Type[] };

/**
 * FFI type descriptor used to specify the type of arguments and return values
 * when calling native GTK functions via FFI.
 */
export type Type =
    | IntegerType
    | FloatType
    | BooleanType
    | StringType
    | GObjectType
    | BoxedType
    | ArrayType
    | RefType
    | CallbackType
    | NullType
    | UndefinedType;

/**
 * Argument descriptor for FFI calls, combining a type descriptor with a value.
 */
export type Arg = { type: Type; value: unknown };

/**
 * Reference wrapper for out/inout parameters in FFI calls.
 * The value property will be mutated by the native function.
 */
export type Ref<T> = { value: T };
