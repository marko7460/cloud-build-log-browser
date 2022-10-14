import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { auth, logout } from "../firebase";
import React, { useEffect, useState, useCallback } from "react";
import ResponsiveAppBar from "./ResponsiveAppBar";
import BuildList from "./BuildList";
import Box from "@mui/system/Box";
import CssBaseline from "@mui/material/CssBaseline";
import LogViewer from "./LogViewer";
import CircularProgress from "@mui/material/CircularProgress";

const sidebarWidth = "440px";

export default function LogBrowser() {
  const [builds, setBuilds] = useState([]);
  const [steps, setSteps] = useState([]);
  const [nextPageTokens, setNextPageTokens] = useState([]);
  const [logContent, setLogContent] = useState([]);
  const [selectedBuildId, setSelectedBuildId] = useState("");
  const [userPhoto, setUserPhoto] = useState("");
  const [paginateControl, setPaginateControl] = useState({
    forward: false,
    backward: false,
  });
  const [loadingLogs, setLoadingLogs] = useState(true);

  const [user, loading /*error*/] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) return navigate("/");
    setUserPhoto(user.photoURL);
  }, [user, loading, navigate]);

  /**
   * Since we use getLog in useEffect and getLog function depends on the
   * props we need to wrap it with useCallback in order to prevent compiler
   * warning. See https://overreacted.io/a-complete-guide-to-useeffect/ for
   * detailed explanation.
   */
  const getLog = useCallback(
    async (step) => {
      if (selectedBuildId === "") return;
      if (!user) return;
      setLoadingLogs(true);
      let userInfo = await user.getIdTokenResult(true);
      let log = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/logs/${selectedBuildId}/${step}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + userInfo.token,
          },
          method: "GET",
        }
      );
      let logText = await log.text();
      setLoadingLogs(false);
      setLogContent(logText);
    },
    [selectedBuildId, user]
  );

  useEffect(() => {
    // Execute this when the page loads
    async function fetchBuilds() {
      if (!user) return;
      let userInfo = await user.getIdTokenResult(true);
      let builds_res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/builds?pageSize=25`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + userInfo.token,
          },
          method: "GET",
        }
      );
      let builds = await builds_res.json();
      setBuilds(builds.builds);
      if ("nextPageToken" in builds) {
        setNextPageTokens([builds.nextPageToken]);
        setPaginateControl({ backward: false, forward: true });
      }

      setSteps(builds.builds[0].steps);
      setSelectedBuildId(builds.builds[0].id);
    }
    fetchBuilds();
  }, [user]);

  useEffect(() => {
    getLog(0);
  }, [getLog, selectedBuildId]);

  async function paginate(pageSize, page, reset = false) {
    if (reset) {
      setNextPageTokens([]);
    }
    let userInfo = await user.getIdTokenResult(true);
    let pageToken = "";
    if (page > 0) {
      pageToken = nextPageTokens[page - 1];
      setPaginateControl({ backward: true, forward: true });
    } else {
      setPaginateControl({ backward: false, forward: true });
    }

    let builds_res = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/api/builds?pageSize=${pageSize}&pageToken=${pageToken}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + userInfo.token,
        },
        method: "GET",
      }
    );
    if (builds_res.status === 401) {
      console.log("Retry ?");
      return;
    }
    let builds = await builds_res.json();
    setBuilds(builds.builds);
    setSteps(builds.builds[0].steps);

    if ("nextPageToken" in builds) {
      if (nextPageTokens.length === page || reset) {
        setNextPageTokens([...nextPageTokens, builds.nextPageToken]);
      }
    } else {
      setPaginateControl({ backward: true, forward: false });
    }
  }

  return (
    <CssBaseline>
      <ResponsiveAppBar
        userPhoto={userPhoto}
        logout={logout}
        steps={steps}
        onStepSelect={getLog}
      />
      <Box
        sx={{
          display: "flex",
          direction: "row",
          width: "100%",
          height: "100vh",
        }}
      >
        <Box
          className="BuildList"
          sx={{
            width: sidebarWidth,
            height: "95%",
            overflowX: "hidden",
            position: "relative",
            zIndex: 200,
            mt: 1,
          }}
        >
          <BuildList
            buildIds={builds}
            setSelectedBuildId={setSelectedBuildId}
            setSteps={setSteps}
            paginate={paginate}
            paginateControl={paginateControl}
          />
        </Box>
        <Box
          className="LogViewer"
          sx={{
            width: "80%",
            height: "95%",
            overflowX: "hidden",
            mt: 1,
            ml: 2,
          }}
        >
          {loadingLogs ? (
            <Box sx={{ display: "flex", m: 10 }}>
              <CircularProgress />
            </Box>
          ) : (
            <LogViewer logContent={logContent} />
          )}
        </Box>
      </Box>
      {/* </Box> */}
    </CssBaseline>
  );
}
