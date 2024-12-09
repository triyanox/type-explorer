import TypeAnalyzer, { AnalysisResult, CONFIG_PRESETS } from "../src/index";

class DataNode {
  #privateData: number;
  children: DataNode[];

  constructor(value: number) {
    this.#privateData = value;
    this.children = [];
  }
  get value() {
    return this.#privateData;
  }
  set value(v: number) {
    this.#privateData = v;
  }

  addChild(node: DataNode) {
    this.children.push(node);
  }
}

class ValidationError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.name = "ValidationError";
    this.code = code;
  }
}

const root = new DataNode(1);
const child1 = new DataNode(2);
const child2 = new DataNode(3);
root.addChild(child1);
root.addChild(child2);
child1.addChild(root);

const complexObject = {
  // Primitive values
  string: "test",
  number: 42,
  boolean: true,
  nullValue: null,
  undefinedValue: undefined,
  bigint: BigInt("9007199254740991"),

  // Symbol properties
  [Symbol.for("test")]: "symbol property",

  // Built-in objects
  date: new Date(),
  regex: /test/gi,
  error: new ValidationError("Invalid input", "E001"),

  // Collections
  map: new Map([
    ["key1", "value1"],
    ["key2", "value2"],
  ]),
  set: new Set([1, 2, "three", { four: 4 }]),

  // Typed Arrays
  int8Array: new Int8Array([1, 2, 3]),
  float64Array: new Float64Array([1.1, 2.2, 3.3]),

  // Functions
  regularFunction: function (a: number, b: string) {
    return a + b;
  },
  arrowFunction: (x: number) => x * x,
  async asyncFunction() {
    return "async result";
  },
  *generatorFunction() {
    yield 42;
  },

  // Nested array with mixed types
  mixedArray: [
    1,
    "string",
    { nested: true },
    [1, 2, 3],
    new Set([1, 2, 3]),
    function () {},
    null,
  ],

  // Promise
  promise: Promise.resolve("done"),

  // Circular reference to root
  circularRef: root,

  // Getters and setters
  get computed() {
    return this.number * 2;
  },
  set computed(value: number) {
    this.number = value / 2;
  },
};

const analyzer = new TypeAnalyzer(CONFIG_PRESETS.DETAILED);

// This is how you can register a custom type
analyzer.registerCustomType(
  "DataNode",
  (value: DataNode, context) =>
    ({
      type: "DataNode",
      value: value.value,
      childCount: value.children.length,
      path: [...context.path],
    } as AnalysisResult)
);

const analysis = analyzer.analyze(complexObject);
const jsonReplacer = (key: string, value: any) => {
  if (typeof value === "bigint") {
    return value.toString() + "n";
  }
  return value;
};
console.log(JSON.stringify(analysis, jsonReplacer, 2));
