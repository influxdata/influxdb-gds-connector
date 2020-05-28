function getAuthType() {
  var response = { type: "NONE" };
  return response;
}

function getFields() {
  var cc = DataStudioApp.createCommunityConnector();
  var fields = cc.getFields();

  return fields;
}

function getConfig(request) {
  var cc = DataStudioApp.createCommunityConnector();
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
