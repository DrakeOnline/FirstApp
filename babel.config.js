module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // This plugin will read from your .env file and inline these specific variables
      ["transform-inline-environment-variables", {
        "include": [
          "CLOCKIFY_API_KEY",
          "CLOCKIFY_WORKSPACE_ID"
        ]
      }]
      // Keep any other plugins you might have here
    ],
  };
};