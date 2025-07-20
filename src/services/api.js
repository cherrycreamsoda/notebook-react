// API Service - This handles all communication with your backend
// Fixed to work properly in the browser

// Use the environment variable or fallback to localhost
const API_BASE_URL =
  typeof process !== "undefined" && process.env && process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL
    : "http://localhost:5000/api"

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Network error" }))
    throw new Error(error.error || `HTTP error! status: ${response.status}`)
  }
  return response.json()
}

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    })
    return await handleResponse(response)
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error)
    throw error
  }
}

// API functions that match your backend endpoints
export const notesAPI = {
  // Get all notes with optional filtering
  getAllNotes: async (view = "", search = "") => {
    const params = new URLSearchParams()
    if (view) params.append("view", view)
    if (search) params.append("search", search)

    const queryString = params.toString()
    const endpoint = `/notes${queryString ? `?${queryString}` : ""}`

    const result = await apiCall(endpoint)
    return result.data // Return just the notes array
  },

  // Get ALL notes including deleted ones (for counting)
  getAllNotesIncludingDeleted: async () => {
    const result = await apiCall("/notes?includeAll=true")
    return result.data
  },

  // Create a new note
  createNote: async (noteData = {}) => {
    const result = await apiCall("/notes", {
      method: "POST",
      body: JSON.stringify({
        title: "New Note",
        content: "",
        isPinned: false,
        ...noteData,
      }),
    })
    return result.data
  },

  // Update a note
  updateNote: async (id, updates) => {
    const result = await apiCall(`/notes/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    })
    return result.data
  },

  // Toggle pin status
  togglePin: async (id) => {
    const result = await apiCall(`/notes/${id}/pin`, {
      method: "PUT",
    })
    return result.data
  },

  // Soft delete a note (move to trash)
  deleteNote: async (id) => {
    const result = await apiCall(`/notes/${id}`, {
      method: "DELETE",
    })
    return result.data
  },

  // Restore a deleted note
  restoreNote: async (id) => {
    const result = await apiCall(`/notes/${id}/restore`, {
      method: "PUT",
    })
    return result.data
  },

  // Permanently delete a note
  permanentDelete: async (id) => {
    const result = await apiCall(`/notes/${id}/permanent`, {
      method: "DELETE",
    })
    return result.data
  },
}

// Export a function to check if the backend is running
export const checkBackendHealth = async () => {
  try {
    const healthUrl = API_BASE_URL.replace("/api", "") + "/api/health"
    const response = await fetch(healthUrl)
    return response.ok
  } catch (error) {
    return false
  }
}
