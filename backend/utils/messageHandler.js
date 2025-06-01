export const messageHandler = (res, statusCode, message, payload, localStrToken) => {

    return res.status(statusCode).json({message: message,  payload: payload, localStrToken: localStrToken })

}