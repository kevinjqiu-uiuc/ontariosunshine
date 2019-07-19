unzip:
	unzip -d raw_data data.zip
	mv raw_data/data/* raw_data
	rm -rf raw_data/data

serve:
	python -m SimpleHTTPServer
