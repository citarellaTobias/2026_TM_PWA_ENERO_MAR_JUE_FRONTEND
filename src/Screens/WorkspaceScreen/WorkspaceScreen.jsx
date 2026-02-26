import React, { useState, useEffect, useContext, useRef } from 'react'
import { Link, useNavigate } from 'react-router'
import useWorkspaceDetail from '../../hooks/useWorkspaceDetail'
import useChannel from '../../hooks/useChannel'
import { inviteUser, getWorkspaceMembers, deleteWorkspace } from '../../services/workspaceService'
import { WorkspaceContext } from '../../context/WorkspaceContext'
import { AuthContext } from '../../context/AuthContext'
import './WorkspaceScreen.css'

const WorkspaceScreen = () => {
    const navigate = useNavigate()
    const { refreshWorkspaces } = useContext(WorkspaceContext)
    const {
        workspace,
        workspaceId,
        member,
        channels,
        loading: workspaceLoading,
        error: workspaceError,
        createChannel,
        updateChannel,
        deleteChannel
    } = useWorkspaceDetail()

    const [selectedChannelId, setSelectedChannelId] = useState(null)
    const [newChannelName, setNewChannelName] = useState('')

    const [showInviteModal, setShowInviteModal] = useState(false)
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviteStatus, setInviteStatus] = useState(null)

    const [showMembersModal, setShowMembersModal] = useState(false)
    const [members, setMembers] = useState([])
    const [membersLoading, setMembersLoading] = useState(false)

    const [showCreateChannelModal, setShowCreateChannelModal] = useState(false)
    const [createChannelName, setCreateChannelName] = useState('')

    const [showEditChannelModal, setShowEditChannelModal] = useState(false)
    const [editingChannelId, setEditingChannelId] = useState(null)
    const [editChannelName, setEditChannelName] = useState('')
    const [editChannelStatus, setEditChannelStatus] = useState(null)

    const [showMobileMenu, setShowMobileMenu] = useState(false)

    const handleInvite = async (e) => {
        e.preventDefault()
        setInviteStatus(null)
        try {
            await inviteUser(workspaceId, inviteEmail)
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
            const response = await getWorkspaceMembers(workspaceId)
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
                await deleteWorkspace(workspaceId)
                refreshWorkspaces()
                navigate('/home')
            } catch (err) {
                alert('Error al eliminar workspace: ' + (err.message || 'Error desconocido'))
            }
        }
    }

    const handleEditChannelOpen = (channelId, channelName) => {
        setEditingChannelId(channelId)
        setEditChannelName(channelName)
        setEditChannelStatus(null)
        setShowEditChannelModal(true)
    }

    const handleUpdateChannel = async () => {
        if (!editChannelName.trim()) {
            setEditChannelStatus({ type: 'error', message: 'El nombre del canal no puede estar vacío' })
            return
        }

        try {
            await updateChannel(editingChannelId, editChannelName.trim())
            setEditChannelStatus({ type: 'success', message: 'Canal actualizado!' })
            setTimeout(() => {
                setShowEditChannelModal(false)
                setEditChannelStatus(null)
                setEditingChannelId(null)
                setEditChannelName('')
            }, 1500)
        } catch (err) {
            setEditChannelStatus({ type: 'error', message: err.message || 'Error al actualizar el canal' })
        }
    }

    const handleDeleteChannelModal = async () => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este canal? Esta acción no se puede deshacer.')) {
            try {
                await deleteChannel(editingChannelId)
                
                // If deleted channel was selected, select first available channel
                if (selectedChannelId === editingChannelId) {
                    const remainingChannels = channels.filter(ch => {
                        const chId = ch.id || ch._id || ch.channel_id
                        return chId !== editingChannelId
                    })
                    if (remainingChannels.length > 0) {
                        const firstId = remainingChannels[0].id || remainingChannels[0]._id || remainingChannels[0].channel_id
                        setSelectedChannelId(firstId)
                    } else {
                        setSelectedChannelId(null)
                    }
                }
                
                setShowEditChannelModal(false)
                setEditChannelStatus(null)
                setEditingChannelId(null)
                setEditChannelName('')
            } catch (err) {
                setEditChannelStatus({ type: 'error', message: err.message || 'Error al eliminar el canal' })
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

    const workspaceName = workspace.title || workspace.workspace_title || workspace.name || 'Workspace'

    return (
        <div className="ws-layout">

            {/* Mobile header */}
            <div className="ws-mobile-header">
                <button className="ws-mobile-toggle" onClick={() => setShowMobileMenu(true)}><i className="bi bi-list"></i></button>
                <div>{workspaceName}</div>
            </div>

            {/* Sidebar */}
            <div className={`ws-sidebar ${showMobileMenu ? 'show' : ''}`}>
                <div className="ws-sidebar-header">
                    <div className="ws-sidebar-header-top">
                        <div className="ws-workspace-name-row">
                            <div className="ws-workspace-logo">
                                {workspaceName.charAt(0).toUpperCase()}
                            </div>
                            <h2>{workspaceName}</h2>
                        </div>
                        <div className="ws-sidebar-actions">
                            <button
                                className="ws-mobile-toggle ws-sidebar-icon-btn"
                                onClick={() => setShowMobileMenu(false)}
                                style={{ display: showMobileMenu ? 'flex' : 'none' }}
                            >×</button>
                        </div>
                    </div>

                    <div className="ws-status-row">
                        <div className="ws-status-dot"></div>
                        <span className="ws-status-label">Activo</span>
                    </div>

                    <Link to="/home" className="ws-back-link">← Volver al Home</Link>

                    <div className="ws-header-buttons">
                        <button className="ws-btn-invite" onClick={() => setShowInviteModal(true)}>
                            <i className="bi bi-person-fill-add"> Invitar</i>
                        </button>
                        <button className="ws-btn-members" onClick={handleShowMembers}>
                            Miembros
                        </button>
                    </div>
                </div>

                <div className="ws-sidebar-body">
                    <div className="ws-section">
                        <div className="ws-section-header">
                            <span className="ws-section-title">Canales</span>
                            <button 
                                className="ws-section-add-btn"
                                onClick={() => setShowCreateChannelModal(true)}
                                title="Crear canal"
                            >
                                +
                            </button>
                        </div>
                        {channels && channels.map(channel => {
                            const id = channel.id || channel._id || channel.channel_id
                            return (
                                <div
                                    key={id}
                                    className={`ws-ch-item ${selectedChannelId === id ? 'active' : ''}`}
                                    onClick={() => setSelectedChannelId(id)}
                                >
                                    <span className="ws-ch-prefix">#</span>
                                    <span className="ws-ch-name">{channel.name || channel.title}</span>
                                    <button 
                                        className="ws-ch-edit-btn"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleEditChannelOpen(id, channel.name || channel.title)
                                        }}
                                        title="Editar canal"
                                    >
                                        <i className="bi bi-pencil"></i>
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </div>


            </div>

            {/* Main panel */}
            <div className="ws-main">
                {selectedChannelId ? (
                    <ChannelChat 
                        workspaceId={workspaceId} 
                        channelId={selectedChannelId} 
                        channels={channels || []} 
                    />
                ) : (
                    <div className="ws-no-channel">Selecciona un canal para comenzar a chatear</div>
                )}
            </div>

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="ws-modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowInviteModal(false)}>
                    <div className="ws-modal">
                        <div className="ws-modal-header">
                            <h3>Invitar a {workspaceName}</h3>
                            <button className="ws-modal-close" onClick={() => setShowInviteModal(false)}>×</button>
                        </div>
                        <div className="ws-modal-body">
                            {inviteStatus && (
                                <div className={`ws-alert ${inviteStatus.type === 'error' ? 'error' : 'success'}`}>
                                    {inviteStatus.message}
                                </div>
                            )}
                            <div className="ws-form-group">
                                <label className="ws-form-label">Email</label>
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="nombre@ejemplo.com"
                                    className="ws-form-input"
                                />
                            </div>
                        </div>
                        <div className="ws-modal-buttons">
                            <button className="ws-btn-secondary" onClick={() => setShowInviteModal(false)}>
                                Cancelar
                            </button>
                            <button className="ws-btn-primary" onClick={handleInvite}>
                                Enviar invitación
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Channel Modal */}
            {showCreateChannelModal && (
                <div className="ws-modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowCreateChannelModal(false)}>
                    <div className="ws-modal">
                        <div className="ws-modal-header">
                            <h3>Crear canal</h3>
                            <button className="ws-modal-close" onClick={() => setShowCreateChannelModal(false)}>×</button>
                        </div>
                        <div className="ws-modal-body">
                            <div className="ws-form-group">
                                <label className="ws-form-label">Nombre del canal</label>
                                <input
                                    type="text"
                                    value={createChannelName}
                                    onChange={(e) => setCreateChannelName(e.target.value)}
                                    placeholder="ej: general, random, dev..."
                                    className="ws-form-input"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && createChannelName.trim()) {
                                            createChannel(createChannelName.trim())
                                            setCreateChannelName('')
                                            setShowCreateChannelModal(false)
                                        }
                                    }}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="ws-modal-buttons">
                            <button className="ws-btn-secondary" onClick={() => setShowCreateChannelModal(false)}>
                                Cancelar
                            </button>
                            <button 
                                className="ws-btn-primary" 
                                onClick={() => {
                                    if (createChannelName.trim()) {
                                        createChannel(createChannelName.trim())
                                        setCreateChannelName('')
                                        setShowCreateChannelModal(false)
                                    }
                                }}
                                disabled={!createChannelName.trim()}
                            >
                                Crear canal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Channel Modal */}
            {showEditChannelModal && (
                <div className="ws-modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowEditChannelModal(false)}>
                    <div className="ws-modal">
                        <div className="ws-modal-header">
                            <h3>Editar canal</h3>
                            <button className="ws-modal-close" onClick={() => setShowEditChannelModal(false)}>×</button>
                        </div>
                        <div className="ws-modal-body">
                            {editChannelStatus && (
                                <div className={`ws-alert ${editChannelStatus.type === 'error' ? 'error' : 'success'}`}>
                                    {editChannelStatus.message}
                                </div>
                            )}
                            <div className="ws-form-group">
                                <label className="ws-form-label">Nombre del canal</label>
                                <input
                                    type="text"
                                    value={editChannelName}
                                    onChange={(e) => setEditChannelName(e.target.value)}
                                    placeholder="Nombre del canal"
                                    className="ws-form-input"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && editChannelName.trim()) {
                                            handleUpdateChannel()
                                        }
                                    }}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="ws-modal-buttons">
                            <button className="ws-btn-danger" onClick={handleDeleteChannelModal}>
                                Eliminar canal
                            </button>
                            <div className="ws-modal-buttons-right">
                                <button className="ws-btn-secondary" onClick={() => setShowEditChannelModal(false)}>
                                    Cancelar
                                </button>
                                <button 
                                    className="ws-btn-primary" 
                                    onClick={handleUpdateChannel}
                                    disabled={!editChannelName.trim()}
                                >
                                    Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Members Modal */}
            {showMembersModal && (
                <div className="ws-modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowMembersModal(false)}>
                    <div className="ws-modal wide">
                        <div className="ws-modal-header">
                            <h3>Miembros de {workspaceName}</h3>
                            <button className="ws-modal-close" onClick={() => setShowMembersModal(false)}>×</button>
                        </div>
                        <div className="ws-modal-body">
                            {membersLoading ? (
                                <div>Cargando miembros...</div>
                            ) : (
                                <ul className="ws-members-list">
                                    {members.map(m => {
                                        const username =
                                            m.fk_id_user?.username ||
                                            m.member_username_user ||
                                            m.username ||
                                            'Unknown User'
                                        const email =
                                            m.fk_id_user?.email ||
                                            m.member_email_user ||
                                            m.email ||
                                            ''
                                        const role = m.role || m.member_role || 'Member'
                                        const memberId = m._id || m.member_id || m.id

                                        return (
                                            <li key={memberId}>
                                                <div className="ws-msg-avatar" style={{ backgroundColor: stringToColor(username) }}>
                                                    {username.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="ws-member-info">
                                                    <div className="ws-member-name">{username}</div>
                                                    <div className="ws-member-meta">{email} · {role}</div>
                                                </div>
                                            </li>
                                        )
                                    })}
                                </ul>
                            )}
                        </div>
                        {member && member.role === 'Owner' && (
                            <div className="ws-modal-footer">
                                <button className="ws-btn-danger" onClick={handleDeleteWorkspace}>
                                    Eliminar Workspace
                                </button>
                                <div className="ws-danger-warning">
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

const ChannelChat = ({ workspaceId, channelId, channels }) => {
    const { messages, loading, sendMessage, deleteMessage, hasFetchedOnce, pendingMessageIds, isUserAtBottom } = useChannel(workspaceId, channelId)
    const { session } = useContext(AuthContext)
    const [newMessage, setNewMessage] = useState('')
    const [previousMessagesCount, setPreviousMessagesCount] = useState(0)
    const messagesEndRef = useRef(null)
    const textareaRef = useRef(null)

    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deletingMessageId, setDeletingMessageId] = useState(null)
    const [deleteError, setDeleteError] = useState(null)

    const channel = channels.find(c => (c.id || c._id || c.channel_id) === channelId)
    const channelName = channel ? (channel.name || channel.title) : 'canal'

    useEffect(() => {
        if (messages.length > previousMessagesCount && isUserAtBottom?.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
        setPreviousMessagesCount(messages.length)
    }, [messages, previousMessagesCount, isUserAtBottom])

    const handleSend = () => {
        if (newMessage.trim()) {
            sendMessage(newMessage.trim())
            setNewMessage('')
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto'
            }
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const handleTextareaChange = (e) => {
        setNewMessage(e.target.value)
        e.target.style.height = 'auto'
        e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px'
    }

    const handleDeleteMessageClick = (messageId) => {
        setDeletingMessageId(messageId)
        setDeleteError(null)
        setShowDeleteModal(true)
    }

    const handleConfirmDelete = async () => {
        try {
            await deleteMessage(deletingMessageId)
            setShowDeleteModal(false)
            setDeletingMessageId(null)
        } catch (err) {
            setDeleteError(err.message || 'Error al eliminar el mensaje')
        }
    }

    const groupedMessages = messages.reduce((groups, msg) => {
        const date = new Date(msg.created_at || msg.createdAt || msg.time || msg.timestamp)
        const dateKey = date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
        if (!groups[dateKey]) groups[dateKey] = []
        groups[dateKey].push(msg)
        return groups
    }, {})

    return (
        <div className="ws-channel-chat">
            <div className="ws-topbar">
                <div className="ws-topbar-left">
                    <div className="ws-topbar-name">
                        <span className="ws-topbar-hash">#</span>
                        {channelName}
                    </div>
                </div>
                <div className="ws-topbar-right">
                    <button className="ws-topbar-icon-btn" title="Buscar"><i className="bi bi-search"></i></button>
                    <button className="ws-topbar-icon-btn" title="Miembros"><i className="bi bi-people"></i></button>
                </div>
            </div>

            <div className="ws-channel-body">
                <div className="ws-messages">
                    {messages.length === 0 && hasFetchedOnce && !loading && (
                        <div className="ws-welcome">
                            <div className="ws-welcome-icon">#</div>
                            <h2>Bienvenido a #{channelName}</h2>
                            <p>Este es el comienzo del canal <strong>#{channelName}</strong>. Di hola 👋</p>
                        </div>
                    )}

                    {Object.entries(groupedMessages).map(([dateLabel, msgs]) => (
                        <React.Fragment key={dateLabel}>
                            <div className="ws-date-sep">
                                <span>{dateLabel}</span>
                            </div>
                            {msgs.map(msg => {
                                const authorName = msg.fk_id_workspace_member?.fk_id_user?.username || msg.fk_workspace_member_id?.fk_id_user?.username || msg.author_name || msg.author?.name || msg.author || 'User'
                                const initial = (authorName || 'U').charAt(0).toUpperCase()
                                const time = new Date(msg.created_at || msg.createdAt || msg.time || msg.timestamp)
                                    .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                const isPending = pendingMessageIds?.has(msg._id)
                                const isDeleted = msg.isDeleted
                                const canDelete = session?.user_id === msg.fk_id_workspace_member?.fk_id_user?._id || session?.user_id === msg.fk_id_workspace_member?.user_id

                                return (
                                    <div key={msg._id || msg.id || msg.message_id} className={`ws-msg-row ${isPending ? 'pending' : ''} ${isDeleted ? 'deleted' : ''}`}>
                                        <div className="ws-msg-avatar" style={{ backgroundColor: stringToColor(authorName) }}>
                                            {initial}
                                        </div>
                                        <div className="ws-msg-body">
                                            <div className="ws-msg-header">
                                                <span className="ws-msg-author">{authorName}
                                                    {isPending && <span className="ws-msg-pending-indicator" title="Enviando..."><i className="bi bi-clock-history"></i></span>}
                                                </span>
                                                <span className="ws-msg-time">{time}</span>
                                                {canDelete && !isDeleted && (
                                                    <button 
                                                        className="ws-msg-delete-btn"
                                                        onClick={() => handleDeleteMessageClick(msg._id)}
                                                        title="Eliminar mensaje"
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                )}
                                            </div>
                                            <div className={`ws-msg-content ${isDeleted ? 'deleted-text' : ''}`}>
                                                {msg.message || msg.mensaje || msg.content || msg.text || msg.body}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </React.Fragment>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <div className="ws-composer-wrapper">
                    <div className="ws-composer-box">
                        <div className="ws-composer-input-row">
                            <textarea
                                ref={textareaRef}
                                className="ws-composer-textarea"
                                rows={1}
                                placeholder={`Mensaje en #${channelName}`}
                                value={newMessage}
                                onChange={handleTextareaChange}
                                onKeyDown={handleKeyDown}
                            />
                            <button
                                className={`ws-composer-send-btn ${newMessage.trim() ? 'ready' : ''}`}
                                onClick={handleSend}
                                disabled={!newMessage.trim()}
                            >
                                <svg className="ws-send-icon" viewBox="0 0 24 24">
                                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                                </svg>
                            </button>
                        </div>
                        <div className="ws-composer-bottom-row">
                            <button className="ws-composer-icon-btn" title="Adjuntar">📎</button>
                            <button className="ws-composer-icon-btn" title="Emoji">😊</button>
                            <button className="ws-composer-icon-btn" title="Mencionar">@</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Message Modal */}
            {showDeleteModal && (
                <div className="ws-modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowDeleteModal(false)}>
                    <div className="ws-modal">
                        <div className="ws-modal-header">
                            <h3>Eliminar mensaje</h3>
                            <button className="ws-modal-close" onClick={() => setShowDeleteModal(false)}>×</button>
                        </div>
                        <div className="ws-modal-body">
                            {deleteError && (
                                <div className="ws-alert error">
                                    {deleteError}
                                </div>
                            )}
                            <p>¿Estás seguro de que quieres eliminar este mensaje?</p>
                        </div>
                        <div className="ws-modal-buttons">
                            <button className="ws-btn-secondary" onClick={() => setShowDeleteModal(false)}>
                                Cancelar
                            </button>
                            <button className="ws-btn-danger" onClick={handleConfirmDelete}>
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function stringToColor(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase()
    return '#' + '00000'.substring(0, 6 - c.length) + c
}

export default WorkspaceScreen