import React from 'react'
import { Link } from 'react-router'
import useForm from '../../hooks/useForm'
import { register } from '../../services/authService'
import useRequest from '../../hooks/useRequest'
import useRegister from '../../hooks/useRegister'

const RegisterScreen = () => {
    const {
        form_state,
        onChangeFieldValue,
        onSubmitForm,
        loading,
        error,
        response
    } = useRegister()
    return (
        <div>
            <h1>Registrate en la aplicacion</h1>
            <form onSubmit={onSubmitForm}>
                <div>
                    <label htmlFor="username">Nombre de usuario:</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={form_state.username}
                        onChange={onChangeFieldValue}
                    />
                </div>
                <div>
                    <label htmlFor="password">Contraseña:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={form_state.password}
                        onChange={onChangeFieldValue}
                    />
                </div>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={form_state.email}
                        onChange={onChangeFieldValue}
                    />
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
                        Usuario registrado exitosamente, te enviaremos un mail con instrucciones.
                    </span>
                }
                <br />
                <button type="submit" disabled={loading}>Registrarse</button>
            </form>
            <span>
                Ya tienes una cuenta? <Link to="/login">iniciar sesion</Link>
            </span>
        </div>
    )
}

export default RegisterScreen