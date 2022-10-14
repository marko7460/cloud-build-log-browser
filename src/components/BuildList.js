import React, { useState, useEffect } from "react";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import CancelIcon from "@mui/icons-material/Cancel";
import CircularProgress from "@mui/material/CircularProgress";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TablePagination from "@mui/material/TablePagination";

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
  if (status === "STATUS_UNKNOWN") {
    return <QuestionMarkIcon />;
  }
  if (status === "WORKING") {
    return <CircularProgress color="inherit" size={20} />;
  }
  return <CircularProgress color="inherit" />;
}

export default function BuildList({
  buildIds,
  setSelectedBuildId,
  setSteps,
  paginate,
  paginateControl,
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [displayedBuildIds, setDispalyedBuildIds] = useState([]);
  useEffect(() => setDispalyedBuildIds(buildIds), [buildIds]);

  const handleListItemClick = (event, build_id, index) => {
    event.preventDefault();
    let filtered = buildIds.filter((build) => build.id === build_id);
    setSteps(filtered[0].steps);
    setSelectedBuildId(build_id);
    setSelectedIndex(index);
  };

  useEffect(
    () =>
      setDispalyedBuildIds(
        buildIds.map((value, index) => ({ id: value.id, status: value.status }))
      ),
    [buildIds]
  );

  const filterBuildIds = (event) => {
    if (event.target.value === "") {
      setDispalyedBuildIds(buildIds);
      return;
    }
    let filtered = buildIds.filter((build) =>
      build.id.startsWith(event.target.value)
    );
    setDispalyedBuildIds(filtered);
  };

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const handleChangePage = (event, newPage) => {
    paginate(rowsPerPage, newPage);
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    let value = parseInt(event.target.value, 10);
    paginate(value, 0, true);
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
      <TablePagination
        component="div"
        count={-1}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50, 100]}
        labelRowsPerPage="Rows"
        nextIconButtonProps={{ disabled: !paginateControl.forward }}
        backIconButtonProps={{ disabled: !paginateControl.backward }}
      />
      <List component="div" aria-label="secondary mailbox folder">
        {displayedBuildIds.map((value, index) => (
          <ListItemButton
            selected={selectedIndex === index}
            onClick={(event) => handleListItemClick(event, value.id, index)}
            key={index}
            value={value.id}
          >
            {getIcon(value.status)}
            <Typography sx={{ fontFamily: "monospace", fontSize: 14, ml: 1 }}>
              {value.id}
            </Typography>
          </ListItemButton>
        ))}
      </List>
    </>
  );
}
