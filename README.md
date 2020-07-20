# InfluxDB Connector for Google Data Studio

[![CircleCI](https://circleci.com/gh/influxdata/influxdb-gds-connector.svg?style=svg)](https://circleci.com/gh/influxdata/influxdb-gds-connector)
[![codecov](https://codecov.io/gh/influxdata/influxdb-gds-connector/branch/master/graph/badge.svg)](https://codecov.io/gh/influxdata/influxdb-gds-connector)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![License](https://img.shields.io/github/license/influxdata/influxdb-gds-connector.svg)](https://github.com/influxdata/influxdb-gds-connector/blob/master/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues-raw/influxdata/influxdb-gds-connector.svg)](https://github.com/influxdata/influxdb-gds-connector/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr-raw/influxdata/influxdb-gds-connector.svg)](https://github.com/influxdata/influxdb-gds-connector/pulls)
[![Slack Status](https://img.shields.io/badge/slack-join_chat-white.svg?logo=slack&style=social)](https://www.influxdata.com/slack)

*This is not an official Google product.*

This [Data Studio] [Connector] lets users query datasets from [InfluxDB v2] instances through the [InfluxDB API].
## How it works

Connect your InfluxDB to Google Data Studio and start pushing  your data to in minutes.

### How to add the InfluxDB Connector to Data Studio

#### Direct link

To add the InfluxDB Connector in Data Studio you can use this link: [create a new datasource](https://datastudio.google.com/u/0/datasources/create?connectorId=AKfycbwhJChhmMypQvNlihgRJMAhCb8gaM3ii9oUNWlW_Cp2PbJSfqeHfPyjNVp15iy9ltCs). 

#### From Data Studio

TBD: If you are already in Data Studio, click the "Create" button and select "Data Source". From there you can search for the InfluxDB Connector.

<img src="docs/datastudio-connector.png" height="350px">

### Connect your InfluxDB to Data Studio

To access your InfluxDB, enter your Connection information: 

- `InfluxDB URL` 
- `Token` 
- `Organization` 
- `Bucket` 
- `Measurement` 

<img src="docs/datastudio-connection.jpg" height="350px">

- [How to retrieve the Organization](https://v2.docs.influxdata.com/v2.0/organizations/view-orgs/)
- [How to retrieve the Token](https://v2.docs.influxdata.com/v2.0/security/tokens/view-tokens/)

#### Set up Metrics

Once you are connected, Data Studio will show you a list of all the fields available from your **Measurement**. 
This includes your _Tag set_, _Field set_ and _Timestamp_. 

<img src="docs/datastudio-fields.png" height="350px">

### Visualize your data in Data Studio

After you have reviewed the fields, press "CREATE REPORT" button to create your report. 

<img src="docs/datastudio-report.png" height="350px">

## Inspiration

- [COVID-19 report powered by InfluxDB](/examples/)

## Troubleshooting

### This app isn't verified

When authorizing the connector, an OAuth consent screen may be presented to you with a warning "This app isn't verified". 
This is because the connector has requested authorization to make requests to an external API (E.g. to fetch data from the service you're connecting to). 

> This warning will no longer be display after the connector will include in Partner connectors gallery - see [#2](https://github.com/influxdata/influxdb-gds-connector/issues/2)

[Data Studio]: https://datastudio.google.com
[Connector]: https://developers.google.com/datastudio/connector
[InfluxDB v2]: https://www.influxdata.com/products/influxdb-overview/influxdb-2-0/
[InfluxDB API]: https://v2.docs.influxdata.com/v2.0/reference/api/
