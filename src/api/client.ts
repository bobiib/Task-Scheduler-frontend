const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

interface ApiErrorResponse {
    error?: {
        code?: string
        message?: string
        details?: string[]
    }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${BASE_URL}${endpoint}`
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    }

    const response = await fetch(url, { ...options, headers })

    if (!response.ok) {
        let errorMessage = `HTTP Error ${response.status}`
        try {
            const errorJson: ApiErrorResponse = await response.json()
            if (errorJson.error?.message) {
                errorMessage = errorJson.error.message
                if (errorJson.error.details?.length) {
                    errorMessage += `: ${errorJson.error.details.join(', ')}`
                }
            }
        } catch {
        }
        throw new Error(errorMessage)
    }

    if (response.status === 204) {
        return {} as T
    }

    const json = await response.json()
    return json.data !== undefined ? json.data : json
}

export const apiClient = {
    get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
    post: <T>(endpoint: string, body: unknown) => request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    patch: <T>(endpoint: string, body: unknown) => request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' })
}
