import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";
import Home from "./Pages/home";
import Engine from "./Pages/engine";
import Puzzle from "./Pages/puzzle";

function Approuter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/engine" element={<Engine />} />
        <Route path="/puzzle" element={<Puzzle />} />

      </Routes>
    </Router>
  );
}

export default Approuter;