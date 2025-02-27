import { configureStore } from "@reduxjs/toolkit";
import userSlice  from "./Slices/userSlice";

const Store =configureStore({
    reducer: {
        user: userSlice,
    },
});

export default Store;