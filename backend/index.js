import express from "express"
import dotenv from 'dotenv'
import connectDb from "./config/connectDb.js"
import cookieParser from "cookie-parser"
import cors from "cors"

import userRoutes from "./routes/userRoutes.js"
import promptRoutes from "./routes/promptRoutes.js"

dotenv.config()
const app = express()
const port = process.env.PORT || 4005; 
connectDb();

//middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods:["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

//routes
app.use("/api/v1/user", userRoutes)
app.use("/api/v1/aithurAi", promptRoutes)


app.listen(port, () => {
  console.log(`Server is litsen on port  ${port}`)
})