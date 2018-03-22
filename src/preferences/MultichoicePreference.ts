import { isString } from "ts-type-guards";
import { PreferenceData, Preference, AllowedTypes } from "./Preference";
import { ValueOrError } from "../Utilities";

export interface MultichoicePreferenceOption<T> {
    value: T,
    label: string,
}

export type MultichoicePreferenceData<T> = PreferenceData<T> & {
    options: MultichoicePreferenceOption<T>[],
}

export class MultichoicePreference<T extends AllowedTypes> extends Preference<T> {
    readonly options: MultichoicePreferenceOption<T>[];

    constructor(data: MultichoicePreferenceData<T>) {
        super(data);
        if (data.options.length < 2) {
            throw new Error(`options must contain at least two elements, but this was not the case for ${this.getType()} '${data.key}'.`);
        }
        const seenOptionValues: T[] = [];
        data.options.forEach(option => {
            // Check that options satisfy any user-provided constraints:
            const validationResult = super.validate(option.value);
            if (isString(validationResult)) {
                // super is used above because we should not use the specialized validation, which checks if the value is in the list of options.
                throw new Error(`Option value ${JSON.stringify(option.value)} (with label '${option.label}') in ${this.getType()} '${data.key}' is invalid. Reason: ${validationResult}`);
            }
            if (seenOptionValues.indexOf(option.value) > -1) {
                throw new Error(`Multiple options with value ${JSON.stringify(option.value)} in ${this.getType()} '${data.key}'.`);
            }
            seenOptionValues.push(option.value);
        });
        this.options = data.options;
    }

    validate(value: T): ValueOrError<T> {
        return (this.data as MultichoicePreferenceData<T>).options.some(option => option.value === value)
            ? { value: value }
            : `${JSON.stringify(value)} is not among the available options.`;
    }

    fromInvalid(value: T): T {
        return this.default;
    }
}
