import { useState, useEffect, useContext, useRef } from 'react'
import useRequest from './useRequest.jsx'
import { getChannelMessages, createMessage, deleteMessage as deleteMessageService } from '../services/channelService.js'
import { AuthContext } from '../context/AuthContext.jsx'

const useChannel = (workspaceId, channelId) => {
    const [messages, setMessages] = useState([])
    const [hasFetchedOnce, setHasFetchedOnce] = useState(false)
    const { session } = useContext(AuthContext)
    const lastMessageIdRef = useRef(null)
    const isUserAtBottomRef = useRef(true)
    
    const messagesRequest = useRequest()
    const sendMessageRequest = useRequest()
    const [pendingMessageIds, setPendingMessageIds] = useState(new Set())

    // Fetch messages on mount and when channel changes
    useEffect(() => {
        if (!channelId || !workspaceId) return

        const fetchMessages = async () => {
            setMessages([])
            setHasFetchedOnce(false)
            lastMessageIdRef.current = null
            try {
                await messagesRequest.sendRequest(() => getChannelMessages(workspaceId, channelId))
            } catch (err) {
                console.error(err)
            } finally {
                setHasFetchedOnce(true)
            }
        }

        fetchMessages()
        
        // Set up polling - fetch messages every 5 seconds (increased from 2s for efficiency)
        const pollInterval = setInterval(() => {
            messagesRequest.sendRequest(() => getChannelMessages(workspaceId, channelId))
                .catch(err => console.error('Error polling messages:', err))
        }, 5000)

        // Cleanup interval on unmount or when channel changes
        return () => {
            clearInterval(pollInterval)
        }
    }, [channelId, workspaceId])

    // Detect if user is at bottom of chat
    useEffect(() => {
        const handleScroll = (e) => {
            const element = e.target
            const isAtBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 50
            isUserAtBottomRef.current = isAtBottom
        }

        const chatElement = document.querySelector('.ws-messages')
        if (chatElement) {
            chatElement.addEventListener('scroll', handleScroll)
            return () => chatElement.removeEventListener('scroll', handleScroll)
        }
    }, [])

    useEffect(() => {
        if (messagesRequest.response?.ok) {
            const newMessages = messagesRequest.response.data?.messages || []
            
            setMessages(prev => {
                // Remove temporary messages and merge with server messages
                const nonTempMessages = prev.filter(m => !m._id?.startsWith('temp_'))
                const existingIds = new Set(nonTempMessages.map(m => m._id))
                const messagesToAdd = newMessages.filter(m => !existingIds.has(m._id))
                
                if (messagesToAdd.length > 0) {
                    return [...nonTempMessages, ...messagesToAdd]
                }
                
                return nonTempMessages.length > 0 ? nonTempMessages : newMessages
            })
            
            // Update last message ID
            if (newMessages.length > 0) {
                lastMessageIdRef.current = newMessages[newMessages.length - 1]._id
            }
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

    const deleteMessage = async (messageId) => {
        try {
            // Mark as deleted locally first for instant feedback
            setMessages(prev => 
                prev.map(msg => 
                    msg._id === messageId 
                        ? { ...msg, isDeleted: true, message: 'Mensaje borrado', content: 'Mensaje borrado' }
                        : msg
                )
            )
            
            // Delete from server
            await deleteMessageService(workspaceId, channelId, messageId)
        } catch (err) {
            console.error('Error deleting message:', err)
            // Revert if error
            setMessages(prev => prev.map(msg => 
                msg._id === messageId 
                    ? { ...msg, isDeleted: false }
                    : msg
            ))
            throw err
        }
    }

    return {
        messages,
        loading: messagesRequest.loading,
        isSending: sendMessageRequest.loading,
        sendMessage,
        deleteMessage,
        hasFetchedOnce,
        pendingMessageIds,
        isUserAtBottom: isUserAtBottomRef
    }
}

export default useChannel




