export const normalizeYear = (year: string | null | undefined): string | undefined => {
  if (!year) return undefined;
  const y = year.toLowerCase();
  if (y.includes('1st') || y.includes('first')) return 'First';
  if (y.includes('2nd') || y.includes('second')) return 'Second';
  if (y.includes('3rd') || y.includes('third')) return 'Third';
  if (y.includes('4th') || y.includes('fourth')) return 'Fourth';
  if (y.includes('5th') || y.includes('fifth') || y.includes('final')) return 'Fifth';
};

export const parseAsPKT = (dateString: string | null | undefined): Date => {
  if (!dateString) return new Date();
  // If it's already a Date string with TZ, parse normally
  if (dateString.includes('Z') || dateString.match(/[+-]\d{2}:\d{2}$/)) {
    return new Date(dateString);
  }
  
  // Assume it's a local PKT string (like from datetime-local)
  return new Date(`${dateString}:00+05:00`);
};
