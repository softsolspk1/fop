export const normalizeYear = (year: string | null | undefined): string | undefined => {
  if (!year) return undefined;
  const y = year.toLowerCase();
  if (y.includes('1st') || y.includes('first')) return 'First';
  if (y.includes('2nd') || y.includes('second')) return 'Second';
  if (y.includes('3rd') || y.includes('third')) return 'Third';
  if (y.includes('4th') || y.includes('fourth')) return 'Fourth';
  if (y.includes('5th') || y.includes('fifth') || y.includes('final')) return 'Fifth';
  return year; // Fallback to original if no match
};
