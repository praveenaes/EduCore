import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";//This reducer manages authentication state.
import organizationReducer from "./slices/organizationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    organization: organizationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;





//entire state(also store.getState() returns this)

// {
//   auth: {
//     user: null,
//     isAuthenticated: false,
//     isLoading: true
//   },
//   organization: {
//     currentOrganization: null
//   }
// }

// type RootState = {
//   auth: {
//     user: strng,
//     isAuthenticated: bolean,
//     isLoading: bolean
//   },
//   organization: {
//     currentOrganization:string
//   }
// };


// type RootState = {
//   auth: authState;
//   organisation:organisationState;
// };


// function getName() {
//   return "John";
// }

// type NameType = ReturnType<typeof getName>;
// type NameType = string;