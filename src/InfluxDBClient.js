function InfluxDBClient() {}

const QUERY_BUCKETS = () =>
  'buckets() |> rename(columns: {"name": "_value"}) |> keep(columns: ["_value"]) |> sort(columns: ["_value"], desc: false)'

const QUERY_MEASUREMENTS = bucket_name =>
  `import "influxdata/influxdb/v1" v1.measurements(bucket: "${bucket_name}")`

const QUERY_TAGS = (bucket_name, measurement_name) =>
  `import "influxdata/influxdb/v1"

v1.tagKeys(
  bucket: "${bucket_name}",
  predicate: (r) => r._measurement == "${measurement_name}",
  start: duration(v: uint(v: 1970-01-01) - uint(v: now()))
)
|> filter(fn: (r) => r._value != "_start" and r._value != "_stop" and r._value != "_measurement" and r._value != "_field")`

const QUERY_FIELDS = (bucket_name, measurement_name, tags) => {
  let concat = tags
    .map(function (tag) {
      return `\\"${tag}\\"`
    })
    .join(', ')
  return (
    `{"query":"from(bucket: \\"${bucket_name}\\") ` +
    `|> range(start: time(v: 1)) ` +
    `|> filter(fn: (r) => r[\\"_measurement\\"] == \\"${measurement_name}\\") ` +
    `|> drop(columns: [${concat}]) ` +
    `|> pivot(rowKey:[\\"_time\\"], columnKey: [\\"_field\\"], valueColumn: \\"_value\\") ` +
    `|> drop(columns: [\\"_start\\", \\"_stop\\", \\"_time\\", \\"_measurement\\"]) ` +
    `|> limit(n:1)", ` +
    `"type":"flux", ` +
    `"dialect":{"header":true,"delimiter":",","annotations":["datatype","group","default"],"commentPrefix":"#","dateTimeFormat":"RFC3339"}}`
  )
}

/**
 * Validate configuration of Connector.
 *
 * @param configParams configuration
 * @returns {string} configuration errors
 */
InfluxDBClient.prototype.validateConfig = function (configParams) {
  let errors = []
  configParams = configParams || {}
  if (!configParams.INFLUXDB_URL) {
    errors.push('URL to connect should be defined.')
  }
  if (!configParams.INFLUXDB_TOKEN) {
    errors.push('Token should be defined.')
  }
  if (!configParams.INFLUXDB_ORG) {
    errors.push('Organization should be defined.')
  }
  if (!configParams.INFLUXDB_BUCKET) {
    errors.push('Bucket should be defined.')
  }
  if (!configParams.INFLUXDB_MEASUREMENT) {
    errors.push('Measurement should be defined.')
  }
  return errors.join(' ')
}

/**
 * Get Buckets names for configured URL, Org and Token.
 *
 * @param configParams configuration
 * @returns {[string]} buckets names
 */
InfluxDBClient.prototype.getBuckets = function (configParams) {
  return this._query(configParams, QUERY_BUCKETS())
}

/**
 * Get Measurements names for configured URL, Org, Token and Bucket.
 *
 * @param configParams configuration
 * @returns {[]} measurements names
 */
InfluxDBClient.prototype.getMeasurements = function (configParams) {
  let query = QUERY_MEASUREMENTS(configParams.INFLUXDB_BUCKET)
  return this._query(configParams, query)
}

/**
 * Get Fields names for configured URL, Org, Token, Bucket and Measurement.
 *
 * @param configParams configuration
 * @returns fields definition
 */
