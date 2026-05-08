import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../lib/api'

// Async thunks
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/projects', { params: filters })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch projects')
    }
  }
)

export const fetchMatchedProjects = createAsyncThunk(
  'projects/fetchMatchedProjects',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/projects/matches')
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch matched projects')
    }
  }
)

export const fetchMyProjects = createAsyncThunk(
  'projects/fetchMyProjects',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/projects')
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch my projects')
    }
  }
)

export const fetchMyApplications = createAsyncThunk(
  'projects/fetchMyApplications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/applications')
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch applications')
    }
  }
)

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (projectData, { rejectWithValue }) => {
    try {
      const response = await api.post('/projects', projectData)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create project')
    }
  }
)

export const applyToProject = createAsyncThunk(
  'projects/applyToProject',
  async ({ projectId, message }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/projects/${projectId}/apply`, { message })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to apply to project')
    }
  }
)

export const completeProject = createAsyncThunk(
  'projects/completeProject',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await api.put(`/projects/${projectId}/complete`)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to complete project')
    }
  }
)

// Fix: removeProject is now an async thunk that calls the DELETE API
export const removeProject = createAsyncThunk(
  'projects/removeProject',
  async (projectId, { rejectWithValue }) => {
    try {
      await api.delete(`/projects/${projectId}`)
      return projectId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete project')
    }
  }
)

// Fix: updateApplicationStatus async thunk
export const updateApplicationStatus = createAsyncThunk(
  'projects/updateApplicationStatus',
  async ({ applicationId, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/applications/${applicationId}`, { status })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update application')
    }
  }
)

const projectsSlice = createSlice({
  name: 'projects',
  initialState: {
    projectsList: [],
    matchedProjects: [],
    myProjects: [],
    appliedProjects: [],
    status: 'idle',
    error: null
  },
  reducers: {
    clearProjectError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchProjects
      .addCase(fetchProjects.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.projectsList = action.payload
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      // fetchMatchedProjects
      .addCase(fetchMatchedProjects.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchMatchedProjects.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.matchedProjects = action.payload
      })
      .addCase(fetchMatchedProjects.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      // fetchMyProjects
      .addCase(fetchMyProjects.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchMyProjects.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.myProjects = action.payload
      })
      .addCase(fetchMyProjects.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      // fetchMyApplications
      .addCase(fetchMyApplications.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchMyApplications.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.appliedProjects = action.payload
      })
      .addCase(fetchMyApplications.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      // createProject
      .addCase(createProject.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.myProjects.unshift(action.payload)
      })
      .addCase(createProject.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      // applyToProject
      .addCase(applyToProject.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(applyToProject.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.appliedProjects.unshift(action.payload)
      })
      .addCase(applyToProject.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      // completeProject
      .addCase(completeProject.fulfilled, (state, action) => {
        const index = state.myProjects.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.myProjects[index] = action.payload;
        }
        const pIndex = state.projectsList.findIndex(p => p._id === action.payload._id);
        if (pIndex !== -1) {
          state.projectsList[pIndex] = action.payload;
        }
      })
      // removeProject (now calls API)
      .addCase(removeProject.fulfilled, (state, action) => {
        const targetId = String(action.payload)
        state.myProjects = state.myProjects.filter((project) => String(project.id ?? project._id) !== targetId)
        state.projectsList = state.projectsList.filter((project) => String(project.id ?? project._id) !== targetId)
      })
      // updateApplicationStatus
      .addCase(updateApplicationStatus.fulfilled, (state, action) => {
        // Update in myProjects applications list if present
        state.myProjects.forEach(project => {
          if (project.applications) {
            const appIndex = project.applications.findIndex(a => a._id === action.payload._id);
            if (appIndex !== -1) {
              project.applications[appIndex] = action.payload;
            }
          }
        });
      })
  }
})

export const { clearProjectError } = projectsSlice.actions
export default projectsSlice.reducer
