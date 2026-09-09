"use node";

import { GoogleGenAI } from "@google/genai";
import { v } from "convex/values";
import { action } from "./_generated/server";

export const recommendCandidates = action({
  args: {
    prompt: v.string(),
    catalog: v.array(v.any()), // Pass the fetched catalog
  },
  async handler(_ctx, args) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Missing GEMINI_API_KEY environment variable");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const contextData = args.catalog.map((c) => ({
      username: c.username,
      firstName: c.firstName,
      lastName: c.lastName,
      score: c.score,
      badge: c.badge,
      skills: c.resolvedSkills.map((s: { name: string }) => s.name).join(", "),
      experience: c.resolvedExperiences
        .map(
          (e: {
            position: string;
            companyName: string;
            durationYears: number;
          }) => `${e.position} at ${e.companyName} (${e.durationYears}y)`,
        )
        .join("; "),
      bio: c.shortBio,
    }));

    const systemPrompt = `You are an AI IT Recruiter for a community app called Wigxel.
You have access to a catalog of software engineers and UI/UX designers, ranked by their score and badge (Gold, Diamond, Ruby, Sapphire).
Your job is to recommend the best candidates based on the user's prompt. 
Analyze the prompt, then select the most suitable candidates from the catalog below based on their skills and experience.
Format your response in Markdown. Present the recommended candidates in a ranked list. Explain briefly why each candidate is a good fit. 

Here is the current catalog of available candidates:
${JSON.stringify(contextData, null, 2)}
`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          { role: "user", parts: [{ text: systemPrompt }] },
          { role: "user", parts: [{ text: args.prompt }] },
        ],
      });

      return response.text;
    } catch (error) {
      console.error("AI Recommendation Error:", error);
      throw new Error("Failed to generate recommendation");
    }
  },
});
