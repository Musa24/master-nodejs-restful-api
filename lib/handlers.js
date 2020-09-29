// // sample handlers
// handlers.sample = function (data, callback) {
//   //Callback http status code and payload object(with "message")
//   // status code:406=> Not Acceptable
//   callback(406, { name: 'sample handler' });
// };

//Dependencies
const _data = require('./data');
const helpers = require('./helpers');

//Define the handlers
const handlers = {};

//User handler
handlers.users = function (data, callback) {
  const methodReq = JSON.parse(data).method;
  const acceptableMethod = ['post', 'get', 'put', 'delete'];
  if (acceptableMethod.indexOf(methodReq) > -1) {
    handlers._users[methodReq](data, callback);
  } else {
    callback(405);
  }
};

//cONTAINER for the users submethods
handlers._users = {};

//POST
//Required data:firstName,LastName,phone,password,tosAgreement
handlers._users.post = function (dataPayload, callback) {
  let data = JSON.parse(dataPayload);

  // Check that all required files are filled out
  const firstName =
    typeof data.payload.firstName === 'string' &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName
      : false;

  const lastName =
    typeof data.payload.lastName === 'string' &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName
      : false;

  const phone =
    typeof data.payload.phone === 'string' &&
    data.payload.phone.trim().length == 10
      ? data.payload.phone
      : false;

  const password =
    typeof data.payload.password === 'string' &&
    data.payload.password.trim().length > 0
      ? data.payload.password
      : false;

  const tosAgreement =
    typeof data.payload.tosAgreement === 'boolean' &&
    data.payload.tosAgreement === true
      ? true
      : false;
  if ((firstName, lastName, password, tosAgreement, phone)) {
    //Make sure the user is unique(does not exists)
    _data.read('users', phone, (err) => {
      if (err) {
        //Hash the password
        const hashedPassword = helpers.hash(password);
        if (hashedPassword) {
          const userObject = {
            firstName,
            lastName,
            phone,
            tosAgreement,
            hashedPassword,
          };

          _data.create('users', phone, userObject, (err) => {
            if (!err) {
              callback(200);
            } else {
              console.log(err);
              callback(500, { Error: 'Could not create a User' });
            }
          });
        } else {
          callback(500, { Error: "Could not hash a User' password" });
        }
      } else {
        callback(400, {
          Error: 'A user with that phone number already exists',
        });
      }
    });
  } else {
    callback(400, { Error: 'Missing required fileds' });
  }
};

//GET
// Required Data :phone
// Optional data : none
// TODO => Only authenticated user can access their object
handlers._users.get = function (data, callback) {
  //check that the phone number is valid from the query string
  const queryString = JSON.parse(data).queryStringObject;

  const phone =
    typeof queryString.phone === 'string' &&
    queryString.phone.trim().length === 10
      ? queryString.phone.trim()
      : false;
  if (phone) {
    _data.read('users', phone, function (err, data) {
      if (!err) {
        let res = JSON.parse(data);
        //Remove the hash password from db
        delete res.hashedPassword;
        callback(200, res);
      } else {
        callback(400);
      }
    });
  } else {
    callback(400, { Error: 'Mising required field' });
  }
};

//PUT
//Required data: phone
// optional data : all
// TODO => Only authenticated user can access their object(Access control)
handlers._users.put = function (data, callback) {
  //Check for the require field
  let updatingData = JSON.parse(data).payload;
  // Check that all required files are filled out
  const firstName =
    typeof updatingData.firstName === 'string' &&
    updatingData.firstName.trim().length > 0
      ? updatingData.firstName
      : false;

  const lastName =
    typeof updatingData.lastName === 'string' &&
    updatingData.lastName.trim().length > 0
      ? updatingData.lastName
      : false;

  const phone =
    typeof updatingData.phone === 'string' &&
    updatingData.phone.trim().length == 10
      ? updatingData.phone
      : false;

  const password =
    typeof updatingData.password === 'string' &&
    updatingData.password.trim().length > 0
      ? updatingData.password
      : false;

  const tosAgreement =
    typeof updatingData.tosAgreement === 'boolean' &&
    updatingData.tosAgreement === true
      ? true
      : false;

  if (phone) {
    //   Error if nothing send to update
    if (firstName || lastName || password) {
      _data.read('users', phone, function (err, data) {
        let res = JSON.parse(data);
        if (!err) {
          //update the necesary field
          if (firstName) {
            res.firstName = firstName;
          }
          if (lastName) {
            res.lastName = lastName;
          }
          if (password) {
            res.hashedPassword = helpers.hash(password);
          }
        }

        //Store the new update
        _data.update('users', phone, res, function (err) {
          if (!err) {
            callback(200);
          } else {
            console.log(err);
            callback(500, { Error: 'Failed to update' });
          }
        });
      });
    } else {
      callback(400, { Error: 'Missing a field to update' });
    }
  } else {
  }
};

