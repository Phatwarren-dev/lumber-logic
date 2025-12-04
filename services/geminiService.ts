import { GoogleGenAI, Type, Schema } from "@google/genai";
import { FinishedPart, RawStock, Settings, OptimizationResult } from "../types";

const mapUnit = (unit: string) => unit === 'mm' ? 'millimeters' : 'inches';

export const calculateLumberPlan = async (
  parts: FinishedPart[],
  stocks: RawStock[],
  settings: Settings
): Promise<OptimizationResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing in environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    I am a furniture maker. I have a list of FINISHED parts I need to make, and a list of RAW LUMBER sizes available to buy.
    
    Please calculate the optimal shopping list of raw lumber to minimize waste.
    
    CRITICAL RULES:

    1. STOCK SELECTION (IMPORTANT):
       - The list of "Available Raw Stock" is a CATALOG of what I *can* buy. 
       - You do NOT need to use every type of raw stock listed. 
       - SELECT ONLY the raw stock sizes that result in the most efficient yield (lowest waste) for the parts needed.
       - If a certain raw stock size is inefficient for the required parts, IGNORE IT.

    2. DIMENSION MATCHING & GLUING (ADVANCED):
       - LENGTH: You CANNOT glue for length. Raw stock Length must be >= Finished Length.
       - WIDTH & THICKNESS: You CAN and SHOULD glue pieces together (laminate) if the raw stock is too narrow/thin.
       
       **OFFCUT REUSE LOGIC (CRITICAL FOR SAVING WOOD):**
       When you glue raw strips to create a wider block, you often generate a usable offcut. You MUST reuse this offcut for the next part.
       
       EXAMPLE SCENARIO:
       - Need: 2 parts, each 90mm wide.
       - Raw Stock: 70mm wide.
       - Width Allowance: 5mm (So target width before machining is 95mm).
       
       *BAD WAY (No Reuse):*
         - Part A: 70mm + 70mm = 140mm. Machine to 90mm. (Waste 45mm).
         - Part B: 70mm + 70mm = 140mm. Machine to 90mm. (Waste 45mm).
         - Result: Uses 4 raw strips.
         
       *OPTIMIZED WAY (Reuse):*
         - Part A: 70mm + 70mm = 140mm. Machine to 90mm. 
         - **Generated Offcut**: 140mm - 95mm (finished+allowance) = 45mm usable strip.
         - Part B: 70mm (new) + 45mm (offcut from A) = 115mm. 
         - Check: 115mm >= 95mm (required). Yes.
         - Result: Uses 3 raw strips (saving 1 strip).
         
       INSTRUCTION:
       - Calculate the optimal combination of raw strips to achieve (Finished Size + Allowance).
       - If you split a part for gluing (lamination), append " (Glue Layer)" to the part name.
       
       **NEGATIVE CONSTRAINT (STRICT):**
       - DO NOT append " (Glue Layer)" if the part fits inside a single piece of raw stock (i.e., Raw Width >= Finished Width). 
       - Even if you rip a 70mm board down to 50mm, that is NOT a glue layer. That is just a normal cut.
       - ONLY use " (Glue Layer)" if you are PHYSICALLY GLUING multiple pieces together to make that specific part.

    3. FIT CHECKING (ALLOWANCE):
       - "Allowance" is the extra material reserved for planing/machining.
         * Thickness Allowance: ${settings.thicknessAllowance}
         * Width Allowance: ${settings.widthAllowance}
       - CONSTRAINT:
         * For Single Board: Raw >= Finished + Allowance.
         * For Glued Block: Sum(Raw Strips) >= Finished + Allowance.
       - RELAXED MATCHING:
         * If the board or glued block is physically larger than the finished size, but slightly smaller than (Finished + Allowance), YOU CAN STILL USE IT if it's the only option. Prefer the full allowance, but accept a tight fit (Raw >= Finished) if necessary.

    4. CUTTING (LENGTH):
       - We cut along the length. 
       - Total length used = Sum of (Finished Length * Quantity) + (Saw Blade Kerf * (Quantity - 1)).
       - The kerf is ${settings.kerf}.
       
    5. OUTPUT:
       - Determine how many of each raw board type are needed.
       - Provide a cutting plan.
    
    Units are in ${mapUnit(settings.unit)}.

    Finished Parts Needed:
    ${JSON.stringify(parts)}

    Available Raw Stock:
    ${JSON.stringify(stocks)}
  `;

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      plan: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            rawStockName: { type: Type.STRING },
            dimensions: {
              type: Type.OBJECT,
              properties: {
                thickness: { type: Type.NUMBER },
                width: { type: Type.NUMBER },
                length: { type: Type.NUMBER },
              }
            },
            quantityNeeded: { type: Type.NUMBER },
            waste: { type: Type.NUMBER, description: "Total waste length for this batch of boards" },
            cuts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  partName: { type: Type.STRING },
                  length: { type: Type.NUMBER },
                  count: { type: Type.NUMBER },
                }
              }
            }
          }
        }
      },
      unmatchableParts: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List names of parts that could not fit into any available raw stock even with gluing or relaxed allowance."
      },
      totalRawVolume: { type: Type.NUMBER }
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.1, // Low temperature for deterministic logic
        systemInstruction: "You are an expert material optimizer algorithm for woodworking. Your goal is to MINIMIZE TOTAL COST and WASTE. You must select the most appropriate raw stock for each part from the provided list. Do not use a stock size if it generates excessive waste compared to another option. Strictly distinguish between 'Glue Layers' and 'Solid Parts'."
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as OptimizationResult;

  } catch (error) {
    console.error("Gemini Optimization Error:", error);
    throw error;
  }
};