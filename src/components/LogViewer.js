import React from "react";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";

export default function LogViewer({ logContent }) {
  return (
    <>
      <Typography fontFamily="monospace" fontSize={10} whiteSpace="pre-wrap">
        {logContent}
      </Typography>
      <Box margin={10}></Box>
    </>
  );
}
