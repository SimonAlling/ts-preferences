import { PreferenceData, Preference } from "./Preference";

export interface MultichoicePreferenceOption<T> {
    value: T,
    label: string,
}

export type MultichoicePreferenceData<T> = PreferenceData<T> & {
    options: MultichoicePreferenceOption<T>[],
}

export class MultichoicePreference<T> extends Preference<T> {
    readonly options: MultichoicePreferenceOption<T>[];

    constructor(data: MultichoicePreferenceData<T>) {
        super(data);
        if (data.options.length < 2) {
            throw new Error(`options must contain at least two elements, but this was not the case for ${this.getType()} '${data.key}'.`);
        }
        this.options = data.options;
    }

    isValidValue(data: MultichoicePreferenceData<T>, value: T): boolean {
        return data.options.some(o => o.value === value);
    }

    fromInvalid(value: T): T {
        return this.default;
    }
}
