// imports
import axios from 'axios';
import Constants from 'expo-constants';

// constants
export const MAX_INCOME_CALGRANT = 49800;
export const MAX_INCOME_SNAP = 12 * 2100;
export const WORKDAYS_IN_YEAR = 4 * 52; // Assuming 4 work-weeks * 5 work-days = 208, user defined 4 * 52 = 208. Let's use this.
export const AVERAGE_HOURLY_RATE = 40;

const workspaceId = Constants.expoConfig?.extra?.clockifyWorkspaceId as string;
const apiKey = Constants.expoConfig?.extra?.clockifyApiKey as string;

// interfaces
export interface ClockifyYearlyReport {
  totalEarnings: number | null;
  maxEarnableToDate: number | null;
  percentOfMax: number | null;
  difference: number | null;
  workdaysLeft: number | null;
  avgHoursPerWorkday: number | null;
  error: string | null;
}

export interface ClockifyEarningsReport {
  totalEarnings: number | null;
  error: string | null;
}

/**
 * Fetches raw time entry data from the Clockify API within a specified date range.
 * @param startDate The start date for the report.
 * @param endDate The end date for the report.
 * @returns A promise that resolves to the API response data, or throws an error.
 */
export async function fetchClockifyTimeEntries(startDate: Date, endDate: Date): Promise<any> {
  const url = `https://reports.api.clockify.me/v1/workspaces/${workspaceId}/reports/detailed`;
  const headers = {
    "X-Api-Key": apiKey,
    "Content-Type": "application/json"
  };

  const payload = {
    "dateRangeStart": startDate.toISOString(),
    "dateRangeEnd": endDate.toISOString(),
    "detailedFilter": {
      "page": 1,
      "pageSize": 1000,
    }
  };

  try {
    const response = await axios.post(url, payload, { headers: headers });
    return response.data;
  } catch (e: any) {
    if (axios.isAxiosError(e)) {
      throw new Error(`Request failed: ${e.message} (Status: ${e.response ? e.response.status : 'N/A'})`);
    }
    throw new Error(`An unexpected error occurred: ${e.message}`);
  }
}

/**
 * Calculates the total billable earnings from Clockify time entries.
 * @param data The raw data received from the Clockify API.
 * @returns The total billable earnings.
 */
export function calculateTotalEarnings(data: any): number {
  let currentTotalEarnings = 0;
  if (typeof data === 'object' && data !== null && "timeentries" in data) {
    const timeEntries = data.timeentries;
    for (const entry of timeEntries) {
      if (entry.billable) {
        const earnedAmount = entry.earnedAmount;
        if (earnedAmount !== undefined && earnedAmount !== null) {
          currentTotalEarnings += earnedAmount;
        }
      }
    }
  }
  // Fixes API issue where decimal is off 2 places
  return Math.floor(currentTotalEarnings / 100);
}

/**
 * Processes the fetched earnings and calculates various financial metrics for a given, completed year.
 * This function determines the specific year based on the provided date and calculates metrics from January 1st to December 31st.
 * @param dateInYear Any date within the target year (e.g., new Date('2023-06-15') for the year 2023).
 * @returns An object containing calculated financial metrics for the full target year.
 */
export async function getYear(dateInYear: Date): Promise<Omit<ClockifyYearlyReport, 'error' | 'earnings'>> {
  // Extract the target year from the provided date
  const targetYear = dateInYear.getFullYear();

  const beginningOfYear = new Date(targetYear, 0, 1); // January 1st of the target year
  const endOfYear = new Date(targetYear, 11, 31, 23, 59, 59, 999); // December 31st, end of day, of the target year

  // Fetch all time entries that occurred throughout the entire target year
  const report = await fetchClockifyTimeEntries(beginningOfYear, endOfYear);
  const earnings = calculateTotalEarnings(report);

  // For a fully elapsed year, the 'max earnable to date' is simply the total annual maximum.
  const maxEarnableForFullYear = MAX_INCOME_CALGRANT; // This represents the fixed annual ceiling.

  // Calculate percentage of the annual maximum achieved.
  const calculatedPercentOfMax = parseFloat(((earnings / MAX_INCOME_CALGRANT) * 100).toFixed(2));

  // Determine the difference from the annual maximum.
  const calculatedDifference = maxEarnableForFullYear - earnings;

  // For a past, completed year, there are no 'workdays left'.
  const calculatedWorkdaysLeft = 0;

  // Calculate the average hours per conceptual workday for the entire year.
  // This derives from total earnings, the average hourly rate, and the defined workdays in a year.
  const calculatedAvgHoursPerWorkday = Math.floor((earnings / AVERAGE_HOURLY_RATE) / WORKDAYS_IN_YEAR);

  return {
    totalEarnings: earnings,
    maxEarnableToDate: maxEarnableForFullYear,
    percentOfMax: calculatedPercentOfMax,
    difference: calculatedDifference,
    workdaysLeft: calculatedWorkdaysLeft,
    avgHoursPerWorkday: calculatedAvgHoursPerWorkday,
  };
}

export async function getCurrentYear() {
  try {
    const today = new Date(); // Represents today's date, which is in the current year
    return await getYear(today);
  } catch (error: any) {
    console.error("Error fetching current year report:", error.message);
    return { error: error.message, totalEarnings: null }; // Return partial object on error
  }
}

