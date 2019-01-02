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

const pref_Boolean = new BooleanPreference(data_Boolean);

const P = {
    insert_foobars: new BooleanPreference(data_Boolean),
    number_of_foobars: new IntegerRangePreference(data_Range),
};

const PM = new PreferenceManager(P, "JEST-preference-");

const Preferences = init(P, "JEST", SIMPLE_RESPONSE_HANDLER);

it("creates a preference", () => {
    expect(pref_Boolean.key).toBe("insert_foobars");
    expect(pref_Boolean.label).toBe("Insert foobars");
    expect(pref_Boolean.description).toBe("Insert some foobars");
    expect(pref_Boolean.default).toBe(true);
});

it("creates a preference with a custom constraint", () => {
    const msg = "Only true is allowed.";
    expect(() => new BooleanPreference({
        key: "only_true",
        label: "Only true",
        description: "",
        default: false,
        constraints: [ { requirement: x => x, message: x => msg } ]
    })).toThrow(msg);
});

it("checks that preferences cannot have the empty string as key", () => {
    const msg = "cannot be the empty string";
    const data = Object.create(data_Boolean);
    data.key = "";
    expect(() => new BooleanPreference(data)).toThrow(msg);
});

it("saves and reads a preference value", () => {
    expect((() => {
        PM.set(P.number_of_foobars, 42);
        return PM.get(P.number_of_foobars);
    })()).toSatisfy(x => x.value === 42 && [ Status.OK, Status.LOCALSTORAGE_ERROR ].some(s => s === x.status));
});

it("checks that getType works", () => {
    expect(pref_Boolean.getType()).toBe("BooleanPreference");
});

it("checks that finite numeric preferences throw on ±Infinity", () => {
    const msg = "Infinity is not a finite number";
    const data = Object.create(data_Range);
    data.default = Infinity;
    expect(() => new IntegerRangePreference(data)).toThrow(msg);
    expect(() => new DoubleRangePreference(data)).toThrow(msg);
    data.default = -Infinity;
    expect(() => new IntegerRangePreference(data)).toThrow(msg);
    expect(() => new DoubleRangePreference(data)).toThrow(msg);
});

it("checks that all numeric preferences throw on NaN", () => {
    const msg = /NaN is not a( finite)? number/;
    const data_finite = Object.create(data_Range);
    data_finite.default = NaN;
    const data_infinite = Object.create(data_Range);
    data_infinite.infinite = true;
    data_infinite.default = NaN;
    expect(() => new IntegerPreference(data_finite)).toThrow(msg);
    expect(() => new DoublePreference(data_finite)).toThrow(msg);
    expect(() => new IntegerRangePreference(data_finite)).toThrow(msg);
    expect(() => new DoubleRangePreference(data_finite)).toThrow(msg);
    expect(() => new IntegerPreference(data_infinite)).toThrow(msg);
    expect(() => new DoublePreference(data_infinite)).toThrow(msg);
    expect(() => new IntegerRangePreference(data_infinite)).toThrow(msg);
    expect(() => new DoubleRangePreference(data_infinite)).toThrow(msg);
});
