function InfluxDBClient() {}

const QUERY_BUCKETS =
  'buckets() |> rename(columns: {"name": "_value"}) |> keep(columns: ["_value"]) |> sort(columns: ["_value"], desc: false)';

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
    errors.push("InfluxDB Token should be defined.");
  }
  if (!configParams.INFLUXDB_ORG) {
    errors.push("InfluxDB Organization should be defined.");
  }
  if (!configParams.INFLUXDB_BUCKET) {
    errors.push("InfluxDB Bucket should be defined.");
  }
  return errors.join(" ");
};

/***
 * Get Bucket names for configured URL, Org and Token.
 *
 * @param configParams configuration
 * @returns {[string]} bucket names
 */
InfluxDBClient.prototype.getBuckets = function(configParams) {
  const options = {
    method: "post",
    payload: QUERY_BUCKETS,
    contentType: "application/vnd.flux",
    headers: {
      Authorization: "Token " + configParams.INFLUXDB_TOKEN,
      Accept: "application/csv"
    }
  };
  let url = this._buildURL(configParams);
  const response = UrlFetchApp.fetch(url, options).getContentText();
  const csv = Utilities.parseCsv(response, ",");

  let buckets = [];
  let value_index;
  csv.forEach(function(row) {
    if (!value_index) {
      value_index = row.indexOf("_value");
    } else {
      let bucket = row[value_index];
      if (bucket) {
        buckets.push(bucket);
      }
    }
  });
  return buckets;
};

InfluxDBClient.prototype._buildURL = function(configParams) {
  let url = configParams.INFLUXDB_URL;
  if (!url.endsWith("/")) {
    url += "/";
  }
  url += "api/v2/query?org=";
  url += encodeURIComponent(configParams.INFLUXDB_ORG);
  return url;
};

// Needed for testing
var module = module || {};
module.exports = InfluxDBClient;
