import { isString } from "ts-type-guards";
import { PreferenceData, ParseResult, FromString } from "./Preference";
import { NumericPreference } from "./NumericPreference";
import { DoublePreference } from "./DoublePreference";

export type RangePreferenceData = PreferenceData<number> & {
    min: number
    max: number
}

export abstract class RangePreference extends NumericPreference implements FromString<number> {
    readonly min: number;
    readonly max: number;

    constructor(data: RangePreferenceData) {
        super(data);
        if (data.min > data.max) {
            throw new Error(`min cannot be greater than max, but they were ${JSON.stringify(data.min)} and ${JSON.stringify(data.max)}, respectively, for ${this.getType()} '${data.key}'.`);
        }
        this.min = data.min;
        this.max = data.max;
    }

    isValidValue(data: RangePreferenceData, value: number): boolean {
        return super.isValidValue(data, value) && value >= data.min && value <= data.max;
    }

    fromInvalid(value: number): number {
        return Math.max(this.min, Math.min(this.max, value));
    }

    static postParse(parsed: ParseResult<number>, min: number, max: number): ParseResult<number> {
        return (
            isString(parsed) ? parsed
            :
            parsed.value > max ? `${parsed.value} is greater than maximum value ${max}.`
            :
            parsed.value < min ? `${parsed.value} is smaller than minimum value ${min}.`
            :
            parsed
        );
    }

    abstract fromString(s: string): ParseResult<number>
}
