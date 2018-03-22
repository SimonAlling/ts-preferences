import { PreferenceData, Constraint, prependConstraints } from "./Preference";
import { NumericPreference } from "./NumericPreference";
import { ValueOrError } from "../Utilities";

export class IntegerPreference extends NumericPreference {
    constructor(data: PreferenceData<number>) {
        const CONSTRAINTS: Constraint<number>[] = [
            {
                requirement: Number.isInteger,
                message: v => `${v} is not an integer.`,
            },
        ];
        prependConstraints(CONSTRAINTS, data);
        super(data);
    }

    static parse(s: string): ValueOrError<number> {
        const parsed = parseInt(s, 10);
        return Number.isNaN(parsed)
            ? `"${s}" is not an integer.`
            : { value: parsed };
    }

    fromString(s: string): ValueOrError<number> {
        return NumericPreference.postParse(this, IntegerPreference.parse(s));
    }
}
