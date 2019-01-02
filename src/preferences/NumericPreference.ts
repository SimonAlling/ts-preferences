import { isString } from "ts-type-guards";

import {
    ValueOrError,
} from "../Utilities";

import {
    Constraint,
    FromString,
    Preference,
    PreferenceData,
    prependConstraints,
} from "./Preference";

export interface NumericPreferenceData extends PreferenceData<number> {}

export abstract class NumericPreference extends Preference<number> implements FromString<number> {
    protected static postParse(p: NumericPreference, parsed: ValueOrError<number>): ValueOrError<number> {
        return isString(parsed)
            ? parsed
            : p.validate(parsed.value);
    }

    constructor(data: NumericPreferenceData) {
        const CONSTRAINTS: Constraint<number>[] = [
            {
                requirement: Number.isFinite,
                message: v => `${v} is not a finite number.`,
            },
        ];
        prependConstraints(CONSTRAINTS, data);
        super(data);
    }

    public abstract fromString(s: string): ValueOrError<number>;
}
