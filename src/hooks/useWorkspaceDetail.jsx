import { useState, useEffect } from "react"
import { useParams } from "react-router"
import useRequest from './useRequest'
import { getWorkspaceDetail } from '../services/workspaceService'
import { getWorkspaceChannels, createChannel as createChannelService, updateChannel as updateChannelService, deleteChannel as deleteChannelService } from '../services/channelService'

const useWorkspaceDetail = () => {
    const { workspace_id } = useParams()
    const [workspace, setWorkspace] = useState(null)
    const [member, setMember] = useState(null)
    const [channels, setChannels] = useState([])
    
    const { loading, error, sendRequest } = useRequest()

    const fetchWorkspaceDetail = async () => {
        await sendRequest(async () => {
            const workspaceResponse = await getWorkspaceDetail(workspace_id)
            console.log('Workspace response:', workspaceResponse)
            setWorkspace(workspaceResponse.data)
            setMember(workspaceResponse.data.member)
            const channelsResponse = await getWorkspaceChannels(workspace_id)
            console.log('Channels response:', channelsResponse)
            
            setChannels(channelsResponse.data?.channels || channelsResponse.data || [])
        })
    }

    useEffect(() => {
        fetchWorkspaceDetail()
    }, [workspace_id])

    const createChannel = async (channelName) => {
        try {
            const response = await createChannelService(workspace_id, { name: channelName })
            
            // Add the new channel immediately to the list for instant feedback
            const newChannel = response.data?.channel_created || {
                _id: response.data?._id,
                name: channelName,
                id: response.data?._id,
                channel_id: response.data?._id
            }
            
            setChannels(prev => [...prev, newChannel])
            
            // Silently refresh just the channels list in the background
            try {
                const channelsResponse = await getWorkspaceChannels(workspace_id)
                setChannels(channelsResponse.data?.channels || channelsResponse.data || [])
            } catch (err) {
                console.error('Error refreshing channels:', err)
            }
        } catch (err) {
            console.error('Error creating channel:', err)
            throw err
        }
    }

    const updateChannel = async (channelId, channelName) => {
        try {
            const response = await updateChannelService(workspace_id, channelId, { name: channelName })
            
            // Update the channel in the local list
            setChannels(prev => 
                prev.map(ch => {
                    const chId = ch.id || ch._id || ch.channel_id
                    return chId === channelId 
                        ? { ...ch, name: channelName, title: channelName }
                        : ch
                })
            )
            
            return response
        } catch (err) {
            console.error('Error updating channel:', err)
            throw err
        }
    }

    const deleteChannel = async (channelId) => {
        try {
            const response = await deleteChannelService(workspace_id, channelId)
            
            // Remove the channel from the local list
            setChannels(prev => 
                prev.filter(ch => {
                    const chId = ch.id || ch._id || ch.channel_id
                    return chId !== channelId
                })
            )
            
            return response
        } catch (err) {
            console.error('Error deleting channel:', err)
            throw err
        }
    }

    return {
        workspace,
        workspaceId: workspace_id,
        member,
        channels,
        loading,
        error,
        fetchWorkspaceDetail,
        createChannel,
        updateChannel,
        deleteChannel
    }

}
export default useWorkspaceDetail
