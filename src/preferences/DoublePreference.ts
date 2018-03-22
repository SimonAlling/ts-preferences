import { PreferenceData, Constraint, prependConstraints } from "./Preference";
import { NumericPreference } from "./NumericPreference";
import { ValueOrError } from "../Utilities";

export class DoublePreference extends NumericPreference {
    constructor(data: PreferenceData<number>) {
        const CONSTRAINTS: Constraint<number>[] = [
            {
                requirement: Number.isFinite,
                message: v => `${v} is not a finite number.`,
            },
        ];
        prependConstraints(CONSTRAINTS, data);
        super(data);
    }

    static parse(s: string): ValueOrError<number> {
        const parsed = parseFloat(s);
        return Number.isNaN(parsed)
            ? `"${s}" is not a number.`
            : { value: parsed };
    }

    fromString(s: string): ValueOrError<number> {
        return NumericPreference.postParse(this, DoublePreference.parse(s));
    }
}
