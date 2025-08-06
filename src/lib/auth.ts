export type User = {
  token: string
  username: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

export async function registerUser(username: string, email: string, password: string): Promise<void> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  })

  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.detail || errorData.message || 'Gagal mendaftar')
  }
}

export async function loginUser(email: string, password: string): Promise<string> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || error.message || 'Gagal login')
  }

  const data = await response.json()
  localStorage.setItem('token', data.access_token)
  return data.access_token
}

export async function getSession(): Promise<User | null> {
  const token = localStorage.getItem('token')
  if (!token) return null

  const response = await fetch(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) return null

  const data = await response.json()
  return { token, username: data.username }
}

export async function logoutUser(): Promise<void> {
  localStorage.removeItem('token')
}



export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};
