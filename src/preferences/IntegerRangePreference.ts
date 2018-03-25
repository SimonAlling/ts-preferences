import { Constraint, prependConstraints } from "./Preference";
import { NumericPreference } from "./NumericPreference";
import { IntegerPreference } from "./IntegerPreference";
import { RangePreferenceData, RangePreference } from "./RangePreference";
import { ValueOrError } from "../Utilities";

export class IntegerRangePreference extends RangePreference {
    constructor(data: RangePreferenceData) {
        const CONSTRAINTS: Constraint<number>[] = [
            {
                requirement: Number.isInteger,
                message: v => `${v} is not an integer.`,
            },
        ];
        prependConstraints(CONSTRAINTS, data);
        super(data);
        if (!Number.isInteger(data.min) || !Number.isInteger(data.max)) {
            throw new TypeError(`Parameters 'min' and 'max' must be integers, but they were ${data.min} and ${data.max} for ${this.asString()}.`);
        }
    }

    fromInvalid(value: number): number {
        return super.fromInvalid(Math.round(value));
    }

    fromString(s: string): ValueOrError<number> {
        return NumericPreference.postParse(this, IntegerPreference.parse(s));
    }
}
