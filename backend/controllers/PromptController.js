import axios from 'axios';
import dotenv from 'dotenv';
import { Prompt } from '../models/promptModel.js';
import { messageHandler } from "../utils/messageHandler.js";

dotenv.config();

export const sendPrompt = async (req, res) => {
  const { content } = req.body;

  if (!content || content.trim() === '') {
    return messageHandler(res, 400, 'Please enter a prompt');
  }

  try {
    const userId = req.user;

    // Save user message
    await Prompt.create({ userId, role: "user", content });

    // Call OpenRouter API
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
       model:"deepseek/deepseek-r1:free",
        messages: [{ role: "user", content }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5173", // or your frontend domain
          "X-Title": "Aithur AI" // optional
        }
      }
    );

    const aiContent = response.data.choices[0].message.content;

    // Save AI message
    await Prompt.create({ userId, role: "assistant", content: aiContent });

    return res.status(201).json({ reply: aiContent });

  } catch (error) {
    console.error("OpenRouter Error:", error.response?.data || error.message);
    return messageHandler(res, 500, "Server error from OpenRouter");
  }
}
