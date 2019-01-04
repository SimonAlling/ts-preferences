import { isString } from "ts-type-guards";

import { ValueOrError } from "../Utilities";

import { DoublePreference } from "./DoublePreference";
import { NumericPreference } from "./NumericPreference";
import { RangePreference } from "./RangePreference";

export class DoubleRangePreference extends RangePreference {
    public getClassName() { return "DoubleRangePreference"; }

    public fromString(s: string): ValueOrError<number> {
        return NumericPreference.postParse(this, DoublePreference.parse(s));
    }
}
