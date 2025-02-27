import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";
import Home from "./Pages/home";
import Engine from "./Pages/engine";
import Puzzle from "./Pages/puzzle";
import Online from "./Pages/online"
import Signup from "./Pages/signUp";
import Login from "./Pages/logIn";
import Activate from "./Pages/activate";
import Createorjoin from "./Pages/createorjoin";
import JoinPage from "./Pages/join";

function Approuter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/engine" element={<Engine />} />
        <Route path="/puzzle" element={<Puzzle />} />
        <Route path="/online/:roomid" element={<Online />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/activate/:uid/:token" element={<Activate />} />
        <Route path="/connect" element={<Createorjoin />} />
        <Route path="/join" element={<JoinPage />} />
        


      </Routes>
    </Router>
  );
}

export default Approuter;