import { ValueOrError } from "../Utilities";

import { NumericPreference, NumericPreferenceData } from "./NumericPreference";
import {
    Constraint,
    FromString,
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
        if (!(Number.isFinite(min) && Number.isFinite(max))) {
            throw new Error(`Parameters 'min' and 'max' must be finite numbers, but they were ${min} and ${max} in ${this}.`);
        }
        if (min > max) {
            throw new Error(`Parameter 'min' cannot be greater than parameter 'max', but they were ${min} and ${max} in ${this}.`);
        }
        this.min = min;
        this.max = max;
    }

    public toValid(value: number): number {
        return super.toValid(Math.max(this.min, Math.min(this.max, value)));
    }

    public abstract fromString(s: string): ValueOrError<number>;
}
