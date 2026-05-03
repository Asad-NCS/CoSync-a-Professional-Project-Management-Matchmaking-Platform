import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../lib/api'

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed')
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', formData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed')
    }
  }
)

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('cosync_user') || 'null')
  } catch {
    localStorage.removeItem('cosync_user')
    return null
  }
}

const isTokenExpired = (token) => {
  if (!token) return true

  try {
    const payloadPart = token.split('.')[1]
    const normalizedPayload = payloadPart.replace(/-/g, '+').replace(/_/g, '/')
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - normalizedPayload.length % 4) % 4),
      '='
    )
    const payload = JSON.parse(atob(paddedPayload))
    return typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now()
  } catch {
    return true
  }
}

const storedToken = localStorage.getItem('cosync_token')
const storedUser = readStoredUser()
const hasValidStoredSession = !!storedUser && !!storedToken && !isTokenExpired(storedToken)

if (!hasValidStoredSession) {
  localStorage.removeItem('cosync_token')
  localStorage.removeItem('cosync_user')
}

const persistAuth = ({ token, user }) => {
  localStorage.setItem('cosync_token', token)
  localStorage.setItem('cosync_user', JSON.stringify(user))
}

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: hasValidStoredSession ? storedUser : null,
    token: hasValidStoredSession ? storedToken : null,
    isAuthenticated: hasValidStoredSession,
    status: 'idle', // idle | loading | succeeded | failed
    error: null,
  },
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      persistAuth(action.payload)
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.status = 'idle'
      state.error = null
      localStorage.removeItem('cosync_token')
      localStorage.removeItem('cosync_user')
    },
    clearError: (state) => {
      state.error = null
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload }
      localStorage.setItem('cosync_user', JSON.stringify(state.user))
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        persistAuth(action.payload)
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        persistAuth(action.payload)
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
  }
})

export const { setCredentials, logout, clearError, updateUser } = authSlice.actions
export default authSlice.reducer
