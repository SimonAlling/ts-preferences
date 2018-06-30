import { isString } from "ts-type-guards";

import { ValueOrError } from "../Utilities";

import {
    FromString,
    Preference,
} from "./Preference";

export abstract class NumericPreference extends Preference<number> implements FromString<number> {
    protected static postParse(p: NumericPreference, parsed: ValueOrError<number>): ValueOrError<number> {
        return isString(parsed)
            ? parsed
            : p.validate(parsed.value);
    }

    public abstract fromString(s: string): ValueOrError<number>;
}
