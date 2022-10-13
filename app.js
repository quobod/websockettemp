import express from "express";
import https from "https";
import http from "http";
import path from "path";
import { fs } from "mz";
import dotenv from "dotenv";
import handlebars from "express-handlebars";
import bodyParser from "body-parser";
import { dlog, successMessage, cls } from "./custom_modules/index.js";
import home from "./routers/home/index.js";
import websocket from "websocket";

// Create __dirname
const __dirname = path.resolve(".");

// Websocket Server
const wsServer = websocket.server;
const wsClient = websocket.client;
const wssc = new wsClient();

// Initialize dotenv
dotenv.config();

// HTTPS options
const httpsOptions = letsencryptOptions();

// Initialize express
const app = express();

app.set("views", path.join(__dirname, "views"));

// view engine setup
app.set("view engine", "hbs");
app.engine(
  "hbs",
  handlebars.engine({
    layoutsDir: __dirname + "/views/layouts",
    extname: "hbs",
    defaultLayout: "layout",
  })
);

// Initialize middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-cache,no-store,max-age=0,must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "-1");
  res.setHeader("X-XSS-Protection", "1;mode=block");
  // res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("keep-alive", "-1");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Content-Security-Policy", "script-src 'self'");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("x-powered-by", "Deez Nuts");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Content-Length, X-Requested-With, *"
  );
  next();
});

// Static assets
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static("./node_modules/websocket/lib/WebSocketClient.js"));

// parse requests of content-type - application/json
app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(
  express.urlencoded({
    extended: true,
  })
);

// Routes
app.use("/", home);

// Initialize server
const server = http.createServer(app);
// const server = https.createServer(httpsOptions, app);

// Start server
server.listen(process.env.PORT, () => {
  cls();
  dlog(successMessage(`\n\tServer listening on port ${process.env.PORT}\n`));
});
// server.listen(process.env.SPORT, () => {
//   cls();
//   dlog(successMessage(`\n\tServer listening on port ${process.env.SPORT}\n`));
// });

function letsencryptOptions(domain = null) {
  let certPath;
  if (null != domain) {
    certPath = "/etc/letsencrypt/live/";
    return {
      key: fs.readFileSync(certPath + domain + "/privkey.pem"),
      cert: fs.readFileSync(certPath + domain + "/cert.pem"),
      ca: fs.readFileSync(certPath + domain + "/chain.pem"),
    };
  } else {
    certPath = path.join(__dirname, "../certi/");
    return {
      key: fs.readFileSync(certPath + "server.key"),
      cert: fs.readFileSync(certPath + "server.cert"),
    };
  }
}

const wss = new wsServer({
  httpServer: server,
  acceptAutoConnections: false,
});

wss.on("request", function (request) {
  if (!originIsAllowed(request.origin)) {
    // Make sure we only accept requests from an allowed origin
    request.reject();
    console.log(
      new Date() + " Connection from origin " + request.origin + " rejected."
    );
    return;
  }

  const connection = request.accept("echo-protocol", request.origin);

  console.log(new Date() + " Connection accepted.");

  connection.on("message", (message) => {
    const mType = message.type.trim().toLowerCase();

    switch (mType) {
      case "utf8":
        console.log("Received Message: " + message.utf8Data);

        connection.sendUTF("Received your message");
        break;

      case "binary":
        console.log(
          "Received Binary Message of " + message.binaryData.length + " bytes"
        );

        connection.sendBytes("Here ya go".binaryData);
        break;

      default:
        console.log("Received Message Type: " + message.type + "\n");
        break;
    }
  });

  connection.on("close", function (reasonCode, description) {
    console.log(
      new Date() + " Peer " + connection.remoteAddress + " disconnected."
    );
  });
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return "http://localhost:3000" == origin;
}
