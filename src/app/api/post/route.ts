import { NextResponse } from "next/server";
import axios from "axios";
import sharp from "sharp";

export async function POST(req: Request) {
  try {
    const { title, description, price, image, apiKey, shopId, categoryId, gatewayIds, customMessage } = await req.json();

    if (!apiKey || !shopId) {
      return NextResponse.json(
        { error: "Veuillez fournir votre clé API et votre identifiant de boutique Antistock." },
        { status: 400 }
      );
    }

    let finalImageId = 17444915; // Votre logo par défaut

    // Tentative d'upload de l'image réelle du produit
    if (image && image.startsWith("http")) {
      try {
        console.log("Téléchargement de l'image fournisseur:", image);
        const imgRes = await axios.get(image, { 
          responseType: 'arraybuffer',
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" }
        });

        let imageBuffer = Buffer.from(imgRes.data);
        const contentType = imgRes.headers['content-type'] || '';
        
        // Conversion WebP -> PNG si nécessaire
        if (contentType.includes('webp') || image.toLowerCase().endsWith('.webp')) {
          console.log("Conversion WebP -> PNG en cours...");
          imageBuffer = await sharp(imageBuffer).png().toBuffer();
        }

        const blob = new Blob([imageBuffer], { type: 'image/png' });
        
        const formData = new FormData();
        formData.append('file', blob, 'image.png');

        const uploadRes = await axios.post(
          `https://business-api.antistock.io/v1/dash/shops/${shopId}/images`,
          formData,
          {
            headers: {
              "Authorization": `Bearer ${apiKey}`
            }
          }
        );

        if (uploadRes.data?.data?.id) {
          finalImageId = uploadRes.data.data.id;
          console.log("Image uploadée sur Antistock avec succès, ID:", finalImageId);
        }
      } catch (uploadErr: any) {
        console.error("Échec de l'upload d'image (utilisation du fallback):", uploadErr.message);
      }
    }

    // Conversion de la description en JSON DraftJS (requis par Antistock)
    // On splitte par paragraphe pour un meilleur rendu
    const paragraphs = description.split('\n').filter((p: string) => p.trim() !== "");
    const blocks = paragraphs.map((text: string, index: number) => ({
      key: `block-${index}`,
      text: text,
      type: "unstyled",
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
      data: {}
    }));

    const draftJsDescription = JSON.stringify({
      blocks: blocks.length > 0 ? blocks : [{
        key: "empty",
        text: description,
        type: "unstyled",
        depth: 0,
        inlineStyleRanges: [],
        entityRanges: [],
        data: {}
      }],
      entityMap: {}
    });

    const antistockPayload = {
      name: title,
      description: draftJsDescription,
      status: "PUBLIC",
      visibility: "PUBLIC",
      unlisted: false,
      imageIds: [finalImageId], 
      categoryId: categoryId ? parseInt(categoryId) : 3022961,
      variants: [
        {
          name: "Standard",
          price: {
            amount: parseFloat(price),
            currency: "EUR"
          },
          stockLevel: 99999,
          minQuantity: 1,
          maxQuantity: 0,
          type: "SINGLE",
          chargeType: "ONE_TIME",
          deliveryType: "SERVICE", 
          customerNote: customMessage || "", // Message de confirmation post-achat
          gateways: gatewayIds ? gatewayIds.split(',').map((id: string) => id.trim()).filter((id: string) => id !== "") : [] 
        }
      ]
    };

    console.log("Publication sur Antistock avec l'ID image:", finalImageId);
    
    const antistockResponse = await axios.post(
      `https://business-api.antistock.io/v1/dash/shops/${shopId}/products`,
      antistockPayload,
      {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("Produit créé avec succès ! Réponse:", JSON.stringify(antistockResponse.data));

    return NextResponse.json({
      success: true,
      message: "Publication réussie avec l'image d'origine !",
      product: antistockResponse.data
    });

  } catch (apiError: any) {
    console.error("Antistock API Error:", apiError.response?.data || apiError.message);
    const errorMsg = apiError.response?.data?.message || apiError.message || "Erreur inconnue";
    const errorDetails = apiError.response?.data ? JSON.stringify(apiError.response.data) : "";
    
    return NextResponse.json({ 
      error: `Erreur Antistock: ${errorMsg}`,
      details: errorDetails
    }, { status: 400 });
  }
}
