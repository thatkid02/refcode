import { configureStore } from "@reduxjs/toolkit";
import GlobalReducer from "./Global/uxSlice";

export const store = configureStore({
    reducer: {
        refcodestore: GlobalReducer
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = ReturnType<typeof store.dispatch>;