import { PreferenceData, Preference, AllowedTypes, FromString, ParseResult } from "./Preference";

export type CustomPreferenceData<T> = PreferenceData<T> & {
    predicate: (value: T) => boolean
    parser: (s: string) => ParseResult<T>
}

export class CustomPreference<T extends AllowedTypes> extends Preference<T> implements FromString<T> {
    constructor(data: CustomPreferenceData<T>) {
        super(data);
        this.fromString = data.parser;
    }

    isValidValue(data: CustomPreferenceData<T>, value: T): boolean {
        return data.predicate(value);
    }

    fromInvalid(value: T): T {
        return this.default;
    }

    fromString(s: string): ParseResult<T> {
        throw `${this.getType()}: No parser.`; // overwritten in constructor
    }
}
