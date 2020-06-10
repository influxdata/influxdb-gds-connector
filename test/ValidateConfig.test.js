const require_import = require('../src/InfluxDBClient')

let client
let validConfigurations

beforeEach(() => {
  client = new require_import.InfluxDBClient()
  validConfigurations = {}
  validConfigurations.INFLUXDB_URL = 'http://localhost:9999'
  validConfigurations.INFLUXDB_TOKEN = 'my-token'
  validConfigurations.INFLUXDB_ORG = 'my-org'
  validConfigurations.INFLUXDB_BUCKET = 'my-bucket'
  validConfigurations.INFLUXDB_MEASUREMENT = 'my-measurement'
})

test('success', () => {
  let errors = client.validateConfig(validConfigurations)
  expect(errors).toHaveLength(0)
})

test('fail', () => {
  let errors = client.validateConfig()
  expect(errors).toEqual(
    'URL to connect should be defined. Token should be defined. Organization should be defined. Bucket should be defined. Measurement should be defined.'
  )
})

test('without URL', () => {
  delete validConfigurations.INFLUXDB_URL
  let errors = client.validateConfig(validConfigurations)
  expect(errors).toEqual('URL to connect should be defined.')
})

test('empty URL', () => {
  validConfigurations.INFLUXDB_URL = ''
  let errors = client.validateConfig(validConfigurations)
  expect(errors).toEqual('URL to connect should be defined.')
})

test('without Token', () => {
  delete validConfigurations.INFLUXDB_TOKEN
  let errors = client.validateConfig(validConfigurations)
  expect(errors).toEqual('Token should be defined.')
})

test('empty Token', () => {
  validConfigurations.INFLUXDB_TOKEN = ''
  let errors = client.validateConfig(validConfigurations)
  expect(errors).toEqual('Token should be defined.')
})

test('without Org', () => {
  delete validConfigurations.INFLUXDB_ORG
  let errors = client.validateConfig(validConfigurations)
  expect(errors).toEqual('Organization should be defined.')
})

test('empty Org', () => {
  validConfigurations.INFLUXDB_ORG = ''
  let errors = client.validateConfig(validConfigurations)
  expect(errors).toEqual('Organization should be defined.')
})

test('without Bucket', () => {
  delete validConfigurations.INFLUXDB_BUCKET
  let errors = client.validateConfig(validConfigurations)
  expect(errors).toEqual('Bucket should be defined.')
})

test('empty Bucket', () => {
  validConfigurations.INFLUXDB_BUCKET = ''
  let errors = client.validateConfig(validConfigurations)
  expect(errors).toEqual('Bucket should be defined.')
})

test('without Measurement', () => {
  delete validConfigurations.INFLUXDB_MEASUREMENT
  let errors = client.validateConfig(validConfigurations)
  expect(errors).toEqual('Measurement should be defined.')
})

test('empty Measurement', () => {
  validConfigurations.INFLUXDB_MEASUREMENT = ''
  let errors = client.validateConfig(validConfigurations)
  expect(errors).toEqual('Measurement should be defined.')
})
