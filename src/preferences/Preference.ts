import { isString } from "ts-type-guards";

import {
    ValueOrError,
    fromMaybe,
    stringify,
} from "../Utilities";

export interface PreferenceData<T> {
    key: string
    default: T
    label: string
    description?: string
    constraints?: Constraint<T>[]
    extras?: { readonly [key: string]: any }
}

export interface Constraint<T> {
    requirement: (value: T) => boolean
    message: (value: T) => string
}

export type AllowedTypes = boolean | number | string;

export interface FromString<T> {
    fromString: (s: string) => ValueOrError<T>
}

export function prependConstraints<T>(cs: Constraint<T>[], data: PreferenceData<T>): void {
    data.constraints = cs.concat(fromMaybe([], data.constraints));
}

export abstract class Preference<T extends AllowedTypes> {
    public readonly key: string;
    public readonly default: T;
    public readonly label: string;
    public readonly description: string;
    public readonly constraints: Constraint<T>[];
    public readonly extras: { readonly [key: string]: any };

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

    public validate(value: T): ValueOrError<T> {
        const constraints = this.constraints;
        for (let i = 0, len = constraints.length; i < len; i++) {
            const constraint = constraints[i];
            if (!constraint.requirement(value)) {
                return constraint.message(value);
            }
        }
        return { value };
    }

    public fromInvalid(value: T): T {
        return this.default;
    }

    public getType(): string {
        return this.constructor.name;
    }

    protected asString(): string {
        return `${this.constructor.name} '${this.key}'`;
    }

    private invalidValue(value: T, message: string): void {
        throw new Error(`${stringify(value)} is not a valid value for ${this.asString()}. Reason: ${message}`);
    }
}
