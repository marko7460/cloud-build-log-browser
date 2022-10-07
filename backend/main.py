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


app = flask.Flask(__name__)
flask_cors.CORS(app)
bigquery_client = bigquery.Client()
HTTP_REQUEST = google.auth.transport.requests.Request()


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
        except:
            return jsonify(error_message), 401
        if not claims:
            return jsonify(error_message), 401

@app.route("/api/build_ids")
def get_build_ids():
    query_job = bigquery_client.query(
        f"SELECT DISTINCT build_id FROM `{os.environ.get('GOOGLE_CLOUD_PROJECT')}.cloud_build.logs`")
    build_ids = []
    try:
        # Set a timeout because queries could take longer than one minute.
        results = query_job.result(timeout=60)
        for row in results:
            build_ids.append(row.build_id)
    except concurrent.futures.TimeoutError:
        return "ERROR", 404

    return jsonify(build_ids), {"Access-Control-Allow-Origin": "*"}


@app.route("/api/steps/<build_id>")
def get_steps(build_id=0):
    query_job = bigquery_client.query(
        f"SELECT DISTINCT step_id FROM `{os.environ.get('GOOGLE_CLOUD_PROJECT')}.cloud_build.logs` where build_id = \'{build_id}\'")
    step_ids = []
    try:
        # Set a timeout because queries could take longer than one minute.
        results = query_job.result(timeout=60)
        for row in results:
            step_ids.append(row.step_id)
    except concurrent.futures.TimeoutError:
        return "ERROR", 404
    step_ids.sort()
    return jsonify(step_ids), {"Access-Control-Allow-Origin": "*"}

@app.route("/api/logs/<build_id>/<step_id>", methods=["GET"])
def get_log(build_id=0, step_id=0):
    query_job = bigquery_client.query(
        f"SELECT log_line FROM `{os.environ.get('GOOGLE_CLOUD_PROJECT')}.cloud_build.logs` where build_id = '{build_id}'AND step_id={step_id} ORDER BY insert_id")
    def generate():
        try:
            # Set a timeout because queries could take longer than one minute.
            results = query_job.result(timeout=60)
            for row in results:
                yield row.log_line + "\n"
        except concurrent.futures.TimeoutError:
            yield "ERROR", 404
    return generate(), {"Content-Type": "text/plain", "Access-Control-Allow-Origin": "*"}


if __name__ == "__main__":
    # This is used when running locally only. When deploying to Google App
    # Engine, a webserver process such as Gunicorn will serve the app. This
    # can be configured by adding an `entrypoint` to app.yaml.
    app.run(host="127.0.0.1", port=8080, debug=True)
