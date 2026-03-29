/**
 * Utility for handling Pakistan Standard Time (PKT / Asia/Karachi)
 */

export const PKT_TIMEZONE = 'Asia/Karachi';

/**
 * Formats a date string or object into a PKT localized string
 */
export const formatPKT = (date: Date | string | number, options: Intl.DateTimeFormatOptions = {}) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';

  return d.toLocaleString('en-GB', {
    timeZone: PKT_TIMEZONE,
    ...options
  });
};

/**
 * Formats a date specifically for display as "29 Mar 2026" in PKT
 */
export const formatDatePKT = (date: Date | string | number) => {
  return formatPKT(date, { day: '2-digit', month: 'short', year: 'numeric' });
};

/**
 * Formats a date specifically for display as "03:47 PM" in PKT
 */
export const formatTimePKT = (date: Date | string | number) => {
  return formatPKT(date, { hour: '2-digit', minute: '2-digit', hour12: true });
};

/**
 * Prepares a date for a datetime-local input, ensuring it reflects PKT
 * Returns string format: YYYY-MM-DDTHH:mm
 */
export const toPKTInputString = (date: Date | string | number = new Date()) => {
  const d = new Date(date);
  // We use Intl translation to get the exact PKT components
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: PKT_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const parts = formatter.formatToParts(d);
  const getPart = (type: string) => parts.find(p => p.type === type)?.value;

  return `${getPart('year')}-${getPart('month')}-${getPart('day')}T${getPart('hour')}:${getPart('minute')}`;
};

/**
 * Ensures an incoming local date string from an input is treated as PKT
 * before sending to the backend (appending +05:00)
 */
export const parsePKTToUTC = (localString: string): string => {
  if (!localString) return "";
  // If it already has a timezone, leave it
  if (localString.includes('Z') || localString.match(/[+-]\d{2}:\d{2}$/)) return localString;
  
  // Append PKT offset (+05:00)
  return `${localString}:00+05:00`;
};
