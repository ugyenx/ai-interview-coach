export async function analyzeResume(resumeText, jobDescription) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key is missing. Please add VITE_GEMINI_API_KEY to your .env file.");
  }

  const prompt = `You are an expert technical recruiter and ATS system.
Analyze the following candidate's resume against the target job description.
Identify keywords that are found and missing. Identify weak bullet points and provide critiques and better suggestions.
You MUST respond with valid JSON ONLY. No markdown wrapping, no extra text.

The JSON format must strictly match:
{
  "score": <number between 0-100 representing ATS match>,
  "keywords": [
    { "word": "Target Keyword 1", "status": "found" },
    { "word": "Target Keyword 2", "status": "missing" }
  ],
  "weakBullets": [
    {
      "original": "The exact bullet from the resume",
      "critique": "Why it's weak (e.g. passive, missing metrics)",
      "suggestion": "A rewritten, metric-driven, active version"
    }
  ],
  "alignmentSummary": "A short paragraph summarizing alignment and gaps.",
  "suggestedSummary": "A customized professional summary for the top of the resume."
}

Job Description:
${jobDescription}

Resume:
${resumeText}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json"
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gemini API Error:", errorText);
    throw new Error("Failed to call Gemini API");
  }

  const data = await response.json();
  try {
    const text = data.candidates[0].content.parts[0].text;
    return JSON.parse(text);
  } catch (err) {
    console.error("Failed to parse Gemini response as JSON:", err);
    throw new Error("Invalid response format from Gemini API");
  }
}