/**
 * Processes the fetched earnings and calculates total billable earnings for a given, completed month.
 * This function determines the specific month based on the provided date and calculates total earnings from its first day to its last.
 * @param dateInMonth Any date within the target month (e.g., new Date('2023-01-15') for the month of January 2023).
 * @returns An object containing the total billable earnings for the full target month.
 */
export async function getMonth(dateInMonth: Date): Promise<Omit<ClockifyEarningsReport, 'error' | 'earnings'>> {
  // Extract the year and month from the provided date
  const targetYear = dateInMonth.getFullYear();
  const targetMonth = dateInMonth.getMonth(); // getMonth() is 0-indexed

  const beginningOfMonth = new Date(targetYear, targetMonth, 1); // First day of the target month
  const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999); // Last day of the target month, end of day

  // Fetch all time entries that occurred throughout the entire target month
  const report = await fetchClockifyTimeEntries(beginningOfMonth, endOfMonth);
  const earnings = calculateTotalEarnings(report);

  return {
    totalEarnings: earnings
  };
}

export async function getCurrentMonth() {
  try {
    const today = new Date(); // Represents today's date, which is in the current month
    return await getMonth(today);
  } catch (error: any) {
    console.error("Error fetching current month report:", error.message);
    return { error: error.message, totalEarnings: null }; // Return partial object on error
  }
}

/**
 * Processes the fetched earnings and calculates total billable earnings for a given, completed week.
 * This function determines the specific week based on the provided date and calculates total earnings from Monday to Sunday.
 * @param dateInWeek Any date within the target week (e.g., new Date('2023-01-05') for the week of Jan 1-7, 2023).
 * @returns An object containing the total billable earnings for the full target week.
 */
export async function getWeek(dateInWeek: Date): Promise<Omit<ClockifyEarningsReport, 'error' | 'earnings'>> {
  // Create a mutable copy of the input date
  const tempDate = new Date(dateInWeek);

  // Determine the beginning of the week (Monday)
  const dayOfWeek = tempDate.getDay(); // 0 for Sunday, 1 for Monday...
  const diffToMonday = tempDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const beginningOfWeek = new Date(tempDate.setDate(diffToMonday));
  beginningOfWeek.setHours(0, 0, 0, 0);

  // Determine the end of the week (Sunday)
  const endOfWeek = new Date(beginningOfWeek);
  endOfWeek.setDate(beginningOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  // Fetch all time entries that occurred throughout this specific week
  const report = await fetchClockifyTimeEntries(beginningOfWeek, endOfWeek);
  const earnings = calculateTotalEarnings(report);

  return {
    totalEarnings: earnings
  };
}

/**
 * Retrieves an array of individual daily earnings reports for the current week.
 * Each element in the array represents the total earnings for a single day (Monday to Sunday).
 * This function relies on the existence of `getDay`, `WorkspaceClockifyTimeEntries`, and `calculateTotalEarnings`.
 * @returns A Promise that resolves to an array of objects, each containing the total earnings for a specific day of the current week.
 */
export async function getDailyReportsForCurrentWeek(): Promise<Array<Omit<ClockifyEarningsReport, 'error' | 'earnings'>>> {
  const dailyReports: Array<Omit<ClockifyEarningsReport, 'error' | 'earnings'>> = [];
  const today = new Date();

  // Determine the beginning of the current week (Monday)
  const dayOfWeek = today.getDay(); // 0 for Sunday, 1 for Monday...
  const diffToMonday = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const beginningOfWeek = new Date(today.setDate(diffToMonday));
  beginningOfWeek.setHours(0, 0, 0, 0); // Set to the very start of Monday

  // Loop through the 7 days of the week, starting from Monday
  for (let i = 0; i < 7; i++) {
    const currentDay = new Date(beginningOfWeek); // Create a new Date object for each iteration
    currentDay.setDate(beginningOfWeek.getDate() + i); // Increment the day to get Tuesday, Wednesday, etc.

    // Fetch the report for the current day using your `getDay` function
    const dayReport = await getDay(currentDay);
    dailyReports.push(dayReport);
  }

  return dailyReports;
}

/**
 * Processes the fetched earnings and calculates total billable earnings for a given, completed day.
 * This function calculates metrics for the entire specified day, from midnight to 11:59:59.999 PM.
 * @param targetDate The specific date for which to calculate the earnings (e.g., new Date('2023-01-15')).
 * @returns An object containing the total billable earnings for the full target day.
 */
export async function getDay(targetDate: Date): Promise<Omit<ClockifyEarningsReport, 'error' | 'earnings'>> {
  // Create mutable copies to set specific times without altering the original date
  const beginningOfDay = new Date(targetDate);
  beginningOfDay.setHours(0, 0, 0, 0); // Set to the very start of the day (midnight)

  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999); // Set to the very end of the day (one millisecond before next midnight)

  // Fetch all time entries that occurred exclusively within this specific day
  const report = await fetchClockifyTimeEntries(beginningOfDay, endOfDay);
  const earnings = calculateTotalEarnings(report);

  return {
    totalEarnings: earnings
  };
}

export async function getCurrentDay() {
  try {
    const today = new Date(); // Represents the current calendar day
    return await getDay(today);
  } catch (error: any) {
    console.error("Error fetching current day report:", error.message);
    return { error: error.message, totalEarnings: null }; // Return partial object on error
  }
}
