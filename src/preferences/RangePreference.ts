import { PreferenceData } from "./Preference";
import { NumericPreference } from "./NumericPreference";

export type RangePreferenceData = PreferenceData<number> & {
    min: number
    max: number
}

export class RangePreference extends NumericPreference {
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
        return value >= data.min && value <= data.max;
    }

    fromInvalid(value: number): number {
        return Math.max(this.min, Math.min(this.max, value));
    }
}
