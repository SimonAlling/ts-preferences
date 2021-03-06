import { ValueOrError } from "../Utilities";

import { IntegerPreference } from "./IntegerPreference";
import { NumericPreference } from "./NumericPreference";
import { Constraint, prependConstraints } from "./Preference";
import { RangePreference, RangePreferenceData } from "./RangePreference";

export class IntegerRangePreference extends RangePreference {
    public getClassName() { return "IntegerRangePreference"; }

    constructor(data: RangePreferenceData) {
        const CONSTRAINTS: Constraint<number>[] = [
            IntegerPreference.CONSTRAINT_INTEGER,
        ];
        prependConstraints(CONSTRAINTS, data);
        super(data);
        if (!Number.isInteger(data.min) || !Number.isInteger(data.max)) {
            throw new TypeError(`Parameters 'min' and 'max' must be integers, but they were ${data.min} and ${data.max} in ${this}.`);
        }
    }

    public toValid(value: number): number {
        return super.toValid(Math.round(value));
    }

    public fromString(s: string): ValueOrError<number> {
        return NumericPreference.postParse(this, IntegerPreference.parse(s));
    }
}
