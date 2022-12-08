import concurrent.futures
import os

import flask
import flask_cors
from flask import jsonify
from flask import request
from google.cloud import bigquery

import google.auth.transport.requests
import google.oauth2.id_token
import googleapiclient.discovery


app = flask.Flask(__name__)
# Set APP_LB_DEBUG environment variable to enable debugging and to allow CORS
if os.environ.get('APP_LB_DEBUG'):
    import logging
    logging.basicConfig(level=logging.DEBUG)
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


def getAccessControlHeader():
    if os.environ.get('APP_LB_DEBUG'):
        return {"Access-Control-Allow-Origin": "*"}
    else:
        return {}


def testUserPermissions(test_user, project_id):
    service = googleapiclient.discovery.build(
        "cloudresourcemanager", "v3",
    )
    request_projects = service.projects().getIamPolicy(
        resource=f'projects/{project_id}',
        body={"options": {"requestedPolicyVersion": 3}},
    )
    response_projects = request_projects.execute()
    bindings = response_projects['bindings']
    for binding in bindings:
        if binding['role'] in ALLOWED_ROLES and test_user in binding['members']:
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
            # print(f"\n\n\nclaims={claims}\n\n\n")
            if not testUserPermissions(
                    f'user:{claims["email"]}',
                    os.environ.get('GOOGLE_CLOUD_PROJECT'),
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
        f"SELECT log_line FROM `{os.environ.get('GOOGLE_CLOUD_PROJECT')}.{os.environ.get('DATASET_ID')}.{os.environ.get('TABLE_ID')}` where build_id = '{build_id}'AND step_id={step_id} ORDER BY insert_id")

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
    return generate(), {"Content-Type": "text/plain", **getAccessControlHeader()}


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
        projectId=os.environ.get('GOOGLE_CLOUD_PROJECT'),
        pageSize=page_size,
        pageToken=token
    )
    try:
        # Set a timeout because queries could take longer than one minute.
        res = req.execute()

    except Exception:
        return "ERROR", 404
    return jsonify(res), {**getAccessControlHeader()}


if __name__ == "__main__":
    # This is used when running locally only. When deploying to Google App
    # Engine, a webserver process such as Gunicorn will serve the app. This
    # can be configured by adding an `entrypoint` to app.yaml.
    app.run(host="127.0.0.1", port=8080, debug=True)
