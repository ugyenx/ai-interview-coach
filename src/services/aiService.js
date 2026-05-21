import Groq from "groq-sdk";
import { SYSTEM_PROMPT, EVALUATION_PROMPT } from "../config/prompts";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true // Warning: For prototype only
});

export async function generateInterviewResponse(messages) {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages
      ],
      model: "llama-3.1-8b-instant", // Using supported instant model
      temperature: 0.7,
      max_tokens: 1024,
      response_format: { type: "json_object" }
    });

    const responseContent = chatCompletion.choices[0]?.message?.content || "{}";
    return JSON.parse(responseContent);
  } catch (error) {
    console.error("Groq API Error:", error);
    throw new Error("Failed to communicate with the AI. Please try again.");
  }
}

export async function generateInterviewEvaluation(transcript) {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: EVALUATION_PROMPT },
        { role: "user", content: "Here is the interview transcript:\n\n" + transcript }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.5,
      max_tokens: 1024,
      response_format: { type: "json_object" }
    });

    const responseContent = chatCompletion.choices[0]?.message?.content || "{}";
    return JSON.parse(responseContent);
  } catch (error) {
    console.error("Groq API Error during evaluation:", error);
    throw new Error("Failed to evaluate the interview.");
  }
}

export async function analyzeResume(resumeText, jobDescription) {
  try {
    const prompt = `You are an expert technical recruiter and ATS system.
Analyze the following candidate's resume against the target job description.
Identify keywords that are found and missing. Identify weak bullet points and provide critiques and better suggestions.
You MUST respond with valid JSON ONLY.

The JSON format must strictly match:
{
  "score": 85,
  "keywords": [
    { "word": "React", "status": "found" },
    { "word": "Docker", "status": "missing" }
  ],
  "weakBullets": [
    {
      "original": "Managed some frontend development tasks.",
      "critique": "Lacks specific metrics and impact.",
      "suggestion": "Led frontend development of 3 core React modules, improving performance by 25%."
    }
  ],
  "alignmentSummary": "Candidate has strong frontend skills but lacks backend database integration experience.",
  "suggestedSummary": "Experienced Frontend Engineer with a proven track record of building performant React applications."
}

Job Description:
${jobDescription}

Resume:
${resumeText}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "user", content: prompt }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.2,
      max_tokens: 2048,
      response_format: { type: "json_object" }
    });

    const responseContent = chatCompletion.choices[0]?.message?.content || "{}";
    return JSON.parse(responseContent);
  } catch (error) {
    console.error("Groq API Error during resume analysis:", error);
    throw new Error("Failed to analyze the resume.");
  }
}
