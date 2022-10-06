import React, { useEffect, useState } from "react";

import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

export default function StepsSelect({ steps, onStepSelect }) {
  const [step, setStep] = useState("");

  // Anytime we select a build we won't to set select text field to 0
  // This can be achieved using effects. whenever the value of "steps" change we want to setStep to 0
  useEffect(() => setStep(0), [steps]);

  const handleChange = (event) => {
    setStep(event.target.value);
    onStepSelect(event.target.value);
  };
  return (
    <TextField
      id="outlined-select-currency"
      select
      label="Select Step"
      variant="filled"
      value={step}
      onChange={handleChange}
      sx={{ backgroundColor: "white", m: 1 }}
    >
      {steps.map((value, index) => (
        <MenuItem key={index} value={value}>
          {value}
        </MenuItem>
      ))}
    </TextField>
  );
}
