import Server from "bare-server-node";
import https from "https";
// import http from "http";
import nodeStatic from "node-static";
import fs from "fs";

const bare = new Server("/bare/", "");
const serve = new nodeStatic.Server("static/");

// const logFileStat = fs.statSync("logs/requests.log");
// if (stats.size > 100000000) {
//     console.log(`[!] log file is over 100mb, deleting log file`);
    
// }

const server = https.createServer({
  key: fs.readFileSync("ssl/key.pem"),
  cert: fs.readFileSync("ssl/cert.pem"),
});
// const server = http.createServer();
server.on("request", (request, response) => {
  console.log(
    `[-] ${request.headers["x-bare-host"] || ""}${request.headers["x-bare-path"] || request.url}`
  );
console.log(request.headers);
  if (bare.route_request(request, response)) return true;
  serve.serve(request, response);
});

server.on("upgrade", (req, socket, head) => {
  if (bare.route_upgrade(req, socket, head)) return;
  socket.end();
});

server.listen(443, () => {
  console.log(`[-] server started on port 443`)
});
