const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

server.on('request', (req, res) => {
  try {
    const pathname = url.parse(req.url).pathname.slice(1);

    const filepath = path.join(__dirname, 'files', pathname);

    switch (req.method) {
      case 'DELETE':
        if (pathname.indexOf('/') >= 0) {
          res.statusCode = 400;
          return res.end();
        }

        fs.access(filepath, (err) => {
          if (err) {
            res.statusCode = 404;
            return res.end();
          }

          fs.unlink(filepath, function(err) {
            if (err) throw err;
            res.statusCode = 200;
            return res.end();
          });
        });
        break;

      default:
        res.statusCode = 501;
        res.end('Not implemented');
    }
  } catch (e) {
    console.error(e.stack);
    res.statusCode = 500;
    res.end();
  }
});

module.exports = server;
