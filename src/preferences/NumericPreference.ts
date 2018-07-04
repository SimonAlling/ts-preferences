import { isString } from "ts-type-guards";

import {
    ValueOrError,
    fromMaybe,
} from "../Utilities";

import {
    Constraint,
    FromString,
    Preference,
    PreferenceData,
    prependConstraints,
} from "./Preference";

export interface NumericPreferenceData extends PreferenceData<number> {
    infinite?: boolean
}

export abstract class NumericPreference extends Preference<number> implements FromString<number> {
    public readonly infinite: boolean;

    protected static postParse(p: NumericPreference, parsed: ValueOrError<number>): ValueOrError<number> {
        return isString(parsed)
            ? parsed
            : p.validate(parsed.value);
    }

    constructor(data: NumericPreferenceData) {
        const infinite = fromMaybe(false, data.infinite);
        const CONSTRAINTS: Constraint<number>[] = [
            infinite ? {
                requirement: v => !Number.isNaN(v),
                message: v => `${v} is not a number.`,
            } : {
                requirement: Number.isFinite,
                message: v => `${v} is not a finite number.`,
            },
        ];
        prependConstraints(CONSTRAINTS, data);
        super(data);
        this.infinite = infinite;
    }

    public abstract fromString(s: string): ValueOrError<number>;
}
