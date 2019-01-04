import { isString } from "ts-type-guards";
import { AllowedTypes } from "ts-storage";
export { AllowedTypes } from "ts-storage";

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
    dependencies?: Dependency<any>[]
    extras?: { readonly [key: string]: any }
}

export interface Constraint<T> {
    requirement: (value: T) => boolean
    message: (value: T) => string
}

export interface Dependency<T extends AllowedTypes> {
    preference: Preference<T>
    condition: (value: T) => boolean
}

export interface FromString<T> {
    fromString: (s: string) => ValueOrError<T>
}

export function prependConstraints<T>(cs: Constraint<T>[], data: PreferenceData<T>): void {
    data.constraints = cs.concat(fromMaybe([], data.constraints));
}

export abstract class Preference<T extends AllowedTypes> {
    // Because class names may be mangled during minification, they have to be
    // explicitly defined in each subclass using this method:
    public abstract getClassName(): string;

    public readonly key: string;
    public readonly default: T;
    public readonly label: string;
    public readonly description: string;
    public readonly constraints: Constraint<T>[];
    public readonly dependencies: Dependency<any>[];
    public readonly extras: { readonly [key: string]: any };

    constructor(data: PreferenceData<T>) {
        if (data.key === "") {
            throw new TypeError(`Empty preference key in this ${this.getClassName()}:\n${stringify(data)}`);
        }
        this.key = data.key;
        this.default = data.default;
        this.label = data.label;
        this.description = fromMaybe("", data.description);
        this.constraints = fromMaybe([], data.constraints);
        this.dependencies = fromMaybe([], data.dependencies);
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

    public toValid(value: T): T {
        return isString(this.validate(value)) ? this.default : value;
    }

    public toString(): string {
        return `${this.getClassName()} '${this.key}'`;
    }

    private invalidValue(value: T, message: string): void {
        throw new Error(`${stringify(value)} is not a valid value for ${this}. Reason: ${message}`);
    }
}
