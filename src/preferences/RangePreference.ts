import { PreferenceData, FromString, Constraint, prependConstraints } from "./Preference";
import { NumericPreference } from "./NumericPreference";
import { DoublePreference } from "./DoublePreference";
import { ValueOrError } from "../Utilities";

export type RangePreferenceData = PreferenceData<number> & {
    min: number
    max: number
}

export abstract class RangePreference extends NumericPreference implements FromString<number> {
    readonly min: number;
    readonly max: number;

    constructor(data: RangePreferenceData) {
        const min = data.min;
        const max = data.max;
        const CONSTRAINTS: Constraint<number>[] = [
            {
                requirement: Number.isFinite,
                message: v => `${v} is not a finite number.`,
            },
            {
                requirement: v => v >= min,
                message: v => `${v} is smaller than minimum value ${min}.`,
            },
            {
                requirement: v => v <= max,
                message: v => `${v} is greater than maximum value ${max}.`,
            },
        ];
        prependConstraints(CONSTRAINTS, data);
        super(data);
        if (!Number.isFinite(min) || !Number.isFinite(max)) {
            throw new Error(`Parameters 'min' and 'max' must be finite numbers, but they were ${min} and ${max}, respectively, for ${this.asString()}.`);
        }
        if (min > max) {
            throw new Error(`Parameter 'min' cannot be greater than parameter 'max', but they were ${min} and ${max}, respectively, for ${this.asString()}.`);
        }
        this.min = min;
        this.max = max;
    }

    fromInvalid(value: number): number {
        return Math.max(this.min, Math.min(this.max, value));
    }

    abstract fromString(s: string): ValueOrError<number>
}
