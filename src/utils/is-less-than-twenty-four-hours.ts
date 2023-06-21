const isLessThanTwentyFourHours = (aDateTime: Date) => {
  const nextDay: Date = new Date();
  nextDay.setHours(23, 59);
  return nextDay.getTime() - aDateTime.getTime() < 86400000;
};

export default isLessThanTwentyFourHours;
