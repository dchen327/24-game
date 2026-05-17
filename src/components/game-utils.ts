import Fraction from "fraction.js";

export type SolveStep = {
  a: Fraction;
  op: "+" | "−" | "×" | "÷";
  b: Fraction;
  result: Fraction;
};

const TARGET = new Fraction(24);

const tryOp = (
  a: Fraction,
  b: Fraction,
  opIdx: number
): { result: Fraction; symbol: SolveStep["op"] } | null => {
  switch (opIdx) {
    case 0:
      return { result: a.add(b), symbol: "+" };
    case 1:
      return { result: a.sub(b), symbol: "−" };
    case 2:
      return { result: a.mul(b), symbol: "×" };
    case 3:
      if (b.valueOf() === 0) return null;
      return { result: a.div(b), symbol: "÷" };
  }
  return null;
};

export const gameUtils = {
  /**
   * Attempts to find a solution that equals 24 using two numbers
   * @param num1 Fraction
   * @param num2 Fraction
   * @returns Equation string if a solution is found, otherwise null
   */
  checkLastTwoNums: (num1: Fraction, num2: Fraction): string | null => {
    const operations = [
      { fn: () => num1.add(num2), symbol: "+" },
      { fn: () => num1.sub(num2), symbol: "−" },
      { fn: () => num2.sub(num1), symbol: "−", reverse: true },
      { fn: () => num1.mul(num2), symbol: "×" },
      { fn: () => (num2.valueOf() !== 0 ? num1.div(num2) : null), symbol: "÷" },
      {
        fn: () => (num1.valueOf() !== 0 ? num2.div(num1) : null),
        symbol: "÷",
        reverse: true,
      },
    ];

    for (const op of operations) {
      const result = op.fn();
      if (result?.equals(24)) {
        const n1 = op.reverse ? num2.toFraction() : num1.toFraction();
        const n2 = op.reverse ? num1.toFraction() : num2.toFraction();
        return `${n1} ${op.symbol} ${n2} = 24`;
      }
    }
    return null;
  },

  shuffle<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  },

  vibrate(ms: number = 20): void {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(ms);
    }
  },

  /**
   * Recursively try to reach 24 by combining `nums` two at a time. Returns
   * the sequence of operations in execution order (step 0 is the deepest
   * combination — the "truly first step"), or null if no solution exists.
   *
   * Iteration order is randomized so that puzzles with multiple distinct
   * first-step branches don't always surface the same one.
   */
  solve(nums: Fraction[]): SolveStep[] | null {
    if (nums.length === 1) {
      return nums[0].equals(TARGET) ? [] : null;
    }

    const pairs: [number, number][] = [];
    for (let i = 0; i < nums.length; i++) {
      for (let j = i + 1; j < nums.length; j++) {
        pairs.push([i, j]);
      }
    }
    const shuffledPairs = gameUtils.shuffle(pairs);
    const shuffledOps = gameUtils.shuffle([0, 1, 2, 3]);

    for (const [i, j] of shuffledPairs) {
      const a = nums[i];
      const b = nums[j];
      const rest = nums.filter((_, k) => k !== i && k !== j);
      const orderings: [Fraction, Fraction][] = gameUtils.shuffle([
        [a, b],
        [b, a],
      ]);

      for (const [first, second] of orderings) {
        for (const op of shuffledOps) {
          const r = tryOp(first, second, op);
          if (!r) continue;
          const sub = gameUtils.solve([...rest, r.result]);
          if (sub !== null) {
            return [
              { a: first, op: r.symbol, b: second, result: r.result },
              ...sub,
            ];
          }
        }
      }
    }
    return null;
  },
};
