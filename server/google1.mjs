import { VertexAI } from "@google-cloud/vertexai";

const vertex = new VertexAI({
  project: process.env.GCP_PROJECT,
  location: "us-central1"
});

const model = vertex.getGenerativeModel({
  model: "gemini-2.5-flash"
});

const result = await model.generateContent({
  contents: [{ role: "user", parts: [{ text: "Hello" }] }]
});

console.log(result.response.candidates[0].content.parts[0].text);