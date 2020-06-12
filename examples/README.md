# COVID-19 report powered by InfluxDB and OWID dataset

## Data set

### How to import
```bash
docker run \
    --env INFLUX_HOST=http://host.docker.internal:9999 \
    --env INFLUX_TOKEN=my-token \
    --env INFLUX_BUCKET_ID=05d5fc8322722001 \
    --env INFLUX_ORG_ID=05d5fc8322722000 \
    --volume "${PWD}":/usr/src/app/ \
    quay.io/influxdb/influx:nightly \
    /usr/src/app/dataset.sh
```

## Report

[https://datastudio.google.com/u/0/reporting/257a8b65-162c-4444-96a9-10b6c218074a/page/ZY4TB](https://datastudio.google.com/u/0/reporting/257a8b65-162c-4444-96a9-10b6c218074a/page/ZY4TB)
