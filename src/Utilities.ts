export function isInt(x: number): boolean {
    return x % 1 === 0;
}

export function assertUnreachable(x: never): never {
    throw new Error("assertUnreachable: " + x);
}
