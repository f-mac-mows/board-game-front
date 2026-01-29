import { YachtCalculator } from '@/utils/yatchCalculator';

export const getExpectedScores = (dice: number[]) => {
  if (!dice || dice.length < 5 || dice.includes(0)) return null;

  return {
    ONES: YachtCalculator.calculateSubTotal(dice, 1),
    TWOS: YachtCalculator.calculateSubTotal(dice, 2),
    THREES: YachtCalculator.calculateSubTotal(dice, 3),
    FOURS: YachtCalculator.calculateSubTotal(dice, 4),
    FIVES: YachtCalculator.calculateSubTotal(dice, 5),
    SIXES: YachtCalculator.calculateSubTotal(dice, 6),
    CHOICE: YachtCalculator.calculateSum(dice),
    FOUR_OF_A_KIND: YachtCalculator.calculateFourOfAKind(dice),
    FULL_HOUSE: YachtCalculator.calculateFullHouse(dice),
    SMALL_STRAIGHT: YachtCalculator.calculateSmallStraight(dice),
    LARGE_STRAIGHT: YachtCalculator.calculateLargeStraight(dice),
    YACHT: YachtCalculator.calculateYacht(dice),
  };
};