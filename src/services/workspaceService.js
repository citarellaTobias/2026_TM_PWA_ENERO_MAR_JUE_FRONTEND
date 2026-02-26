import { ServerError } from "../utils/errorUtils.js"

const URL_API = import.meta.env.VITE_API_URL
export async function getWorkspaceList() {
    const response_http = await fetch(
        URL_API + '/api/workspace',
        {
            method: 'GET',
            headers: {
                'x-api-key': import.meta.env.VITE_API_KEY,
                'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
            },
        }
    )
    const response = await response_http.json()
    if (!response.ok) {
        throw new ServerError(response.message, response.status)
    }
    return response
}

export async function createWorkspace(workspace_data) {
    const response_http = await fetch(
        URL_API + '/api/workspace',
        {
            method: 'POST',
            headers: {
                'x-api-key': import.meta.env.VITE_API_KEY,
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
            },
            body: JSON.stringify(workspace_data)
        }
    )
    const response = await response_http.json()
    if (!response.ok) {
        throw new ServerError(response.message, response.status)
    }
    return response
}

export async function getWorkspaceDetail(workspace_id){
    const response_http = await fetch(
        URL_API + `/api/workspace/${workspace_id}`,
        {
            method: 'GET',
            headers: {
                'x-api-key': import.meta.env.VITE_API_KEY,
                'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
            },
        }
    )
    const response = await response_http.json()
    if(!response.ok){
        throw new ServerError(response.message, response.status)
    }
    return response
}

export async function getWorkspaceMembers(workspace_id){
    const response_http = await fetch(
        URL_API + `/api/workspace/${workspace_id}/members`,
        {
            method: 'GET',
            headers: {
                'x-api-key': import.meta.env.VITE_API_KEY,
                'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
            },
        }
    )
    const response = await response_http.json()
    if(!response.ok){
        throw new ServerError(response.message, response.status)
    }
    return response
}

export async function inviteUser(workspace_id, email, role = 'Member') {
    const response_http = await fetch(
        URL_API + `/api/workspace/${workspace_id}/members`,
        {
            method: 'POST',
            headers: {
                'x-api-key': import.meta.env.VITE_API_KEY,
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
            },
            body: JSON.stringify({ email, role })
        }
    )
    const response = await response_http.json()
    if (!response.ok) {
        throw new ServerError(response.message, response.status)
    }
    return response
}

export async function deleteWorkspace(workspace_id) {
    const response_http = await fetch(
        URL_API + `/api/workspace/${workspace_id}`,
        {
            method: 'DELETE',
            headers: {
                'x-api-key': import.meta.env.VITE_API_KEY,
                'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
            },
        }
    )
    const response = await response_http.json()
    if (!response.ok) {
        throw new ServerError(response.message, response.status)
    }
    return response
}

export async function updateMemberRole(workspace_id, member_id, role) {
    const response_http = await fetch(
        URL_API + `/api/workspace/${workspace_id}/members/${member_id}/role`,
        {
            method: 'PUT',
            headers: {
                'x-api-key': import.meta.env.VITE_API_KEY,
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
            },
            body: JSON.stringify({ role })
        }
    )
    const response = await response_http.json()
    if (!response.ok) {
        throw new ServerError(response.message, response.status)
    }
    return response
}

export async function deleteMember(workspace_id, member_id) {
    const response_http = await fetch(
        URL_API + `/api/workspace/${workspace_id}/members/${member_id}`,
        {
            method: 'DELETE',
            headers: {
                'x-api-key': import.meta.env.VITE_API_KEY,
                'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
            },
        }
    )
    const response = await response_http.json()
    if (!response.ok) {
        throw new ServerError(response.message, response.status)
    }
    return response
}