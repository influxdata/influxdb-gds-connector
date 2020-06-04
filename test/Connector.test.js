DataStudioApp = jest.fn()
DataStudioApp.createCommunityConnector = jest.fn()

const connector = require('../src/Connector')

test('getAuthType', () => {
  expect(connector.getAuthType()).toEqual({type: 'NONE'})
})

test('isAdminUser', () => {
  expect(connector.isAdminUser()).toEqual(false)
})
