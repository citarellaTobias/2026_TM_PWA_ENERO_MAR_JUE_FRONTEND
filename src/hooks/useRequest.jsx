import { useState, useEffect, useContext } from 'react'
import { getChannelMessages, createMessage } from '../services/channelService.js'
import { AuthContext } from '../context/AuthContext.jsx'

const useChannel = (workspaceId, channelId) => {
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(false)
    const [hasFetchedOnce, setHasFetchedOnce] = useState(false)
    const { session } = useContext(AuthContext)
    const [pendingMessageIds, setPendingMessageIds] = useState(new Set())

    const fetchMessages = async () => {
        if (!channelId || !workspaceId) return
        setLoading(true)
        try {
            const response = await getChannelMessages(workspaceId, channelId)
            if (response?.ok) {
                setMessages(response.data?.messages || [])
            }
        } catch (err) {
            console.error("Error cargando mensajes", err)
        } finally {
            setLoading(false)
            setHasFetchedOnce(true)
        }
    }

    useEffect(() => {
        if (!channelId || !workspaceId) return
        fetchMessages()
    }, [channelId, workspaceId])

    const sendMessage = async (content) => {
        const tempId = `temp_${Date.now()}`
        const tempMessage = {
            _id: tempId,
            content,
            created_at: new Date().toISOString(),
            fk_workspace_member_id: {
                fk_id_user: { username: session?.username || 'User' }
            },
            isPending: true
        }
        setMessages(prev => [...prev, tempMessage])
        setPendingMessageIds(prev => new Set([...prev, tempId]))

        try {
            await createMessage(workspaceId, channelId, { content })
            await fetchMessages()
        } catch (err) {
            console.error("Error enviando mensaje", err)
            setMessages(prev => prev.filter(msg => msg._id !== tempId))
        } finally {
            setPendingMessageIds(prev => {
                const updated = new Set(prev)
                updated.delete(tempId)
                return updated
            })
        }
    }

    return { messages, loading, sendMessage, hasFetchedOnce, pendingMessageIds }
}

export default useChannel
