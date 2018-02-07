import { PreferenceData, Preference } from "./Preference";

export type CustomPreferenceData<T> = PreferenceData<T> & {
    predicate: (value: T) => boolean
}

export class CustomPreference<T> extends Preference<T> {
    constructor(data: CustomPreferenceData<T>) {
        super(data);
    }

    isValidValue(data: CustomPreferenceData<T>, value: T): boolean {
        return data.predicate(value);
    }

    fromInvalid(value: T): T {
        return this.default;
    }
}
