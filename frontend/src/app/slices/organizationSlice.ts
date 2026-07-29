import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface OrganizationInfo {
  name: string;
  logoPath?: string;
}

interface OrganizationState {
  organization: OrganizationInfo | null;
}

const initialState: OrganizationState = {
  organization: null,
};

export const organizationSlice = createSlice({
  name: "organization",
  initialState,
  reducers: {
    setOrganization: (state, action: PayloadAction<OrganizationInfo>) => {
      state.organization = action.payload;
    },
    clearOrganization: (state) => {
      state.organization = null;
    },
  },
});

export const { setOrganization, clearOrganization } = organizationSlice.actions;
export default organizationSlice.reducer;
