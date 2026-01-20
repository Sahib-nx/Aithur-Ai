import { messageHandler } from "../utils/messageHandler.js";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();

function userMiddleware(req, res, next) {

    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer')) {

        return messageHandler(res, 401, 'Unauthorized');

    }

    const token = authHeader.split(' ')[1];

    try {

      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
     console.log(decoded);
      req.user = decoded.userId;
      next();
    } catch (error) { 

        return messageHandler(res, 403, 'Invalid token or expired token');

    }
}

export default userMiddleware;
