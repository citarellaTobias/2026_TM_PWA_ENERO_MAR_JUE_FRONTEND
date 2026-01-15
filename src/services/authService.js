/* En estos archivos buscamos centralizar la configuracion y llamada a servicios externos de nuestro frontend
Un ejemplo de esto puede ser:
- API INTERNA
- API EXTERNA
- Libreria que necesite una configuracion
*/

import { ServerError } from "../utils/errorUtils"

/*
fetch es una funcion que nos permite hacer peticiones HTTP a un servidor
Se lo usa entre otras cosas para comunicarnos con API (Servidores HTTP)
En criollo es la forma de interactuar con el backend y lo podriamos comparar con hacer una solicitud http desde postman

fetch recibe 2 parametros:
- URL de consulta
- Un objeto de configuracion
*/

const URL_API = 'http://localhost:8080'


export async function login (username, password){
    const response_http = await fetch(
        URL_API + '/api/auth/login',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', //Configuramos que voy enviar JSON en la peticion
                },
                body: JSON.stringify( //transforma un Object a json en formato string
                    {
                        password: password,
                        email: email
                    }
                )
            }
    )
    const response = await response_http.json()
    if(!response.ok){
        throw new ServerError(response.message, response.status)
    }
    return response
}

export async function register (username, password, email){
        const response_http =await fetch(
            URL_API + '/api/auth/register',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', //Configuramos que voy enviar JSON en la peticion
                },
                body: JSON.stringify( //transforma un Object a json en formato string
                    {
                        username: username,
                        password: password,
                        email: email
                    }
                )
            }
        )
    
        //Transformar la respuesta a HTTP para obtener los datos que nos envio por body el servidor
        //Como el servidor envia JSON debemos tomar la response como json (.json())
        const response = await response_http.json()
        if(!response.ok){
            throw new ServerError( response.message, response.status)
        }
        return response
}

/*
{
    "message": "usuario creado exitosamente",
    "status": 201,
    "ok":true,
    "data":null
}
*/