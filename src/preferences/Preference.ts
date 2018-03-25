import { isString } from "ts-type-guards";
import { fromMaybe, ValueOrError, stringify } from "../Utilities";

export type PreferenceData<T> = {
    key: string
    default: T
    label: string
    description?: string
    constraints?: Constraint<T>[]
    extras?: { readonly [key: string]: any }
}

export type Constraint<T> = {
    requirement: (value: T) => boolean
    message: (value: T) => string
}

export type AllowedTypes = boolean | number | string

export interface FromString<T> {
    fromString: (s: string) => ValueOrError<T>
}

export function prependConstraints<T>(cs: Constraint<T>[], data: PreferenceData<T>): void {
    data.constraints = cs.concat(fromMaybe([], data.constraints));
}

export abstract class Preference<T extends AllowedTypes> {
    readonly key: string;
    readonly default: T;
    readonly label: string;
    readonly description: string;
    readonly constraints: Constraint<T>[];
    readonly extras: { readonly [key: string]: any };

    constructor(data: PreferenceData<T>) {
        if (data.key === "") {
            throw new TypeError(`A preference key cannot be the empty string, but this was the case for this ${this.getType()} data:\n${stringify(data)}`);
        }
        this.key = data.key;
        this.default = data.default;
        this.label = data.label;
        this.description = fromMaybe("", data.description);
        this.constraints = fromMaybe([], data.constraints);
        this.extras = fromMaybe({}, data.extras);
        const validationResult = this.validate(data.default);
        if (isString(validationResult)) {
            this.invalidValue(data.default, validationResult);
        }
    }

    validate(value: T): ValueOrError<T> {
        const constraints = this.constraints;
        for (let i = 0, len = constraints.length; i < len; i++) {
            const constraint = constraints[i];
            if (!constraint.requirement(value)) {
                return constraint.message(value);
            }
        }
        return { value: value };
    }

    fromInvalid(value: T): T {
        return this.default;
    }

    invalidValue(value: T, message: string): void {
        throw new Error(`${stringify(value)} is not a valid value for ${this.asString()}. Reason: ${message}`);
    }

    getType(): string {
        return this.constructor.name;
    }

    protected asString(): string {
        return `${this.constructor.name} '${this.key}'`;
    }
}
