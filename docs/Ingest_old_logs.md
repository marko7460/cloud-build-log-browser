# Ingesting old cloud build logs

Each Cloud Build job by default stores all logs in the GCS bucket `gs://<PROJECT NUMBER>.cloudbuild-logs.googleusercontent.com/`
where `PROJECT_NUMBER` is the project number where Cloud Build is running. Log file names are in the format
`log-<BUILD_NUMBER>.txt`. If you have deployed the archictecure in this repo you will notice that the Log Browser works only
for the new builds. The following procedure shows how to ingest old logs into the BQ table created with [terraform](../terraform/).

1. Go to [misc](../misc/) folder
1. Create a bucket for ingestion: `gsutil mb gs://<CLOUD BUILD PROJECT ID>-ingestion`
1. create a python virtualenv and run `pip install -r requirements.txt`
1. Download old logs by running `./download-old-logs.py <CLOUD BUILD PROJECT ID>`.
1. Create the ingestion file by running `./ingest-logs.py`. File `ingest-load.jsonl` will be created.
1. Upload the ingestion file to the GCS bucket: `gsutil  cp  ingest-load.jsonl gsutil mb gs://<CLOUD BUILD PROJECT ID>-ingestion`
1. Load data into the BQ table created with [terraform](../terraform/). Example:
   `bq load --noreplace --source_format=NEWLINE_DELIMITED_JSON <CLOUD BUILD PROJECT ID>:cloud_build.logs gs://<CLOUD BUILD PROJECT ID>-ingestion ./myschema.json`
   - You can test this procedure by loading the data into a test table first.

## Troubleshooting

If the `download-old-logs.py` failes due to the CRC, please check this article https://cloud.google.com/storage/docs/gsutil/addlhelp/CRC32CandInstallingcrcmod on how to install it on your system. If you can't install CRC libraries you can disable the crc check by setting `check_hashes = if_fast_else_skip` in your `.boto` file (On MacOS `/Users/<user name>/.boto`).
