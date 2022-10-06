import concurrent.futures

import flask
from flask import jsonify
from google.cloud import bigquery


app = flask.Flask(__name__)
bigquery_client = bigquery.Client()

@app.route("/build_ids")
def get_build_ids():
    query_job = bigquery_client.query(f"SELECT DISTINCT build_id FROM `sap-iac-cicd.cloud_build.logs`")
    build_ids=[]
    try:
        # Set a timeout because queries could take longer than one minute.
        results = query_job.result(timeout=60)
        for row in results:
            build_ids.append(row.build_id)
    except concurrent.futures.TimeoutError:
        return "ERROR", 404

    return jsonify(build_ids), {"Access-Control-Allow-Origin": "*"}

@app.route("/steps/<build_id>")
def get_steps(build_id=0):
    if build_id == 0:
        return "Invalid build_id", 404
    query_job = bigquery_client.query(f"SELECT DISTINCT step_id FROM `sap-iac-cicd.cloud_build.logs` where build_id = \'{build_id}\'")
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

@app.route("/logs/<build_id>/<step_id>")
def get_log(build_id=0, step_id=0):
    if build_id == 0 or step_id == 0:
        return "Invalid build_id", 404
    query_job = bigquery_client.query(f"SELECT log_line FROM `sap-iac-cicd.cloud_build.logs` where build_id = '{build_id}'AND step_id={step_id} ORDER BY insert_id")
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
