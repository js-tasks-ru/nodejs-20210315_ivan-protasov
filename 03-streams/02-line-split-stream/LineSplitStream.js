const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  #buffer = "";

  constructor(options) {
    super(options);
  }

  _transform(chunk, encoding, callback) {
    const strArray = (this.#buffer + chunk).split(os.EOL);
    if (strArray < 2) {
      this.#buffer+=strArray[0];
    } else {
      for (let i=0; i< strArray.length-1; i++){
        this.push(strArray[i])
      }
      this.#buffer = strArray[strArray.length-1];
    }
    callback();
  }

  _flush(callback) {
    callback(null, this.#buffer);
  }
}

module.exports = LineSplitStream;
