import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

export default function StepsList({ steps, onStepSelect }) {
  const [alignment, setAlignment] = useState("web");
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => setSelectedIndex(0), [steps]);

  const handleChange = (event, newAlignment) => {
    setAlignment(newAlignment);
  };

  const onStepClick = (event, value, index) => {
    onStepSelect(value);
    setSelectedIndex(index);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        overflow: "auto",
        //height: 100,
      }}
    >
      <ToggleButtonGroup
        color="primary"
        value={alignment}
        exclusive
        onChange={handleChange}
        aria-label="Platform"
      >
        {steps.map((value, index) => (
          <ToggleButton
            value={value}
            key={index}
            size="large"
            onClick={(event) => onStepClick(event, value, index)}
            selected={selectedIndex === index}
          >
            {value}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
}
