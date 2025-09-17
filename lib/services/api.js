const API_ROOT = process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "") + "/api"
  : "/api";

const handleResponse = async (res) => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP error! status: ${res.status}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

const request = async (endpoint, options = {}) => {
  const opts = {
    headers: { "Content-Type": "application/json" },
    ...options,
  };
  const res = await fetch(`${API_ROOT}${endpoint}`, opts);
  return handleResponse(res);
};

export const notesAPI = {
  getAllNotes: async (view = "", search = "", type = "") => {
    const params = new URLSearchParams();
    if (view) params.append("view", view);
    if (search) params.append("search", search);
    if (type) params.append("type", type);

    const endpoint = `/notes${params.toString() ? `?${params}` : ""}`;
    const result = await request(endpoint);
    return result.data;
  },

  getAllNotesIncludingDeleted: async () => {
    const result = await request("/notes?view=all");
    return result.data;
  },

  fetchNoteById: async (id) => {
    const result = await request(`/notes/${id}`);
    return result.data;
  },

  createNote: async (note) => {
    const result = await request("/notes", {
      method: "POST",
      body: JSON.stringify(note),
    });
    return result.data;
  },

  updateNote: async (id, updates) => {
    const result = await request(`/notes/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    return result.data;
  },

  deleteNote: async (id) => {
    const result = await request(`/notes/${id}`, {
      method: "DELETE",
    });
    return result.data;
  },

  restoreNote: async (id) => {
    const result = await request(`/notes/${id}/restore`, {
      method: "PUT",
    });
    return result.data;
  },

  togglePin: async (id) => {
    const result = await request(`/notes/${id}/pin`, {
      method: "PUT",
    });
    return result.data;
  },

  permanentDelete: async (id) => {
    const result = await request(`/notes/${id}/permanent`, {
      method: "DELETE",
    });
    return result.data;
  },
};

export const fetchNotes = (view = "", search = "", type = "") =>
  notesAPI.getAllNotes(view, search, type);
export const fetchNoteById = (id) => notesAPI.fetchNoteById(id);
export const createNote = (note) => notesAPI.createNote(note);
export const updateNote = (id, updates) => notesAPI.updateNote(id, updates);
export const deleteNote = (id) => notesAPI.deleteNote(id);
export const permanentDelete = (id) => notesAPI.permanentDelete(id);
export const restoreNote = (id) => notesAPI.restoreNote(id);
export const togglePin = (id) => notesAPI.togglePin(id);

export const checkBackendHealth = async () => {
  try {
    const healthUrl = API_ROOT.replace(/\/api$/, "") + "/api/health";
    const res = await fetch(healthUrl);
    return res.ok;
  } catch (e) {
    return false;
  }
};
