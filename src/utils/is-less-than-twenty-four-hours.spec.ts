import isLessThanTwentyFourHours from './is-less-than-twenty-four-hours';

describe('isLessThanTwentyFourHours', () => {
  it('expect to be true ', () => {
    expect(isLessThanTwentyFourHours(new Date())).toBe(true);
  });
  it('expect to be false ', () => {
    expect(
      isLessThanTwentyFourHours(new Date('Tue May 28 2023 13:01:26'))
    ).toBe(false);
  });
});
