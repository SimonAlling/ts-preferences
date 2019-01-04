import { ValueOrError, fromMaybe } from "../Utilities";

import {
    Constraint,
    FromString,
    Preference,
    PreferenceData,
    prependConstraints,
} from "./Preference";

export interface StringPreferenceData extends PreferenceData<string> {
    multiline: boolean
    minLength?: number
    maxLength?: number
}

export class StringPreference extends Preference<string> implements FromString<string> {
    public getClassName() { return "StringPreference"; }

    protected static REGEX_LINE_BREAKS = /\n+/g;
    public readonly multiline: boolean;
    public readonly maxLength: number;
    public readonly minLength: number;

    constructor(data: StringPreferenceData) {
        const minLength = fromMaybe(0, data.minLength);
        const maxLength = fromMaybe(Infinity, data.maxLength);
        const CONSTRAINTS: Constraint<string>[] = [];
        if (!data.multiline) {
            CONSTRAINTS.push({
                requirement: v => !v.includes("\n"),
                message: v => `Line breaks are not allowed.`,
            });
        }
        if (minLength > 0) {
            CONSTRAINTS.push({
                requirement: v => v.length >= minLength,
                message: v => `Minimum length is ${minLength} characters.`,
            });
        }
        if (maxLength < Infinity) {
            CONSTRAINTS.push({
                requirement: v => v.length <= maxLength,
                message: v => `Maximum length ${maxLength} exceeded.`,
            });
        }
        prependConstraints(CONSTRAINTS, data);
        super(data);
        // One might think that we should check that minLength ≤ maxLength here.
        // But such a check would constitute dead code, because in that case,
        // there is no possible default value, so the super call will throw
        // before we get here. While we could perform the check before the super
        // call, it then would not be able to use `this` in its error message.
        if (minLength < 0) {
            throw new Error(`Parameter 'minLength' cannot be negative, but it was ${minLength} in ${this}.`);
        }
        this.multiline = data.multiline;
        this.maxLength = maxLength;
        this.minLength = minLength;
    }

    public toValid(s: string): string {
        const truncated = s.substring(0, this.maxLength);
        return super.toValid(
            this.multiline
            ? truncated
            : truncated.replace(StringPreference.REGEX_LINE_BREAKS, " ")
        );
    }

    public fromString(s: string): ValueOrError<string> {
        return this.validate(s);
    }
}
