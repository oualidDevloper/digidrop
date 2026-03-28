"use client";

import { useState } from "react";
import { Search, Link as LinkIcon, DollarSign, UploadCloud, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [margin, setMargin] = useState(2);
  const [apiKey, setApiKey] = useState("");
  const [shopId, setShopId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; data?: any } | null>(null);

  const handleScrapeAndPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    setResult(null);

    try {
      // Step 1: Trigger our backend scraping + posting route
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, marginMultiplier: margin, apiKey, shopId }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult({ success: true, message: "Produit importé avec succès sur Antistock !", data });
      } else {
        setResult({ success: false, message: data.error || "Une erreur est survenue lors de l'import." });
      }
    } catch (err: any) {
      setResult({ success: false, message: err.message || "Erreur de connexion au serveur API." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-6 font-sans">
      <div className="max-w-xl w-full bg-[#141414] border border-[#262626] rounded-2xl p-8 shadow-2xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#A13DFF]/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#A13DFF]/30">
            <UploadCloud className="w-8 h-8 text-[#A13DFF]" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">DigiDrop Scraper</h1>
          <p className="text-[#A3A3A3] text-sm">Automatisateur d'importation vers Antistock</p>
        </div>

        {/* Form */}
        <form onSubmit={handleScrapeAndPost} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#A3A3A3]">API Key Antistock</label>
              <input type="password" required value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="votre clef api..." className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl px-4 py-3 focus:outline-none focus:border-[#A13DFF] focus:ring-1 focus:ring-[#A13DFF] transition-all text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#A3A3A3]">Shop ID Antistock</label>
              <input type="text" required value={shopId} onChange={e => setShopId(e.target.value)} placeholder="identifiant de boutique..." className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl px-4 py-3 focus:outline-none focus:border-[#A13DFF] focus:ring-1 focus:ring-[#A13DFF] transition-all text-sm" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#A3A3A3] flex items-center gap-2">
              <LinkIcon className="w-4 h-4" /> URL du Produit Fournisseur
            </label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://site-fournisseur.com/produit/..."
              className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl px-4 py-3 focus:outline-none focus:border-[#A13DFF] focus:ring-1 focus:ring-[#A13DFF] transition-all text-sm"
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
                className="w-full cursor-pointer accent-[#A13DFF]"
              />
              <span className="bg-[#0A0A0A] border border-[#262626] px-4 py-2 rounded-lg font-mono font-bold w-20 text-center">
                x{margin}
              </span>
            </div>
            <p className="text-xs text-[#A3A3A3]/60">(Prix Fournisseur × {margin} = Votre prix de revente)</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#00D8FF] to-[#A13DFF] hover:opacity-90 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(161,61,255,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            {loading ? "Aspiration en cours..." : "Aspirer & Publier sur Antistock"}
          </button>
        </form>

        {/* Results */}
        {result && (
          <div className={`mt-6 p-4 rounded-xl border flex items-start gap-4 ${result.success ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
            {result.success ? <CheckCircle className="w-6 h-6 flex-shrink-0" /> : <AlertCircle className="w-6 h-6 flex-shrink-0" />}
            <div>
              <p className="font-semibold text-sm">{result.message}</p>
              {result.success && result.data?.title && (
                <p className="text-xs mt-1 text-green-400/80">Produit généré : {result.data.title} ({result.data.finalPrice}€)</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
