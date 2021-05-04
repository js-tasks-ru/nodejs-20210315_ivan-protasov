const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();
const maxSize = 1048576;

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
          let size = 0;
          const body = [];
          let isLimit;

          req.on('data', function(data) {
            size += data.length;
            body.push(data);

            if (size > maxSize) {
              isLimit = true;
              res.statusCode = 413;
              return res.end('File is too big!');
            }
          });

          req.on('error', (e) => {
            console.error(e.stack);
            res.statusCode = 500;
            res.end();
          });

          req.on('end', ()=>{
            if (!isLimit) {
              const file = fs.createWriteStream(filepath, {autoDestroy: true});
              file.on('error', function(e) {
                console.error(e.stack);
                res.statusCode = 500;
                res.end();
              }).write(Buffer.concat(body));
              file.on('finish', ()=>{
                res.statusCode = 201;
                return res.end();
              });
              file.end();
            }
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
