import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const { title, description, price, image, apiKey, shopId } = await req.json();

    if (!apiKey || !shopId) {
      return NextResponse.json(
        { error: "Veuillez fournir votre clé API et votre identifiant de boutique Antistock." },
        { status: 400 }
      );
    }

    const antistockPayload = {
      title,
      description,
      price: parseFloat(price),
      currency: "EUR",
      productType: "SERVICE", // Mode Dropshipping
      thumbnailInfo: image ? { url: image } : undefined,
      visibility: "PUBLIC",
      seo: { title, description }
    };

    const antistockResponse = await axios.post(
      `https://api.sellpass.io/v1/dash/shops/${shopId}/products`,
      antistockPayload,
      {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: "Publication réussie sur Antistock !",
      product: antistockResponse.data
    });

  } catch (apiError: any) {
    console.error("Antistock API Error:", apiError.response?.data || apiError.message);
    return NextResponse.json({ 
      error: `Erreur Antistock: ${apiError.response?.data?.message || "Clé API ou Shop ID invalide."}` 
    }, { status: 400 });
  }
}
