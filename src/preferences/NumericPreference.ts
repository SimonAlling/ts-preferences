import { isString } from "ts-type-guards";
import { PreferenceData, Preference, FromString } from "./Preference";
import { ValueOrError } from "../Utilities";

export abstract class NumericPreference extends Preference<number> implements FromString<number> {
    constructor(data: PreferenceData<number>) {
        super(data);
    }

    protected static postParse(p: NumericPreference, parsed: ValueOrError<number>): ValueOrError<number> {
        return isString(parsed)
            ? parsed
            : p.validate(parsed.value);
    }

    abstract fromString(s: string): ValueOrError<number>
}
