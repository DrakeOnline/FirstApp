import 'dotenv/config'; // This line is crucial: it loads variables from .env

export default ({ config }) => {
  return {
    ...config,
    expo: {
      ...config.expo,
      owner: "drakec",
      slug: "FirstApp",
      // Add the 'android' object with the 'package' property
      android: {
        package: "com.drakec.firstapp", // <-- IMPORTANT: Replace with your unique package name
      },
      extra: {
        // These keys will be accessible in your app via Expo-Constants
        // For security, it's best to load these from .env in app.config.js
        clockifyWorkspaceId: process.env.CLOCKIFY_WORKSPACE_ID,
        clockifyApiKey: process.env.CLOCKIFY_API_KEY,
        // You can add more environment variables here as needed

        // Manually add the 'eas' object with your projectId
        eas: {
          projectId: "96ac5958-27c7-4530-88d2-dab89568ebee",
        },
        router: {}, // Keep this if you are using expo-router, as it's often dynamically added
      },
    },
  };
};
