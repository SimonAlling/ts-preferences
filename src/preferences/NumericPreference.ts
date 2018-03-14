import { PreferenceData, Preference, FromString, ParseResult } from "./Preference";

export abstract class NumericPreference extends Preference<number> implements FromString<number> {
    constructor(data: PreferenceData<number>) {
        super(data);
    }

    abstract fromString(s: string): ParseResult<number>
}
