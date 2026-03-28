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

    // ---------------------------------------------------------
    // STRATÉGIE GÉNÉRIQUE D'ASPIRATION (Universelle)
    // ---------------------------------------------------------

    // 1. TITRE
    let title = $('meta[property="og:title"]').attr("content") || 
                $('meta[name="twitter:title"]').attr("content") || 
                $("h1").first().text().trim() || 
                $("title").first().text().trim() || 
                "Produit sans titre";
    
    // 2. IMAGE
    let image = $('meta[property="og:image"]').attr("content") || $('meta[name="twitter:image"]').attr("content") || "";
    
    if (!image || image.length < 5) {
      // Approche générique: chercher une image liée au "produit" via les attributs
      $("img").each((i, el) => {
        const src = $(el).attr("src") || "";
        const className = $(el).attr("class") || "";
        const idName = $(el).attr("id") || "";
        const combined = (src + className + idName).toLowerCase();
        
        if (combined.includes("product") || combined.includes("main") || combined.includes("item") || combined.includes("gallery") || combined.includes("amazonimage")) {
           if(src.startsWith("http")) {
               image = src;
               return false;
           }
        }
      });
      // Fallback absolu: la première image valide de la page
      if (!image) {
          image = $('img').filter((i, el) => ($(el).attr('src') || '').startsWith('http')).first().attr('src') || "";
      }
    }

    // 3. DESCRIPTION (L'algorithme du bloc le plus long)
    let description = "";
    
    // Étape A : Filtrer tous les éléments dont le nom évoque une description
    $("*").each((i, el) => {
       const className = $(el).attr("class") || "";
       const idName = $(el).attr("id") || "";
       const combined = (className + idName).toLowerCase();
       
       if (combined.includes("desc") || combined.includes("detail") || combined.includes("info")) {
           const text = $(el).text().trim();
           // On garde le bloc contenant le plus long texte (évite de cibler juste un titre "Description")
           if (text.length > 50 && text.length > description.length) {
               description = text; 
           }
       }
    });

    // Étape B : Si échoue, chercher le plus long paragraphe classique rédigé
    if (!description || description.length < 50) {
        $("p").each((i, el) => {
           const text = $(el).text().trim();
           if (text.length > description.length) {
               description = text;
           }
        });
    }

    // Étape C : Dernier recours SEO
    if (!description || description.length < 50) {
       description = $('meta[property="og:description"]').attr("content") || 
                     $("meta[name='description']").attr("content") || 
                     "Veuillez taper votre propre description ici.";
    }

    // Nettoyage: enlever les centaines d'espaces / sauts de lignes illisibles
    description = description.replace(/\n\s*\n/g, '\n\n').replace(/\s{3,}/g, '\n').trim();
    
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
