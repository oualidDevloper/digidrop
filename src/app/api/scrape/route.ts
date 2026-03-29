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
    // STRATÉGIE D'ASPIRATION (Z2U & UNIVERSELLE)
    // ---------------------------------------------------------

    // 1. TITRE
    let title = $('meta[property="og:title"]').attr("content") || 
                $('meta[name="twitter:title"]').attr("content") || 
                $("h1").first().text().trim() || 
                $("title").first().text().trim() || 
                "Produit sans titre";
    
    // Nettoyage spécial Z2U: Enlever "Z2U.com" ou autres suffixes
    title = title.replace(/\s*-\s*Z2U\.com/gi, "").trim();

    // 2. IMAGE
    let image = $('meta[property="og:image"]').attr("content") || 
                $('meta[name="twitter:image"]').attr("content") || 
                "";
    
    // Fallback Z2U spécifique
    if (url.includes("z2u.com")) {
      const z2uImg = $(".productPhoto img").first().attr("src") ||
                     $(".goods-info-pic img").first().attr("src") || 
                     $(".product-img-main img").first().attr("src") || 
                     $(".goods-img img").first().attr("src") ||
                     $(".goods-info-img img").first().attr("src");
      if (z2uImg) image = z2uImg;
    }

    if (!image || image.length < 5) {
      // Approche générique: chercher une image liée au "produit" via les attributs
      $("img").each((i, el) => {
        const src = $(el).attr("src") || "";
        const className = $(el).attr("class") || "";
        const idName = $(el).attr("id") || "";
        const combined = (src + className + idName).toLowerCase();
        
        if (combined.includes("product") || combined.includes("main") || combined.includes("item") || combined.includes("gallery") || combined.includes("amazonimage")) {
           if(src.startsWith("http") || src.startsWith("//")) {
               image = src;
               return false;
           }
        }
      });
      
      // Fallback absolu: la première image valide de la page
      if (!image) {
          image = $('img').filter((i, el) => {
            const s = $(el).attr('src') || '';
            return s.startsWith('http') || s.startsWith('//');
          }).first().attr('src') || "";
      }
    }

    // Normalisation de l'URL
    if (image && image.startsWith("//")) {
      image = "https:" + image;
    }

    // 3. DESCRIPTION
    let description = "";
    
    // Étape A : Filtrer tous les éléments dont le nom évoque une description
    $("*").each((i, el) => {
       const className = $(el).attr("class") || "";
       const idName = $(el).attr("id") || "";
       const combined = (className + idName).toLowerCase();
       
       if (combined.includes("desc") || combined.includes("detail") || combined.includes("info")) {
           const text = $(el).text().trim();
           if (text.length > 50 && text.length > description.length) {
               description = text; 
           }
       }
    });

    // Étape B : Si échoue ou Z2U spécifique
    if (!description || description.length < 50) {
        description = $(".product-description").text().trim() || 
                      $(".goods-info-detail").text().trim() || 
                      "";
    }

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

    // Nettoyage
    description = description.replace(/\n\s*\n/g, '\n\n').replace(/\s{3,}/g, '\n').trim();
    
    if (!title) title = "Produit importé";

    // 4. PRIX
    let rawPrice = "0";
    
    // Sélecteurs spécifiques Z2U
    if (url.includes("z2u.com")) {
        const z2uPrice = $(".goods-price-num").first().text() || $(".price").first().text();
        if (z2uPrice) rawPrice = z2uPrice.replace(/[^0-9.,]/g, "").replace(",", ".");
    }
    
    // Fallback générique
    if (parseFloat(rawPrice) <= 0) {
        const priceText = $('[class*="price"], [id*="price"]').first().text().replace(/[^0-9.,]/g, "").replace(",", ".");
        if (priceText) {
          const parsed = parseFloat(priceText);
          if (!isNaN(parsed)) rawPrice = parsed.toString();
        }
    }

    const basePrice = parseFloat(rawPrice) > 0 ? parseFloat(rawPrice) : 5.00; 
    const finalPrice = parseFloat((basePrice * marginMultiplier).toFixed(2));

    return NextResponse.json({
      success: true,
      data: {
        title,
        description: description.substring(0, 1000), // Limiter pour l'API
        price: finalPrice,
        image
      }
    });


  } catch (error: any) {
    console.error("Scraping error:", error.message);
    return NextResponse.json({ error: error.message || "Erreur lors du scraping du site fournisseur." }, { status: 500 });
  }
}
