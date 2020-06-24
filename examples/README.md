# COVID-19 report powered by InfluxDB

This example shows how to create a report in [Google Data Studio](https://datastudio.google.com/s/p19vh-b82Sw) where is as a source use InfluxDB. 

The following image shows how will finished report looks like:

<p align="center">
    [<img src="COVID-19_report_powered_by_InfluxDB.png" height="250px">](https://datastudio.google.com/s/p19vh-b82Sw) 
</p>

## Data set

### How to import
```bash
docker run \
    --env INFLUX_HOST=http://host.docker.internal:9999 \
    --env INFLUX_TOKEN=my-token \
    --env INFLUX_BUCKET_ID=05e54a371803c001 \
    --env INFLUX_ORG_ID=05e54a371803c000 \
    --volume "${PWD}":/usr/src/app/ \
    quay.io/influxdb/influx:nightly \
    /usr/src/app/dataset.sh
```

## Report

[https://datastudio.google.com/u/0/reporting/257a8b65-162c-4444-96a9-10b6c218074a/page/ZY4TB](https://datastudio.google.com/u/0/reporting/257a8b65-162c-4444-96a9-10b6c218074a/page/ZY4TB)

