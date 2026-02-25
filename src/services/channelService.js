import { ServerError } from "../utils/errorUtils"

const URL_API = import.meta.env.VITE_API_URL

export async function getWorkspaceChannels(workspace_id){
    const response_http = await fetch(
        URL_API + `/api/workspace/${workspace_id}/channels`,
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

export async function updateChannel(workspace_id, channel_id, channel_data){
    const response_http = await fetch(
        URL_API + `/api/workspace/${workspace_id}/channel/${channel_id}`,
        {
            method: 'PUT',
            headers: {
                'x-api-key': import.meta.env.VITE_API_KEY,
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
            },
            body: JSON.stringify(channel_data)
        }
    )
    const response = await response_http.json()
    if(!response.ok){
        throw new ServerError(response.message, response.status)
    }
    return response
}

export async function deleteChannel(workspace_id, channel_id) {
    const response_http = await fetch(
        URL_API + `/api/workspace/${workspace_id}/channels/${channel_id}`,
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

export async function createChannel(workspace_id, channel_data) {
    const response_http = await fetch(
        URL_API + `/api/workspace/${workspace_id}/channels`,
        {
            method: 'POST',
            headers: {
                'x-api-key': import.meta.env.VITE_API_KEY,
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
            },
            body: JSON.stringify(channel_data)
        }
    )
    const response = await response_http.json()
    if (!response.ok) {
        throw new ServerError(response.message, response.status)
    }
    return response
}

export async function getChannelMessages(workspace_id, channel_id) {
    console.log('🔍 getChannelMessages: Fetching messages for workspace:', workspace_id, 'channel:', channel_id)
    const response_http = await fetch(
        URL_API + `/api/workspace/${workspace_id}/channels/${channel_id}/messages`,
        {
            method: 'GET',
            headers: {
                'x-api-key': import.meta.env.VITE_API_KEY,
                'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
            },
        }
    )
    console.log('📡 getChannelMessages: HTTP status:', response_http.status)
    const response = await response_http.json()
    console.log('📦 getChannelMessages: Response:', response)
    if(!response.ok){
        console.error('❌ getChannelMessages: Error response:', response)
        throw new ServerError(response.message, response.status)
    }
    return response
}

export async function createMessage(workspace_id, channel_id, messageData) {
    console.log('📝 createMessage: Sending message to workspace:', workspace_id, 'channel:', channel_id, 'Data:', messageData)
    const response_http = await fetch(
        URL_API + `/api/workspace/${workspace_id}/channels/${channel_id}/messages`,
        {
            method: 'POST',
            headers: {
                'x-api-key': import.meta.env.VITE_API_KEY,
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
            },
            body: JSON.stringify(messageData)
        }
    )
    console.log('📡 createMessage: HTTP status:', response_http.status)
    const response = await response_http.json()
    console.log('📦 createMessage: Response:', response)
    if (!response.ok) {
        console.error('❌ createMessage: Error response:', response)
        throw new ServerError(response.message, response.status)
    }
    return response
}