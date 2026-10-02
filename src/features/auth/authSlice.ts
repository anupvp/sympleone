import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { ApiError } from '../../api/httpClient'
import { fetchCurrentUser, loginRequest, logoutRequest } from './authApi'
import {
  clearStoredAuth,
  loadStoredAuth,
  persistAuth,
} from './authStorage'
import type { AuthState, LoginCredentials } from './types'

const stored = loadStoredAuth()

const initialState: AuthState = {
  user: stored.user,
  accessToken: stored.accessToken,
  status:
    stored.accessToken && stored.user ? 'authenticated' : 'idle',
  error: null,
}

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const data = await loginRequest(credentials)
      persistAuth(data.accessToken, data.user)
      return data
    } catch (err) {
      if (err instanceof ApiError) {
        return rejectWithValue(err.message)
      }
      if (err instanceof Error) {
        return rejectWithValue(err.message)
      }
      return rejectWithValue('Login failed')
    }
  },
)

export const hydrateSession = createAsyncThunk(
  'auth/hydrate',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { auth: AuthState }
    const token = state.auth.accessToken
    if (!token) {
      return rejectWithValue('No token')
    }
    try {
      const user = await fetchCurrentUser(token)
      persistAuth(token, user)
      return user
    } catch {
      clearStoredAuth()
      return rejectWithValue('Session expired')
    }
  },
)

export const logout = createAsyncThunk('auth/logout', async (_, { getState }) => {
  const state = getState() as { auth: AuthState }
  const token = state.auth.accessToken
  if (token) {
    try {
      await logoutRequest(token)
    } catch {
      // Best-effort; clear local session regardless.
    }
  }
  clearStoredAuth()
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null
    },
    establishSession(
      state,
      action: { payload: { accessToken: string; user: AuthState['user'] } },
    ) {
      const { accessToken, user } = action.payload
      if (!accessToken || !user) {
        return
      }
      persistAuth(accessToken, user)
      state.accessToken = accessToken
      state.user = user
      state.status = 'authenticated'
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'authenticated'
        state.accessToken = action.payload.accessToken
        state.user = action.payload.user
        state.error = null
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'error'
        state.error =
          (typeof action.payload === 'string' ? action.payload : null) ??
          'Login failed'
      })
      .addCase(hydrateSession.fulfilled, (state, action) => {
        state.user = action.payload
        state.status = 'authenticated'
      })
      .addCase(hydrateSession.rejected, (state) => {
        state.user = null
        state.accessToken = null
        state.status = 'idle'
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.accessToken = null
        state.status = 'idle'
        state.error = null
      })
  },
})

export const { clearAuthError, establishSession } = authSlice.actions
export default authSlice.reducer
