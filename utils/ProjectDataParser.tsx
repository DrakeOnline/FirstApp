// projectUtils.ts

// Assuming projects.json is in the same directory or accessible via your bundler's path resolution.
// You might need to adjust the path if it's located elsewhere.
import projectsDataJson from '../assets/data/projects.json';

// Assuming ClockifyReport.tsx is in the same directory or accessible.
// Adjust the path './ClockifyReport' as necessary based on your project structure.
import { calculateTotalEarnings, fetchClockifyTimeEntries } from './ClockifyReport';

/**
 * IProject Interface
 * Defines the structure for a single project object, including details
 * necessary for display and the completion meter.
 * This should match the interface in your Project.tsx and Projects.tsx files.
 */
export interface IProject {
  name: string;
  details: string;
  amount: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  start_date: string; // Date string from JSON, e.g., "YYYY-MM-DD"
  progress: number;   // Represents completion percentage (0-100)
}

// Type for projects as they are loaded from JSON (initially without a 'progress' field)
type ProjectFromJson = Omit<IProject, 'progress'>;

// Defines the order of priorities for sorting. Lower number means higher priority.
const priorityOrder: { [key in IProject['priority']]: number } = {
  critical: 1,
  high: 2,
  medium: 3,
  low: 4,
};

// The hardcoded start date for calculating total earned money.
const HARDCODED_EARNINGS_START_DATE = new Date('2025-05-31');

/**
 * Sorts projects by priority (critical > high > medium > low).
 * @param projects Array of projects (without progress field initially).
 * @returns A new array of projects sorted by priority.
 */
const sortProjectsByPriority = (projects: ProjectFromJson[]): ProjectFromJson[] => {
  // Create a shallow copy before sorting to avoid mutating the original array
  return [...projects].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
};

/**
 * Fetches total earnings from Clockify since a given start date up to the current date.
 * @param startDate The date from which to calculate earnings.
 * @returns A Promise that resolves to the total earned amount (number).
 */
async function getTotalEarnedSince(startDate: Date): Promise<number> {
  const endDate = new Date(); // Current date

  // If the start date for earnings is in the future, no earnings could have been made.
  if (startDate > endDate) {
    console.warn("Earnings start date is in the future. Assuming 0 earnings.");
    return 0;
  }

  try {
    // Call Clockify API to get time entries within the date range
    const timeEntriesReport = await fetchClockifyTimeEntries(startDate, endDate);
    // Calculate total earnings from the report
    return calculateTotalEarnings(timeEntriesReport);
  } catch (error) {
    console.error("Failed to fetch or calculate Clockify earnings:", error);
    // Depending on error handling strategy, you might re-throw or return a default
    return 0; // Return 0 earnings in case of an error
  }
}

/**
 * Calculates the progress of each project based on total earned money.
 * Funds are distributed according to project priority. Overflow funds from one
 * project contribute to the next in the priority list.
 * @param sortedProjects Array of projects, sorted by priority (without initial progress).
 * @param totalEarnedMoney Total money available for distribution across projects.
 * @returns An array of IProject objects, each with a calculated 'progress' field.
 */
function distributeFundsAndCalculateProgress(
  sortedProjects: ProjectFromJson[],
  totalEarnedMoney: number
): IProject[] {
  let remainingEarnedMoney = totalEarnedMoney;
  const projectsWithCalculatedProgress: IProject[] = [];

  for (const project of sortedProjects) {
    // Initialize the current project with 0 progress, adding it to the structure
    const currentProjectWithProgress: IProject = { ...project, progress: 0 };

    if (project.amount <= 0) {
      // If a project has no cost or a negative cost, consider it 100% complete
      // as no funds are needed. Or, set to 0% if that's more appropriate.
      currentProjectWithProgress.progress = 100;
    } else if (remainingEarnedMoney > 0) {
      // Determine how much of the remaining money can be allocated to this project
      const moneyAllocatedToProject = Math.min(remainingEarnedMoney, project.amount);
      
      // Calculate progress based on the allocated amount
      currentProjectWithProgress.progress = (moneyAllocatedToProject / project.amount) * 100;
      
      // Reduce the remaining earned money by the amount allocated
      remainingEarnedMoney -= moneyAllocatedToProject;
    }
    
    // Ensure progress is a number between 0 and 100, rounded to two decimal places.
    currentProjectWithProgress.progress = Math.min(100, Math.max(0, parseFloat(currentProjectWithProgress.progress.toFixed(2))));
    
    projectsWithCalculatedProgress.push(currentProjectWithProgress);
  }

  return projectsWithCalculatedProgress;
}

/**
 * Main exported function to process projects.
 * It loads project data, sorts by priority, fetches total earnings,
 * and then calculates progress for each project based on available funds.
 * @returns A Promise resolving to an array of IProject objects with updated progress values.
 */
export async function processProjectsWithProgress(): Promise<IProject[]> {
  // Type assertion: treat the imported JSON data as an array of ProjectFromJson
  const rawProjects: ProjectFromJson[] = projectsDataJson as ProjectFromJson[];

  // Step 1: Sort projects by their defined priority
  const sortedProjects = sortProjectsByPriority(rawProjects);
  
  // Step 2: Calculate total money earned since the hardcoded start date
  const totalEarned = await getTotalEarnedSince(HARDCODED_EARNINGS_START_DATE);
  
  // Step 3: Distribute the earned money to projects and calculate their progress
  const projectsWithProgress = distributeFundsAndCalculateProgress(sortedProjects, totalEarned);

  return projectsWithProgress;
}
