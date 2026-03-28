import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

export async function POST(req: Request) {
  try {
    const { url, marginMultiplier } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "L'URL est requise." }, { status: 400 });
    }

    const { data: html } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    
    const $ = cheerio.load(html);

    let title = $('meta[property="og:title"]').attr("content") || $("h1").first().text().trim();
    let description = $('meta[property="og:description"]').attr("content") || $("meta[name='description']").attr("content") || "Produit importé automatiquement.";
    let image = $('meta[property="og:image"]').attr("content") || "";
    
    if (!title) {
        title = "Produit importé (Titre introuvable)";
    }

    let rawPrice = "0";
    const priceText = $('[class*="price"], [id*="price"]').first().text().replace(/[^0-9.,]/g, "").replace(",", ".");
    if (priceText) {
      const parsed = parseFloat(priceText);
      if (!isNaN(parsed)) rawPrice = parsed.toString();
    }

    const basePrice = parseFloat(rawPrice) > 0 ? parseFloat(rawPrice) : 5.00; 
    const finalPrice = parseFloat((basePrice * marginMultiplier).toFixed(2));

    return NextResponse.json({
      success: true,
      data: {
        title,
        description,
        price: finalPrice,
        image
      }
    });

  } catch (error: any) {
    console.error("Scraping error:", error.message);
    return NextResponse.json({ error: error.message || "Erreur lors du scraping du site fournisseur." }, { status: 500 });
  }
}
