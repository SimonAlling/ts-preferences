import { isString } from "ts-type-guards";
import { NumericPreference } from "./NumericPreference";
import { DoublePreference } from "./DoublePreference";
import { RangePreferenceData, RangePreference } from "./RangePreference";
import { ValueOrError } from "../Utilities";

export class DoubleRangePreference extends RangePreference {
    constructor(data: RangePreferenceData) {
        super(data);
    }

    fromString(s: string): ValueOrError<number> {
        return NumericPreference.postParse(this, DoublePreference.parse(s));
    }
}
