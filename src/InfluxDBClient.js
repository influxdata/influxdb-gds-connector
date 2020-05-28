function InfluxDBClient() {}

InfluxDBClient.prototype.getMeasurements = function() {
  return ["cpu", "mem"];
};

// Needed for testing
module.exports = InfluxDBClient;
