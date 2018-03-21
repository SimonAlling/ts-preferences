import { PreferenceData, Preference, ParseResult, FromString } from "./Preference";
import { fromMaybe } from "../Utilities";

export type StringPreferenceData = PreferenceData<string> & {
    multiline: boolean
    maxLength?: number
}

export class StringPreference extends Preference<string> implements FromString<string> {
    static REGEX_LINE_BREAKS = /\n+/g;
    readonly multiline: boolean;
    readonly maxLength: number;

    constructor(data: StringPreferenceData) {
        super(data);
        const maxLength = data.maxLength;
        if (fromMaybe(Infinity, maxLength) < 0) {
            throw new Error(`maxLength cannot be negative, but it was ${JSON.stringify(data.maxLength)} for ${this.getType()} '${data.key}'`);
        }
        this.multiline = data.multiline;
        this.maxLength = fromMaybe(Infinity, maxLength);
    }

    isValidValue(data: StringPreferenceData, value: string): boolean {
        return (
            super.isValidValue(data, value)
            &&
            value.length <= fromMaybe(Infinity, data.maxLength)
            &&
            (data.multiline || !value.includes("\n"))
        );
    }

    fromInvalid(s: string): string {
        const truncated = s.substring(0, this.maxLength);
        return this.multiline
            ? truncated
            : truncated.replace(StringPreference.REGEX_LINE_BREAKS, " ");
    }

    fromString(s: string): ParseResult<string> {
        return (
            s.length > this.maxLength ? `Max length ${this.maxLength} exceeded.`
            :
            !this.multiline && s.includes("\n") ? `Line breaks are not allowed.`
            :
            { value: s }
        );
    }
}
