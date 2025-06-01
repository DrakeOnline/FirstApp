// Projects.tsx
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'; // Using react-native components for Expo, Added Dimensions
import { processProjectsWithProgress } from '../utils/ProjectDataParser'; // Assuming this path is correct

/**
 * IProject Interface
 * Defines the structure for a single project object, including details
 * necessary for display and the completion meter.
 */
export interface IProject {
  name: string;
  details: string;
  amount: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  start_date: string;
  progress: number; // Represents completion percentage (0-100)
  // It's good practice to have a unique ID for list items if available
  // id?: string | number;
}

/**
 * ProjectCard Component
 * This functional React component displays the details of a single project
 * along with a visual completion meter. It receives a 'project' object
 * conforming to the IProject interface as its prop.
 * This component is designed to be reusable for displaying individual project cards.
 */
const ProjectCard: React.FC<{ project: IProject }> = ({ project }) => {
  // Determine the color of the progress bar based on the project's progress.
  const progressColor = project.progress >= 90 ? cardStyles.progressBarGreen :
                          project.progress >= 50 ? cardStyles.progressBarYellow :
                          cardStyles.progressBarRed;

  // Determine the text color for priority for better visual distinction.
  const priorityTextColor = project.priority === 'critical' ? cardStyles.priorityCritical :
                            project.priority === 'high' ? cardStyles.priorityHigh :
                            project.priority === 'medium' ? cardStyles.priorityMedium :
                            project.priority === 'low' ? cardStyles.priorityLow:
                            cardStyles.priorityLow;
                            // priorityLow falls through to default
  return (
    // The main container for each project card.
    <View style={cardStyles.cardContainer}>
      <View>
        {/* Project Name: Displayed prominently as a title. */}
        <Text style={cardStyles.projectName}>{project.name}</Text>
        {/* Project Details: Rendered only if the 'details' field is not empty */}
        {project.details && <Text style={cardStyles.projectDetails}>{project.details}</Text>}

        {/* Flexbox Layout for Additional Project Information */}
        <View style={cardStyles.infoGrid}>
          {/* Amount: Displays the project's financial value */}
          <View style={cardStyles.infoItemHalf}>
            <Text style={cardStyles.infoLabel}>Amount:</Text>
            <Text style={cardStyles.infoValue}>${project.amount.toLocaleString()}</Text>
            </View>
          {/* Priority: Indicates the urgency of the project */}
          <View style={cardStyles.infoItemHalf}>
            <Text style={cardStyles.infoLabel}>Priority:</Text>
            <Text style={[cardStyles.infoValue, priorityTextColor]}>{project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}</Text>
          </View>
        </View>
      </View>

      {/* Completion Meter Section */}
      <View style={cardStyles.progressSection}>
        <View style={cardStyles.progressHeader}>
          <Text style={cardStyles.progressLabel}>Progress</Text>
          <Text style={cardStyles.progressValue}>{Math.floor(project.progress)}%</Text>
        </View>
        {/* The actual progress bar */}
        <View style={cardStyles.progressBarBackground}>
          <View
            style={[cardStyles.progressBarFill, progressColor, { width: `${project.progress}%` }]}
          ></View>
        </View>
      </View>
    </View>
  );
};

