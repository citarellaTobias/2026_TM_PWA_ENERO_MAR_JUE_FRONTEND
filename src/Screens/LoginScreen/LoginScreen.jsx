import React from 'react'
import { Link } from 'react-router'
import useLogin from '../../hooks/useLogin'
import "./LoginScreen.css"

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
        <div className="login-page">
            <header className="login-nav">
                <div className="logo">
                    <img src="/slack_logo.svg" alt="Slack" className="slack-logo" />
                </div>
                <div className="nav-right">
                    ¿Eres nuevo en Slack? <Link to="/register">Crea una cuenta</Link>
                </div>
            </header>

            <main className="login-main">
                <h1>Inicia sesión en Slack</h1>
                <p className="subtitle">Te recomendamos usar la <strong>dirección de correo que usas en el trabajo.</strong></p>

                <form className="login-form" onSubmit={onSubmitForm}>
                    <div className="input-group">
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            placeholder="nombre@email.com"
                            onChange={onChangeFieldValue} 
                            value={form_state.email} 
                            required
                        />
                    </div>
                    <div className="input-group">
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            placeholder="tu contraseña"
                            onChange={onChangeFieldValue} 
                            value={form_state.password} 
                            required
                        />
                    </div>

                    {error && <div className="error-alert">{error.message}</div>}
                    
                    {response && response.ok && (
                        <div className="success-alert">Te has logueado exitosamente</div>
                    )}

                    <button 
                        className="btn-login-submit" 
                        type="submit" 
                        disabled={loading || (response && response.ok)}
                    >
                        {loading ? 'Iniciando sesión...' : 'Iniciar sesión con el correo'}
                    </button>
                </form>

                <div className="login-footer">
                    <p>¿No sabes qué correo electrónico usas? <a href="#">Te podemos ayudar</a></p>
                </div>
            </main>
        </div>
    )
}

export default LoginScreen