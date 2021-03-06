import { ValueOrError } from "../Utilities";

import { NumericPreference } from "./NumericPreference";

export class DoublePreference extends NumericPreference {
    public getClassName() { return "DoublePreference"; }

    public static parse(s: string): ValueOrError<number> {
        const parsed = parseFloat(s);
        return (
            Number.isNaN(parsed)
            ? `"${s}" is not a number.`
            : { value: parsed }
        );
    }

    public fromString(s: string): ValueOrError<number> {
        return NumericPreference.postParse(this, DoublePreference.parse(s));
    }
}
