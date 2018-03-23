export type ValueOrError<T> = { value: T } | string

export function assertUnreachable(x: never): never {
    throw new Error("assertUnreachable: " + x);
}

export function fromMaybe<T>(fallback: T, x: T | undefined): T {
    return x === undefined ? fallback : x;
}

function replacer(key: string, value: any): any {
    if (Number.isNaN(value)) {
        return "NaN";
    }
    switch (value) {
        case Infinity:
            return "Infinity";
        case -Infinity:
            return "-Infinity";
        default:
            return value;
    }
}

export function stringify(x: any): string {
    return JSON.stringify(x, replacer);
}
