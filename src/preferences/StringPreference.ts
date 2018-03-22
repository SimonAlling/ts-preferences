import { PreferenceData, Preference, FromString, Constraint, prependConstraints } from "./Preference";
import { fromMaybe, ValueOrError } from "../Utilities";

export type StringPreferenceData = PreferenceData<string> & {
    multiline: boolean
    maxLength?: number
}

export class StringPreference extends Preference<string> implements FromString<string> {
    static REGEX_LINE_BREAKS = /\n+/g;
    readonly multiline: boolean;
    readonly maxLength: number;

    constructor(data: StringPreferenceData) {
        const maxLength = fromMaybe(Infinity, data.maxLength);
        const CONSTRAINTS: Constraint<string>[] = [];
        if (!data.multiline) {
            CONSTRAINTS.push({
                requirement: v => !v.includes("\n"),
                message: v => `Line breaks are not allowed.`,
            });
        }
        if (maxLength < Infinity) {
            CONSTRAINTS.push({
                requirement: v => v.length < maxLength,
                message: v => `Max length ${maxLength} exceeded.`,
            });
        }
        prependConstraints(CONSTRAINTS, data);
        super(data);
        if (maxLength < 0) {
            throw new Error(`maxLength cannot be negative, but it was ${maxLength} for ${this.getType()} '${data.key}'`);
        }
        this.multiline = data.multiline;
        this.maxLength = maxLength;
    }

    fromInvalid(s: string): string {
        const truncated = s.substring(0, this.maxLength);
        return this.multiline
            ? truncated
            : truncated.replace(StringPreference.REGEX_LINE_BREAKS, " ");
    }

    fromString(s: string): ValueOrError<string> {
        return this.validate(s);
    }
}
