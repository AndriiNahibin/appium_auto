import type { TFixtureWithExpected } from "../../../types/TFixture";
import type { TSortDirection } from "../../../types/TSortDirection";
import { ESortOption } from "../../enum/ESortOption";

export const priceSorting: TFixtureWithExpected<ESortOption, TSortDirection>[] = [
  { name: ESortOption.PRICE_LOW_TO_HIGH, testData: ESortOption.PRICE_LOW_TO_HIGH, expected: "asc" },
  { name: ESortOption.PRICE_HIGH_TO_LOW, testData: ESortOption.PRICE_HIGH_TO_LOW, expected: "desc" },
];
