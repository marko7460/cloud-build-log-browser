import React from "react";
import Paper from "@mui/material/Paper";
import { Typography } from "@mui/material";

export default function LogViewer({ logContent }) {
  return (
    <Paper
      elevation={2}
      sx={{ width: "100%", p: 1, flexGrow: 1, overflow: "auto", border: 1 }}
    >
      <Typography fontFamily="monospace" fontSize={10} whiteSpace="pre-wrap">
        {logContent}
      </Typography>
    </Paper>
  );
}
