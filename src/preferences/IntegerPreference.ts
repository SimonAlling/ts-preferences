import { ValueOrError } from "../Utilities";

import { NumericPreference, NumericPreferenceData } from "./NumericPreference";
import { Constraint, prependConstraints } from "./Preference";

export class IntegerPreference extends NumericPreference {
    public getClassName() { return "IntegerPreference"; }

    public static readonly CONSTRAINT_INTEGER: Constraint<number> = {
        requirement: Number.isInteger,
        message: v => `${v} is not an integer.`,
    };

    public static parse(s: string): ValueOrError<number> {
        const parsed = parseInt(s, 10);
        return (
            Number.isNaN(parsed)
            ? `"${s}" is not an integer.`
            : { value: parsed }
        );
    }

    constructor(data: NumericPreferenceData) {
        const CONSTRAINTS: Constraint<number>[] = [
            IntegerPreference.CONSTRAINT_INTEGER,
        ];
        prependConstraints(CONSTRAINTS, data);
        super(data);
    }

    public toValid(value: number): number {
        return super.toValid(Math.round(value));
    }

    public fromString(s: string): ValueOrError<number> {
        return NumericPreference.postParse(this, IntegerPreference.parse(s));
    }
}
