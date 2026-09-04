import Resume from "../models/resume.js";
import ai from "../configs/ai.js";

const cleanAIResponse = (text) => {
  if (!text) return "";
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .replace(/^"|"$/g, "")
    .replace(/^[\s\-\*•]+/gm, "")
    .trim();
};

export const enhanceProfessionalSummary = async (req, res) => {
  try {
    const { userContent } = req.body;

    if (!userContent) {
      return res.status(400).json({ message: "Content is required." });
    }

    const preamble = `
    You are a Senior Resume Strategist with expertise in ATS optimization.
    Task: Rewrite the user's professional summary to be a "High-Impact Executive Hook".
    
    GUIDELINES:
    1. **Impact:** Focus on achievements and core competencies.
    2. **Tone:** Professional, confident, and active. Avoid passive voice.
    3. **ATS Keywords:** Naturally integrate industry-standard keywords.
    4. **Formatting:** Keep it to 3-4 concise sentences.
    5. **Output:** Return ONLY the polished paragraph text. No labels, no quotes, no markdown.
    `;

    const response = await ai.chat({
      model: "command-r-08-2024",
      message: `Refine this summary to make it stand out:\n\n"${userContent}"`,
      preamble: preamble,
      temperature: 0.5, 
    });

    return res.status(200).json({ enhancedContent: cleanAIResponse(response.text) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const enhanceJobDescription = async (req, res) => {
  try {
    const { userContent } = req.body;

    if (!userContent) {
      return res.status(400).json({ message: "Content is required." });
    }

    const preamble = `
    You are an expert Technical Recruiter. Rewrite the provided job description bullet points using the **"Action Verb + Task + Result"** formula.
    
    GUIDELINES:
    1. **Quantify:** Aggressively add metrics (e.g., "Increased efficiency by 20%"). If numbers aren't provided, use qualitative impact.
    2. **Power Verbs:** Start every bullet with strong verbs (e.g., Engineered, Spearheaded, Optimized).
    3. **Clarity:** Remove fluff and make it punchy.
    4. **Formatting:** Return the result as plain sentences separated by newlines.
    5. **CRITICAL:** Do NOT use bullet points, hyphens (-), asterisks (*), or numbers at the start of lines. Just raw text.
    `;

    const response = await ai.chat({
      model: "command-r-08-2024",
      message: `Improve these bullet points:\n\n"${userContent}"`,
      preamble: preamble,
      temperature: 0.5, 
    });

    return res.status(200).json({ enhancedContent: cleanAIResponse(response.text) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const uploadResume = async (req, res) => {
  try {
    const { resumeText, title } = req.body;
    const userId = req.userId;

    if (!resumeText) {
      return res.status(400).json({ message: "No resume text provided." });
    }

    const jsonSchema = `{
      "professional_summary": "string",
      "skills": ["string"],
      "personal_info": {
        "full_name": "string",
        "email": "string",
        "phone": "string",
        "linkedin": "string",
        "website": "string",
        "location": "string",
        "profession": "string"
      },
      "experience": [
        {
          "company": "string",
          "position": "string",
          "start_date": "string",
          "end_date": "string",
          "description": "string",
          "is_current": boolean
        }
      ],
      "education": [
        {
          "institution": "string",
          "degree": "string",
          "field": "string",
          "graduation_date": "string",
          "gpa": "string"
        }
      ],
      "project": [
        {
          "name": "string",
          "type": "string",
          "description": "string"
        }
      ]
    }`;

    const response = await ai.chat({
      model: "command-r-08-2024",
      message: `Extract data from this resume text:\n\n"${resumeText.slice(0, 30000)}"`,
      preamble: `You are a strict JSON Data Extraction API.
      
      RULES:
      1. Extract data from the text and map it to the provided JSON Schema.
      2. Return ONLY valid JSON.
      3. Do NOT include markdown formatting (like \`\`\`json).
      4. Do NOT add any conversational text.
      5. If a field is missing, use an empty string "" or empty array [].
      
      REQUIRED JSON SCHEMA:
      ${jsonSchema}`,
      temperature: 0, 
    });

    let extractedText = cleanAIResponse(response.text);
    
    let parsedData;
    try {
      parsedData = JSON.parse(extractedText);
    } catch (parseError) {
      return res.status(500).json({ 
        message: "AI failed to format data. Please try uploading a cleaner file." 
      });
    }

    const newResume = await Resume.create({
      userId: userId,
      title: title || "Uploaded Resume",
      ...parsedData,
    });

    return res.status(200).json({ resumeId: newResume._id });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};