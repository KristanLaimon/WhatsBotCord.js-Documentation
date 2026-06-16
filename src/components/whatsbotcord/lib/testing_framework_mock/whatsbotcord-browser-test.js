export function describe(name, fn) {
  console.log(`🧪 Suite: ${name}`);
  try {
    fn();
  } catch (err) {
    console.error(`  ❌ Suite execution error: ${name}\n`, err);
  }
}

export function test(name, fn) {
  Promise.resolve(fn()).then(
    () => {
      console.log(`  ✅ Pass: ${name}`);
    },
    (err) => {
      console.error(`  ❌ Fail: ${name}\n`, err);
    }
  );
}

export { test as it };

export function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Expected ${actual} to be ${expected}`);
      }
    },
    toEqual(expected) {
      const actualStr = JSON.stringify(actual);
      const expectedStr = JSON.stringify(expected);
      if (actualStr !== expectedStr) {
        throw new Error(`Expected ${actualStr} to equal ${expectedStr}`);
      }
    },
    toContain(expected) {
      if (typeof actual?.includes === "function") {
        if (!actual.includes(expected)) {
          throw new Error(`Expected ${JSON.stringify(actual)} to contain ${expected}`);
        }
      } else {
        throw new Error(`Expected ${actual} to contain ${expected} (actual is not indexable)`);
      }
    },
    toHaveLength(expected) {
      if (actual === null || actual === undefined || typeof actual.length !== "number") {
        throw new Error(`Expected actual to have a length property (actual is ${actual})`);
      }
      if (actual.length !== expected) {
        throw new Error(`Expected length to be ${expected}, but got ${actual.length}`);
      }
    },
    toBeDefined() {
      if (actual === undefined) {
        throw new Error("Expected actual to be defined");
      }
    },
    toBeUndefined() {
      if (actual !== undefined) {
        throw new Error(`Expected actual to be undefined, but got ${actual}`);
      }
    },
    toBeTruthy() {
      if (!actual) {
        throw new Error(`Expected ${actual} to be truthy`);
      }
    },
    toBeFalsy() {
      if (actual) {
        throw new Error(`Expected ${actual} to be falsy`);
      }
    }
  };
}
