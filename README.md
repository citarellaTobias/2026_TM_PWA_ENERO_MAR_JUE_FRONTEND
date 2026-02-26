# Clon de Slack - Frontend
## Descripción
Esta es la interfaz de usuario (Frontend) para el clon de Slack, desarrollada como proyecto final para la diplomatura de Full-Stack Developer de la UTN.

Esta aplicación cliente se conecta con nuestra API REST (Backend) para gestionar la autenticación de usuarios, la navegación entre espacios de trabajo (workspaces), la administración de canales y el envío o lectura de mensajes en tiempo real.

## Tecnologías Utilizadas
- React (v19): Librería principal para la construcción de interfaces de usuario y componentes interactivos.

- Vite: Entorno de desarrollo ultrarrápido y empaquetador para el proyecto.

- React Router (v7): Herramienta para manejar la navegación interna y la protección de rutas privadas (como el dashboard o los canales) sin recargar la página.

- JWT-Decode: Utilizado para decodificar los JSON Web Tokens del lado del cliente, permitiendo extraer la información del usuario logueado y validar su sesión.

- Bootstrap Icons & React Icons: Librerías utilizadas para la iconografía de la interfaz (menús, botones de enviar, configuración, etc.).

- Fetch API: Para realizar las peticiones HTTP al servidor backend.

## Características Principales
### Desde esta interfaz el usuario puede:

- Autenticación: Registrarse e iniciar sesión. La aplicación guarda y gestiona el token JWT para mantener la sesión activa.

- Gestión de Workspaces: Ver sus espacios de trabajo disponibles, crear nuevos y administrar invitaciones/miembros.

- Navegación de Canales: Moverse fluidamente entre los distintos canales de un espacio de trabajo.

- Mensajería: Interfaz de chat funcional para enviar y leer mensajes dentro de los canales seleccionados.

## Instrucciones para ejecutar el proyecto

- Instalar las dependencias del proyecto:
npm install

- Iniciar el servidor de desarrollo:

npm run dev
