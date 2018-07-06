export type ValueOrError<T> = { value: T } | string;

export type Maybe<A> = A | undefined;

const SPECIAL_NUMBERS: { readonly [key: string]: number } = {
    "Infinity": Infinity,
    "-Infinity": -Infinity,
    "NaN": NaN,
};

export function assertUnreachable(x: never): never {
    throw new Error("assertUnreachable: " + x);
}

export function fromMaybe<T>(fallback: T, x: Maybe<T>): T {
    return x === undefined ? fallback : x;
}

function replacer(key: string, value: any): any {
    for (const representation in SPECIAL_NUMBERS) {
        const n = SPECIAL_NUMBERS[representation];
        if (value === n || Number.isNaN(value) && Number.isNaN(n)) {
            return representation;
        }
    }
    return value;
}

export function stringify(x: any): string {
    return JSON.stringify(x, replacer);
}