const cardStyles = StyleSheet.create({
  cardContainer: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6, // For Android shadow
    flexDirection: 'column',
    justifyContent: 'space-between',
    borderColor: '#E2E8F0', // gray-200
    borderWidth: 1,
    marginBottom: 16, // mb-4
    width: '100%', // Ensure it takes full width within its container
  },
  projectName: {
    fontSize: 24, // text-2xl
    fontWeight: '600', // font-semibold
    color: '#2D3748', // gray-800
    marginBottom: 8, // mb-2
  },
  projectDetails: {
    color: '#718096', // gray-600
    marginBottom: 12, // mb-3
    fontSize: 16, // text-base
    lineHeight: 24, // leading-relaxed (approx 1.5 * 16)
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // fontSize: 16, // text-base - Applied to children
    // color: '#4A5568', // gray-700 - Applied to children
    marginBottom: 16, // mb-4
  },
  infoItemHalf: {
    width: '50%', // w-1/2
    marginBottom: 8, // mb-2
    flexDirection: 'row', // To align label and value
  },
  infoItemFull: {
    width: '100%',
    marginBottom: 8, // mb-2
    flexDirection: 'row', // To align label and value
  },
  infoLabel: {
    fontWeight: '500', // font-medium
    color: '#2D3748', // gray-800
    marginRight: 4, // Add some space between label and value
    fontSize: 16,
  },
  infoValue: {
    fontWeight: '700', // font-bold
    color: '#4A5568', // gray-700
    fontSize: 16,
  },
  priorityCritical: {
    color: '#E53E3E', // text-red-600
  },
  priorityHigh: {
    color: '#ED8936', // text-orange-500
  },
  priorityMedium: {
    color: '#4CAE4C', // text-green-500
  },
  priorityLow: {
    color: '#01898F', // text-gray-500
  },
  progressSection: {
    marginTop: 16, // mt-4
    paddingTop: 16, // pt-4
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0', // border-t border-gray-200
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8, // mb-2
  },
  progressLabel: {
    fontSize: 14, // text-sm
    fontWeight: '500', // font-medium
    color: '#4A5568', // gray-700
  },
  progressValue: {
    fontSize: 14, // text-sm
    fontWeight: '500', // font-medium
    color: '#4A5568', // gray-700
  },
  progressBarBackground: {
    width: '100%', // w-full
    backgroundColor: '#E2E8F0', // bg-gray-200
    borderRadius: 9999, // rounded-full
    height: 12, // h-3
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%', // h-full
    borderRadius: 9999, // rounded-full
  },
  progressBarGreen: {
    backgroundColor: '#48BB78', // bg-green-500
  },
  progressBarYellow: {
    backgroundColor: '#ECC94B', // bg-yellow-500
  },
  progressBarRed: {
    backgroundColor: '#F56565', // bg-red-500
  },
});

/**
 * ProjectSummary Component
 * This component displays a summary of projects by priority,
 * including total amount and overall progress, each in its own card.
 */
const ProjectSummary: React.FC<{ projects: IProject[] }> = ({ projects }) => {
  const summaryData = projects.reduce((acc, project) => {
    if (!acc[project.priority]) {
      acc[project.priority] = { totalAmount: 0, completedAmount: 0, count: 0 };
    }
    acc[project.priority].totalAmount += project.amount;
    acc[project.priority].completedAmount += project.amount * (project.progress / 100);
    acc[project.priority].count++;
    return acc;
  }, {} as Record<IProject['priority'], { totalAmount: number; completedAmount: number; count: number }>);

  const priorities: Array<IProject['priority']> = ['critical', 'high', 'medium', 'low'];
  const overallTotalAmount = projects.reduce((sum, project) => sum + project.amount, 0);
  const overallCompletedAmount = projects.reduce((sum, project) => sum + (project.amount * (project.progress / 100)), 0);
  const overallProgress = Math.floor(overallTotalAmount > 0 ? (overallCompletedAmount / overallTotalAmount) * 100 : 0);

  // Determine the color for the overall progress bar
  const overallProgressColor = overallProgress >= 90 ? summaryStyles.overallProgressBarGreen :
                               overallProgress >= 50 ? summaryStyles.overallProgressBarYellow :
                               summaryStyles.overallProgressBarRed;

  return (
    <View style={summaryStyles.summaryContainer}>
      <Text style={summaryStyles.summaryTitle}>Project Progress Summary</Text>
      <View style={summaryStyles.cardsRow}>
        {priorities.map(priority => {
          const data = summaryData[priority];
          const priorityProgress = data && data.totalAmount > 0 ? (data.completedAmount / data.totalAmount) * 100 : 0;
          const displayProgress = Math.floor(parseFloat(priorityProgress.toFixed(0))); // Round to two decimal places

          let cardBackgroundColor = '#E6FFFA'; // default light teal
          let textColor = '#2C7A7B'; // default dark teal

          if (priority === 'critical') {
            cardBackgroundColor = '#FFE6E6'; // very light red
            textColor = '#C53030'; // red-700
          } else if (priority === 'high') {
            cardBackgroundColor = '#FFFBEB'; // very light yellow
            textColor = '#B7791F'; // darker yellow/brown
          } else if (priority === 'medium') {
            cardBackgroundColor = '#E6FFFA'; // very light green (light teal)
            textColor = '#4CAE4C'; // dark teal (complementary to green)
          } else if (priority === 'low') {
            cardBackgroundColor = '#F0F4F8'; // very light gray-blue
            textColor = '#01898F'; // gray-600
          }

          return (
            <View key={priority} style={[summaryStyles.summaryCard, { backgroundColor: cardBackgroundColor }]}>
              <Text style={[summaryStyles.summaryCardTitle, { color: textColor }]}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </Text>
              <Text style={[summaryStyles.summaryCardProgress, { color: textColor }]}>
                {displayProgress}%
              </Text>
              <Text style={[summaryStyles.summaryCardAmount, { color: textColor }]}>
                ${(data?.totalAmount || 0).toLocaleString()}
              </Text>
            </View>
          );
        })}
      </View>
      <View style={summaryStyles.overallSummary}>
        <Text style={summaryStyles.overallSummaryLabel}>Overall Progress</Text>
        <Text style={summaryStyles.overallSummaryValue}>
          ${Math.floor(overallCompletedAmount).toLocaleString()} / ${Math.floor(overallTotalAmount).toLocaleString()} ({parseFloat(overallProgress.toFixed(2))}%)
        </Text>
      </View>
      <View style={summaryStyles.overallProgressBarBackground}>
        <View
          style={[summaryStyles.overallProgressBarFill, overallProgressColor, { width: `${overallProgress}%` }]}
        ></View>
      </View>
    </View>
  );
};

