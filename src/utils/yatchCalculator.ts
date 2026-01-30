export const YachtCalculator = {
  calculateSum: (dice: number[]) => dice.reduce((a, b) => a + b, 0),

  calculateSubTotal: (dice: number[], target: number) => 
    dice.filter(d => d === target).length * target,

  calculateFourOfAKind: (dice: number[]) => {
    const counts = getCounts(dice);
    return Object.values(counts).some(c => c >= 4) ? YachtCalculator.calculateSum(dice) : 0;
  },

  calculateFullHouse: (dice: number[]) => {
    const counts = Object.values(getCounts(dice));
    const isFive = new Set(dice).size === 1;
    if ((counts.length === 2 && counts.includes(3)) || isFive) return 25;
    return 0;
  },

  calculateSmallStraight: (dice: number[]) => {
    const sequence = Array.from(new Set(dice)).sort().join("");
    return /1234|2345|3456/.test(sequence) ? 15 : 0;
  },

  calculateLargeStraight: (dice: number[]) => {
    const sequence = Array.from(new Set(dice)).sort().join("");
    return sequence === "12345" || sequence === "23456" ? 30 : 0;
  },

  calculateYacht: (dice: number[]) => {
    return new Set(dice).size === 1 ? 50 : 0;
  }
};

const getCounts = (dice: number[]) => {
  return dice.reduce((acc, d) => {
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);
};