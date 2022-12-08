locals {
  dataflow_bucket_roles = [
    "roles/storage.legacyBucketReader",
    "roles/storage.objectCreator"
  ]
  dataflow_sa_roles = [
    "roles/bigquery.jobUser",
    "roles/dataflow.worker",
    "roles/pubsub.subscriber",
    "roles/pubsub.viewer"
  ]
  backend_sa_project_roles = [
    "roles/iam.securityReviewer",
    "roles/cloudbuild.builds.viewer",
    "roles/bigquery.jobUser",
  ]
}

module "log_export" {
  source                 = "terraform-google-modules/log-export/google"
  destination_uri        = module.log_destination.destination_uri
  filter                 = <<EOT
resource.type="build" logName="projects/${var.project}/logs/cloudbuild"
EOT
  log_sink_name          = "cloud-build-logs-sink"
  parent_resource_id     = var.project
  parent_resource_type   = "project"
  unique_writer_identity = true
}

module "log_destination" {
  source                   = "terraform-google-modules/log-export/google//modules/pubsub"
  project_id               = var.project
  topic_name               = var.topic
  log_sink_writer_identity = module.log_export.writer_identity
  create_subscriber        = false //Review this
}

resource "google_service_account" "dataflow_job" {
  account_id = var.dataflow_sa
  project    = var.project
}

resource "google_service_account" "web_app_backend" {
  account_id = var.webapp_backend_sa
  project    = var.project
}

resource "google_storage_bucket" "dataflow_bucket" {
  location = "US"
  project  = var.project
  name     = "${var.project}-dataflow-transform-log-to-bq"
}

resource "google_storage_bucket_iam_member" "dataflow_bucket_permissions" {
  for_each = toset(local.dataflow_bucket_roles)
  member   = "serviceAccount:${google_service_account.dataflow_job.email}"
  role     = each.value
  bucket   = google_storage_bucket.dataflow_bucket.name
}

resource "google_project_iam_member" "dataflow_sa_project_permissions" {
  for_each = toset(local.dataflow_sa_roles)
  member   = "serviceAccount:${google_service_account.dataflow_job.email}"
  project  = var.project
  role     = each.value
}

resource "google_bigquery_dataset" "main" {
  project       = var.project
  dataset_id    = var.dataset_id
  friendly_name = var.dataset_id
  description   = "Cloud Build Logs Dataset"
  location      = var.dataset_location
}

resource "google_bigquery_table" "main" {
  dataset_id = google_bigquery_dataset.main.dataset_id
  table_id   = var.table_id
  project    = var.project
  schema     = <<EOF
[
      {
        "name": "build_id",
        "type": "STRING",
        "mode": "REQUIRED"
      },
      {
        "name": "step_id",
        "type": "INTEGER",
        "mode": "REQUIRED"
      },
      {
        "name": "insert_id",
        "type": "INTEGER",
        "mode": "REQUIRED"
      },
      {
        "name": "log_line",
        "type": "STRING",
        "mode": "NULLABLE"
      }
]
EOF
}

resource "google_pubsub_subscription" "sub" {
  project = var.project
  name    = var.subscription
  topic   = module.log_destination.resource_name
}

resource "google_bigquery_table_iam_member" "dataflow_sa_bq_table_iam" {
  dataset_id = google_bigquery_dataset.main.dataset_id
  member     = "serviceAccount:${google_service_account.dataflow_job.email}"
  role       = "roles/bigquery.dataEditor"
  table_id   = google_bigquery_table.main.table_id
  project    = var.project
}

resource "google_bigquery_dataset_iam_member" "dataflow_sa_bq_dataset_iam" {
  dataset_id = google_bigquery_dataset.main.dataset_id
  member     = "serviceAccount:${google_service_account.dataflow_job.email}"
  role       = "roles/bigquery.dataEditor"
  project    = var.project
}

resource "google_bigquery_table_iam_member" "webapp_backend_sa_bq_table_iam" {
  dataset_id = google_bigquery_dataset.main.dataset_id
  member     = "serviceAccount:${google_service_account.web_app_backend.email}"
  role       = "roles/bigquery.dataViewer"
  table_id   = google_bigquery_table.main.table_id
  project    = var.project
}

resource "google_project_iam_member" "webapp_backend_sa_project_iam" {
  for_each = toset(local.backend_sa_project_roles)
  member   = "serviceAccount:${google_service_account.web_app_backend.email}"
  project  = var.project
  role     = each.value
}

resource "google_storage_bucket_object" "main" {
  bucket = google_storage_bucket.dataflow_bucket.name
  name   = "main.js"
  source = "${path.module}/files/main.js"
}