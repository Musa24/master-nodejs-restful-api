// Create and export configuration

// Container for all the environment
const environments = {};

//Default  will be  staging env
environments.staging = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: 'staging',
  hashingSecret: 'secret',
};

//Production environment
environments.production = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: 'prodcution',
  hashingSecret: 'secret',
};

// module.exports

//Determine which environment to export as a commnand-line argument
const currentEnvironment =
  typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : '';

//If nothing pass then  a default is staging
var environmentToExport =
  typeof environments[currentEnvironment] === 'object'
    ? environments[currentEnvironment]
    : environments.staging;

// export module
module.exports = environmentToExport;
