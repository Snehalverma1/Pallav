import { GoogleGenAI, Chat } from "@google/genai";
import { Property, ChatMessage } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing from environment variables.");
    throw new Error("API Key missing");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Generates a response based on the property context and user query.
 */
export const sendPropertyChatMessage = async (
  property: Property,
  history: ChatMessage[],
  newMessage: string
): Promise<string> => {
  try {
    const ai = getAiClient();
    
    const propertyContext = `
      PROPERTY DATA:
      Title: ${property.title}
      Price: $${property.price.toLocaleString()}
      Address: ${property.address}
      Stats: ${property.bedrooms} Beds, ${property.bathrooms} Baths, ${property.sqft} Sqft.
      Description: ${property.description}
    `;

    const systemInstruction = `
      You are a helpful real estate assistant.
      
      ADMIN INSTRUCTIONS (Behave according to this):
      "${property.aiSystemInstruction}"
      
      CONTEXT (Use this data to answer):
      ${propertyContext}
      
      RULES:
      1. If the user asks something not in the context, politely say you don't know or defer to the agent.
      2. Keep answers concise and professional unless the Admin Instructions say otherwise.
    `;

    const chat: Chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: systemInstruction,
        temperature: property.aiTemperature || 0.7,
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "I'm sorry, I couldn't generate a response.";
    
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I am having trouble connecting to the AI service right now.";
  }
};

/**
 * THE GLOBAL GUIDE
 * This agent knows where the user is (Gallery vs Property) and helps accordingly.
 */
export const sendGlobalAgentMessage = async (
  currentView: string,
  currentProperty: Property | undefined,
  allProperties: Property[],
  history: ChatMessage[],
  newMessage: string
): Promise<string> => {
  try {
    const ai = getAiClient();

    let context = "";
    let systemInstruction = "";

    if (currentView === 'USER_GALLERY') {
      const listingsSummary = allProperties.map(p => 
        `- ${p.title}: $${(p.price/1000).toFixed(0)}k, ${p.bedrooms}bd/${p.bathrooms}ba in ${p.address}`
      ).join('\n');

      context = `
        USER LOCATION: Browsing the Property Gallery.
        AVAILABLE LISTINGS:
        ${listingsSummary}
      `;
      
      systemInstruction = `
        You are "Eve", the lead concierge for EstateAI. 
        You are welcoming, professional, and helpful.
        
        YOUR GOAL: Help the user filter through the list of properties. Ask them about their budget, preferred location, or bedroom count.
        
        CONTEXT:
        ${context}

        INSTRUCTIONS:
        1. Keep responses short (under 2 sentences) as you are chatting in a small bubble.
        2. If they ask for a specific type of house, recommend one from the AVAILABLE LISTINGS list.
        3. Be enthusiastic.
      `;

    } else if (currentView === 'USER_PROPERTY' && currentProperty) {
      context = `
        USER LOCATION: Viewing details of "${currentProperty.title}".
        PROPERTY DETAILS:
        Price: $${currentProperty.price}
        Address: ${currentProperty.address}
        Desc: ${currentProperty.description}
      `;

      systemInstruction = `
        You are "Eve", the lead concierge for EstateAI.
        
        YOUR GOAL: The user is looking at a specific house. Highlight its best features.
        
        CONTEXT:
        ${context}
        
        INSTRUCTIONS:
        1. Act as if you are standing right next to the user.
        2. Keep it conversational and brief.
        3. Mention the "Admin's Sales Pitch": "${currentProperty.aiSystemInstruction}".
      `;
    } else {
      systemInstruction = "You are a helpful assistant.";
    }

    const chat: Chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "I'm listening...";

  } catch (error) {
    console.error(error);
    return "I'm having trouble connecting to headquarters.";
  }
};