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
