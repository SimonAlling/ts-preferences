import { PreferenceData, ParseResult } from "./Preference";
import { NumericPreference } from "./NumericPreference";
import { isInt } from "../Utilities";

export class IntegerPreference extends NumericPreference {
    constructor(data: PreferenceData<number>) {
        super(data);
    }

    isValidValue(data: PreferenceData<number>, value: number): boolean {
        return super.isValidValue(data, value) && isInt(value);
    }

    static parse(s: string): ParseResult<number> {
        const parsed = parseInt(s, 10);
        return Number.isNaN(parsed)
            ? `"${s}" is not an integer.`
            : { value: parsed };
    }

    fromString(s: string): ParseResult<number> {
        return IntegerPreference.parse(s);
    }
}
