import { PreferenceData, ParseResult } from "./Preference";
import { NumericPreference } from "./NumericPreference";

export class DoublePreference extends NumericPreference {
    constructor(data: PreferenceData<number>) {
        super(data);
    }

    static parse(s: string): ParseResult<number> {
        const parsed = parseFloat(s);
        return Number.isNaN(parsed)
            ? `"${s}" is not a number.`
            : { value: parsed };
    }

    fromString(s: string): ParseResult<number> {
        return DoublePreference.parse(s);
    }
}
