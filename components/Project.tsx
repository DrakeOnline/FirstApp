import React from 'react';

/**
 * IProject Interface
 * Defines the structure for a single project object, including details
 * necessary for display and the completion meter.
 */
export interface IProject {
  name: string;
  details: string;
  amount: number;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  start_date: string;
  progress: number; // Represents completion percentage (0-100)
}

/**
 * Projects Component
 * This functional React component displays the details of a single project
 * along with a visual completion meter. It receives a 'project' object
 * conforming to the IProject interface as its prop.
 */
const Projects: React.FC<{ project: IProject }> = ({ project }) => {
  // Determine the color of the progress bar based on the project's progress.
  // This provides a quick visual cue about the project's status,
  // transitioning from red (Low progress) to yellow (Medium) to green (High).
  const progressColor = project.progress >= 90 ? 'bg-green-500' :
                        project.progress >= 50 ? 'bg-yellow-500' :
                        'bg-red-500';

  // Determine the text color for priority for better visual distinction.
  // This helps in quickly identifying the urgency of a project.
  const priorityTextColor = project.priority === 'Critical' ? 'text-red-600' :
                           project.priority === 'High' ? 'text-orange-500' :
                           project.priority === 'Medium' ? 'text-blue-500' :
                           'text-gray-500';

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 flex flex-col justify-between border border-gray-200">
      <div>
        {/* Project Name: Displayed prominently as a title. */}
        <h3 className="text-2xl font-semibold text-gray-800 mb-2">{project.name}</h3>
        {/* Project Details: Rendered only if the 'details' field is not empty,
            providing a brief description of the project. */}
        {project.details && <p className="text-gray-600 mb-3 text-base leading-relaxed">{project.details}</p>}

        {/* Grid Layout for Additional Project Information:
            Organizes amount, priority, and start date in a responsive grid. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-base text-gray-700 mb-4">
          {/* Amount: Displays the project's financial value, formatted for readability. */}
          <div><span className="font-medium text-gray-800">Amount:</span> <span className="font-bold">${project.amount.toLocaleString()}</span></div>
          {/* Priority: Indicates the urgency of the project with a distinct color. */}
          <div><span className="font-medium text-gray-800">Priority:</span> <span className={`font-bold ${priorityTextColor}`}>{project.priority}</span></div>
        </div>
      </div>

      {/* Completion Meter Section:
          Provides a visual representation of the project's progress. */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-medium text-gray-700">{project.progress}%</span>
        </div>
        {/* The actual progress bar:
            A visually appealing bar that fills up based on the 'progress' value,
            with dynamic color changes. */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${progressColor}`}
            style={{ width: `${project.progress}%` }}
            role="progressbar"
            aria-valuenow={project.progress}
            aria-valuemin={0}
            aria-valuemax={100}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Projects; // Export the Projects component as the default.
