DataStudioApp = jest.fn();
DataStudioApp.createCommunityConnector = jest.fn();

const connector = require("../src/Connector");

test("getAuthType", () => {
  expect(connector.authType()).toEqual({ type: "NONE" });
});
