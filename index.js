// Primary file for the API
const http = require('http');
const https = require('https');
const { stringify } = require('querystring');
const { StringDecoder } = require('string_decoder');
const url = require('url');
const stringDecode = require('string_decoder').StringDecoder; //for Payload
const config = require('./lib/config');
const fs = require('fs');
// const _data = require('./lib/data');
const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');

//TESITNG TO WRITE A DATA
// _data.create('test', 'newFile', { foo: 'boo' }, (err) => {
//   console.log('this was the errror', err);
// });
// _data.read('test', 'newFile', (err, data) => {
//   console.log('this was the errror', err, 'And this will be the data', data);
// });
// _data.update('test', 'newFile', { name: 'Musa' }, (err) => {
//   console.log('this was the errror', err);
// });

// _data.delete('test', 'newFile', (err) => {
//   console.log('this was the errror', err);
// });

//HTTP
//Instantiate the HTTP server
const httpServer = http.createServer((req, res) => {
  unifiedServer(req, res);
});

// Start the server and listen on a port => HTTP
const PORT = config.httpPort;
httpServer.listen(PORT, () => {
  // console.log('The sever is running in PORT:', PORT,);
  console.log(`The sever is running in port ${PORT} in ${config.envName} mode`);
});

//HTTPS
//Instantiate the HTTPS server
const httpsServerOptions = {
  key: fs.readFileSync('./https/key.pem'),
  cert: fs.readFileSync('./https/cert.pem'),
};

const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
  unifiedServer(req, res);
});

// Start the server and listen on a port => HTTP
const PORT1 = config.httpsPort;
httpsServer.listen(PORT1, () => {
  // console.log('The sever is running in PORT:', PORT,);
  console.log(
    `The sever is running in port ${PORT1} in ${config.envName} mode`
  );
});

//All The sever logic for both the http and https server
const unifiedServer = function (req, res) {
  //Get the URL  and Parse it
  const parsedUrl = url.parse(req.url, true);

  //Get the path
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');

  //Get the query string as an object
  const queryStringObjct = parsedUrl.query;

  //   Query String Parameter
  console.log('Query String Parameter', queryStringObjct);
  //Get the http Method
  const method = req.method.toLowerCase();

  //Get header as object
  const header = req.headers;
  // console.log('HEADERS', header);

  //Get the payload if any
  const decoder = new StringDecoder('utf-8');
  let buffer = '';
  req.on('data', (data) => {
    buffer += decoder.write(data); //This is called only when we have a data
  });

  req.on('end', () => {
    buffer += decoder.end();

    //choose the handler this request to go if one if not found user not found handler
    const chosenHandler =
      typeof router[trimmedPath] !== 'undefined'
        ? router[trimmedPath]
        : handlers.notFound;

    // Construct data object to send to the handler

    let data = {
      trimmedPath: trimmedPath,
      queryStringObject: queryStringObjct,
      method: method,
      headers: header,
      payload: helpers.parseJSONToObject(buffer),
      // payload: buffer,
    };
    // creating JSON data
    data = JSON.stringify(data);

    //  Route the request to the handler specified in the router
    chosenHandler(data, (statusCode, payload) => {
      //Use status code called back by handler of default to 200 and payload empty or from handler
      statusCode = typeof statusCode === 'number' ? statusCode : 200;
      payload = typeof payload === 'object' ? payload : {};
      // Convert the payload to string
      const payloadString = JSON.stringify(payload);

      //Telling we are sending a JSON type
      res.setHeader('Content-Type', 'application/json');
      // return  the response
      res.writeHead(statusCode);
      // Send Respond

      res.end(payloadString);
      console.log('Returning this response:', statusCode, payloadString);
    });

    //log the request path
    // console.log('PAYLOAD', buffer);
  });
};

//Define a request router
const router = {
  // sample: handlers.sample,
  ping: handlers.ping,
  users: handlers.users,
  tokens: handlers.tokens,
};
