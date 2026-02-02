import React from "react"
import { Route, Routes } from 'react-router'
import LoginScreen from './Screens/LoginScreen/LoginScreen'
import RegisterScreen from './Screens/RegisterScreen/RegisterScreen'
import AuthContextProvider from "./context/AuthContext"
import AuthMiddleware from './Middlewares/AuthMiddleware'
import WorkspaceContextProvider from "./context/WorkspaceContext"
import HomeScreen from "./Screens/HomeScreen/HomeScreen"
function App(){


  return (
    <AuthContextProvider>
      <Routes>
        <Route path='/' element={<LoginScreen />} />
        <Route  path='/register' element={<RegisterScreen />} />
        <Route  path='/login' element={<LoginScreen />} />
        <Route element={<AuthMiddleware />}>
          <Route path='/home' element={
            <WorkspaceContextProvider>
              <HomeScreen />
            </WorkspaceContextProvider>
          } />
        </Route>
      </Routes>
    </AuthContextProvider>
  )
}

export default App