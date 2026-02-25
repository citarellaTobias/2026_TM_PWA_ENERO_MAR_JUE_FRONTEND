import React, { useState, useEffect, useContext } from 'react'
import { Link, useNavigate } from 'react-router'
import useWorkspaceDetail from '../../hooks/useWorkspaceDetail'
import useChannel from '../../hooks/useChannel'
import { inviteUser, getWorkspaceMembers, deleteWorkspace } from '../../services/workspaceService'
import { WorkspaceContext } from '../../context/WorkspaceContext'
import './WorkspaceScreen.css'

const WorkspaceScreen = () => {
    const navigate = useNavigate()
    const { refreshWorkspaces } = useContext(WorkspaceContext)
    const {
        workspace,
        member,
        channels,
        loading: workspaceLoading,
        error: workspaceError,
        createChannel
    } = useWorkspaceDetail()

    const [selectedChannelId, setSelectedChannelId] = useState(null)
    const [newChannelName, setNewChannelName] = useState('')

    const [showInviteModal, setShowInviteModal] = useState(false)
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviteStatus, setInviteStatus] = useState(null)

    const [showMembersModal, setShowMembersModal] = useState(false)
    const [members, setMembers] = useState([])
    const [membersLoading, setMembersLoading] = useState(false)

    const [showMobileMenu, setShowMobileMenu] = useState(false)

    const handleInvite = async (e) => {
        e.preventDefault()
        setInviteStatus(null)
        try {
            await inviteUser(workspace._id || workspace.workspace_id, inviteEmail)
            setInviteStatus({ type: 'success', message: 'Invitación enviada!' })
            setInviteEmail('')
            setTimeout(() => {
                setShowInviteModal(false)
                setInviteStatus(null)
            }, 2000)
        } catch (err) {
            setInviteStatus({ type: 'error', message: err.message || 'Error al enviar invitación.' })
        }
    }

    const handleShowMembers = async () => {
        setShowMembersModal(true)
        setMembersLoading(true)
        try {
            const response = await getWorkspaceMembers(workspace._id || workspace.workspace_id)
            setMembers(response.data?.members || response.data || [])
        } catch (err) {
            console.error("Error al obtener miembros", err)
        } finally {
            setMembersLoading(false)
        }
    }

    const handleDeleteWorkspace = async () => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este workspace? Esta acción no se puede deshacer.')) {
            try {
                await deleteWorkspace(workspace._id || workspace.workspace_id)
                refreshWorkspaces()
                navigate('/home')
            } catch (err) {
                alert('Error al eliminar workspace: ' + (err.message || 'Error desconocido'))
            }
        }
    }

    useEffect(() => {
        if (!selectedChannelId && channels && channels.length > 0) {
            const first = channels[0]
            const id = first.id || first._id || first.channel_id || first.workspace_channel_id
            setSelectedChannelId(id)
        }
    }, [channels, selectedChannelId])

    if (workspaceLoading) return <span>Cargando workspace...</span>
    if (workspaceError) return <span>Error al cargar workspace: {workspaceError.message}</span>
    if (!workspace) return <span>Workspace no encontrado</span>

    return (
        <div className="workspace-container">
            <div className="mobile-header">
                <button className="mobile-menu-toggle" onClick={() => setShowMobileMenu(true)}>☰</button>
                <div>{workspace.title || workspace.workspace_title || workspace.name}</div>
            </div>

            <div className={`workspace-sidebar ${showMobileMenu ? 'show' : ''}`}>
                <div className="workspace-header">
                    <div>
                        <Link to="/home" className="back-button">← Volver al Home</Link>
                        <button className="mobile-menu-toggle" onClick={() => setShowMobileMenu(false)}>×</button>
                    </div>
                    <div>
                        {workspace.image ? (
                            <img src={workspace.image} alt={workspace.title} />
                        ) : (
                            <div className="workspace-avatar">
                                {(workspace.title || workspace.workspace_title || workspace.name || 'W').charAt(0).toUpperCase()}
                            </div>
                        )}
                        <h2>{workspace.title || workspace.workspace_title || workspace.name}</h2>
                    </div>
                    <div className="workspace-header-buttons">
                        <button className="btn-invite" onClick={() => setShowInviteModal(true)}>
                            + Invitar
                        </button>
                        <button className="btn-members" onClick={handleShowMembers}>
                            Miembros
                        </button>
                    </div>
                </div>
                <div className="channels-list">
                    <h3>Canal</h3>
                    <ul>
                        {channels && channels.map(channel => {
                            const id = channel.id || channel._id || channel.channel_id
                            return (
                                <li
                                    key={id}
                                    onClick={() => setSelectedChannelId(id)}
                                    className={selectedChannelId === id ? 'active' : ''}
                                >
                                    # {channel.name || channel.title}
                                </li>
                            )
                        })}
                    </ul>
                </div>
                <div className="create-channel">
                    <input
                        type="text"
                        placeholder="Crear canal"
                        value={newChannelName}
                        onChange={(e) => setNewChannelName(e.target.value)}
                    />
                    <button onClick={() => {
                        if (newChannelName.trim()) {
                            createChannel(newChannelName)
                            setNewChannelName('')
                        }
                    }}>
                        +
                    </button>
                </div>
            </div>
            <div className="workspace-main">
                {selectedChannelId ? (
                    <ChannelChat channelId={selectedChannelId} channels={channels || []} />
                ) : (
                    <div className="no-channel-selected">Selecciona un canal para comenzar a chatear</div>
                )}
            </div>

            {showInviteModal && (
                <div className="modal-overlay">
                    <div className="modal-content invite-modal">
                        <div className="modal-header">
                            <h3>Invitar a {workspace.title || workspace.workspace_title}</h3>
                        </div>
                        <form onSubmit={handleInvite}>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    required
                                    className="form-input"
                                />
                            </div>
                            {inviteStatus && (
                                <div className={`alert ${inviteStatus.type === 'error' ? 'alert-error' : 'alert-success'}`}>
                                    {inviteStatus.message}
                                </div>
                            )}
                            <div className="modal-buttons">
                                <button
                                    type="button"
                                    onClick={() => setShowInviteModal(false)}
                                    className="btn-secondary"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                >
                                    Enviar invitación
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            {showMembersModal && (
                <div className="modal-overlay">
                    <div className="modal-content members-modal">
                        <div className="modal-header">
                            <h3>Miembros de {workspace.title || workspace.workspace_title}</h3>
                            <button className="modal-close-btn" onClick={() => setShowMembersModal(false)}>×</button>
                        </div>

                        <div className="modal-body">
                            {membersLoading ? (
                                <div>Cargando miembros...</div>
                            ) : (
                                <ul className="members-list">
                                    {members.map(m => (
                                        <li key={m._id}>
                                            <div className="message-avatar" style={{ backgroundColor: stringToColor(m.fk_id_user?.username || 'User') }}>
                                                {(m.fk_id_user?.username || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <div className="member-info">
                                                <div className="member-name">{m.fk_id_user?.username || 'Unknown User'}</div>
                                                <div className="member-meta">{m.fk_id_user?.email} • {m.role}</div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {member && member.role === 'Owner' && (
                            <div className="modal-footer">
                                <button className="btn-danger" onClick={handleDeleteWorkspace}>
                                    Eliminar Workspace
                                </button>
                                <div className="danger-warning">
                                    Advertencia: Esta acción no se puede deshacer.
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

const ChannelChat = ({ channelId, channels }) => {
    const { messages, loading, sendMessage, hasFetchedOnce } = useChannel(channelId)
    const [newMessage, setNewMessage] = useState('')

    const channel = channels.find(c => (c.id || c._id || c.channel_id) === channelId)

    const handleSend = (e) => {
        e.preventDefault()
        if (newMessage.trim()) {
            sendMessage(newMessage)
            setNewMessage('')
        }
    }

    return (
        <div className="channel-chat">
            <div className="channel-header">
                # {channel ? channel.name : 'channel'}
            </div>
            <div className="messages-list">
                {messages.map(msg => {
                    const authorName = msg.fk_workspace_member_id?.fk_id_user?.username || msg.author_name || msg.author?.name || msg.author || 'User'
                    const initial = (authorName || 'U').charAt(0).toUpperCase()
                    const time = new Date(msg.created_at || msg.createdAt || msg.time || msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

                    return (
                        <div key={msg._id || msg.id || msg.message_id} className="message-item">
                            <div className="message-avatar" style={{ backgroundColor: stringToColor(authorName) }}>
                                {initial}
                            </div>
                            <div className="message-body">
                                <div className="message-header">
                                    <span className="message-author">{authorName}</span>
                                    <span className="message-time">{time}</span>
                                </div>
                                <div className="message-content">{msg.mensaje || msg.content || msg.text || msg.body}</div>
                            </div>
                        </div>
                    )
                })}
                {messages.length === 0 && hasFetchedOnce && !loading && (
                    <div style={{ padding: '20px', color: '#616061' }}>No hay mensajes aun. Di hola!</div>
                )}
            </div>
            <div className="input-area-container">
                <form className="message-input" onSubmit={handleSend}>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={`Escribe un mensaje en #${channel ? channel.name : 'channel'}`}
                    />
                    <button type="submit">Enviar</button>
                </form>
            </div>
        </div>
    )
}

function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + "00000".substring(0, 6 - c.length) + c;
}

export default WorkspaceScreen
