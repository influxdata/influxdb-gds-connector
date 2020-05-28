var cc = DataStudioApp.createCommunityConnector();

// https://developers.google.com/datastudioUrlFetchApp/connector/build#define_the_fields_with_getschema
function getFields() {
  var fields = cc.getFields();

  return fields;
}

// https://developers.google.com/datastudio/connector/reference#getconfig
function getConfig(request) {
  var config = cc.getConfig();
  return config.build();
}

function getSchema(request) {
  return { schema: getFields().build() };
}

function getData(request) {
  request.configParams = validateConfig(request.configParams);

  var requestedFields = getFields().forIds(
    request.fields.map(function(field) {
      return field.name;
    })
  );

  return {
    schema: requestedFields.build(),
    rows: []
  };
}

/**
 * Returns the Auth Type of this connector.
 * @return {object} The Auth type.
 */
function getAuthType() {
  return cc
    .newAuthTypeResponse()
    .setAuthType(cc.AuthType.KEY)
    .setHelpUrl(
      "https://v2.docs.influxdata.com/v2.0/security/tokens/view-tokens/"
    )
    .build();
}

/**
 * Resets the auth service.
 */
function resetAuth() {
  var userProperties = PropertiesService.getUserProperties();
  userProperties.deleteProperty("dscc.key");
}

/**
 * Returns true if the auth service has access.
 * @return {boolean} True if the auth service has access.
 */
function isAuthValid() {
  var userProperties = PropertiesService.getUserProperties();
  var key = userProperties.getProperty("dscc.key");
  // This assumes you have a validateKey function that can validate
  // if the key is valid.
  return validateKey(key);
}

/**
 * Sets the credentials.
 * @param {Request} request The set credentials request.
 * @return {object} An object with an errorCode.
 */
function setCredentials(request) {
  var key = request.key;

  var validKey = validateKey(key);
  if (!validKey) {
    return {
      errorCode: "INVALID_CREDENTIALS"
    };
  }
  var userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty("dscc.key", key);
  return {
    errorCode: "NONE"
  };
}

function validateKey(key) {
  return true;
}
