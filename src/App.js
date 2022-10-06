import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SignIn from "./components/SignIn";
import LogBrowser from "./components/LogBrowser";
function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<SignIn />} />
        <Route exact path="/dashboard" element={<LogBrowser />} />
      </Routes>
    </Router>
  );
}

export default App;
