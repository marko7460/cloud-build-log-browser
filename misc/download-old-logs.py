#!/usr/bin/env python
import googleapiclient.discovery
import sys
from google.cloud import storage


if len(sys.argv) != 2:
    print('Please pass the project ID')
    sys.exit(1)

project_id = sys.argv[1]


# Get project Number
cloud_resource_manager = googleapiclient.discovery.build(
    "cloudresourcemanager", "v1",  # credentials=credentials
)
cloud_resource_manager_request = cloud_resource_manager.projects().get(
    projectId=project_id)
cloud_resource_manager_response = cloud_resource_manager_request.execute()

project_number = cloud_resource_manager_response['projectNumber']


# Get all the build IDs
service = googleapiclient.discovery.build(
    "cloudbuild", "v1",  # credentials=credentials
)
request = service.projects().builds().list(
    projectId=project_id,
    pageSize=500,
    pageToken=None
)
print(f'\nInitial Request')
response = request.execute()

# builds = getIds(response['builds'])
builds = [i['id'] for i in response['builds'] if 'logsBucket' in i]
print(f'Total builds = {len(builds)}')


# Download all the build log files
storage_client = storage.Client()
bucket = storage_client.bucket(
    f'{project_number}.cloudbuild-logs.googleusercontent.com')
for build in builds:
    blob_name = f'log-{build}.txt'
    print(f'Downloading {blob_name}')
    try:
        blob = bucket.blob(blob_name)
        blob.download_to_filename(blob_name)
    except Exception as e:
        print(e)
