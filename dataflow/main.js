/**
 * A transform which adds a field to the incoming data.
 * https://cloud.google.com/blog/topics/developers-practitioners/extend-your-dataflow-template-with-udfs
 * @param {string} inJson
 * @return {string} outJson
 */
function transform(inJson) {
  var obj = JSON.parse(inJson);
  // Validate that the object is coming from cloud build
  if (obj.labels.hasOwnProperty("build_tags")) {
    if (!obj.labels.build_tags.startsWith("trigger-")) {
      return "";
    }
  }
  var insert_id_arr = obj.insertId.split("-");
  var insert_id = parseInt(insert_id_arr[insert_id_arr.length - 1]);
  var step_arr = obj.labels.build_step.match(/^Step #[0-9]+/);
  if (step_arr == null) {
    return "";
  }
  var step_id = step_arr[0].split("#")[1];
  step_id = parseInt(step_id);
  var out = {
    build_id: obj.resource.labels.build_id,
    step_id: step_id,
    insert_id: insert_id,
    log_line: obj.textPayload,
  };
  return JSON.stringify(out);
}
