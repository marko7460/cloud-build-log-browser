import React, { useState } from "react";

import {
  Typography,
  Menu,
  Box,
  Tooltip,
  IconButton,
  Avatar,
  MenuItem,
  Toolbar,
  AppBar,
} from "@mui/material";
import StepsSelect from "./StepsSelect";

function ResponsiveAppBar({ userPhoto, logout, steps, onStepSelect }) {
  const [anchorElUser, setAnchorElUser] = useState(null);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <AppBar className="ResponsiveAppBar" position="sticky" sx={{ top: 0 }}>
      <Toolbar id="ResponsiveAppBar">
        <Typography
          variant="h6"
          component="h2"
          sx={{
            fontFamily: "monospace",
            fontWeight: 700,
            letterSpacing: ".3rem",
            color: "inherit",
            textDecoration: "none",
          }}
        >
          Cloud Build Log Browser
        </Typography>
        <Box
          sx={{
            flexGrow: 1,
            "& .MuiTextField-root": { m: 1, width: "25ch" },
          }}
        >
          <StepsSelect steps={steps} onStepSelect={onStepSelect} />
        </Box>
        <Box sx={{ flexGrow: 0 }}>
          <Tooltip title="Open settings">
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              <Avatar src={userPhoto} />
            </IconButton>
          </Tooltip>
          <Menu
            sx={{ mt: "45px" }}
            id="menu-appbar"
            anchorEl={anchorElUser}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
          >
            <MenuItem key="Logout" onClick={logout}>
              <Typography textAlign="center">Logout</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default ResponsiveAppBar;
