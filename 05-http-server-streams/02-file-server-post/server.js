const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');

const server = new http.Server();
const maxSize = 1024 * 1024;

server.on('request', async (req, res) => {
  try {
    const pathname = url.parse(req.url).pathname.slice(1);
    const filepath = path.join(__dirname, 'files', pathname);
    if (!fs.existsSync('files')) {
      fs.mkdirSync('files');
    }
    switch (req.method) {
      case 'POST':
        if (pathname.indexOf('/') >= 0) {
          res.statusCode = 400;
          return res.end();
        }
        fs.access(filepath, (err) => {
          if (!err) {
            res.statusCode = 409;
            return res.end();
          }

          const limitSizeStream = new LimitSizeStream({limit: maxSize});
          const file = fs.createWriteStream(filepath, {autoDestroy: true});

          req
              .on('error', (e) => {
                fs.unlink(filepath, function(err) {
                  if (err) throw err;
                  res.statusCode = 500;
                  res.end();
                });
              })
              .pipe(limitSizeStream)
              .on('error', (e) => {
                fs.unlink(filepath, function(err) {
                  if (err) throw err;
                  res.statusCode = 413;
                  res.end('File is too large!');
                });
              })
              .pipe(file);

          file.on('finish', ()=>{
            res.statusCode = 201;
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
