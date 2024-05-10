import { createSlice } from "@reduxjs/toolkit";


interface GlobalRefCodeState {
    accessTokenObject: any
}

const initialState: GlobalRefCodeState = {
    accessTokenObject: {}
};

const refcodeSlice = createSlice({
    name: 'refcode',
    initialState,
    reducers: {
        setTwitterSuccessToken: (state, action) => {
            state.accessTokenObject = action.payload
        },

    }
});

export const { setTwitterSuccessToken } = refcodeSlice.actions;
export default refcodeSlice.reducer;