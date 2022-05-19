import Server from "bare-server-node";
import https from "https";
import http from "http";
import nodeStatic from "node-static";
import fs from "fs";

const bare = new Server("/bare/", "");
const serve = new nodeStatic.Server("static/");

const httpsServer = process.env.HTTPMODE ? http.createServer() : https.createServer({
  key: fs.readFileSync("ssl/key.pem"),
  cert: fs.readFileSync("ssl/cert.pem"),
});

httpsServer.on("request", (req, res) => {
  const proxied = bare.route_request(req, res);
  !proxied && serve.serve(req, res);

  const hd = req.headers;
  console.log(
    `[${proxied ? "proxy" : "static"}] ${hd["x-bare-host"] || ""}${
      hd["x-bare-path"] || req.url
    }`
  );
  proxied && console.log(hd);
});

httpsServer.on("upgrade", (req, socket, head) => {
  if (bare.route_upgrade(req, socket, head)) return;
  socket.end();
});

httpsServer.listen(process.env.PORT || 443, () => {
  console.log(`[-] https server started on port ${process.env.PORT || 443}`);
});
