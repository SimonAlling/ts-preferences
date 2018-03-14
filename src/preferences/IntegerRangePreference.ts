import { FromString, ParseResult } from "./Preference";
import { IntegerPreference } from "./IntegerPreference";
import { RangePreferenceData, RangePreference } from "./RangePreference";
import { isInt } from "../Utilities";

export class IntegerRangePreference extends RangePreference implements FromString<number> {
    constructor(data: RangePreferenceData) {
        super(data);
        if (!isInt(data.min) || !isInt(data.max)) {
            throw new TypeError(`min and max must be integers, but they were ${JSON.stringify(data.min)} and ${JSON.stringify(data.max)} for ${this.getType()} '${data.key}'.`);
        }
    }

    isValidValue(data: RangePreferenceData, value: number): boolean {
        return super.isValidValue(data, value) && isInt(value);
    }

    fromInvalid(value: number): number {
        return Math.round(super.fromInvalid(value));
    }

    fromString(s: string): ParseResult<number> {
        const parsed = IntegerPreference.parse(s);
        return RangePreference.postParse(parsed, this.min, this.max);
    }
}
