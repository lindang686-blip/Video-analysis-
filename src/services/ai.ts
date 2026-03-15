import { GoogleGenAI, Type, Modality } from "@google/genai";
import { LearningPoint } from "../store";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('Missing GEMINI_API_KEY');
}

const ai = new GoogleGenAI({ apiKey });

const MOCK_SUBTITLES = [
  "I was gonna to the store, but I ain't got no money.",
  "He is very much happy today.",
  "Let's touch base offline about this.",
  "I'm chuffed to bits about the new flat.",
  "That's a piece of cake.",
  "Could you borrow me your pen?"
];

export const generateLearningPoint = async (timestamp: number): Promise<Omit<LearningPoint, 'id'> | null> => {
  try {
    const subtitle = MOCK_SUBTITLES[Math.floor(Math.random() * MOCK_SUBTITLES.length)];

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an expert English tutor analyzing a video transcript.
      The current subtitle is: "${subtitle}"
      
      Generate a learning point based on this subtitle or a hypothetical context around it.
      The learning point MUST be one of these types:
      - 'phrase' / 'collocation' / 'chunk': Extract a useful phrase or chunk.
      - 'grammar_correction': Correct a grammatical mistake made by the speaker (e.g., "borrow me" -> "lend me").
      - 'authentic_replacement': Replace a clunky/Chinglish/unnatural phrase with a native, authentic expression.
      - 'native_expression': Highlight a very native idiom used.

      Include:
      1. The main content (the phrase, or the corrected grammar).
      2. Detailed explanation.
      3. A specific example sentence from a popular TV show/movie.
      4. If applicable, explain the difference between UK and US English usage (ukUsDifference).
      5. If it's a correction or replacement, provide the 'originalText' and 'correctedText'.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: {
              type: Type.STRING,
              enum: ['grammar', 'collocation', 'phrase', 'native_expression', 'useful_word', 'culture', 'grammar_correction', 'authentic_replacement'],
              description: "The type of learning point."
            },
            content: {
              type: Type.STRING,
              description: "The main word, phrase, or grammar point."
            },
            explanation: {
              type: Type.STRING,
              description: "Detailed explanation."
            },
            example: {
              type: Type.STRING,
              description: "An example sentence from a popular TV show or movie."
            },
            originalText: {
              type: Type.STRING,
              description: "If correcting grammar or replacing with authentic expression, the original clunky/wrong text."
            },
            correctedText: {
              type: Type.STRING,
              description: "The corrected or more authentic native expression."
            },
            ukUsDifference: {
              type: Type.STRING,
              description: "Explanation of UK vs US differences for this point, if any."
            }
          },
          required: ['type', 'content', 'explanation', 'example']
        }
      }
    });

    const data = JSON.parse(response.text || "{}");

    return {
      type: data.type || 'useful_word',
      timestamp,
      content: data.content || 'Unknown',
      explanation: data.explanation || 'No explanation provided.',
      example: data.example || 'No example provided.',
      originalText: data.originalText,
      correctedText: data.correctedText,
      ukUsDifference: data.ukUsDifference,
      subtitle: subtitle
    };
  } catch (error) {
    console.error("AI Generation Error:", error);
    return null;
  }
};

export const chatWithAI = async (context: LearningPoint, message: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Context: Learning point about "${context.content}" (${context.type}). Explanation: ${context.explanation}. Example: ${context.example}. User asks: ${message}`,
    });
    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("AI Chat Error:", error);
    return "An error occurred while communicating with the AI.";
  }
};

export const generateHermionePodcast = async (points: LearningPoint[]): Promise<string> => {
  try {
    const pointsText = points.map(p => `${p.content}: ${p.explanation}`).join('\n');
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are Hermione Granger from Harry Potter. Create a short, engaging podcast script reviewing these English learning points. Use British English and your characteristic tone (smart, slightly bossy but helpful). Points:\n${pointsText}`,
    });
    return response.text || "Podcast generation failed.";
  } catch (error) {
    console.error("Podcast Generation Error:", error);
    return "Failed to generate podcast script.";
  }
};

export const generateAudio = async (text: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Closest to a clear female voice available
          },
        },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio ? `data:audio/mp3;base64,${base64Audio}` : null;
  } catch (error) {
    console.error("Audio Generation Error:", error);
    return null;
  }
};
