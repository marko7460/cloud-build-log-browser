import React, { useState, useEffect } from "react";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

export default function BuildList({
  getSteps,
  buildIds,
  setSelectedBuildId,
  getInitialLog,
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [displayedBuildIds, setDispalyedBuildIds] = useState([]);
  useEffect(() => setDispalyedBuildIds(buildIds), [buildIds]);

  const handleListItemClick = (event, build_id, index) => {
    event.preventDefault();
    getSteps(build_id);
    setSelectedBuildId(build_id);
    setSelectedIndex(index);
    //getInitialLog(0);
  };

  useEffect(() => setDispalyedBuildIds(buildIds), [buildIds]);

  const filterBuildIds = (event) => {
    if (event.target.value === "") {
      setDispalyedBuildIds(buildIds);
      return;
    }
    let filtered = buildIds.filter((build) =>
      build.startsWith(event.target.value)
    );
    setDispalyedBuildIds(filtered);
    console.log(filtered);
  };

  return (
    <>
      <TextField
        fullWidth
        label="Build ID"
        id="fullWidth"
        sx={{ p: 1 }}
        variant="filled"
        onChange={filterBuildIds}
      />
      <List component="nav" aria-label="secondary mailbox folder">
        {displayedBuildIds.map((value, index) => (
          <ListItemButton
            selected={selectedIndex === index}
            onClick={(event) => handleListItemClick(event, value, index)}
            key={index}
            value={value}
          >
            <Typography
              sx={{ fontFamily: "monospace", fontSize: 14 }}
              component="div"
            >
              {value}
            </Typography>
          </ListItemButton>
        ))}
      </List>
    </>
  );
}
