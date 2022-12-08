# Log Browser
* bucket for dataflow
* main.js pushed to dataflow bucket (This is the main.js file that is used to run the dataflow job)
* log export based on the filter
* pub sub topic as log export destination
* pub sub subscription for dataflow job
* big query dataset and the table with proper schema
* service account for dataflow
* service account for backend
* service account for fronted
* dataflow SA access to dataflow bucket

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:-----:|
| dataflow\_network | VPC where dataflow will run | `string` | n/a | yes |
| dataflow\_region | Region where dataflow will be started. Must match the subnetwork region | `string` | n/a | yes |
| dataflow\_sa | Dataflow service account | `string` | `"dataflow-log-to-bq-sa"` | no |
| dataflow\_subnetwork | Subnetwork in the format https://www.googleapis.com/compute/v1/projects/PROJECT_ID/regions/us-central1/subnetworks/SUBNETWORK | `string` | n/a | yes |
| dataset\_id | Dataset name | `string` | `"cloud_build_logs"` | no |
| dataset\_location | Dataset location | `string` | `"US"` | no |
| project | Project ID | `string` | n/a | yes |
| subscription | Pub/Sub subscription name where logs will be pushed | `string` | `"cloud-build-log-sub"` | no |
| table\_id | Table name | `string` | `"logs"` | no |
| topic | Pub/Sub topic name where logs will be pushed | `string` | `"cloud-build-log-topic"` | no |
| webapp\_backend\_sa | App engine webapp backend service account | `string` | `"web-app-backend-sa"` | no |

## Outputs

| Name | Description |
|------|-------------|
| backend\_yaml | backend.yaml |
| dataflow\_command | Dataflow command |
| dataset\_id | Dataset ID |
| dispatch\_yaml | dispatch.yaml |
| frontend\_yaml | frontend.yaml |
| project\_id | Project ID |
| table\_id | Table ID |
| table\_reference | Table Reference |