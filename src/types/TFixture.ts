export type TFixture<TData> = {
  name: string,
  testData: TData,
};

export type TFixtureWithExpected<TData, TExpected> = TFixture<TData> & {
  expected: TExpected,
};
