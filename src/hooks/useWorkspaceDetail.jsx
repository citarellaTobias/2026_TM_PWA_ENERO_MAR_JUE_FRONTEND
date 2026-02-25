import { useState, useEffect } from "react"
import { useParams } from "react-router"
import useRequest from './useRequest'
import { getWorkspaceDetail } from '../services/workspaceService'
import { getWorkspaceChannels, createChannel as createChannelService } from '../services/channelService'

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
        await sendRequest(async () => {
            await createChannelService(workspace_id, { name: channelName })
            await fetchWorkspaceDetail() 
        })
    }

    return {
        workspace,
        workspaceId: workspace_id,
        member,
        channels,
        loading,
        error,
        fetchWorkspaceDetail,
        createChannel
    }

}
export default useWorkspaceDetail
