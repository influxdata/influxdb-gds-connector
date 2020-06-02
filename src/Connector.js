var cc = DataStudioApp.createCommunityConnector();

/**
 * Returns the Auth Type of this connector.
 * @return {object} The Auth type.
 */
function getAuthType() {
  return cc
    .newAuthTypeResponse()
    .setAuthType(cc.AuthType.NONE)
    .build();
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
  return false;
}

/**
 * Get Schema fields for given configuration.
 *
 * @param request
 * @param cached {boolean}  use cached values
 * @returns fields for given configuration
 */
function getFields(request, cached) {
  const client = new InfluxDBClient();
  validateConfig(request.configParams);

  const cache = CacheService.getScriptCache();
  const cacheKey = [
    request.configParams.INFLUXDB_URL,
    request.configParams.INFLUXDB_BUCKET,
    request.configParams.INFLUXDB_MEASUREMENT
  ].join("#");

  if (cached) {
    const cachedSchema = JSON.parse(cache.get(cacheKey));
    if (cachedSchema !== null) {
      Logger.log(
        "Use cached schema for key: %s, schema: %s",
        cacheKey,
        cachedSchema
      );
      return cachedSchema;
    }
  }

  try {
    let fields = client.getFields(request.configParams);
    let cacheValue = JSON.stringify(fields);

    Logger.log(
      "Store cached schema for key: %s, schema: %s",
      cacheKey,
      cacheValue
    );
    cache.put(cacheKey, cacheValue);

    return fields;
  } catch (e) {
    throwUserError(
      `"GetFields from: ${request.configParams.INFLUXDB_URL}" returned an error:${e}`
    );
  }
}

// https://developers.google.com/datastudio/connector/reference#getconfig
function getConfig(request) {
  const client = new InfluxDBClient();
  const configParams = request.configParams;
  const config = cc.getConfig();

  config
    .newTextInput()
    .setId("INFLUXDB_URL")
    .setName("InfluxDB URL")
    .setHelpText("e.g. https://us-west-2-1.aws.cloud2.influxdata.com");

  config
    .newInfo()
    .setId("instructions-token")
    .setText(
      "How to retrieve the Token - https://v2.docs.influxdata.com/v2.0/security/tokens/view-tokens/."
    );

  config
    .newTextInput()
    .setId("INFLUXDB_TOKEN")
    .setName("Token")
    .setHelpText(
      "e.g. 2gihWWvM3_r1Q58GwSsF03iR9wsnjS4X6qNP9SLKj5eURe5-_eR0HMia-gU1gSAJ8SiCIzymRLgU1pmTV-0dDA=="
    );

  config
    .newInfo()
    .setId("instructions-org")
    .setText(
      "How to retrieve the Organization - https://v2.docs.influxdata.com/v2.0/organizations/view-orgs/."
    );

  config
    .newTextInput()
    .setId("INFLUXDB_ORG")
    .setName("Organization")
    .setHelpText("e.g. my-org");

  let isConfigEmpty = configParams === undefined;

  if (
    !isConfigEmpty &&
    configParams.INFLUXDB_URL &&
    configParams.INFLUXDB_TOKEN
  ) {
    let select = config
      .newSelectSingle()
      .setId("INFLUXDB_BUCKET")
      .setName("Bucket")
      .setIsDynamic(true);

    try {
      let buckets = client.getBuckets(configParams).sort();
      buckets.forEach(function(bucket) {
        select.addOption(
          config
            .newOptionBuilder()
            .setLabel(bucket)
            .setValue(bucket)
        );
      });
    } catch (e) {
      throwUserError(
        `"GetBuckets from: ${configParams.INFLUXDB_URL}" returned an error:${e}`
      );
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
      .setId("INFLUXDB_MEASUREMENT")
      .setName("Measurement")
      .setIsDynamic(true);

    try {
      let buckets = client.getMeasurements(configParams).sort();
      buckets.forEach(function(measurement) {
        select.addOption(
          config
            .newOptionBuilder()
            .setLabel(measurement)
            .setValue(measurement)
        );
      });
    } catch (e) {
      throwUserError(
        `"GetMeasurements from: ${configParams.INFLUXDB_URL}" returned an error:${e}`
      );
    }
  }

  let isBucketEmpty =
    isConfigEmpty ||
    configParams.INFLUXDB_BUCKET === undefined ||
    configParams.INFLUXDB_BUCKET === null;

  let isMeasurementEmpty =
    isConfigEmpty ||
    configParams.INFLUXDB_MEASUREMENT === undefined ||
    configParams.INFLUXDB_MEASUREMENT === null;

  if (isBucketEmpty || isMeasurementEmpty) {
    config.setIsSteppedConfig(true);
  }

  config.setDateRangeRequired(true);

  return config.build();
}

function getSchema(request) {
  const fields = getFields(request, false);
  return { schema: fields };
}

function getData(request) {
  const names = request.fields.map(field => field.name);

  let fieldsFiltered = getFields(request, true).filter(field =>
    names.includes(field.name)
  );

  Logger.log("Use fields: %s for requested names: %s", fieldsFiltered, names);

  return {
    schema: fieldsFiltered,
    rows: []
  };
}

/**
 * Validate config object and throw error if anything wrong.
 *
 * @param  {Object} configParams Config object supplied by user.
 */
function validateConfig(configParams) {
  const client = new InfluxDBClient();
  let errors = client.validateConfig(configParams);
  if (errors) {
    throwUserError(errors);
  }
}

/**
 * Throws User-facing errors.
 *
 * @param  {string} message Error message.
 */
function throwUserError(message) {
  DataStudioApp.createCommunityConnector()
    .newUserError()
    .setText(message)
    .throwException();
}
