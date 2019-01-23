export type ValueOrError<T> = { value: T } | string;

export type Maybe<A> = A | undefined;

export function assertUnreachable(x: never): never {
    throw new Error("assertUnreachable: " + x);
}

export function fromMaybe<T>(fallback: T, x: Maybe<T>): T {
    return x === undefined ? fallback : x;
}

// Stringify special numbers in a readable way:
function replacer(key: string, value: any): any {
    switch (true) {
        case Number.isNaN(value): return "NaN";
        case value === Infinity: return "Infinity";
        case value === -Infinity: return "-Infinity";
        default: return value;
    }
}

export function stringify(x: any): string {
    return JSON.stringify(x, replacer);
}
