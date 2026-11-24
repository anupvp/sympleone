import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import dashboardReducer from '../features/dashboard/state/dashboardSlice'
import layoutReducer from '../layout/layoutSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    layout: layoutReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
