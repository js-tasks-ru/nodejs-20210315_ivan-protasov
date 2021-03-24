const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  #totalSize = 0;
  #limit = 0;

  constructor(options) {
    super(options);
    this.#limit = options.limit;
  }

  _transform(chunk, encoding, callback) {
    let error;
    this.#totalSize +=chunk.length;

    if (this.#totalSize > this.#limit) {
      error = new LimitExceededError();
    }
    callback(error, chunk);
  }
}

module.exports = LimitSizeStream;
