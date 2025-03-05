import { createSlice } from "@reduxjs/toolkit";

const themeSlice = createSlice({
    name: 'theme',
    initialState: {
        isDark: localStorage.getItem('isDark') === 'true' || false
    },
    reducers: {
        toggleTheme: (state) => {
            state.isDark = !state.isDark;
            localStorage.setItem('isDark', state.isDark);
        }
    }
});

export const { toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;