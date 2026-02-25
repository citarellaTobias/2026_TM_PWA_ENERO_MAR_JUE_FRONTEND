import { useState, useEffect, useContext } from 'react'
import useRequest from './useRequest.jsx'
import { getChannelMessages, createMessage } from '../services/channelService.js'
import { AuthContext } from '../context/AuthContext.jsx'

const useChannel = (workspaceId, channelId) => {
    const [messages, setMessages] = useState([])
    const [hasFetchedOnce, setHasFetchedOnce] = useState(false)
    const { session } = useContext(AuthContext)
    
    const messagesRequest = useRequest()
    const sendMessageRequest = useRequest()
    const [pendingMessageIds, setPendingMessageIds] = useState(new Set())

    useEffect(() => {
        if (!channelId || !workspaceId) {
            console.log('❌ useChannel: Missing workspaceId or channelId', { workspaceId, channelId })
            return
        }

        console.log('🔄 useChannel: Fetching messages for workspace:', workspaceId, 'channel:', channelId)

        const fetchMessages = async () => {
            try {
                // 👇 AQUÍ SE PASA EL workspaceId
                await messagesRequest.sendRequest(() => getChannelMessages(workspaceId, channelId))
            } catch (err) {
                console.error("❌ Error cargando mensajes", err)
            } finally {
                setHasFetchedOnce(true)
            }
        }

        fetchMessages()
    }, [channelId, workspaceId])

    useEffect(() => {
        if (messagesRequest.response?.ok) {
            console.log('✅ Messages response received:', messagesRequest.response)
            console.log('📝 Messages data:', messagesRequest.response.data)
            const newMessages = messagesRequest.response.data?.messages || []
            console.log(`📨 Setting ${newMessages.length} messages`)
            setMessages(newMessages)
        } else if (messagesRequest.response) {
            console.log('❌ Messages response not ok:', messagesRequest.response)
        }
    }, [messagesRequest.response])

    const sendMessage = async (content) => {
        console.log('📤 Sending message:', content, 'to workspace:', workspaceId, 'channel:', channelId)
        const tempMessageId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        console.log('🆔 Generated temp ID:', tempMessageId)
        
        try {
            const newMessage = {
                _id: tempMessageId,
                content: content,
                created_at: new Date().toISOString(),
                fk_workspace_member_id: {
                    fk_id_user: {
                        username: session?.username || 'User'
                    }
                },
                isPending: true
            }
            console.log('➕ Adding temp message to state:', newMessage)
            setMessages(prev => [...prev, newMessage])
            setPendingMessageIds(prev => new Set([...prev, tempMessageId]))
            
            console.log('🌐 Sending to server...')
            // 👇 AQUÍ SE PASA EL workspaceId
            await sendMessageRequest.sendRequest(() => createMessage(workspaceId, channelId, { content }))
            console.log('✅ sendMessageRequest.response:', sendMessageRequest.response)
            console.log('❌ sendMessageRequest.error:', sendMessageRequest.error)
            
            if (sendMessageRequest.error || !sendMessageRequest.response?.ok) {
                const errorMsg = sendMessageRequest.error?.message || sendMessageRequest.response?.message || 'Error desconocido'
                console.error('❌ Failed to send message:', errorMsg)
                throw new Error(errorMsg)
            }
            
            console.log('✅ Message saved to database, refreshing...')
            
            console.log('🔄 Refreshing messages from server...')
            // 👇 AQUÍ SE PASA EL workspaceId
            await messagesRequest.sendRequest(() => getChannelMessages(workspaceId, channelId))
            console.log('🔄 messagesRequest.response:', messagesRequest.response)
            console.log('🔄 messagesRequest.error:', messagesRequest.error)
            
            setPendingMessageIds(prev => {
                const updated = new Set(prev)
                updated.delete(tempMessageId)
                return updated
            })
            console.log('✅ Message sent successfully')
        } catch (err) {
            console.error("❌ Error enviando mensaje", err)
            console.error("❌ Error details:", err.message, err.status)
            setMessages(prev => prev.filter(msg => msg._id !== tempMessageId))
            setPendingMessageIds(prev => {
                const updated = new Set(prev)
                updated.delete(tempMessageId)
                return updated
            })
        }
    }

    return {
        messages,
        loading: messagesRequest.loading || sendMessageRequest.loading,
        sendMessage,
        hasFetchedOnce,
        pendingMessageIds
    }
}

export default useChannel