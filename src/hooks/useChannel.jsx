import { useState, useEffect } from 'react'
import useRequest from './useRequest.jsx'
import { getChannelMessages, createMessage } from '../services/channelService.js'

const useChannel = (channelId) => {
    const [messages, setMessages] = useState([])
    const [hasFetchedOnce, setHasFetchedOnce] = useState(false)
    
    const messagesRequest = useRequest()
    const sendMessageRequest = useRequest()

    useEffect(() => {
        if (!channelId) return

        const fetchMessages = async () => {
            try {
                await messagesRequest.sendRequest(() => getChannelMessages(channelId))
            } catch (err) {
                console.error("Error cargando mensajes", err)
            } finally {
                setHasFetchedOnce(true)
            }
        }

        fetchMessages()
    }, [channelId])

    useEffect(() => {
        if (messagesRequest.response?.ok) {
            setMessages(messagesRequest.response.data?.messages || [])
        }
    }, [messagesRequest.response])

    const sendMessage = async (content) => {
        try {
            await sendMessageRequest.sendRequest(() => createMessage(channelId, { content }))
            await messagesRequest.sendRequest(() => getChannelMessages(channelId))
        } catch (err) {
            console.error("Error enviando mensaje", err)
        }
    }

    return {
        messages,
        loading: messagesRequest.loading || sendMessageRequest.loading,
        sendMessage,
        hasFetchedOnce
    }
}

export default useChannel