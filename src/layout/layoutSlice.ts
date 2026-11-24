import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface LayoutState {
  globalSearchQuery: string
}

const initialState: LayoutState = {
  globalSearchQuery: '',
}

const layoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: {
    setGlobalSearchQuery(state, action: PayloadAction<string>) {
      state.globalSearchQuery = action.payload
    },
    clearGlobalSearchQuery(state) {
      state.globalSearchQuery = ''
    },
  },
})

export const { setGlobalSearchQuery, clearGlobalSearchQuery } = layoutSlice.actions
export default layoutSlice.reducer