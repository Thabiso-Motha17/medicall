/** Sum-type for service results — keeps callers honest about errors. */
export type Result<T, E = Error> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: E;
};
export declare const Ok: <T>(value: T) => Result<T, never>;
export declare const Err: <E>(error: E) => Result<never, E>;
