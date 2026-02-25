import { useContext } from "react";
import { Link } from "react-router";
import { WorkspaceContext } from "../../context/WorkspaceContext";
import './HomeScreen.css'



const HomeScreen = () => {

  const { workspace_list_loading, workspace_list_error, workspace_list } =
    useContext(WorkspaceContext);
  if (workspace_list_loading || !workspace_list) {
    return (
      <div className="home-loading">
        <div className="spinner"></div>
        <span>Cargando tus espacios de trabajo...</span>
      </div>
    )
  }



  const workspaces = workspace_list.data.workspaces



  return (
    <div className="home-wrapper">
      <header className="home-nav">
        <img src="/slack_logo.svg" alt="Slack" className="slack-logo" />
      </header>
      <main className="home-content">
        <section className="create-section">
          <div className="create-text">
            <h1>Crear un nuevo espacio de trabajo de Slack</h1>
            <p>Slack le da a tu equipo un lugar donde pueden hablar y trabajar juntos.</p>
            <Link to="/create-workspace" className="btn-primary-large">
              Crear un espacio de trabajo
            </Link>
          </div>
        </section>
        <div className="divider">
          <span>O BIEN</span>
        </div>

        <section className="workspace-list-section">
          <h3>Abre un espacio de trabajo</h3>
          <p className="list-subtitle">Listos para comenzar</p>
          <span className="user-email-display">{workspace_list?.email}</span>

          <div className="workspace-container">
            {workspaces.map((workspace) => (
              <Link
                key={workspace.workspace_id}
                to={`/workspace/${workspace.workspace_id}`}
                className="workspace-card"
              >
                <div className="card-left">
                  <div className="workspace-avatar">
                    {workspace.workspace_title.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="workspace-info">
                    <span className="ws-name">{workspace.workspace_title}</span>
                    <span className="ws-members">
                      {workspace.members_count || 1} miembro
                    </span>
                  </div>
                </div>
                <div className="card-arrow">
                  <span>→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default HomeScreen