const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Network error" }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

const apiCall = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });
  return handleResponse(response);
};

export const notesAPI = {
  getAllNotes: async (view = "", search = "") => {
    const params = new URLSearchParams();
    if (view) params.append("view", view);
    if (search) params.append("search", search);

    const endpoint = `/notes${params.toString() ? `?${params}` : ""}`;
    const result = await apiCall(endpoint);
    return result.data;
  },

  getAllNotesIncludingDeleted: async () => {
    const result = await apiCall("/notes?includeAll=true");
    return result.data;
  },

  createNote: async (noteData = {}) => {
    const result = await apiCall("/notes", {
      method: "POST",
      body: JSON.stringify({
        title: "New Note",
        content: "",
        isPinned: false,
        ...noteData,
      }),
    });
    return result.data;
  },

  updateNote: async (id, updates) => {
    const result = await apiCall(`/notes/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    return result.data;
  },

  togglePin: async (id) => {
    const result = await apiCall(`/notes/${id}/pin`, { method: "PUT" });
    return result.data;
  },

  deleteNote: async (id) => {
    const result = await apiCall(`/notes/${id}`, { method: "DELETE" });
    return result.data;
  },

  restoreNote: async (id) => {
    const result = await apiCall(`/notes/${id}/restore`, { method: "PUT" });
    return result.data;
  },

  permanentDelete: async (id) => {
    const result = await apiCall(`/notes/${id}/permanent`, {
      method: "DELETE",
    });
    return result.data;
  },
};

export const checkBackendHealth = async () => {
  try {
    const healthUrl = API_BASE_URL.replace("/api", "") + "/api/health";
    const response = await fetch(healthUrl);
    return response.ok;
  } catch {
    return false;
  }
};
