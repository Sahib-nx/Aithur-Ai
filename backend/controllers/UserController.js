import { User } from "../models/userModel.js";
import { messageHandler } from "../utils/messageHandler.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


export const register = async (req, res) => {


    try {

        const { username, email, password } = req.body;

        if (username === "", email === "", password === "") {

            return messageHandler(res, 400, "All Fields are required");

        }


        const user = await User.findOne({ email })

        if (user) {

            return messageHandler(res, 400, "User already exists");

        }

        const hashPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            email,
            password: hashPassword
        });


        if (newUser) {

            const secretkey = process.env.JWT_SECRET_KEY;

            if (!secretkey) {
                return messageHandler(res, 500, "JWT secret key not configured");
            }

            const userId = newUser._id

            const token = jwt.sign({ userId }, secretkey, {
                expiresIn: "180d"
            })

            const expires = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toUTCString();

            res.setHeader(
                "Set-Cookie",
                `token=${token}; HttpOnly; Path=/; SameSite=Strict; Expires=${expires}`
            );

            return messageHandler(res, 201, "User Cretaed Successfully", newUser, token )

        } else {

            return res.status(500).json({ message: "User Creation Failed" })
        }

    } catch (error) {

        console.error("REGISTER ERROR:", error);
        return messageHandler(res, 500, "Server Error!");
    }

}


export const login = async (req, res) => {


    try {

        const { email, password } = req.body;

        if (!email || !password) {

            return messageHandler(res, 400, "All Fields Are Required");

        }



        const user = await User.findOne({ email })

        if (!user) {

            return messageHandler(res, 400, "User Not Found With This Email");
        }


        const VerifyPass = await bcrypt.compare(password, user.password);

        if (VerifyPass) {

            const secretkey = process.env.JWT_SECRET_KEY;

            if (!secretkey) {
                return messageHandler(res, 500, "JWT secret key not configured");
            }

            const userId = user._id;


            const token = jwt.sign({ userId }, secretkey, {
                expiresIn: "180d"
            })

            const expires = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toUTCString();
            res.setHeader(
                "Set-Cookie",
                `token=${token}; HttpOnly; Path=/; SameSite=Strict; Expires=${expires}`
            );

            return messageHandler(res, 200, "Login Successfull", user, token)

        } else {

            return messageHandler(res, 400, "Invalid Password");

        }

    } catch (error) {

        console.error("LOGIN ERROR:", error);
        return messageHandler(res, 500, "Server Error!");
    }
}

export const logout = (req, res) => {

    try {

        // Clear the authentication token cookie
        res.setHeader('Set-Cookie', 'token=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax; Secure');

        return messageHandler(res, 200, 'Logged out successfully');

    } catch (error) {

        console.error("LOGGOUT ERROR:", error);
        return messageHandler(res, 500, "Server Error!");
    }

}