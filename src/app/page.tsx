"use client";

import { useState, useEffect } from "react";
import { Search, Link as LinkIcon, DollarSign, UploadCloud, CheckCircle, AlertCircle, Loader2, Edit3, Send } from "lucide-react";

type ScrapedData = { title: string; description: string; price: number; image: string };

export default function Home() {
  const [url, setUrl] = useState("");
  const [margin, setMargin] = useState(2);
  const [apiKey, setApiKey] = useState("");
  const [shopId, setShopId] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [result, setResult] = useState<{ success: boolean; message: string; details?: string } | null>(null);

  const fetchCategories = async () => {
    if (!apiKey || !shopId) return;
    try {
      const res = await fetch(`/api/categories?apiKey=${apiKey}&shopId=${shopId}`);
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories || []);
        if (data.categories?.length > 0 && !selectedCategory) {
          setSelectedCategory(data.categories[0].id.toString());
        }
      }
    } catch (err) {
      console.error("Erreur chargement catégories:", err);
    }
  };

  useEffect(() => {
    if (apiKey && shopId) {
      fetchCategories();
    }
  }, [apiKey, shopId]);

  // Étape 1 : Aspiration (Scrape)
  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    setResult(null);
    setScrapedData(null);

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, marginMultiplier: margin }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setScrapedData(data.data);
      } else {
        setResult({ success: false, message: data.error || "Une erreur est survenue lors de l'aspiration." });
      }
    } catch (err: any) {
      setResult({ success: false, message: err.message || "Erreur de connexion au serveur API." });
    } finally {
      setLoading(false);
    }
  };


  // Étape 2 : Publication (Post to Antistock)
  const handlePost = async () => {
    if (!scrapedData) return;
    if (!apiKey || !shopId) {
      setResult({ success: false, message: "Veuillez configurer votre Clé API et votre Shop ID en haut de la page." });
      return;
    }

    setIsPosting(true);
    setResult(null);

    try {
      const response = await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...scrapedData, apiKey, shopId, categoryId: selectedCategory }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult({ success: true, message: "Produit publié avec succès sur votre boutique Antistock !" });
        setScrapedData(null); // Clear form after success
        setUrl("");
      } else {
        setResult({ 
          success: false, 
          message: data.error || "Erreur lors de la publication.",
          details: data.details || ""
        });
      }
    } catch (err: any) {
      setResult({ success: false, message: err.message || "Erreur de connexion serveur pour la publication." });
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-6 font-sans">
      <div className="max-w-2xl w-full bg-[#141414] border border-[#262626] rounded-2xl p-8 shadow-2xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#00D8FF]/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#00D8FF]/30">
            <UploadCloud className="w-8 h-8 text-[#00D8FF]" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">DigiDrop Scraper</h1>
          <p className="text-[#A3A3A3] text-sm">Aspiration & Publication Automatisée en un clic</p>
        </div>

        {/* Global Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pb-6 border-b border-[#262626]">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#A3A3A3]">API Key Antistock</label>
            <input type="password" required value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="sk_live_..." className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl px-4 py-3 focus:outline-none focus:border-[#00D8FF] focus:ring-1 focus:ring-[#00D8FF] transition-all text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#A3A3A3]">Shop ID Antistock</label>
            <input type="text" required value={shopId} onChange={e => setShopId(e.target.value)} placeholder="01234..." className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl px-4 py-3 focus:outline-none focus:border-[#00D8FF] focus:ring-1 focus:ring-[#00D8FF] transition-all text-sm" />
          </div>
        </div>

        {/* Etape 1 : Formulaire Aspiration */}
        {!scrapedData && (
          <form onSubmit={handleScrape} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#A3A3A3] flex items-center gap-2">
                <LinkIcon className="w-4 h-4" /> URL du Produit Z2U
              </label>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.z2u.com/..."
                className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl px-4 py-3 focus:outline-none focus:border-[#00D8FF] focus:ring-1 focus:ring-[#00D8FF] transition-all text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#A3A3A3] flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Multiplicateur de Marge
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.1"
                  value={margin}
                  onChange={(e) => setMargin(parseFloat(e.target.value))}
                  className="w-full cursor-pointer accent-[#00D8FF]"
                />
                <span className="bg-[#0A0A0A] border border-[#262626] px-4 py-2 rounded-lg font-mono font-bold w-20 text-center">
                  x{margin}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00D8FF] hover:opacity-90 text-black font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              {loading ? "Aspiration..." : "1. Aspirer les données"}
            </button>
          </form>
        )}

        {/* Etape 2 : Formulaire Edition (Prévisualisation) */}
        {scrapedData && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold flex items-center gap-2"><Edit3 className="w-5 h-5 text-[#00D8FF]" /> Prévisualisation & Edition</h2>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="space-y-2 flex-1">
                  <label className="text-xs font-semibold text-[#A3A3A3]">Titre du Produit</label>
                  <input 
                    type="text" 
                    value={scrapedData.title} 
                    onChange={(e) => setScrapedData({...scrapedData, title: e.target.value})} 
                    className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg px-3 py-2 text-sm focus:border-[#00D8FF] focus:outline-none" 
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="space-y-2 w-1/3">
                  <label className="text-xs font-semibold text-[#A3A3A3]">Prix (€)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={scrapedData.price} 
                    onChange={(e) => setScrapedData({...scrapedData, price: parseFloat(e.target.value)})} 
                    className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg px-3 py-2 text-sm font-mono focus:border-[#00D8FF] focus:outline-none text-[#00D8FF]" 
                  />
                </div>
                <div className="space-y-2 w-2/3">
                  <label className="text-xs font-semibold text-[#A3A3A3]">Catégorie Antistock</label>
                  <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg px-3 py-2 text-sm focus:border-[#00D8FF] focus:outline-none cursor-pointer"
                  >
                    {categories.length === 0 && <option value="">Chargement...</option>}
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#A3A3A3]">Image URL</label>
                <input 
                  type="text" 
                  value={scrapedData.image} 
                  onChange={(e) => setScrapedData({...scrapedData, image: e.target.value})} 
                  className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg px-3 py-2 text-sm focus:border-[#00D8FF] focus:outline-none" 
                />
              </div>

              <div className="space-y-2">
                <textarea 
                  rows={4} 
                  value={scrapedData.description} 
                  onChange={(e) => setScrapedData({...scrapedData, description: e.target.value})} 
                  className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg px-3 py-2 text-sm focus:border-[#00D8FF] focus:outline-none resize-none" 
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-[#262626]">
              <button
                onClick={() => setScrapedData(null)}
                className="w-1/3 bg-[#0A0A0A] border border-[#262626] hover:bg-[#1A1A1A] text-white font-bold py-4 rounded-xl transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handlePost}
                disabled={isPosting}
                className="w-2/3 bg-gradient-to-r from-[#00D8FF] to-[#A13DFF] hover:opacity-90 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(161,61,255,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isPosting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {isPosting ? "Publication..." : "2. Publier définitivement"}
              </button>
            </div>
          </div>
        )}

        {/* Results Message */}
        {result && !scrapedData && (
          <div className="mt-6 p-4 rounded-xl border flex items-start gap-4 bg-green-500/10 border-green-500/30 text-green-400">
            {result.success ? <CheckCircle className="w-6 h-6 flex-shrink-0" /> : <AlertCircle className="w-6 h-6 flex-shrink-0 text-red-400" />}
            <div>
              <p className={`font-semibold text-sm ${!result.success && 'text-red-400'}`}>{result.message}</p>
              {result.details && <p className="text-xs mt-1 text-red-300 opacity-80">{result.details}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
