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
      case 'GET':
        if (pathname.indexOf('/') >= 0) {
          res.statusCode = 400;
          res.end();
          return;
        }
        const readStream = fs.createReadStream(filepath);
        readStream.pipe(res);
        readStream.on('error', function(err) {
          if (err.code === 'ENOENT') {
            res.statusCode = 404;
            res.end();
          } else {
            res.statusCode = 500;
            res.end('Internal server error');
          }
        });
        req.on('close', ()=>{
          if (res.finished) return;
          stream.destroy();
        });
        break;
      default:
        res.statusCode = 501;
        res.end('Not implemented');
    }
  } catch (e) {
    res.statusCode = 500; // При любых ошибках сервер должен, по возможности, возвращать ошибку 500 => Антон, я правильно понял, что имелось ввиду?
    res.end();
  }
});

module.exports = server;
