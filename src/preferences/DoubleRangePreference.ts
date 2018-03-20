import { isString } from "ts-type-guards";
import { ParseResult } from "./Preference";
import { DoublePreference } from "./DoublePreference";
import { RangePreferenceData, RangePreference } from "./RangePreference";

export class DoubleRangePreference extends RangePreference {
    constructor(data: RangePreferenceData) {
        super(data);
    }

    fromString(s: string): ParseResult<number> {
        const parsed = DoublePreference.parse(s);
        return RangePreference.postParse(parsed, this.min, this.max);
    }
}
