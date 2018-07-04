import { isString } from "ts-type-guards";

import {
    ValueOrError,
    stringify,
} from "../Utilities";

import {
    AllowedTypes,
    Constraint,
    Preference,
    PreferenceData,
    prependConstraints,
} from "./Preference";

export interface MultichoicePreferenceOption<T> {
    value: T
    label: string
}

export interface MultichoicePreferenceData<T> extends PreferenceData<T> {
    options: MultichoicePreferenceOption<T>[]
}

export class MultichoicePreference<T extends AllowedTypes> extends Preference<T> {
    public readonly options: MultichoicePreferenceOption<T>[];

    constructor(data: MultichoicePreferenceData<T>) {
        const options = data.options;
        const CONSTRAINTS: Constraint<T>[] = [
            {
                requirement: v => options.some(o => o.value === v),
                message: v => `${stringify(v)} is not among the available options.`,
            },
        ];
        prependConstraints(CONSTRAINTS, data);
        super(data);
        if (options.length < 2) {
            throw new Error(`Parameter 'options' must contain at least two elements, but this was not the case for ${this.asString()}.`);
        }
        const seenOptionValues: T[] = [];
        options.forEach(option => {
            // Check that options satisfy any user-provided constraints:
            const validationResult = this.validate(option.value);
            if (isString(validationResult)) {
                // super is used above because we should not use the specialized validation, which checks if the value is in the list of options.
                throw new Error(`Option value ${stringify(option.value)} (with label '${option.label}') in ${this.asString()} is invalid. Reason: ${validationResult}`);
            }
            if (seenOptionValues.indexOf(option.value) > -1) {
                throw new Error(`Multiple options with value ${stringify(option.value)} in ${this.asString()}.`);
            }
            seenOptionValues.push(option.value);
        });
        this.options = options;
    }

    public toValid(value: T): T {
        return this.default;
    }
}
