import express from 'express'
import { sendPrompt } from '../controllers/PromptController.js';
import userMiddleware from '../middleware/promptMIddleware.js';



const router =  express.Router();

router.post("/prompt", userMiddleware, sendPrompt)


export default router;