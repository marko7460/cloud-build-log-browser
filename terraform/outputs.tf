output "dataflow_command" {
  description = "Dataflow command "
  value       = <<EOT
gcloud dataflow jobs run transform-log-to-bq \
  --project ${var.project} \
  --gcs-location gs://dataflow-templates-us-central1/latest/PubSub_Subscription_to_BigQuery \
  --region ${var.dataflow_region} \
  --max-workers 3 \
  --num-workers 1 \
  --service-account-email ${google_service_account.dataflow_job.email} \
  --staging-location gs://${google_storage_bucket.dataflow_bucket.name}/temp/ \
  --subnetwork ${var.dataflow_subnetwork} \
  --network ${var.dataflow_network} \
  --disable-public-ips \
  --worker-machine-type n1-standard-2 \
  --enable-streaming-engine \
  --additional-experiments enable_streaming_engine \
  --parameters inputSubscription=${google_pubsub_subscription.sub.id},javascriptTextTransformGcsPath=gs://${google_storage_bucket.dataflow_bucket.name}/main.js,javascriptTextTransformFunctionName=transform,outputTableSpec=${var.project}:${google_bigquery_dataset.main.dataset_id}.${google_bigquery_table.main.table_id}
EOT
}

output "backend_yaml" {
  description = "backend.yaml"
  value       = <<EOT
runtime: python39
service: logbrowserbackend
default_expiration: "5m"
service_account: "${google_service_account.web_app_backend.email}"
env_variables:
  DATASET_ID: "${google_bigquery_dataset.main.dataset_id}"
  TABLE_ID: "${google_bigquery_table.main.table_id}"
handlers:
  - url: /api/steps/.*
    script: main.py
  - url: /api/build_ids/
    script: main.py
  - url: /api/logs/.*
    script: main.py
EOT
}

output "frontend_yaml" {
  description = "frontend.yaml"
  value       = <<EOT
runtime: nodejs16
default_expiration: "5m"
service: logbrowserfronted
handlers:
  - url: /(.*\..+)$
    static_files: build/\1
    upload: build/(.*\..+)$
  # Catch all handler to index.html
  - url: /.*
    static_files: build/index.html
    upload: build/index.html
EOT
}

output "dispatch_yaml" {
  description = "dispatch.yaml"
  value       = <<EOT
dispatch:
  - url: "*/api/*"
    service: logbrowserbackend
EOT
}

output "project_id" {
  description = "Project ID"
  value       = var.project
}

output "dataset_id" {
  description = "Dataset ID"
  value       = google_bigquery_dataset.main.dataset_id
}

output "table_id" {
  description = "Table ID"
  value       = google_bigquery_table.main.table_id
}

output "table_reference" {
  description = "Table Reference"
  value       = "${var.project}:${google_bigquery_dataset.main.dataset_id}.${google_bigquery_table.main.table_id}"
}