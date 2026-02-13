
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getAIAssistance = async (prompt: string, context: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Context: ${context}\n\nUser Question: ${prompt}`,
      config: {
        systemInstruction: "Eres un asistente experto de ReservaYa, una plataforma de gestión de turnos. Ayudas a proveedores a mejorar sus servicios y a clientes a encontrar lo que necesitan de forma amable y eficiente. Responde en español de forma concisa.",
        temperature: 0.7,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Lo siento, tuve un problema al procesar tu solicitud.";
  }
};

export const generateServiceDescription = async (serviceName: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Genera una descripción profesional y atractiva para un servicio llamado: ${serviceName}`,
      config: {
        systemInstruction: "Eres un redactor creativo experto en marketing para servicios. Crea una descripción corta (máximo 2 párrafos) que resalte el valor del servicio.",
        temperature: 0.9,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "";
  }
};
