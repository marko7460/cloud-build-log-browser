variable "project" {
  type        = string
  description = "Project ID"
}

variable "topic" {
  type        = string
  description = "Pub/Sub topic name where logs will be pushed"
  default     = "cloud-build-log-topic"
}

variable "subscription" {
  type        = string
  description = "Pub/Sub subscription name where logs will be pushed"
  default     = "cloud-build-log-sub"
}

variable "dataset_id" {
  type        = string
  description = "Dataset name"
  default     = "cloud_build_logs"
}

variable "dataset_location" {
  type        = string
  description = "Dataset location"
  default     = "US"
}

variable "table_id" {
  type        = string
  description = "Table name"
  default     = "logs"
}

variable "dataflow_sa" {
  type        = string
  description = "Dataflow service account"
  default     = "dataflow-log-to-bq-sa"
}

variable "dataflow_region" {
  type        = string
  description = "Region where dataflow will be started. Must match the subnetwork region"
}

variable "dataflow_network" {
  type        = string
  description = "VPC where dataflow will run"
}

variable "dataflow_subnetwork" {
  type        = string
  description = "Subnetwork in the format https://www.googleapis.com/compute/v1/projects/PROJECT_ID/regions/us-central1/subnetworks/SUBNETWORK"
}

variable "webapp_backend_sa" {
  type        = string
  description = "App engine webapp backend service account"
  default     = "web-app-backend-sa"
}