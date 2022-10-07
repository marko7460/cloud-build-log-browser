import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { auth, logout } from "../firebase";
import React, { useEffect, useState, useCallback } from "react";
import ResponsiveAppBar from "./ResponsiveAppBar";
import BuildList from "./BuildList";
import Box from "@mui/system/Box";
import CssBaseline from "@mui/material/CssBaseline";
import LogViewer from "./LogViewer";
import { Toolbar } from "@mui/material";
//import { async } from "@firebase/util";

const sidebarWidth = "340px";

export default function LogBrowser() {
  const [stepIds, setStepIds] = useState([0]);
  const [buildIds, setBuildIds] = useState([]);
  const [logContent, setLogContent] = useState([]);
  const [selectedBuildId, setSelectedBuildId] = useState("");
  const [userPhoto, setUserPhoto] = useState("");

  const [user, loading /*error*/] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) return navigate("/");
    setUserPhoto(user.photoURL);
  }, [user, loading, navigate]);

  const getSteps = async (id) => {
    let steps_res = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/api/steps/${id}`
    );
    let steps = await steps_res.json();
    setStepIds(steps);
  };

  /**
   * Since we use getLog in useEffect and getLog function depends on the
   * props we need to wrap it with useCallback in order to prevent compiler
   * warning. See https://overreacted.io/a-complete-guide-to-useeffect/ for
   * detailed explanation.
   */
  const getLog = useCallback(
    async (step) => {
      if (selectedBuildId === "") return;
      setLogContent(`Loading step ${step}...`);
      let log = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/logs/${selectedBuildId}/${step}`
      );
      let logText = await log.text();
      setLogContent(logText);
    },
    [selectedBuildId]
  );

  useEffect(() => {
    // Execute this when the page loads
    async function fetchBuildIds() {
      let build_ids_res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/build_ids`
      );
      let build_ids = await build_ids_res.json();
      setBuildIds(build_ids);
      if (build_ids.length > 0) {
        setSelectedBuildId(build_ids[0]);
        await getSteps(build_ids[0]);
      }
    }
    fetchBuildIds();
  }, []);

  useEffect(() => {
    getLog(0);
  }, [getLog]);

  return (
    <CssBaseline>
      <Box
        sx={{
          flexDirection: "column",
          display: "flex",
        }}
      >
        <ResponsiveAppBar
          userPhoto={userPhoto}
          logout={logout}
          steps={stepIds}
          onStepSelect={getLog}
        />
        <Toolbar></Toolbar>
        <Box
          sx={{
            flexDirection: "row",
            display: "flex",
            width: "100%",
          }}
        >
          <Box
            sx={{
              width: sidebarWidth,
              height: "100vh",
              overflowX: "hidden",
              position: "fixed",
              zIndex: 0,
              mt: 1,
            }}
          >
            <BuildList
              getSteps={getSteps}
              buildIds={buildIds}
              setSelectedBuildId={setSelectedBuildId}
            />
          </Box>
          <Box
            sx={{
              width: "100%",
              marginLeft: sidebarWidth,
              height: "100vh",
              mt: 1,
            }}
          >
            <LogViewer logContent={logContent} />
          </Box>
        </Box>
      </Box>
    </CssBaseline>
  );
}
