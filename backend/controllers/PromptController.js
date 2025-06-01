import OpenAI from "openai";
import dotenv from 'dotenv';
import { Prompt } from '../models/promptModel.js';
import { messageHandler } from "../utils/messageHandler.js";

dotenv.config();

const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.OPENAI_API_KEY,
});
console.log(openai.apiKey)

export const sendPrompt = async (req, res) => {

    const { content } = req.body;

    if (!content || content.trim() === '') {

        return messageHandler(res, 400, 'Please enter a prompt');

    }

    try {

        const userId = req.user;

        // Save user prompt to the database
        const userPrompt = await Prompt.create({
            userId: userId,
            role: "user",
            content
        });

        // Generate AI response using OpenAI's chat model
        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: content }],
            model: "deepseek-chat",
        });

        // Extract AI response from the completion object
        const aiContent = completion.choices[0].message.content;

        //save AI prompt to the database
        const aiMessage = await Prompt.create({
            userId: userId,
            role: "assistant",
            content: aiContent
        });

        return res.status(201).json({ reply: aiContent });

    } catch (error) {
        console.error("Error in prompt:", error);
        return messageHandler(res, 500, "Server error");
    }
}
