const config = require("./utils/config"); // Import configuration settings from config.js, which uses data from .env
const express = require("express"); //Import Express framework
const app = express(); //Creates an instance of Express and assigns it to app variable
const loginRouter = require("./controllers/login");
const blogsRouter = require("./controllers/blogs"); //Import the router for /api/blogs/ from blogs.js
const usersRouter = require("./controllers/users");
const middleware = require("./utils/middleware"); // Import middlewares from middleware.js
const logger = require("./utils/logger"); //Import "console.log" middleware from logger.js
const cors = require("cors"); // Import the CORS middleware to enable Cross-Origin Resource Sharing
const mongoose = require("mongoose"); //Import Mongoose for MongoDB object modeling

//Connect to Mongo Database
mongoose.set("strictQuery", false);
logger.info("connecting to", config.MONGODB_URI);

mongoose
  .connect(config.MONGODB_URI) // Connect to the MongoDB database using the URI from the config
  .then(() => {
    logger.info("Connected to MongoDB database"); // Log a successful connection
  })
  .catch(
    (error) => logger.error("Error connecting to the database", error.message) // Log an error if the connection fails
  );

app.use(cors()); // Use the CORS middleware to allow connections from different origins
app.use(express.json()); // Use the express.json() middleware to parse incoming JSON requests (request.body)

app.use(middleware.requestLogger); // Use custom middleware to log information about incoming requests (GET, POST, ETC..)
app.use(middleware.tokenExtractor);
app.use(middleware.userExtractor);

app.use("/api/login", loginRouter);
app.use("/api/blogs", middleware.userExtractor, blogsRouter); // Use the blogsRouter for handling requests to /api/blogs
app.use("/api/users", usersRouter);

app.use(middleware.unknownEndpoint); // Use custom middleware to handle unknown endpoints
app.use(middleware.errorHandler); // Use custom middleware to handle errors

module.exports = app; // Export the app instance for use in other parts of the application (index.js in this case)
