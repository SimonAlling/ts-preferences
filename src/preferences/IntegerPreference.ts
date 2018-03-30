import { ValueOrError } from "../Utilities";

import { NumericPreference } from "./NumericPreference";
import {
    Constraint,
    PreferenceData,
    prependConstraints,
} from "./Preference";

export class IntegerPreference extends NumericPreference {
    public static parse(s: string): ValueOrError<number> {
        const parsed = parseInt(s, 10);
        return Number.isNaN(parsed)
            ? `"${s}" is not an integer.`
            : { value: parsed };
    }

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

    public fromString(s: string): ValueOrError<number> {
        return NumericPreference.postParse(this, IntegerPreference.parse(s));
    }
}
