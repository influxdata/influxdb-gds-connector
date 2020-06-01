const InfluxDBClient = require("../src/InfluxDBClient");

let client;
let validConfigurations;

beforeEach(() => {
  client = new InfluxDBClient();
  validConfigurations = {};
  validConfigurations.INFLUXDB_URL = "http://localhost:9999";
  validConfigurations.INFLUXDB_TOKEN = "my-token";
  validConfigurations.INFLUXDB_ORG = "my-org";
  validConfigurations.INFLUXDB_BUCKET = "my-bucket";
});

test("success", () => {
  let errors = client.validateConfig(validConfigurations);
  expect(errors).toHaveLength(0);
});

test("fail", () => {
  let errors = client.validateConfig({});
  expect(errors).toEqual(
    "InfluxDB URL should be defined. InfluxDB Token should be defined. InfluxDB Organization should be defined. InfluxDB Bucket should be defined."
  );
});

test("without URL", () => {
  delete validConfigurations.INFLUXDB_URL;
  let errors = client.validateConfig(validConfigurations);
  expect(errors).toEqual("InfluxDB URL should be defined.");
});

test("empty URL", () => {
  validConfigurations.INFLUXDB_URL = "";
  let errors = client.validateConfig(validConfigurations);
  expect(errors).toEqual("InfluxDB URL should be defined.");
});

test("without Token", () => {
  delete validConfigurations.INFLUXDB_TOKEN;
  let errors = client.validateConfig(validConfigurations);
  expect(errors).toEqual("InfluxDB Token should be defined.");
});

test("empty Token", () => {
  validConfigurations.INFLUXDB_TOKEN = "";
  let errors = client.validateConfig(validConfigurations);
  expect(errors).toEqual("InfluxDB Token should be defined.");
});

test("without Org", () => {
  delete validConfigurations.INFLUXDB_ORG;
  let errors = client.validateConfig(validConfigurations);
  expect(errors).toEqual("InfluxDB Organization should be defined.");
});

test("empty Org", () => {
  validConfigurations.INFLUXDB_ORG = "";
  let errors = client.validateConfig(validConfigurations);
  expect(errors).toEqual("InfluxDB Organization should be defined.");
});

test("without Bucket", () => {
  delete validConfigurations.INFLUXDB_BUCKET;
  let errors = client.validateConfig(validConfigurations);
  expect(errors).toEqual("InfluxDB Bucket should be defined.");
});

test("empty Bucket", () => {
  validConfigurations.INFLUXDB_BUCKET = "";
  let errors = client.validateConfig(validConfigurations);
  expect(errors).toEqual("InfluxDB Bucket should be defined.");
});
