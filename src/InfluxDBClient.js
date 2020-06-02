function InfluxDBClient() {}

const QUERY_BUCKETS = () =>
  'buckets() |> rename(columns: {"name": "_value"}) |> keep(columns: ["_value"]) |> sort(columns: ["_value"], desc: false)';

const QUERY_MEASUREMENTS = bucket_name =>
  `import "influxdata/influxdb/v1" v1.measurements(bucket: "${bucket_name}")`;

const QUERY_TAGS = (bucket_name, measurement_name) =>
  `import "influxdata/influxdb/v1"

v1.tagKeys(
  bucket: "${bucket_name}",
  predicate: (r) => r._measurement == "${measurement_name}",
  start: duration(v: uint(v: 1970-01-01) - uint(v: now()))
)
|> filter(fn: (r) => r._value != "_start" and r._value != "_stop" and r._value != "_measurement" and r._value != "_field")`;

// import "influxdata/influxdb/v1"

// v1.measurementFieldKeys(
//     bucket: "github",
//     measurement: "circleci",
//     start: duration(v: uint(v: 1970-01-01) - uint(v: now()))
// )

// const QUERY_FIELDS = (bucket_name, measurement_name, tags) => {
//   let concat = tags
//     .map(function(tag) {
//       return `"${tag}"`;
//     })
//     .join(", ");
//   return `from(bucket: "${bucket_name}") |> range(start: time(v: 1)) |> filter(fn: (r) => r["_measurement"] == "${measurement_name}") |> drop(columns: [${concat}]) |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value") |> limit(n:1)`;
// };

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
    errors.push("URL to connect should be defined.");
  }
  if (!configParams.INFLUXDB_TOKEN) {
    errors.push("Token should be defined.");
  }
  if (!configParams.INFLUXDB_ORG) {
    errors.push("Organization should be defined.");
  }
  if (!configParams.INFLUXDB_BUCKET) {
    errors.push("Bucket should be defined.");
  }
  if (!configParams.INFLUXDB_MEASUREMENT) {
    errors.push("Measurement should be defined.");
  }
  return errors.join(" ");
};

/**
 * Get Buckets names for configured URL, Org and Token.
 *
 * @param configParams configuration
 * @returns {[string]} buckets names
 */
InfluxDBClient.prototype.getBuckets = function(configParams) {
  return this._schemaQuery(configParams, QUERY_BUCKETS());
};

/**
 * Get Measurements names for configured URL, Org, Token and Bucket.
 *
 * @param configParams configuration
 * @returns {[]} measurements names
 */
InfluxDBClient.prototype.getMeasurements = function(configParams) {
  let query = QUERY_MEASUREMENTS(configParams.INFLUXDB_BUCKET);
  return this._schemaQuery(configParams, query);
};

/**
 * Get Fields names for configured URL, Org, Token, Bucket and Measurement.
 *
 * @param configParams configuration
 * @returns fields definition
 */
InfluxDBClient.prototype.getFields = function(configParams) {
  var fields = [];

  let query = QUERY_TAGS(
    configParams.INFLUXDB_BUCKET,
    configParams.INFLUXDB_MEASUREMENT
  );
  let tags = this._schemaQuery(configParams, query);

  tags.forEach(tag => {
    const field = {};
    field.name = tag;
    field.label = tag;
    field.dataType = "STRING";
    field.semantics = {};
    field.semantics.conceptType = "DIMENSION";
    fields.push(field);
  });

  return fields;
};

InfluxDBClient.prototype._schemaQuery = function(configParams, query) {
  const options = {
    method: "post",
    payload: query,
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
