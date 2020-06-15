#!/usr/bin/env bash

set -e

SCRIPT_PATH="$( cd "$(dirname "$0")" ; pwd -P )"

mkdir -p "${SCRIPT_PATH}"/tmp

# INFLUX_HOST
# INFLUX_TOKEN
# INFLUX_BUCKET_ID
# INFLUX_ORG_ID

csv_files=(
"https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/ecdc/full_data.csv|dateTime:2006-01-02,tag,long,long,long,long"
"https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/ecdc/locations.csv|tag,tag,tag,dateTime:2006,long"
"https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/testing/covid-testing-all-observations.csv|tag,tag,dateTime:2006-01-02,string,string,string,long,long,double,double,long,double"
)

apt-get --yes install wget || true

for i in "${csv_files[@]}"
do
  url="${i%|*}"
  filename="${url##*/}"
  datatype="#datatype ${i#*|}"
  measurement="#constant measurement,covid_${filename%.*}"
  file_path="$SCRIPT_PATH"/tmp/"${filename}"

	#
	# Download file
	#
	wget -O "$file_path" "$url"

  #
  # Import
  #
  influx write --header="$datatype" --header="$measurement" --file "$file_path" --skipRowOnError

done
