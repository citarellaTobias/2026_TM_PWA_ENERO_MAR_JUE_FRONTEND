import { useContext } from "react"
import { WorkspaceContext } from "../../context/WorkspaceContext"



const HomeScreen = () => {
    const {workspace_list_loading, workspace_list_error, workspace_list} = useContext(WorkspaceContext)
    console.log(workspace_list)

    if(workspace_list_loading || !workspace_list){
        return <span>Loading...</span>
    }

    return(
        <div>
            <h1>Bienvenido nuevamente</h1>

            {
                workspace_list_error && <span>{workspace_list_error.message}</span>
            }
            {
                workspace_list.data.workspaces && workspace_list.data.workspaces.length > 0 && workspace_list.data.workspaces.map(
                    workspace => <div key={workspace.workspace_id}>{workspace.workspace_title}</div>
                )
            }
            {
                workspace_list.data.workspaces && workspace_list.data.workspaces.length === 0 && <span>No tienes workspaces</span>
            }
        </div>
    )
}

export default HomeScreen