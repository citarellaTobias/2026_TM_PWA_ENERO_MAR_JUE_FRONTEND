import React from 'react';
import { Link } from 'react-router';
import useRegister from '../../hooks/useRegister';
import "./RegisterScreen.css";

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
        <div className="register-page">
            <header className="register-nav">
                <div className="logo">
                    <span className="slack-logo-text">slack</span>
                </div>
                <div className="nav-right">
                    ¿Ya usas Slack? <Link to="/login">Inicia sesión</Link>
                </div>
            </header>

            <main className="register-main">
                <h1>Primero, introduce tu correo electrónico</h1>
                <p className="subtitle">Te sugerimos usar la <strong>dirección de correo que usas en el trabajo.</strong></p>

                <form className="register-form" onSubmit={onSubmitForm}>
                    <div className="input-group">
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="nombre@email.com"
                            value={form_state.email}
                            onChange={onChangeFieldValue}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <input
                            type="text"
                            id="username"
                            name="username"
                            placeholder="Tu nombre de usuario"
                            value={form_state.username}
                            onChange={onChangeFieldValue}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Crea una contraseña"
                            value={form_state.password}
                            onChange={onChangeFieldValue}
                            required
                        />
                    </div>

                    {error && <div className="error-alert">{error.message}</div>}

                    {response && response.ok && (
                        <div className="success-alert">
                            Usuario registrado exitosamente. Revisa tu correo.
                        </div>
                    )}

                    <button 
                        className="btn-register-submit" 
                        type="submit" 
                        disabled={loading}
                    >
                        {loading ? 'Registrando...' : 'Continuar'}
                    </button>
                </form>

                <div className="register-footer">
                    <label className="checkbox-label">
                        <input type="checkbox" defaultChecked />
                        <span>Me gustaría recibir correos con consejos, noticias y ofertas de Slack.</span>
                    </label>
                    <p className="terms">
                        Al continuar, aceptas las <a href="#">Condiciones del servicio</a> y la <a href="#">Política de privacidad</a>.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default RegisterScreen