function InfluxDBClient() {}

InfluxDBClient.prototype.getMeasurements = function() {
  return ["cpu", "mem"];
};

/**
 * Validate configuration of Connector.
 *
 * @param configParams configuration
 * @returns {string} configuration errors
 */
InfluxDBClient.prototype.validateConfig = function(configParams) {
  let errors = [];
  configParams = configParams || {};
  if (!configParams.INFLUXDB_URL) {
    errors.push("InfluxDB URL should be defined.");
  }
  if (!configParams.INFLUXDB_TOKEN) {
    errors.push("InfluxDB TOKEN should be defined.");
  }
  if (!configParams.INFLUXDB_ORG) {
    errors.push("InfluxDB Organization should be defined.");
  }
  return errors.join(" ");
};

// Needed for testing
var module = module || {};
module.exports = InfluxDBClient;
