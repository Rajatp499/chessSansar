import { configureStore } from "@reduxjs/toolkit";
import userSlice  from "./Slices/userSlice";
import themeReducer from "./Slices/themeSlice";

const Store =configureStore({
    reducer: {
        user: userSlice,
        theme: themeReducer
    },
});

export default Store;