import { useContext, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import useWorkspaceDetail from "../../hooks/useWorkspaceDetail.jsx"
import useChannel from "../../hooks/useChannel.jsx"
import { WorkspaceContext } from '../../context/WorkspaceContext.jsx'
import { deleteWorkspace, getWorkspaceMembers, inviteUser } from "../../services/workspaceService.js"
import './WorkspaceScreen.css'
const WorkspaceScreen = () => {
    const navigate = useNavigate()
    const { workspace_id } = useParams()
    const { workspace_list_loading } = useContext(WorkspaceContext)

    const {
        workspace = {},
        member,
        channels = [],
        loading: workspaceLoading,
        error: workspaceError,
        handleCreateChannel
    } = useWorkspaceDetail(workspace_id)

    const [selectedChannelId, setSelectedChannelId] = useState(null)
    const [newChannelName, setNewChannelName] = useState('')
    const [showMobileMenu, setShowMobileMenu] = useState(false)

    const [showInviteModal, setShowInviteModal] = useState(false)
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviteStatus, setInviteStatus] = useState(null)

    const [showMembersModal, setShowMembersModal] = useState(false)
    const [members, setMembers] = useState([])
    const [membersLoading, setMembersLoading] = useState(false)

    useEffect(() => {
        if(!selectedChannelId && channels.length > 0){
            setSelectedChannelId(channels[0].channel_id || channels[0].id)
        }
    },
    [channels, selectedChannelId]
)

const handleInvite = async (e) => {
    e.preventDefault()
    setInviteStatus(null)

    try{
        await inviteUser(workspace_id, inviteEmail)
        setInviteStatus({type: 'success', message: 'Invitacion enviada!'})
        setInviteEmail('')
        setTimeout(()=>{
            setShowInviteModal(false)
            setInviteStatus(null)
        },
        2000)
    }
    catch(error){
        setInviteStatus({type: 'error', message: error.message || 'Error al enviar invitación.' })
    }
}

const handleShowMembers = async () => {
    setShowMembersModal(true)
    setMembersLoading(true)
    try{
        const response = await getWorkspaceMembers(workspace_id)
        setMembers(response.data.members || [])
    }
    catch(error){
        console.error("Error al obtener miembros", error)
    }
    finally{
        setMembersLoading(false)
    }
}

const handleDeleteWorkspace = async () => {
    if(window.confirm('¿Estás seguro de que quieres eliminar este workspace? Esta acción no se puede deshacer.')){
        try{
            await deleteWorkspace(workspace_id)
            navigate('/home')
        }
        catch(error){
            alert('Error al eliminar workspace: ' + (error.message || 'Error desconocido.'))
        }
    }
}

const handleCreateNewChannel = async () => {
    if(newChannelName.trim()){
        try{
            await handleCreateChannel({ name: newChannelName.trim() })
            setNewChannelName('')
        }
        catch(error){
            alert('Error al crear canal: ' + error.message)
        }
    }
}

if(workspaceLoading || workspace_list_loading){
    return(
        <div className="workspace-container">
            <div className="workspace-loading">
                <span>Cargando workspace...</span>
            </div>
        </div>
    )
}

if(workspaceError){
    return (
        <div className="workspace-container">
            <div className="workspace-error">
            <span>Error al cargar workspace: {workspaceError.message}</span>
            </div>
        </div>
    )
}

if(!workspace){
    return (
        <div className="workspace-container">
            <div className="workspace-error">
                <span>Workspace no encontrado</span>
            </div>
        </div>
    )
}

const ChannelChat = ({ channelId, channel }) => {
    const { messages, loading, sendMessage, hasFetchedOnce } = useChannel(channelId)
    const [newMessage, setNewMessage] = useState('')

    const handleSend = (e) => {
        e.preventDefault()
        if (newMessage.trim()) {
            sendMessage(newMessage)
            setNewMessage('')
        }
    }

    return (
        <div className="channel-chat">
            <div className="channel-header"># {channel ? channel.name : 'canal'}</div>
            <div className="messages-list">
                {messages.map(msg => {
                    const authorName = msg.member?.user?.name || msg.author_name || 'Usuario'
                    const initial = authorName.charAt(0).toUpperCase()
                    const time = new Date(msg.created_at || msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    return (
                        <div key={msg.message_id || msg.id} className="message-item">
                            <div className="message-avatar">{initial}</div>
                            <div className="message-body">
                                <div className="message-header">
                                    <span className="message-author">{authorName}</span>
                                    <span className="message-time">{time}</span>
                                </div>
                                <div className="message-content">{msg.content || msg.mensaje}</div>
                            </div>
                        </div>
                    )
                })}
                {messages.length === 0 && hasFetchedOnce && !loading && (
                    <div className="no-messages">No hay mensajes aun. ¡Di hola!</div>
                )}
            </div>

            <div className="input-area-container">
                <form className="message-input" onSubmit={handleSend}>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={`Escribe un mensaje en #${channel ? channel.name : 'canal'}`}
                    />
                    <button type="submit" className="send-btn">Enviar</button>
                </form>
            </div>
        </div>
    )
}

const selectedChannel = channels.find(c => (c.channel_id || c.id) === selectedChannelId)

return (
        <div className="workspace-container">
            <div className="mobile-header">
                <button className="mobile-menu-toggle" onClick={() => setShowMobileMenu(true)}>☰</button>
                <div className="mobile-title">{workspace.name}</div>
            </div>

            <div className={`workspace-sidebar ${showMobileMenu ? 'show' : ''}`}>
                <div className="sidebar-top">
                    <div className="sidebar-controls">
                        <button className="back-button" onClick={() => navigate('/home')}>← Volver</button>
                        <button className="mobile-close" onClick={() => setShowMobileMenu(false)}>×</button>
                    </div>

                    <div className="sidebar-identity">
                        <div className="workspace-avatar">{workspace?.name?.charAt(0).toUpperCase() || 'W'}</div>
                        <h2 className="workspace-name">{workspace?.name || 'Workspace'}</h2>
                    </div>

                    <div className="header-actions">
                        <button className="btn-outline" onClick={() => setShowInviteModal(true)}>+ Invitar</button>
                        <button className="btn-solid" onClick={handleShowMembers}>Miembros</button>
                    </div>
                </div>

                <div className="channels-list">
                    <h3 className="channels-title">Canales</h3>
                    <ul className="channels-ul">
                        {channels.map(channel => (
                            <li
                                key={channel.channel_id || channel.id}
                                onClick={() => {
                                    setSelectedChannelId(channel.channel_id || channel.id)
                                    setShowMobileMenu(false)
                                }}
                                className={selectedChannelId === (channel.channel_id || channel.id) ? 'channel-item active' : 'channel-item'}
                            >
                                # {channel.name}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="create-channel">
                    <input
                        className="create-channel-input"
                        type="text"
                        placeholder="Crear canal"
                        value={newChannelName}
                        onChange={(e) => setNewChannelName(e.target.value)}
                        onKeyPress={(e) => { if (e.key === 'Enter') handleCreateNewChannel() }}
                    />
                    <button className="create-channel-btn" onClick={handleCreateNewChannel}>+</button>
                </div>
            </div>

            <div className="workspace-main">
                {selectedChannel ? (
                    <ChannelChat channelId={selectedChannelId} channel={selectedChannel} />
                ) : (
                    <div className="no-channel-selected">Selecciona un canal para comenzar a chatear</div>
                )}
            </div>

            {showInviteModal && (
                <div className="modal-overlay" role="dialog" aria-modal="true">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Invitar a {workspace.name}</h3>
                            <button className="modal-close" onClick={() => setShowInviteModal(false)}>×</button>
                        </div>
                        <form className="modal-body" onSubmit={handleInvite}>
                            <label className="modal-label">Email</label>
                            <input className="modal-input" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required />
                            {inviteStatus && <div className={`invite-status ${inviteStatus.type}`}>{inviteStatus.message}</div>}
                            <div className="modal-actions">
                                <button type="button" className="btn-outline" onClick={() => setShowInviteModal(false)}>Cancelar</button>
                                <button type="submit" className="btn-primary">Enviar invitación</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showMembersModal && (
                <div className="modal-overlay" role="dialog" aria-modal="true">
                    <div className="modal-content modal-large">
                        <div className="modal-header">
                            <h3>Miembros de {workspace.name}</h3>
                            <button className="modal-close" onClick={() => setShowMembersModal(false)}>×</button>
                        </div>

                        <div className="modal-body members-body">
                            {membersLoading ? (
                                <div className="members-loading">Cargando miembros...</div>
                            ) : (
                                <ul className="members-list">
                                    {members.map(m => (
                                        <li key={m.member_id || m.id} className="member-item">
                                            <div className="member-avatar">{(m.user?.name || m.name || 'U').charAt(0).toUpperCase()}</div>
                                            <div className="member-info">
                                                <div className="member-name">{m.user?.name || m.name || 'Unknown'}</div>
                                                <div className="member-meta">{m.user?.email || m.email} • {m.role}</div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {member && (member.role === 'owner' || member.role === 'Owner') && (
                            <div className="modal-footer">
                                <button className="btn-danger" onClick={handleDeleteWorkspace}>Eliminar Workspace</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default WorkspaceScreen