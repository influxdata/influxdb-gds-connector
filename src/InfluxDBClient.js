function InfluxDBClient() {}

InfluxDBClient.prototype.getMeasurements = function() {
  return ["cpu", "mem"];
};

// Needed for testing
var module = module || {};
module.exports = InfluxDBClient;