//DELETE
//Requied field : phone
// Authenticated
handlers._users.delete = function (data, callback) {
  //check that the phone number is valid from the query string
  const queryString = JSON.parse(data).queryStringObject;

  const phone =
    typeof queryString.phone === 'string' &&
    queryString.phone.trim().length === 10
      ? queryString.phone.trim()
      : false;
  if (phone) {
    _data.read('users', phone, function (err, data) {
      if (!err) {
        _data.delete('users', phone, (err) => {
          if (!err) {
            callback(200);
          } else {
            callback(500, { Error: 'Could not delete the specifi user' });
          }
        });
      } else {
        callback(400, { Error: 'Could not find the specified user' });
      }
    });
  } else {
    callback(400, { Error: 'Mising required field' });
  }
};

//Token handler
handlers.tokens = function (data, callback) {
  const methodReq = JSON.parse(data).method;
  const acceptableMethod = ['post', 'get', 'put', 'delete'];
  if (acceptableMethod.indexOf(methodReq) > -1) {
    handlers._tokens[methodReq](data, callback);
  } else {
    callback(405);
  }
};

// Container for all token
handlers._tokens = {};

// Token post
// Require:phone & password
// Option:None
// Token get
handlers._tokens.post = function (dataPayload, callback) {
  let data = JSON.parse(dataPayload);
  const phone =
    typeof data.payload.phone === 'string' &&
    data.payload.phone.trim().length == 10
      ? data.payload.phone
      : false;

  const password =
    typeof data.payload.password === 'string' &&
    data.payload.password.trim().length > 0
      ? data.payload.password
      : false;

  if (phone && password) {
    //Lockup the user match that phone number
    _data.read('users', phone, function (err, userData) {
      let data = JSON.parse(userData);
      if (!err && userData) {
        //hash the sent passowrd and compare with the store password
        const hashedPassword = helpers.hash(password);

        if (hashedPassword === data.hashedPassword) {
          //if valid create a new token with random name  set expiration date 1 hour in the future
          const tokenId = helpers.createRandomString(20);
          const expires = Date.now() + 1000 * 60 * 60;

          const tokenObject = {
            phone: phone,
            id: tokenId,
            expires: expires,
          };

          _data.create('tokens', tokenId, tokenObject, (err) => {
            if (!err) {
              callback(200, tokenObject);
            } else {
              callback(500, { Error: 'Could not create a new token' });
            }
          });
        } else {
          callback(400, {
            Error: "Password did not match the specified user'",
          });
        }
      } else {
        callback(400, { Error: 'Could not find the specif user' });
      }
    });
  } else {
    callback(400, { Error: 'Missing required filed(s)' });
  }
};

// Token - git
// Required data : id
//Optional data :none
handlers._tokens.get = function (data, callback) {
  //check that the id is valid
  const queryString = JSON.parse(data).queryStringObject;

  const id =
    typeof queryString.id === 'string' && queryString.id.trim().length === 20
      ? queryString.id.trim()
      : false;
  if (id) {
    _data.read('tokens', id, function (err, tokenData) {
      if (!err) {
        let res = JSON.parse(tokenData);

        callback(200, res);
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, { Error: 'Mising required field' });
  }
};

//Tokens -put
// Requied data : id ,extend
//Option data : none

handlers._tokens.put = function (dataPayload, callback) {
  let data = JSON.parse(dataPayload);
  const id =
    typeof data.payload.id === 'string' && data.payload.id.trim().length == 20
      ? data.payload.id
      : false;
  const extend =
    typeof data.payload.id === 'boolen' && data.payload.extend == true
      ? true
      : false;

  if (id && extend) {
    //Lockup the token
    _data.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        //Check if the token is not expired yet
        if (tokenData.expires > DataCue.now()) {
          tokenData.expires = Date.now() + 1000 * 60 * 60;
          _data.update('tokens', id, tokenData, (err) => {
            if (!err) {
              callback(200);
            } else {
              callback(500, { Error: 'Could not update the token' });
            }
          });
        } else {
          callback(400, {
            Error: 'The token has already expired, and can not be extended',
          });
        }
      } else {
        callback(400, { Error: 'Specified token does not extst' });
      }
    });
  } else {
    callback(400, { Error: 'Missing required field(s) or invalid' });
  }
};

//ping handlers
handlers.ping = function (data, callback) {
  callback(200);
};

//Not found handler
handlers.notFound = function (data, callback) {
  callback(404);
};

module.exports = handlers;
