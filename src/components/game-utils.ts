import Fraction from "fraction.js";

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
};
