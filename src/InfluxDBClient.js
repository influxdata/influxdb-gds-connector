function InfluxDBClient() {}

InfluxDBClient.prototype.getMeasurements = function() {
  return ["cpu", "mem"];
};

module.exports = new InfluxDBClient();
