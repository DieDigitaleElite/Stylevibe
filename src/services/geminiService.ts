import { GoogleGenAI } from "@google/genai";
import { StyleType, StylingResult, Product } from "../types";

async function resizeImage(base64Str: string, maxWidth = 800, maxHeight = 800): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
  });
}

export async function generateVirtualTryOn(
  base64Image: string,
  style: StyleType,
  fullMakeover: boolean = false
): Promise<StylingResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("API-Key fehlt. Bitte stelle sicher, dass GEMINI_API_KEY in den Umgebungsvariablen (z.B. in Vercel) gesetzt ist.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-2.5-flash-image";

  const resizedImage = await resizeImage(base64Image);
  const base64Data = resizedImage.split(',')[1];

  const prompt = `
    STYLING-ANWEISUNG:
    Führe ein virtuelles Try-On durch, indem du NUR die Kleidung (und optional Haare/Make-up) änderst.
    
    KRITISCHE REGEL - GESICHTS-IDENTITÄT:
    Das Gesicht der Person darf unter KEINEN Umständen verändert werden. 
    - Kopiere das Gesicht 1:1 aus dem Originalbild.
    - Ändere KEINE Gesichtszüge, Augenfarbe, Nasenform oder Lippen.
    - Führe KEINE "Verschönerung" (Beautification) durch, die die Identität verändert.
    - Die Person muss im Ergebnis exakt so aussehen wie auf dem Originalfoto.
    
    ${fullMakeover ? `
    KOMPLETTES UMSTYLING (NUR HAARE & MAKE-UP):
    1. Ändere die Frisur passend zum ${style}-Stil.
    2. Füge Make-up hinzu, aber achte darauf, dass die darunterliegenden Gesichtszüge identisch bleiben.
    ` : `
    STRENGES OUTFIT-ONLY:
    1. Behalte Gesicht, Haare, Kopf und Pose EXAKT so bei, wie sie im Original sind.
    2. Ändere ausschließlich die Kleidung.
    `}
    
    OUTFIT-TRANSFORMATION:
    1. Ersetze die Kleidung durch ein High-Fashion "${style}" Outfit.
    2. Das Ergebnis muss fotorealistisch sein und wie ein echtes Foto wirken.
    3. Gib einen kurzen Styling-Tipp auf Deutsch ab.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: "image/jpeg",
            },
          },
          { text: prompt },
        ],
      },
    });

    if (!response.candidates?.[0]?.content?.parts) {
      throw new Error("Keine Antwort vom KI-Stylisten erhalten.");
    }

    let editedImageUrl = "";
    let description = "";

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        editedImageUrl = `data:image/png;base64,${part.inlineData.data}`;
      } else if (part.text) {
        description += part.text;
      }
    }

    if (!editedImageUrl) {
      throw new Error("Das gestylte Bild konnte nicht generiert werden.");
    }

    // Schnelle Generierung von passenden (simulierten) Produkten für maximale Geschwindigkeit
    const recommendations: Product[] = [
      {
        id: "1",
        name: `${style} Statement Piece`,
        brand: "StyleVibe Elite",
        price: "€129.00",
        image: `https://picsum.photos/seed/${style}-1/400/500`,
        affiliateUrl: `https://www.google.com/search?q=${encodeURIComponent(style + " fashion shop")}`,
        category: "Kleidung"
      },
      {
        id: "2",
        name: "Premium Accessoire",
        brand: "VibeBasic",
        price: "€49.00",
        image: `https://picsum.photos/seed/${style}-2/400/500`,
        affiliateUrl: `https://www.google.com/search?q=${encodeURIComponent(style + " accessories")}`,
        category: "Accessoires"
      }
    ];

    return {
      imageUrl: editedImageUrl,
      description: description.trim() || `Dein ${style}-Look ist fertig!`,
      recommendations
    };
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error("Der KI-Stylist ist gerade überlastet. Bitte versuche es gleich noch einmal.");
  }
}
