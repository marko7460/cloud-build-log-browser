#!/bin/bash
PROJECT_ID="sap-iac-cicd"
BQ_DATASET="cloud_build"
BQ_TABLE="logs"
REGION="us-central1"
SUBNETWORK="https://www.googleapis.com/compute/v1/projects/sap-iac-cicd/regions/us-central1/subnetworks/dataflow"
NETWORK="dataflow"
SERVICE_ACCOUNT="dataflow-log-processor@sap-iac-cicd.iam.gserviceaccount.com"
PUB_SUB_SUBSCRIPTION="projects/sap-iac-cicd/subscriptions/cloud-build-logs-sub"
GCS_BUCKET="sap-iac-cicd-dataflow"

gsutil cp main.js gs://${GCS_BUCKET}/main.js
gcloud dataflow jobs run transform-log-to-bq \
  --project ${PROJECT_ID} \
  --gcs-location gs://dataflow-templates-us-central1/latest/PubSub_Subscription_to_BigQuery \
  --region ${REGION} \
  --max-workers 3 \
  --num-workers 2 \
  --service-account-email ${SERVICE_ACCOUNT} \
  --staging-location gs://${GCS_BUCKET}/temp/ \
  --subnetwork ${SUBNETWORK} \
  --network ${NETWORK} \
  --additional-experiments enable_streaming_java_vmr \
  --parameters inputSubscription=${PUB_SUB_SUBSCRIPTION},javascriptTextTransformGcsPath=gs://${GCS_BUCKET}/main.js,javascriptTextTransformFunctionName=transform,outputTableSpec=${PROJECT_ID}:${BQ_DATASET}.${BQ_TABLE}
