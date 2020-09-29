//Libary for storing and editing data

//Dependencies
const fs = require('fs');

const path = require('path');
const helpers = require('./helpers');

//Container for the module(to be exported)
var lib = {};

//Base directory of the data
lib.baseDir = path.join(__dirname, '/.././.data/');

//Write data to a file
lib.create = function (dir, file, data, callback) {
  //Open a file for writtng
  const url = lib.baseDir + dir + '/' + file + '.json';
  console.log(url);
  fs.open(url, 'wx', (err, fileDescriptor) => {
    console.log(fileDescriptor, err);
    if (!err && fileDescriptor) {
      //   Convert data to string
      var stringData = JSON.stringify(data);

      //Write to file and Close it
      fs.writeFile(fileDescriptor, stringData, (err) => {
        if (!err) {
          fs.close(fileDescriptor, (err) => {
            if (!err) {
              callback(false);
            } else {
              callback('Error closing file');
            }
          });
        } else {
          callback('Error writting to file');
        }
      });
    } else {
      callback('Could not create a new file, may be it already exist', err);
    }
  });
};

//Read data from a file
lib.read = function (dir, file, callback) {
  const url = lib.baseDir + dir + '/' + file + '.json';
  fs.readFile(url, 'utf-8', (err, data) => {
    console.log('Data', data);
    if (!err && data) {
      const parsedData = helpers.parseJSONToObject(data);
      callback(false, data);
    } else {
      callback(err, data);
    }
  });
};

// Update
lib.update = function (dir, file, data, callback) {
  //Open file for writting
  const url = lib.baseDir + dir + '/' + file + '.json';
  fs.open(url, 'r+', (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      const stringData = JSON.stringify(data);
      // truncate the file
      fs.ftruncate(fileDescriptor, (err) => {
        if (!err) {
          //Write to file and Close it
          fs.writeFile(fileDescriptor, stringData, (err) => {
            if (!err) {
              fs.close(fileDescriptor, (err) => {
                if (!err) {
                  callback(false);
                } else {
                  callback('Error closing  file');
                }
              });
            } else {
              callback('Error writting to the existing file');
            }
          });
        } else {
          callback('Error truncating file');
        }
      });
    } else {
      callback(
        'Could not open the file for updsting ,it may be already exist',
        err
      );
    }
  });
};

//DELETE a file
lib.delete = function (dir, file, callback) {
  //unlink the file
  const url = lib.baseDir + dir + '/' + file + '.json';
  fs.unlink(url, (err) => {
    if (!err) {
      callback(false);
    } else {
      callback('Error deleting a file');
    }
  });
};

// export
module.exports = lib;
