/** Returns a local calendar date formatted for an HTML date input. */
export const getLocalDateInputValue = (date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/** Calculates completed weeks between a check-in date and a calendar date. */
export const calculateAgeWeeks = (
  entryDate: string,
  currentDate = getLocalDateInputValue()
): number => {
  const parseCalendarDate = (value: string) => {
    const [year, month, day] = value.slice(0, 10).split('-').map(Number);
    return year && month && day ? Date.UTC(year, month - 1, day) : NaN;
  };
  const differenceDays = Math.floor(
    (parseCalendarDate(currentDate) - parseCalendarDate(entryDate)) / 86_400_000
  );
  return Number.isFinite(differenceDays) ? Math.max(0, Math.floor(differenceDays / 7)) : 0;
};

/** Shifts a YYYY-MM-DD calendar date without timezone conversion. */
export const shiftCalendarDate = (value: string, days: number): string => {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  return [
    shifted.getUTCFullYear(),
    String(shifted.getUTCMonth() + 1).padStart(2, '0'),
    String(shifted.getUTCDate()).padStart(2, '0')
  ].join('-');
};
