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
        if (!channelId || !workspaceId) return

        const fetchMessages = async () => {
            setMessages([])
            setHasFetchedOnce(false)
            try {
                await messagesRequest.sendRequest(() => getChannelMessages(workspaceId, channelId))
            } catch (err) {
                console.error(err)
            } finally {
                setHasFetchedOnce(true)
            }
        }

        fetchMessages()
    }, [channelId, workspaceId])

    useEffect(() => {
        if (messagesRequest.response?.ok) {
            const newMessages = messagesRequest.response.data?.messages || []
            setMessages(newMessages)
        }
    }, [messagesRequest.response])

    const sendMessage = async (content) => {
        if (!content.trim()) return

        const tempMessageId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        const newMessage = {
            _id: tempMessageId,
            message: content,
            content: content,
            created_at: new Date().toISOString(),
            fk_id_workspace_member: {
                fk_id_user: {
                    username: session?.username || 'User'
                }
            },
            fk_workspace_member_id: {
                fk_id_user: {
                    username: session?.username || 'User'
                }
            },
            isPending: true
        }

        setMessages(prev => [...prev, newMessage])
        setPendingMessageIds(prev => new Set([...prev, tempMessageId]))
        
        try {
            await sendMessageRequest.sendRequest(() => createMessage(workspaceId, channelId, { 
                message: content,
                content: content 
            }))
            
            if (sendMessageRequest.error) throw new Error()
            
            await messagesRequest.sendRequest(() => getChannelMessages(workspaceId, channelId))
            
        } catch (err) {
            setMessages(prev => prev.filter(msg => msg._id !== tempMessageId))
        } finally {
            setPendingMessageIds(prev => {
                const updated = new Set(prev)
                updated.delete(tempMessageId)
                return updated
            })
        }
    }

    return {
        messages,
        loading: messagesRequest.loading,
        isSending: sendMessageRequest.loading,
        sendMessage,
        hasFetchedOnce,
        pendingMessageIds
    }
}

export default useChannel




