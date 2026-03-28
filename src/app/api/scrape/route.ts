import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

export async function POST(req: Request) {
  try {
    const { url, marginMultiplier, apiKey, shopId } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "L'URL est requise." }, { status: 400 });
    }

    if (!apiKey || !shopId) {
      return NextResponse.json(
        { error: "Veuillez fournir votre clé API et votre identifiant de boutique Antistock." },
        { status: 400 }
      );
    }

    // 1. Aspiration des données du fournisseur
    const { data: html } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    
    const $ = cheerio.load(html);

    // Extraction générique (peut nécessiter d'être adaptée selon le site fournisseur spécifique)
    let title = $('meta[property="og:title"]').attr("content") || $("h1").first().text().trim();
    let description = $('meta[property="og:description"]').attr("content") || $("meta[name='description']").attr("content") || "Produit importé automatiquement.";
    let image = $('meta[property="og:image"]').attr("content") || "";
    
    if (!title) {
        title = "Produit importé (Titre introuvable)";
    }

    // Récupération du prix (Tentative générique - cherchons des symboles ou classes classiques)
    let rawPrice = "0";
    const priceText = $('[class*="price"], [id*="price"]').first().text().replace(/[^0-9.,]/g, "").replace(",", ".");
    if (priceText) {
      const parsed = parseFloat(priceText);
      if (!isNaN(parsed)) rawPrice = parsed.toString();
    }

    // On force un prix minimal pour éviter les bugs si le scraping de prix échoue
    const basePrice = parseFloat(rawPrice) > 0 ? parseFloat(rawPrice) : 5.00; 

    // 2. Application de la Marge
    const finalPrice = parseFloat((basePrice * marginMultiplier).toFixed(2));

    // 3. Envoi vers Antistock API
    const antistockPayload = {
      title: title,
      description: description,
      price: finalPrice,
      currency: "EUR",
      productType: "SERVICE", // Mode Dropshipping (pas de stock requis)
      thumbnailInfo: image ? { url: image } : undefined,
      visibility: "PUBLIC"
    };

    // Envoi réel à Antistock
    try {
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
        message: "Scraping et publication réussis sur Antistock !",
        title,
        finalPrice,
        product: antistockResponse.data
      });
    } catch (apiError: any) {
      console.error("Antistock API Error:", apiError.response?.data || apiError.message);
      return NextResponse.json({ 
        error: `Erreur Antistock: ${apiError.response?.data?.message || "Clé API ou Shop ID invalide."}` 
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error("Scraping error:", error.message);
    return NextResponse.json({ error: error.message || "Erreur lors du scraping du site fournisseur." }, { status: 500 });
  }
}
