const InfluxDBClient = require("../src/InfluxDBClient");

let client;

beforeEach(() => {
  client = new InfluxDBClient();
});

test("get measurements", () => {
  let measurements = client.getMeasurements();
  expect(measurements).toHaveLength(2);
  expect(measurements).toContain("cpu");
  expect(measurements).toContain("mem");
});
