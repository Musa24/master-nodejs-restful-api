// Helpers for various task

// Dependencies
const crypto = require('crypto');
const config = require('./config');

//container for all the helpers

const helpers = {};
// creating a SHA256 hash
helpers.hash = function (str) {
  if (str.length > 0) {
    const hash = crypto
      .createHmac('sha256', config.hashingSecret)
      .update(str)
      .digest('hex');
    return hash;
  }
};

//Parse the JSON string to an object in all cases,without throwing
helpers.parseJSONToObject = function (str) {
  try {
    const obj = JSON.parse(str);
    return obj;
  } catch (error) {
    return {};
  }
};

//Create a string of a randow alphanumeriv character of a given length
helpers.createRandomString = function (stringLength) {
  stringLength =
    typeof stringLength === 'number' && stringLength > 0 ? stringLength : false;

  if (stringLength) {
    const possibleCharacters = 'abcdefghijklmnopqrstvuwxyz0123456789';
    // start final string

    let str = '';
    for (let i = 0; i < stringLength; i++) {
      // Get a random character from the possibleCharacter string
      let randomCharacter = possibleCharacters.charAt(
        Math.floor(Math.random() * possibleCharacters.length)
      );

      str += randomCharacter;
    }
    return str;
  }
};

module.exports = helpers;
