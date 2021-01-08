option task = {name: "Optimize COVID19 DataSet", every: 6h}

bucket_name = "COVID-19-GDS"
org_name = "InfluxData"
data_recovered = from(bucket: bucket_name)
	|> range(start: 1970, stop: now())
	|> filter(fn: (r) =>
		(r["_measurement"] == "covid_Bing-COVID19-Data"))
	|> filter(fn: (r) =>
		(not exists r["AdminRegion1"] and exists r["ISO2"] and r["_field"] == "RecoveredChange"))
	|> map(fn: (r) =>
		({r with Country_Region: if r["ISO3"] == "CZE" then "Czechia" else if r["ISO3"] == "VAT" then "Vatican" else if r["ISO3"] == "MMR" then "Myanmar" else if r["ISO3"] == "MKD" then "Macedonia" else if r["ISO3"] == "TTO" then "Trinidad and Tobago" else if r["ISO3"] == "SWZ" then "Swaziland" else if r["ISO3"] == "STP" then "Sao Tome and Principe" else if r["ISO3"] == "VCT" then "Saint Vincent and the Grenadines" else if r["ISO3"] == "LCA" then "Saint Lucia" else if r["ISO3"] == "PSE" then "Palestine" else if r["ISO3"] == "FLK" then "Falkland Islands" else if r["ISO3"] == "FRO" then "Faeroe Islands" else if r["ISO3"] == "COD" then "Democratic Republic of Congo" else if r["ISO3"] == "CUW" then "Curacao" else if r["ISO3"] == "CIV" then "Cote d'Ivoire" else if r["ISO3"] == "COG" then "Congo" else if r["ISO3"] == "BIH" then "Bosnia and Herzegovina" else if r["ISO3"] == "ATH" then "Antigua and Barbuda" else if r["ISO3"] == "VIR" then "United States Virgin Islands" else if r["ISO3"] == "ESH" then "Western Sahara" else if r["ISO3"] == "BES" then "Bonaire Sint Eustatius and Saba" else if r["ISO3"] == "ATG" then "Antigua and Barbuda" else if r["Country_Region"] == "St Kitts and Nevis" then "Saint Kitts and Nevis" else if r["ISO3"] == "TLS" then "Timor" else if r["ISO3"] == "TCA" then "Turks and Caicos Islands" else r["Country_Region"]}))
	|> rename(columns: {Country_Region: "location"})
	|> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
	|> drop(columns: ["ISO2", "ISO3", "_start", "_stop", "_measurement"])
	|> map(fn: (r) =>
		({r with _measurement: "data_recovered"}))
locations = from(bucket: bucket_name)
	|> range(start: 1970, stop: now())
	|> filter(fn: (r) =>
		(r["_measurement"] == "covid_locations"))
	|> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
	|> map(fn: (r) =>
		({r with location_fixed: if r["location"] == "Czech Republic" then "Czechia" else r["location"]}))
	|> drop(columns: ["continent", "countriesAndTerritories", "_start", "_stop", "_time", "_measurement", "location"])
	|> rename(columns: {location_fixed: "location"})
full_data = from(bucket: bucket_name)
	|> range(start: 1970, stop: now())
	|> filter(fn: (r) =>
		(r["_measurement"] == "covid_owid-covid-data"))
	|> filter(fn: (r) =>
		(r["location"] != "World" and r["location"] != "International"))
	|> map(fn: (r) =>
		({r with _measurement: "full_data_plus_location"}))
	|> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
full_data_plus_location = join(tables: {full_data: full_data, locations: locations}, on: ["location"])

join(tables: {d1: full_data_plus_location, d2: data_recovered}, on: ["_time", "location"])
	|> drop(columns: ["_measurement_d1", "_measurement_d2"])
	|> map(fn: (r) =>
		({r with _measurement: "COVID19_optimized"}))
	|> fill(column: "new_deaths", value: 0)
	|> fill(column: "new_cases", value: 0)
	|> fill(column: "total_deaths", value: 0)
	|> to(
		bucket: bucket_name,
		org: org_name,
		timeColumn: "_time",
		fieldFn: (r) =>
			({
				"new_cases": r["new_cases"],
				"new_deaths": r["new_deaths"],
				"population": r["population"],
				"RecoveredChange": r["RecoveredChange"],
			}),
	)
