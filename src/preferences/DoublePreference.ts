import {
    ValueOrError,
} from "../Utilities";

import { NumericPreference } from "./NumericPreference";
import {
    Constraint,
    PreferenceData,
    prependConstraints,
} from "./Preference";

export class DoublePreference extends NumericPreference {
    public static parse(s: string): ValueOrError<number> {
        const parsed = parseFloat(s);
        return Number.isNaN(parsed)
            ? `"${s}" is not a number.`
            : { value: parsed };
    }

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

    public fromString(s: string): ValueOrError<number> {
        return NumericPreference.postParse(this, DoublePreference.parse(s));
    }
}
