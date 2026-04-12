import { NextResponse } from "next/server";
import axios from "axios";
import sharp from "sharp";

export async function POST(req: Request) {
  try {
    const { title, description, price, image, apiKey, shopId, categoryId } = await req.json();

    if (!apiKey || !shopId) {
      return NextResponse.json(
        { error: "Veuillez fournir votre clé API et votre identifiant de boutique Antistock." },
        { status: 400 }
      );
    }

    // 1. Récupération des données de la boutique en arrière-plan (Catégories et Gateways)
    let autoCategoryId = 3022951; // Fallback "All" ou "Streaming"
    let autoGatewayIds: number[] = [];
    const defaultMsg = "Dear Customer,\n\nThank you for your purchase! Your order has been successfully confirmed.\n\nYou will receive another email within a maximum of 24 hours containing your access details and instructions.\n\nIf you have any questions in the meantime, please feel free to contact us.\n\nThank you for your trust!\n\nBest regards,";

    try {
      console.log("Extraction des paramètres de la boutique (Gateways)...");
      const payRes = await axios.get(`https://business-api.antistock.io/v1/dash/shops/${shopId}/settings/payments`, {
        headers: { "Authorization": `Bearer ${apiKey}` }
      });
      const gateways = payRes.data.data?.paymentsGateways || [];
      autoGatewayIds = gateways.filter((g: any) => g.status === "ACTIVE").map((g: any) => ({ gateway: g.gatewayName || g.name }));

      if (categoryId) {
        autoCategoryId = parseInt(categoryId);
        console.log(`Utilisation de la catégorie sélectionnée : ${autoCategoryId}`);
      } else {
        console.log("Détection automatique de la catégorie...");
        const catRes = await axios.get(`https://business-api.antistock.io/v1/dash/shops/${shopId}/categories`, {
          headers: { "Authorization": `Bearer ${apiKey}` }
        });

        // Système de correspondance intelligente (Smart Matching)
        const categories = catRes.data.data || [];
        const titleLower = title.toLowerCase();
        
        const smartMatch = categories.find((c: any) => {
          const catNameLower = c.name.toLowerCase();
          return titleLower.includes(catNameLower) || catNameLower.includes(titleLower.split(' ')[0]);
        });

        if (smartMatch) {
          autoCategoryId = smartMatch.id;
        } else {
          const fallbackCat = categories.find((c: any) => 
            c.name.toLowerCase().includes("streaming") || 
            c.name.toLowerCase().includes("all")
          );
          if (fallbackCat) autoCategoryId = fallbackCat.id;
          else if (categories.length > 0) autoCategoryId = categories[0].id;
        }
      }
    } catch (fetchErr: any) {
      console.warn("Échec de l'auto-détection :", fetchErr.message);
    }

    let finalImageId = 17444915; // Votre logo par défaut
    // ... rest of image upload logic ...
    if (image && image.startsWith("http")) {
      try {
        console.log("Téléchargement de l'image fournisseur:", image);
        const imgRes = await axios.get(image, { 
          responseType: 'arraybuffer',
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" }
        });
        let imageBuffer = Buffer.from(imgRes.data);
        const contentType = imgRes.headers['content-type'] || '';
        if (contentType.includes('webp') || image.toLowerCase().endsWith('.webp')) {
          imageBuffer = await sharp(imageBuffer).png().toBuffer();
        }
        const blob = new Blob([imageBuffer], { type: 'image/png' });
        const formData = new FormData();
        formData.append('file', blob, 'image.png');
        const uploadRes = await axios.post(`https://business-api.antistock.io/v1/dash/shops/${shopId}/images`, formData, {
          headers: { "Authorization": `Bearer ${apiKey}` }
        });
        if (uploadRes.data?.data?.id) finalImageId = uploadRes.data.data.id;
      } catch (e) {}
    }

    const paragraphs = description.split('\n').filter((p: string) => p.trim() !== "");
    const blocks = paragraphs.map((text: string, index: number) => ({
      key: `block-${index}`, text, type: "unstyled", depth: 0, inlineStyleRanges: [], entityRanges: [], data: {}
    }));

    const antistockPayload = {
      name: title,
      description: JSON.stringify({
        blocks: blocks.length > 0 ? blocks : [{ key: "e", text: description, type: "unstyled", depth: 0, inlineStyleRanges: [], entityRanges: [], data: {} }],
        entityMap: {}
      }),
      status: "PUBLIC",
      visibility: "PUBLIC",
      unlisted: false,
      ImageIds: [finalImageId], 
      categoryId: autoCategoryId,
      variants: [
        {
          name: "Standard",
          price: { amount: parseFloat(price), currency: "USD" },
          minQuantity: 1,
          maxQuantity: 0,
          chargeType: "ONE_TIME",
          deliveryType: "PRESET", 
          customerNote: defaultMsg,
          deliveryConfigurations: {
            warehouseId: 2151518,
            limitStock: 1,
            displayStock: false
          },
          gateways: autoGatewayIds 
        }
      ]
    };

    console.log("Publication finale automatisée...");
    const antistockResponse = await axios.post(
      `https://business-api.antistock.io/v1/dash/shops/${shopId}/products`,
      antistockPayload,
      { headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" } }
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
