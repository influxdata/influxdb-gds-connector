const cc = DataStudioApp.createCommunityConnector()

/**
 * Returns the Auth Type of this connector.
 * @return {object} The Auth type.
 */
function getAuthType() {
  return {type: 'NONE'}
}

/**
 * This checks whether the current user is an admin user of the connector.
 *
 * @returns {boolean} Returns true if the current authenticated user at the time
 * of function execution is an admin user of the connector. If the function is
 * omitted or if it returns false, then the current user will not be considered
 * an admin user of the connector.
 */
function isAdminUser() {
  return false
}

/**
 * Get Schema fields for given configuration.
 *
 * @param request
 * @param cached {boolean}  use cached values
 * @param client {InfluxDBClient}  InfluxDB cliebt
 * @returns fields for given configuration
 */
function getFields(request, cached, client) {
  validateConfig(request.configParams)

  const cache = CacheService.getScriptCache()
  const cacheKey = [
    request.configParams.INFLUXDB_URL,
    request.configParams.INFLUXDB_BUCKET,
    request.configParams.INFLUXDB_MEASUREMENT,
    request.configParams.INFLUXDB_SCHEMA_RANGE,
  ].join('#')

  if (cached) {
    const cachedSchema = JSON.parse(cache.get(cacheKey))
    if (cachedSchema !== null) {
      Logger.log(
        'Use cached schema for key: %s, schema: %s',
        cacheKey,
        cachedSchema
      )
      return cachedSchema
    }
  }

  try {
    let fields = client.getFields(request.configParams)
    let cacheValue = JSON.stringify(fields)

    Logger.log(
      'Store cached schema for key: %s, schema: %s',
      cacheKey,
      cacheValue
    )
    cache.put(cacheKey, cacheValue)

    return fields
  } catch (e) {
    throwUserError(`Cannot retrieve a Schema of your Measurement`, e)
  }
}

// https://developers.google.com/datastudio/connector/reference#getconfig
function getConfig(request) {
  const client = new InfluxDBClient()
  const configParams = request.configParams
  const config = cc.getConfig()

  config
    .newTextInput()
    .setId('INFLUXDB_URL')
    .setName('InfluxDB URL')
    .setHelpText('e.g. https://us-west-2-1.aws.cloud2.influxdata.com')

  config
    .newInfo()
    .setId('instructions-token')
    .setText(
      'How to retrieve the Token - https://v2.docs.influxdata.com/v2.0/security/tokens/view-tokens/.'
    )

  config
    .newTextInput()
    .setId('INFLUXDB_TOKEN')
    .setName('Token')
    .setHelpText(
      'e.g. 2gihWWvM3_r1Q58GwSsF03iR9wsnjS4X6qNP9SLKj5eURe5-_eR0HMia-gU1gSAJ8SiCIzymRLgU1pmTV-0dDA=='
    )

  config
    .newInfo()
    .setId('instructions-org')
    .setText(
      'How to retrieve the Organization - https://v2.docs.influxdata.com/v2.0/organizations/view-orgs/.'
    )

  config
    .newTextInput()
    .setId('INFLUXDB_ORG')
    .setName('Organization')
    .setHelpText('e.g. my-org')

  let isConfigEmpty = configParams === undefined

  if (
    !isConfigEmpty &&
    configParams.INFLUXDB_URL &&
    configParams.INFLUXDB_TOKEN
  ) {
    let select = config
      .newSelectSingle()
      .setId('INFLUXDB_BUCKET')
      .setName('Bucket')
      .setIsDynamic(true)

    try {
      let buckets = client.getBuckets(configParams).sort()
      buckets.forEach(function (bucket) {
        select.addOption(
          config.newOptionBuilder().setLabel(bucket).setValue(bucket)
        )
      })
    } catch (e) {
      throwUserError(`Cannot retrieve a list of Buckets`, e)
    }
  }

  if (
    !isConfigEmpty &&
    configParams.INFLUXDB_URL &&
    configParams.INFLUXDB_TOKEN &&
    configParams.INFLUXDB_BUCKET
  ) {
    let select = config
      .newSelectSingle()
      .setId('INFLUXDB_MEASUREMENT')
      .setName('Measurement')
      .setIsDynamic(true)

    try {
      let buckets = client.getMeasurements(configParams).sort()
      buckets.forEach(function (measurement) {
        select.addOption(
          config.newOptionBuilder().setLabel(measurement).setValue(measurement)
        )
      })
    } catch (e) {
      throwUserError(`Cannot retrieve a list of Measurements`, e)
    }
  }

  let isBucketEmpty =
    isConfigEmpty ||
    configParams.INFLUXDB_BUCKET === undefined ||
    configParams.INFLUXDB_BUCKET === null

  let isMeasurementEmpty =
    isConfigEmpty ||
    configParams.INFLUXDB_MEASUREMENT === undefined ||
    configParams.INFLUXDB_MEASUREMENT === null

  if (isBucketEmpty || isMeasurementEmpty) {
    config.setIsSteppedConfig(true)
  } else {
    config
      .newInfo()
      .setId('instructions-optimization')
      .setText(
        'How to optimize data - https://github.com/influxdata/influxdb-gds-connector#data-optimize.'
      )

    config
      .newTextInput()
      .setId('INFLUXDB_SCHEMA_RANGE')
      .setName('Schema Query Range')
      .setHelpText(
        'Specify the oldest time to include in results of the "Schema query". The value has to be specified as a negative "Duration", e.g.: -6h, -12h, -1w. The default behaviour is retrieve all data.'
      )
  }

  config.setDateRangeRequired(true)

  return config.build()
}

function getSchema(request) {
  let client = new InfluxDBClient()
  const fields = getFields(request, false, client)
  return {schema: fields}
}

function getData(request) {
  const start = new Date()
  const client = new InfluxDBClient()
  const names = request.fields.map(field => field.name)

  let fieldsFiltered = getFields(request, true, client).filter(field =>
    names.includes(field.name)
  )

  Logger.log('Use fields: %s for requested names: %s', fieldsFiltered, names)

  try {
    let rows = client.getData(
      request.configParams,
      request.scriptParams,
      request.dateRange,
      fieldsFiltered
    )

    Logger.log('GetData took: "%s" milliseconds.', new Date() - start)

    return {
      schema: fieldsFiltered,
      rows: rows,
      filtersApplied: false,
    }
  } catch (e) {
    throwUserError(
      `Cannot retrieve Data`,
      e
    )
  }
}

/**
 * Validate config object and throw error if anything wrong.
 *
 * @param  {Object} configParams Config object supplied by user.
 */
function validateConfig(configParams) {
  const client = new InfluxDBClient()
  let errors = client.validateConfig(configParams)
  if (errors) {
    throwUserError(errors, '')
  }
}

/**
 * Throws User-facing errors.
 *
 * @param  {string} message Error message.
 * @param {InfluxDBError|Error|string} error original Error
 */
function throwUserError(message, error) {
  let debugText = error.debugText ? error.debugText : error
  console.error(
    `The connector yielded an error: ${error}, message: ${message}, debugText: ${debugText}.`
  )
  let text = error.message
    ? `${message}. InfluxDB Error Response: "${error.message}"${
        error.fluxQuery ? '. Requested Query: "' + error.fluxQuery + '"' : ''
      }`
    : message
  DataStudioApp.createCommunityConnector()
    .newUserError()
    .setText(text)
    .setDebugText(debugText)
    .throwException()
}

// Needed for testing
var module = module || {}
module.exports = {getAuthType, isAdminUser, getData}
