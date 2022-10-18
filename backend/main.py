import concurrent.futures
import os
import logging
#logging.basicConfig(level=logging.DEBUG)

import flask
import flask_cors
from flask import jsonify
from flask import request
from google.cloud import bigquery

import google.auth.transport.requests
import google.oauth2.id_token
import googleapiclient.discovery

app = flask.Flask(__name__)
flask_cors.CORS(app)
bigquery_client = bigquery.Client()
HTTP_REQUEST = google.auth.transport.requests.Request()

ALLOWED_ROLES = [
    'roles/owner',
    'roles/editor',
    'roles/viewer',
    'roles/appengineflex.serviceAgent',
    'roles/cloudbuild.builds.approver',
    'roles/cloudbuild.builds.builder',
    'roles/cloudbuild.builds.editor',
    'roles/cloudbuild.builds.viewer',
    'roles/cloudbuild.serviceAgent',
    'roles/clouddeploy.serviceAgent',
    'roles/cloudfunctions.admin',
    'roles/cloudfunctions.developer',
    'roles/cloudfunctions.serviceAgent',
    'roles/cloudfunctions.viewer',
    'roles/composer.worker',
    'roles/dataflow.admin',
    'roles/dataflow.developer',
    'roles/datapipelines.serviceAgent',
    'roles/dataprep.serviceAgent',
    'roles/firebase.admin',
    'roles/firebase.developAdmin',
    'roles/firebase.developViewer',
    'roles/firebase.viewer',
    'roles/run.serviceAgent',
    'roles/runapps.serviceAgent',
    'roles/serverless.serviceAgent'
]


def testUserPermissions(test_user, project_id, organization_id, folder_id):
    service = googleapiclient.discovery.build(
        "cloudresourcemanager", "v3",
    )
    request_projects = service.projects().getIamPolicy(
            resource=f'projects/{project_id}',
            body={"options": {"requestedPolicyVersion": 3}},
    )
    request_folders = service.folders().getIamPolicy(
        resource=f'folders/{folder_id}',
        body={"options": {"requestedPolicyVersion": 3}},
    )
    request_organizations = service.organizations().getIamPolicy(
        resource=f'organizations/{organization_id}',
        body={"options": {"requestedPolicyVersion": 3}},
    )
    response_projects = request_projects.execute()
    response_folders = request_folders.execute()
    response_organizations = request_organizations.execute()
    bindings = response_projects['bindings'] + response_folders['bindings'] + response_organizations['bindings']
    for binding in bindings:
        if binding['role'] in ALLOWED_ROLES and test_user in binding['members']:
            print(binding)
            return True
    return False


@app.before_request
def verify_permissions():
    error_message = {
        "message": "Unauthorized"
    }
    if flask.request.method in ["GET", "POST"]:
        if not "Authorization" in request.headers:
            return 'Unauthorized', 401
        id_token = request.headers['Authorization'].split(' ').pop()
        try:
            claims = google.oauth2.id_token.verify_firebase_token(
                id_token, HTTP_REQUEST, audience=None)
            print(f"\n\n\nclaims={claims}\n\n\n")
            if not testUserPermissions(
                    f'user:{claims["email"]}',
                    os.environ.get('GOOGLE_CLOUD_PROJECT'),
                    os.environ.get('ORGANIZATION_ID'),
                    os.environ.get('FOLDER_ID')
            ):
                return jsonify(error_message), 401
        except Exception as e:
            print(f"Error={e}")
            return jsonify(error_message), 401
        if not claims:
            return jsonify(error_message), 401


@app.route("/api/logs/<build_id>/<step_id>", methods=["GET"])
def get_log(build_id=0, step_id=0):
    query_job = bigquery_client.query(
        f"SELECT log_line FROM `{os.environ.get('GOOGLE_CLOUD_PROJECT')}.cloud_build.logs` where build_id = '{build_id}'AND step_id={step_id} ORDER BY insert_id")

    def generate():
        try:
            # Set a timeout because queries could take longer than one minute.
            results = query_job.result(timeout=60)
            for row in results:
                if row.log_line:
                    if row.log_line.endswith('\n'):
                        yield row.log_line
                    else:
                        yield row.log_line + "\n"
                else:
                    yield '\n'
        except concurrent.futures.TimeoutError:
            yield "ERROR", 404
    return generate(), {"Content-Type": "text/plain", "Access-Control-Allow-Origin": "*"}


@app.route("/api/builds")
def get_builds():
    args = request.args
    token = args.get('pageToken', None)
    page_size = args.get('pageSize', 25)
    res = {
        'builds': [],
        'nextPageToken': '',
    }
    service = googleapiclient.discovery.build(
        "cloudbuild", "v1",
    )
    req = service.projects().builds().list(
        projectId='sap-iac-cicd',
        pageSize=page_size,
        pageToken=token
    )
    try:
        # Set a timeout because queries could take longer than one minute.
        res = req.execute()

    except Exception:
        return "ERROR", 404

    return jsonify(res), {"Access-Control-Allow-Origin": "*"}


if __name__ == "__main__":
    # This is used when running locally only. When deploying to Google App
    # Engine, a webserver process such as Gunicorn will serve the app. This
    # can be configured by adding an `entrypoint` to app.yaml.
    app.run(host="127.0.0.1", port=8080, debug=True)
