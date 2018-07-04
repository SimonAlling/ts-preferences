import { ValueOrError } from "../Utilities";

import { NumericPreference, NumericPreferenceData } from "./NumericPreference";
import {
    Constraint,
    PreferenceData,
    prependConstraints,
} from "./Preference";

export class IntegerPreference extends NumericPreference {
    public static readonly isInteger: (v: number) => boolean = v => Number.isInteger(v) || Math.abs(v) === Infinity;
    public static readonly CONSTRAINT_INTEGER: Constraint<number> = {
        requirement: IntegerPreference.isInteger,
        message: v => `${v} is not an integer.`,
    };

    public static parse(s: string): ValueOrError<number> {
        const parsed = parseInt(s, 10);
        return Number.isNaN(parsed)
            ? `"${s}" is not an integer.`
            : { value: parsed };
    }

    constructor(data: NumericPreferenceData) {
        const CONSTRAINTS: Constraint<number>[] = [
            IntegerPreference.CONSTRAINT_INTEGER,
        ];
        prependConstraints(CONSTRAINTS, data);
        super(data);
    }

    public fromString(s: string): ValueOrError<number> {
        return NumericPreference.postParse(this, IntegerPreference.parse(s));
    }
}
