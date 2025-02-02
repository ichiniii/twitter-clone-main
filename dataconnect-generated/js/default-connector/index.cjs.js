const { getDataConnect, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'default',
  service: 'twitter-clone-udemy',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

