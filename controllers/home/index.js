import asyncHandler from "express-async-handler";
import bunyan from "bunyan";
const logger = bunyan.createLogger({ name: "Home Controller" });

// @desc        Home page
// @route       GET /
// @access      Public
export const homePage = asyncHandler(async (req, res) => {
  logger.info(`Route: /`);

  try {
    res.render("home/home", {
      title: process.env.SITE_NAME || "RMT",
      home: true,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).json({
      status: "failure",
      message: err.message,
      cause: err.stackTrace,
    });
  }
});
