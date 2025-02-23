const app = require("./app"); // Import the Express application instance from app.js
const config = require("./utils/config"); // Import configuration settings from config.js

app.listen(config.PORT, () => {
  // Start the Express server and listen on the port specified in the config
  console.log(`Server running on port ${config.PORT}`); // Log a message indicating that the server is running and on which port
});
