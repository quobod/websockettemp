const log = (arg = "") => console.log(arg);

if (window) {
  const nav = navigator;
  const platform = nav.platform;
  const lang = nav.language;
  const langs = nav.languages;
  const storage = nav.storage;
  const usb = nav.usb;
  const userAgent = nav.userAgent;
  const vendor = nav.vendor;

  log(`Platform:\t${platform}`);
  log(`Languages:\t${langs}`);
  log(`Language:\t${lang}`);
  log(`UAgent:\t${userAgent}`);
  log(`Vendor:\t${vendor}`);
}

const wsClient = new WebSocket("ws://localhost:3000", ["echo-protocol"]);

wsClient.onopen = function (e) {
  log("[open] Connection established");
  log("Sending to server");
  wsClient.send("My name is John");
};

wsClient.onmessage = function (event) {
  log(`[message] Data received from server: ${event.data}`);
};

wsClient.onclose = function (event) {
  if (event.wasClean) {
    log(
      `[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`
    );
  } else {
    // e.g. server process killed or network down
    // event.code is usually 1006 in this case
    log("[close] Connection died");
  }
};

wsClient.onerror = function (error) {
  log(`[error] ${error.message}`);
};
