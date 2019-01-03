import {
    Status,
    PreferenceManager,
    Preference,
    BooleanPreference,
    DoublePreference,
    DoubleRangePreference,
    IntegerPreference,
    IntegerRangePreference,
    MultichoicePreference,
    NumericPreference,
    RangePreference,
    StringPreference,
    init,
    SIMPLE_RESPONSE_HANDLER,
} from "../src/index";

interface Expect extends jest.Matchers<void> {
    toSatisfy: (x: any) => boolean
    toNotSatisfy: (x: any) => boolean
    extend: (extensions: { [ k: string ]: any }) => void
    (x: any): Expect
}

declare const expect: Expect

beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
});

expect.extend({
  toSatisfy<T>(received: T, predicate: (x: T) => boolean) {
    if (predicate(received)) {
      return {
        message: () =>
          `expected ${JSON.stringify(received)} not to satisfy ${predicate.toString()}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${JSON.stringify(received)} to satisfy ${predicate.toString()}`,
        pass: false,
      };
    }
  },
});

const data_Boolean = {
    key: "insert_foobars",
    label: "Insert foobars",
    description: "Insert some foobars",
    default: true,
};

const data_Range = {
    key: "number_of_foobars",
    label: "Number of foobars",
    description: "Number of foobars to insert",
    min: 0,
    max: 100,
    default: 5,
};

const data_Numeric_Infinity = {
    key: "favorite_number",
    label: "Favorite number",
    description: "Your favorite number",
    default: Infinity,
};

const data_Range_Infinity = {
    key: "infinite_range",
    label: "Infinite range",
    description: "Infinite range",
    min: 0,
    max: Infinity,
    default: 5,
};

const pref_Boolean = new BooleanPreference(data_Boolean);

const P = {
    insert_foobars: new BooleanPreference(data_Boolean),
    number_of_foobars: new IntegerRangePreference(data_Range),
};

const PM = new PreferenceManager(P, "JEST-preference-");

const Preferences = init(P, "JEST", SIMPLE_RESPONSE_HANDLER);

it("can create a preference", () => {
    expect(pref_Boolean.key).toBe(data_Boolean.key);
    expect(pref_Boolean.label).toBe(data_Boolean.label);
    expect(pref_Boolean.description).toBe(data_Boolean.description);
    expect(pref_Boolean.default).toBe(data_Boolean.default);
});

it("can create a preference with a custom constraint", () => {
    const msg = "Only true is allowed.";
    expect(() => new BooleanPreference({
        key: "only_true",
        label: "Only true",
        description: "",
        default: false,
        constraints: [ { requirement: x => x, message: x => msg } ]
    })).toThrow(msg);
});

it("does not allow the empty string as key", () => {
    const msg = "Empty preference key";
    const data = { ...data_Boolean, key: "" };
    expect(() => new BooleanPreference(data)).toThrow(msg);
});

it("can save and read a preference value", () => {
    PM.set(P.number_of_foobars, 42);
    expect(PM.get(P.number_of_foobars)).toEqual({ value: 42, status: Status.OK });
});

it("produces correct string representations", () => {
    expect(pref_Boolean.getType()).toBe(BooleanPreference.name);
    expect(pref_Boolean.toString()).toBe(`${BooleanPreference.name} '${data_Boolean.key}'`);
});

it("throws on ±Infinity in a numeric preference", () => {
    const msg = "Infinity is not a finite number";
    expect(() => new IntegerPreference(data_Numeric_Infinity)).toThrow(msg);
    expect(() => new DoublePreference(data_Numeric_Infinity)).toThrow(msg);
});

it("throws on an infinitely large range in a range preference", () => {
    const msg = /must be finite numbers/;
    expect(() => new IntegerRangePreference(data_Range_Infinity)).toThrow(msg);
    expect(() => new DoubleRangePreference(data_Range_Infinity)).toThrow(msg);
});

it("throws on NaN in a numeric preference", () => {
    const msg = /NaN is not a( finite)? number/;
    const data_nan = { ...data_Range, default: NaN };
    expect(() => new IntegerPreference(data_nan)).toThrow(msg);
    expect(() => new DoublePreference(data_nan)).toThrow(msg);
    expect(() => new IntegerRangePreference(data_nan)).toThrow(msg);
    expect(() => new DoubleRangePreference(data_nan)).toThrow(msg);
});
