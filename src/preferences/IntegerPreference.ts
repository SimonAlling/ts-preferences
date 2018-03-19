import { PreferenceData } from "./Preference";
import { NumericPreference } from "./NumericPreference";
import { isInt } from "../Utilities";

export class IntegerPreference extends NumericPreference {
    constructor(data: PreferenceData<number>) {
        super(data);
    }

    isValidValue(data: PreferenceData<number>, value: number): boolean {
        return isInt(value);
    }
}
