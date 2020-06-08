DataStudioApp = jest.fn()
DataStudioApp.createCommunityConnector = jest.fn()

Logger = jest.fn()
Logger.log = jest.fn()

let cache = {}
cache.get = jest.fn(() => null)
cache.put = jest.fn()

CacheService = jest.fn()
CacheService.getScriptCache = jest.fn(() => cache)

InfluxDBClient = jest.fn().mockImplementation(() => {
  return {
    validateConfig: jest.fn(),
    getFields: jest.fn(() => []),
    getData: jest.fn(() => []),
  }
})
const connector = require('../src/Connector')

test('getAuthType', () => {
  expect(connector.getAuthType()).toEqual({type: 'NONE'})
})

test('isAdminUser', () => {
  expect(connector.isAdminUser()).toEqual(false)
})

test('getData', () => {
  expect(
    connector.getData({
      fields: [],
      configParams: {
        INFLUXDB_URL: 'http://localhost:9999',
        INFLUXDB_TOKEN: 'my-token',
        INFLUXDB_ORG: 'my-org',
      },
    })
  ).toEqual({
    filtersApplied: false,
    rows: [],
    schema: [],
  })
})
