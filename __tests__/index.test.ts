import {
    Status,
    PreferenceManager,
    Preference,
    BooleanPreference,
    DictionaryPreference,
    DoublePreference,
    DoubleRangePreference,
    IntegerPreference,
    IntegerRangePreference,
    ListPreference,
    MultichoicePreference,
    NumericPreference,
    RangePreference,
    StringPreference,
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
const pref_String = new StringPreference({
    key: "name",
    label: "Name",
    default: "John Smith",
    multiline: false,
});
const pref_Integer = new IntegerPreference({
    key: "favorite_integer",
    label: "Favorite integer",
    default: 42,
});
const pref_Double = new DoublePreference({
    key: "favorite_double",
    label: "Favorite double",
    default: 3.14,
});
const pref_IntegerRange = new IntegerRangePreference({
    key: "favorite_digit",
    label: "Favorite digit",
    default: 0,
    min: 0,
    max: 9,
});
const pref_Dictionary = new DictionaryPreference({
    key: "starting_point",
    label: "Starting point",
    default: { x: 5, y: 5 },
});
const pref_List = new ListPreference({
    key: "aliases",
    label: "Aliases",
    default: [ "John", "Johnny", "The Man" ],
});
const pref_Multichoice = new MultichoicePreference({
    key: "speed",
    label: "Speed",
    default: "normal",
    options: [ {
        value: "slow",
        label: "Slow",
    }, {
        value: "normal",
        label: "Normal",
    }, {
        value: "fast",
        label: "Fast",
    } ],
});

const EXAMPLE_PREFERENCES = [
    pref_Boolean,
    pref_String,
    pref_Integer,
    pref_Double,
    pref_IntegerRange,
    pref_Dictionary,
    pref_List,
    pref_Multichoice,
];

const P = {
    insert_foobars: new BooleanPreference(data_Boolean),
    number_of_foobars: new IntegerRangePreference(data_Range),
};

const Preferences = new PreferenceManager(P, "JEST");

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
    Preferences.set(P.number_of_foobars, 42);
    expect(Preferences.getRaw(P.number_of_foobars)).toEqual({ value: 42, status: Status.OK });
});

it("produces correct string representations", () => {
    // Note that .name works only when code is not minified, which is
    // exactly why the getClassName method exists.
    EXAMPLE_PREFERENCES.forEach(p => {
        expect(p.getClassName()).toBe(p.constructor.name);
        expect(p.toString()).toBe(`${p.getClassName()} '${p.key}'`);
    });
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

it("throws on too few options in a multichoice preference", () => {
    const msg = /two elements/;
    expect(() => new MultichoicePreference({
        key: "dprk_election",
        label: "Cast your vote",
        options: [ {
            value: "kim",
            label: "Kim",
        } ],
        default: "kim",
    })).toThrow(msg);
});

it("throws on an invalid default in a multichoice preference", () => {
    const msg = /available options/;
    expect(() => new MultichoicePreference({
        key: "colors",
        label: "Choose a color",
        options: [ {
            value: "red",
            label: "Red",
        }, {
            value: "blue",
            label: "Blue",
        } ],
        default: "panda",
    })).toThrow(msg);
});

it("throws on duplicate options in a multichoice preference", () => {
    const msg = /Multiple options/;
    expect(() => new MultichoicePreference({
        key: "colors",
        label: "Choose a color",
        options: [ {
            value: "red",
            label: "Red",
        }, {
            value: "red",
            label: "Blue",
        } ],
        default: "red",
    })).toThrow(msg);
});

it("throws on minLength > maxLength in a string preference", () => {
    const msg = /length/;
    expect(() => new StringPreference({
        key: "paradox",
        label: "Enter a string",
        default: "",
        multiline: false,
        minLength: 5,
        maxLength: 1,
    })).toThrow(msg);
});

it("throws on min > max in a range preference", () => {
    const msg = /(min|max)imum value/;
    expect(() => new IntegerRangePreference({
        key: "paradox",
        label: "Pick a number",
        default: 5,
        min: 5,
        max: 1,
    })).toThrow(msg);
});