const summaryStyles = StyleSheet.create({
  summaryContainer: {
    backgroundColor: '#F7FAFC', // light gray background for the whole summary section
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    alignSelf: 'center', // Center the summary block
    width: '100%',
    maxWidth: 700, // Match projectsContainer maxWidth
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A202C', // Darker text for titles
    marginBottom: 16,
    textAlign: 'center',
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Distribute space evenly between cards
    marginBottom: 16,
    gap: 12, // Space between cards
  },
  summaryCard: {
    flex: 1, // This makes each card take up equal space
    padding: 12, // Reduced padding to fit more in row
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center', // Center content horizontally
    justifyContent: 'center', // Center content vertically
    aspectRatio: 1.2, // Maintain a good aspect ratio for the cards
  },
  summaryCardTitle: {
    fontSize: 16, // Slightly reduced font size
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryCardProgress: {
    fontSize: 24, // Slightly reduced font size
    fontWeight: '900',
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryCardAmount: {
    fontSize: 12, // Slightly reduced font size
    fontWeight: '500',
    textAlign: 'center',
  },
  overallSummary: {
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0', // Light gray border
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overallSummaryLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748', // Gray-800
  },
  overallSummaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A5568',
  },
  overallProgressBarBackground: {
    width: '100%',
    backgroundColor: '#E2E8F0',
    borderRadius: 9999,
    height: 12,
    overflow: 'hidden',
    marginTop: 8, // Space between value and bar
  },
  overallProgressBarFill: {
    height: '100%',
    borderRadius: 9999,
  },
  overallProgressBarGreen: {
    backgroundColor: '#48BB78', // bg-green-500
  },
  overallProgressBarYellow: {
    backgroundColor: '#ECC94B', // bg-yellow-500
  },
  overallProgressBarRed: {
    backgroundColor: '#F56565', // bg-red-500
  },
});


/**
 * Projects Component
 * This is the main component that loads and displays a list of project cards.
 * It fetches project data asynchronously on component mount.
 */
const Projects: React.FC = () => {
  // State to hold the array of project data.
  const [projects, setProjects] = useState<IProject[]>([]);
  // State to manage loading status.
  const [loading, setLoading] = useState<boolean>(true);
  // State to manage any potential errors during data loading.
  const [error, setError] = useState<string | null>(null);

  // useEffect hook to fetch data when the component mounts.
  useEffect(() => {
    const fetchAndSetProjects = async () => {
      setLoading(true); // Indicate that data loading has started
      setError(null);    // Reset any previous errors

      try {
        // Call the asynchronous function to get project data
        const rawProjectsData = await processProjectsWithProgress();

        // It's a good practice to check if the fetched data is an array
        if (Array.isArray(rawProjectsData)) {
          // Process the fetched data (e.g., ensure 'progress' is valid)
          const processedProjects = rawProjectsData.map(project => ({
            ...project,
            // Ensure progress is a number and defaults to 0 if undefined or invalid
            progress: (typeof project.progress === 'number' && !isNaN(project.progress))
                        ? project.progress
                        : 0,
          }));
          setProjects(processedProjects);
        } else {
          // Handle cases where the data is not in the expected array format
          console.error("Fetched project data is not an array:", rawProjectsData);
          setError("Received invalid project data format. Please check the data source.");
          setProjects([]); // Set to empty array on format error
        }
      } catch (err) {
        // Handle any errors that occur during the data fetching process
        console.error("Failed to load projects:", err);
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred while loading projects.";
        setError(`Failed to load project data: ${errorMessage}. Please try again later.`);
        setProjects([]); // Clear projects on error
      } finally {
        // Indicate that data loading has finished, regardless of success or failure
        setLoading(false);
      }
    };

    fetchAndSetProjects(); // Execute the data fetching function

  }, []); // Empty dependency array ensures this effect runs only once on component mount.

  // Conditional rendering based on loading and error states.
  if (loading) {
    return (
      <View style={appStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A5568" />
        <Text style={appStyles.loadingText}>Loading projects...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={appStyles.errorContainer}>
        <Text style={appStyles.errorTextTitle}>Oops!</Text>
        <Text style={appStyles.errorText}>{error}</Text>
      </View>
    );
  }

  if (projects.length === 0) {
    return (
      <View style={appStyles.emptyContainer}>
        <Text style={appStyles.emptyText}>No projects found.</Text>
        <Text style={appStyles.emptySubText}>It seems there are no projects to display at the moment.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={appStyles.scrollViewContainer} contentContainerStyle={appStyles.scrollViewContentContainer}>
      {/* Page Title */}
      <Text style={appStyles.pageTitle}>
        Goals Overview
      </Text>

      {/* Container for project cards */}
      <View style={appStyles.projectsContainer}>
        {/* Map over the projects array to render a ProjectCard for each project. */}
        {projects.map((project, index) => (
          <ProjectCard key={`${project.name}-${index}`} project={project} />
        ))}
      </View>

      {/* Project Summary Component */}
      <ProjectSummary projects={projects} />
    </ScrollView>
  );
};

const appStyles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7FAFC', // bg-gray-50
    padding: 20,
  },
  loadingText: {
    fontSize: 18, // text-lg
    color: '#4A5568', // gray-700
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F5', // bg-red-50 (lighter red for error background)
    padding: 20,
  },
  errorTextTitle: {
    fontSize: 22, // text-xl
    fontWeight: 'bold',
    color: '#C53030', // red-700
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16, // text-base
    color: '#E53E3E', // red-600
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7FAFC',
    padding: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A5568',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
  },
  scrollViewContainer: {
    flex: 1,
    backgroundColor: '#F7FAFC', // bg-gray-50
  },
  scrollViewContentContainer: {
    padding: 24, // p-6 (simplified from p-6 sm:p-8)
  },
  pageTitle: {
    fontSize: 32, // text-3xl (adjusted for mobile)
    fontWeight: '800', // font-extrabold
    color: '#1A202C', // gray-900
    marginBottom: 32, // mb-8 (adjusted)
    textAlign: 'center',
    lineHeight: 40, // leading-tight (approx 1.25 * 32)
  },
  projectsContainer: {
    flexDirection: 'column',
    alignItems: 'center', // Center cards if they don't take full width
    width: '100%',
    maxWidth: 700, // Limit max width for better readability on larger tablets in portrait
    alignSelf: 'center', // Center the container itself
  },
});

export default Projects; // Export the Projects component as the default.