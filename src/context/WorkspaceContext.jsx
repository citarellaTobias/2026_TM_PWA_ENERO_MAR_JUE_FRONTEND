import { createContext, useEffect } from "react";
import useRequest from "../hooks/useRequest";
import { getWorkspaceList } from "../services/workspaceService";


export const WorkspaceContext = createContext(
    {
        workspace_list_loading: false,
        workspace_list: null,
        workspace_list_error: null,
        refreshWorkspaces: () => {}
    }
)

const WorkspaceContextProvider = ({children}) => {
    const {loading, response, error, sendRequest} = useRequest()

    const refreshWorkspaces = () => {
        sendRequest(getWorkspaceList)
    }

    useEffect(
        () => {
            refreshWorkspaces()
        },
        []
    )

    const provider_values = {
        workspace_list_loading: loading,
        workspace_list: response,
        workspace_list_error: error,
        refreshWorkspaces
    }
    return(
        <WorkspaceContext.Provider 
            value={provider_values}>
                {children}
        </WorkspaceContext.Provider>
    )
}

export default WorkspaceContextProvider