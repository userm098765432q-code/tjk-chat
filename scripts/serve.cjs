// Сервери статикӣ барои тестҳои Cypress — бе зависимости берунӣ
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".png": "image/png" };

function serve(port) {
  const server = http.createServer((req, res) => {
    const urlPath = req.url === "/" ? "/index.html" : req.url.split("?")[0];
    const file = path.join(ROOT, path.normalize(urlPath).replace(/^(\.\.[\/\\])+/, ""));
    if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404); res.end("Not found"); return; }
      res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
      res.end(data);
    });
  });
  server.listen(port);
  return server;
}

module.exports = { serve };
