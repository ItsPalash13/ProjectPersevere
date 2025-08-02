import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  session: null
};

const levelSessionSlice = createSlice({
  name: 'levelSession',
  initialState,
  reducers: {
    setLevelSession: (state, action) => {
      state.session = action.payload;
    },
    clearLevelSession: (state) => {
      state.session = null;
    }
  }
});

export const { setLevelSession, clearLevelSession } = levelSessionSlice.actions;
export default levelSessionSlice.reducer; 