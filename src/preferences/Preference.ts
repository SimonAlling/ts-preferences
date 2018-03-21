import { fromMaybe } from "../Utilities";

export type PreferenceData<T> = {
    key: string
    default: T
    label: string
    description: string
    constraints?: Constraint<T>[]
    extras?: { readonly [key: string]: any }
}

export type Constraint<T> = {
    requirement: (value: T) => boolean
    message: string
}

export type AllowedTypes = boolean | number | string

export type ParseResult<T> = { value: T } | string

export interface FromString<T> {
    fromString: (s: string) => ParseResult<T>
}

export abstract class Preference<T extends AllowedTypes> {
    readonly data: PreferenceData<T>;
    readonly key: string;
    readonly default: T;
    readonly label: string;
    readonly description: string;
    readonly constraints: Constraint<T>[];
    readonly extras: { readonly [key: string]: any };

    constructor(data: PreferenceData<T>) {
        if (data.key === "") {
            throw new TypeError(`A preference key cannot be the empty string, but this was the case for this preference data:\n${JSON.stringify(data)}`);
        }
        this.data = data;
        this.key = data.key;
        this.default = data.default;
        this.label = data.label;
        this.description = data.description;
        this.constraints = fromMaybe([], data.constraints);
        this.extras = data.extras || {};
        if (!this.isValidValue(data, data.default)) {
            this.invalidValue(data.default);
        }
    }

    // All type-correct values are valid by default; specialized preference types may need a more specific implementation:
    isValidValue(data: PreferenceData<T>, value: T): boolean {
        return fromMaybe([], data.constraints).every(constraint =>
            constraint.requirement(value)
        );
    }

    // Identity function by default; specialized preference types may need a more specific implementation:
    fromInvalid(value: T): T {
        return value;
    }

    invalidValue(value: T): void {
        throw new Error(`${JSON.stringify(value)} is not a valid value for ${this.getType()} '${this.key}'.`);
    }

    getType(): string {
        return this.constructor["name"];
    }
}
