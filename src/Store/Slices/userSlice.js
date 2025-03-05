import { createSlice } from "@reduxjs/toolkit";
import pp from "../../assets/profile.gif";

// Initial state
const user = {
  name: "    ",
  profilepic: null
};

// Create a slice
const userSlice = createSlice({
  name: "user",
  initialState: user,
  reducers: {
    setUser: (state, action) => {
      return { ...state, ...action.payload }; // ✅ Correctly updating state
    },
  },
});

// Export actions
export const { setUser } = userSlice.actions;

// Export reducer
export default userSlice.reducer;
