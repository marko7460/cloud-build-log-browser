import React, { useEffect, useState } from "react";

import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import CancelIcon from "@mui/icons-material/Cancel";

function getIcon(status) {
  if (status === "SUCCESS") {
    return <CheckCircleIcon sx={{ color: "green" }} />;
  }
  if (
    status === "FAILURE" ||
    status === "INTERNAL_ERROR" ||
    status === "CANCELLED" ||
    status === "EXPIRED" ||
    status === "TIMEOUT"
  ) {
    return <CancelIcon sx={{ color: "red" }} />;
  }
  if (status === "STATUS_UNKNOWN" || "") {
    return <QuestionMarkIcon />;
  }
}

export default function StepsSelect({ steps, onStepSelect }) {
  const [step, setStep] = useState("");

  useEffect(() => {
    if (steps.length === 0) {
      return;
    }
    setStep(steps[0].id);
  }, [steps]);

  const handleChange = (event) => {
    setStep(event.target.value);
    let index = steps.findIndex((element) => element.id === event.target.value);
    //console.log(index);
    onStepSelect(index);
  };

  /**
   * This function ensures that TextField value is set properly.
   * Without this sanitization the React will keep throwing warnings
   * when painiting the menu with steps
   * @returns
   */
  function sanitize() {
    let step_names = steps.map((value) => value.id);
    if (step_names.includes(step)) {
      return step;
    } else {
      return "";
    }
  }

  return (
    <TextField
      id="outlined-select-currency"
      select
      label="Select Step"
      variant="filled"
      value={sanitize()}
      onChange={handleChange}
      sx={{ backgroundColor: "white", m: 1 }}
    >
      {steps.map((value, index) => (
        <MenuItem key={index} value={value.id}>
          {getIcon(value.status)}
          {`${index}: ${value.id}`}
        </MenuItem>
      ))}
    </TextField>
  );
}
