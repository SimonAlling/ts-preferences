export type ValueOrError<T> = { value: T } | string

export function assertUnreachable(x: never): never {
    throw new Error("assertUnreachable: " + x);
}

export function fromMaybe<T>(fallback: T, x: T | undefined): T {
    return x === undefined ? fallback : x;
}
