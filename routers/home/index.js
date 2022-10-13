import { Router } from "express";
import { homePage } from "../../controllers/home/index.js";
import { signedOut } from "../../middleware/AuthMiddleware.js";

const home = Router();

// home route
home.route("/").get(homePage);

export default home;