InfluxDBClient.prototype.getFields = function (configParams) {
  const fields = []

  const measurement = {}
  measurement.name = '_measurement'
  measurement.label = 'measurement'
  measurement.dataType = 'STRING'
  measurement.semantics = {}
  measurement.semantics.conceptType = 'DIMENSION'
  fields.push(measurement)

  let queryTags = QUERY_TAGS(
    configParams.INFLUXDB_BUCKET,
    configParams.INFLUXDB_MEASUREMENT
  )
  let tags = this._query(configParams, queryTags)

  tags.forEach(tag => {
    const field = {}
    field.name = tag
    field.label = tag
    field.dataType = 'STRING'
    field.semantics = {}
    field.semantics.conceptType = 'DIMENSION'
    fields.push(field)
  })

  let queryFields = QUERY_FIELDS(
    configParams.INFLUXDB_BUCKET,
    configParams.INFLUXDB_MEASUREMENT,
    tags
  )

  let tables = this._query(configParams, queryFields, {
    mapping: this._extractData,
    contentType: 'application/json',
  })

  tables.forEach(table => {
    table.fields.forEach(field => fields.push(field))
  })

  const timestamp = {}
  timestamp.name = '_time'
  timestamp.label = 'time'
  timestamp.dataType = 'STRING'
  timestamp.semantics = {}
  timestamp.semantics.isReaggregatable = false
  timestamp.semantics.conceptType = 'DIMENSION'
  timestamp.semantics.semanticType = 'YEAR_MONTH_DAY_SECOND'
  timestamp.semantics.semanticGroup = 'DATETIME'
  fields.push(timestamp)

  return fields
}

InfluxDBClient.prototype._query = function (
  configParams,
  query,
  configs = {
    mapping: this._extractSchema,
    contentType: 'application/vnd.flux',
  }
) {
  const options = {
    method: 'post',
    payload: query,
    contentType: configs.contentType,
    headers: {
      Authorization: 'Token ' + configParams.INFLUXDB_TOKEN,
      Accept: 'application/csv',
    },
  }
  let url = this._buildURL(configParams)
  const response = UrlFetchApp.fetch(url, options).getContentText()

  return configs.mapping(response)
}

InfluxDBClient.prototype._extractSchema = function (textContent) {
  const csv = Utilities.parseCsv(textContent, ',')

  let values = []
  let value_index
  csv.forEach(function (row) {
    if (!value_index) {
      value_index = row.indexOf('_value')
    } else {
      let bucket = row[value_index]
      if (bucket) {
        values.push(bucket)
      }
    }
  })
  return values
}

InfluxDBClient.prototype._extractData = function (textContent) {
  let processNextTable = true
  let table
  let tables = []

  function prepareTable() {
    if (processNextTable) {
      table = new InfluxDBTable()
      tables.push(table)
      processNextTable = false
    }
  }

  Logger.log('Response from InfluxDB: %s', textContent)

  textContent.split('\n').forEach(line => {
    if (line.startsWith('#group')) {
      prepareTable()
      table.group = line
    } else if (line.startsWith('#datatype')) {
      prepareTable()
      table.data_types = line
    } else if (line.startsWith('#default')) {
      prepareTable()
      table.defaults = line
    } else if (line.startsWith(',result,table,')) {
      prepareTable()
      table.names = line
    } else {
      // process row of table first time => parseSchema,
      if (!processNextTable) {
        table.parseSchema()
        processNextTable = true
      }
      table.data.push(line)
    }
  })

  return tables
}

InfluxDBClient.prototype._buildURL = function (configParams) {
  let url = configParams.INFLUXDB_URL
  if (!url.endsWith('/')) {
    url += '/'
  }
  url += 'api/v2/query?org='
  url += encodeURIComponent(configParams.INFLUXDB_ORG)
  return url
}

class InfluxDBTable {
  group
  data_types
  defaults
  names
  data = []
  fields = []

  parseSchema() {
    let data_types = this.data_types.split(',').slice(3)
    let names = this.names.split(',').slice(3)
    data_types.forEach((type, index) => {
      const field = {}
      field.name = names[index].trim()
      field.label = names[index].trim()
      field.semantics = {}
      field.semantics.conceptType = 'METRIC'
      field.semantics.isReaggregatable = false

      switch (type.trim()) {
        case 'double':
        case 'long':
        case 'unsignedLong':
          field.dataType = 'NUMBER'
          field.semantics.semanticGroup = 'NUMBER'
          field.semantics.isReaggregatable = true
          break
        case 'boolean':
          field.dataType = 'BOOLEAN'
          break
        case 'dateTime:RFC3339':
          field.dataType = 'STRING'
          field.semantics.semanticType = 'YEAR_MONTH_DAY_SECOND'
          field.semantics.semanticGroup = 'DATETIME'
          break
        default:
          field.dataType = 'STRING'
          break
      }
      this.fields.push(field)
    })
  }
}

// istanbul ignore next
// Needed for testing
var module = module || {}
module.exports = InfluxDBClient
