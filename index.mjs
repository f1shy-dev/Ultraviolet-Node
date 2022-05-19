import Server from "bare-server-node";
import https from "https";
import http from "http";
import nodeStatic from "node-static";
import fs from "fs";

const bare = new Server("/bare/", "");
const serve = new nodeStatic.Server("static/");

const httpsServer = https.createServer({
  key: fs.readFileSync("ssl/key.pem"),
  cert: fs.readFileSync("ssl/cert.pem"),
});
const httpServer = http.createServer();

// const server = http.createServer();
[httpServer, httpsServer].forEach(i => i.on("request", (request, response) => {
  console.log(
    `[-] ${request.headers["x-bare-host"] || ""}${request.headers["x-bare-path"] || request.url}`
  );
  console.log(request.headers);
  if (bare.route_request(request, response)) return true;
  serve.serve(request, response);
}));

[httpServer, httpsServer].forEach(i => i.on("upgrade", (req, socket, head) => {
  if (bare.route_upgrade(req, socket, head)) return;
  socket.end();
}));

httpsServer.listen(443, () => {
  console.log(`[-] https server started on port 443`)
});

httpServer.listen(8080, () => {
  console.log(`[-] http server started on port 8080`)
});
