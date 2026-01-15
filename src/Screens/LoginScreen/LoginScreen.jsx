import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import useForm from '../../hooks/useForm'
import useRequest from '../../hooks/useRequest'
import { login } from '../../services/authService'
import useLogin from '../../hooks/useLogin'

const LoginScreen = () => {
    const {
        form_state,
        onChangeFieldValue,
        onSubmitForm,
        loading,
        error,
        response
    } = useLogin()

    return (
        <div>
            <h1>Inicia sesion</h1>
            <form onSubmit={onSubmitForm}>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" name="email" onChange={onChangeFieldValue} value={form_state.email} />
                </div>
                <div>
                    <label htmlFor="password">Contraseña:</label>
                    <input type="password" id="password" name="password" onChange={onChangeFieldValue} value={form_state.password} />
                </div>
                {
                    error && <span style={{ color: 'red' }}>{error.message}</span>
                }
                {
                    response
                    &&
                    response.ok
                    &&
                    <span style={{ color: 'yellowgreen' }}>
                        Te has logueado exitosamente
                    </span>
                }
                <button type="submit" disabled={loading || (response && response.ok)}>Iniciar sesion</button>
            </form>
            <span>
                Aun no tienes cuenta? <Link to="/register">Registrate</Link>
            </span>
        </div>
    )
}

export default LoginScreen