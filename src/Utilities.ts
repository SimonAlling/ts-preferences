export function isInt(x: number): boolean {
    return x % 1 === 0;
}

export function assertUnreachable(x: never): never {
    throw new Error("assertUnreachable: " + x);
}

export function fromMaybe<T>(fallback: T, x: T | undefined): T {
    return x === undefined ? fallback : x;
}
