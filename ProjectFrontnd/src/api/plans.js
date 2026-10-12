const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function generatePlans(params) {
  const response = await fetch(`${API_BASE}/plans/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Network error" }));
    throw new Error(error.detail || "Failed to generate floor plan layout");
  }
  return response.json();
}

export async function refinePlan({ currentPlan, userMessage, chatHistory }) {
  const response = await fetch(`${API_BASE}/plans/refine`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      currentPlan,
      userMessage,
      chatHistory,
    }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Network error" }));
    throw new Error(error.detail || "Failed to refine floor plan");
  }
  return response.json();
}

export async function savePlan(planData) {
  const response = await fetch(`${API_BASE}/plans/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(planData),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Network error" }));
    throw new Error(error.detail || "Failed to save plan");
  }
  return response.json();
}

export async function loadPlan(id) {
  const response = await fetch(`${API_BASE}/plans/${id}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Network error" }));
    throw new Error(error.detail || "Failed to load plan");
  }
  return response.json();
}

export async function listPlans(sessionId) {
  const response = await fetch(`${API_BASE}/plans/?session=${sessionId}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Network error" }));
    throw new Error(error.detail || "Failed to list plans");
  }
  return response.json();
}

export async function loadPublicPlan(id) {
  const response = await fetch(`${API_BASE}/plans/${id}/public`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Network error" }));
    throw new Error(error.detail || "Failed to load public plan");
  }
  return response.json();
}

export async function deletePlan(id) {
  const response = await fetch(`${API_BASE}/plans/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Network error" }));
    throw new Error(error.detail || "Failed to delete plan");
  }
  return response.json();
}
