import { createSlice } from "@reduxjs/toolkit";
import pp from "../../assets/profile.gif";

// Get initial state from localStorage with default values
const initialState = {
  name: localStorage.getItem('username') || null,
  profilepic: localStorage.getItem('profilepic') || pp
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      // Update name
      state.name = action.payload.name;
      localStorage.setItem('username', action.payload.name);

      // Update profilepic only if provided
      if (action.payload.profilepic) {
        state.profilepic = action.payload.profilepic;
        localStorage.setItem('profilepic', action.payload.profilepic);
      }
    },
    clearUser: (state) => {
      state.name = null;
      state.profilepic = pp;

      localStorage.removeItem('username');
      localStorage.removeItem('profilepic');
    }
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
