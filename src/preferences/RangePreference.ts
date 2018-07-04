import { ValueOrError } from "../Utilities";

import { DoublePreference } from "./DoublePreference";
import { NumericPreference, NumericPreferenceData } from "./NumericPreference";
import {
    Constraint,
    FromString,
    PreferenceData,
    prependConstraints,
} from "./Preference";

export interface RangePreferenceData extends NumericPreferenceData {
    min: number
    max: number
}

export abstract class RangePreference extends NumericPreference implements FromString<number> {
    public readonly min: number;
    public readonly max: number;

    constructor(data: RangePreferenceData) {
        const min = data.min;
        const max = data.max;
        const CONSTRAINTS: Constraint<number>[] = [
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
        if (Number.isNaN(min) || Number.isNaN(max)) {
            throw new Error(`Parameters 'min' and 'max' cannot be NaN, but they were ${min} and ${max}, respectively, for ${this.asString()}.`);
        }
        if (!(this.infinite || Number.isFinite(min) && Number.isFinite(max))) {
            throw new Error(`Parameters 'min' and 'max' must be finite numbers (unless 'infinite' is true), but they were ${min} and ${max}, respectively, for ${this.asString()}.`);
        }
        if (min > max) {
            throw new Error(`Parameter 'min' cannot be greater than parameter 'max', but they were ${min} and ${max}, respectively, for ${this.asString()}.`);
        }
        this.min = min;
        this.max = max;
    }

    public toValid(value: number): number {
        return super.toValid(Math.max(this.min, Math.min(this.max, value)));
    }

    public abstract fromString(s: string): ValueOrError<number>;
}
