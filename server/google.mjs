import dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";

console.log("The API Key: " + process.env.GOOGLE_AI_API_KEY)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

console.log("Testing whether gemini-1.5-flash works")
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash"   
});


const response = await fetch(
  "https://generativelanguage.googleapis.com/v1beta/models",
  {
    headers: { "x-goog-api-key": process.env.GOOGLE_AI_API_KEY }
  }
);

const data = await response.json();
console.log(data);

console.log("Testing a message")
const result = await model.generateContent("Hello!");
console.log(result.response.text());