import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  Camera, 
  Sparkles, 
  ShoppingBag, 
  ChevronRight, 
  RefreshCw, 
  CheckCircle2,
  ArrowRight,
  Info,
  Star
} from 'lucide-react';
import { StyleType, StylingResult, Product } from './types';
import { generateVirtualTryOn } from './services/geminiService';

const STYLES: StyleType[] = [
  'Streetwear', 
  'Business Casual', 
  'Boho Chic', 
  'Minimalist', 
  'Cyberpunk', 
  'Old Money'
];

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<StyleType>('Streetwear');
  const [fullMakeover, setFullMakeover] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<StylingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTryOn = async () => {
    if (!image) return;
    setIsProcessing(true);
    setError(null);
    try {
      const stylingResult = await generateVirtualTryOn(image, selectedStyle, fullMakeover);
      setResult(stylingResult);
    } catch (err) {
      console.error(err);
      setError("Etwas ist schiefgelaufen. Bitte versuche es mit einem anderen Foto erneut.");
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-6 flex justify-between items-center border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <Sparkles className="text-black w-5 h-5" />
          </div>
          <span className="font-display text-2xl tracking-tighter uppercase">StyleVibe AI</span>
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-medium opacity-60">
          <a href="#" className="hover:opacity-100 transition-opacity">So funktioniert's</a>
          <a href="#" className="hover:opacity-100 transition-opacity">Styles</a>
          <a href="#" className="hover:opacity-100 transition-opacity">Preise</a>
        </nav>
        <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-sm transition-all">
          Anmelden
        </button>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        {!image && !result ? (
          <HeroSection onUpload={() => fileInputRef.current?.click()} />
        ) : (
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Side: Image Preview/Result */}
            <div className="space-y-6">
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden glass group">
                {isProcessing && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                    <RefreshCw className="w-12 h-12 animate-spin mb-4" />
                    <p className="text-xl font-medium animate-pulse">KI-Stylist arbeitet...</p>
                    <p className="text-sm opacity-60 mt-2">Dein perfekter {selectedStyle}-Look wird erstellt</p>
                  </div>
                )}
                
                <img 
                  src={result?.imageUrl || image || ''} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />

                {error && (
                  <div className="absolute inset-0 z-30 flex items-center justify-center bg-red-500/20 backdrop-blur-md p-6 text-center">
                    <div className="bg-black/80 p-6 rounded-2xl border border-red-500/50">
                      <p className="text-red-400 font-medium mb-4">{error}</p>
                      <button 
                        onClick={() => setError(null)}
                        className="text-xs uppercase tracking-widest font-bold hover:underline"
                      >
                        Schließen
                      </button>
                    </div>
                  </div>
                )}

                {result && (
                  <div className="absolute top-6 left-6 bg-white text-black px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                    KI-Umstyling
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={reset}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Neu starten
                </button>
                {!result && (
                  <button 
                    onClick={handleTryOn}
                    disabled={isProcessing}
                    className="btn-primary flex-[2] flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Look generieren
                  </button>
                )}
              </div>
            </div>

            {/* Right Side: Controls & Recommendations */}
            <div className="space-y-12">
              {!result ? (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-4xl font-display uppercase tracking-tight mb-2">Wähle deinen Vibe</h2>
                    <p className="opacity-60">Wähle einen Stil und unsere KI transformiert dein Foto sofort.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {STYLES.map((style) => (
                      <button
                        key={style}
                        onClick={() => setSelectedStyle(style)}
                        className={`p-4 rounded-2xl text-left transition-all border ${
                          selectedStyle === style 
                            ? 'bg-white text-black border-white' 
                            : 'bg-white/5 border-white/10 hover:border-white/30'
                        }`}
                      >
                        <span className="block text-xs uppercase opacity-60 mb-1 font-bold tracking-widest">Style</span>
                        <span className="text-lg font-semibold">{style}</span>
                      </button>
                    ))}
                  </div>

                  <div className="p-6 glass rounded-2xl flex items-center justify-between group cursor-pointer" onClick={() => setFullMakeover(!fullMakeover)}>
                    <div className="flex gap-4 items-center">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${fullMakeover ? 'bg-white text-black' : 'bg-white/10 text-white'}`}>
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold uppercase text-xs tracking-widest">Komplettes Umstyling</h4>
                        <p className="text-sm opacity-40">Inklusive Haare & Make-up</p>
                      </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full p-1 transition-all ${fullMakeover ? 'bg-emerald-500' : 'bg-white/10'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full transition-all ${fullMakeover ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                  </div>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-12"
                >
                  <div className="space-y-4">
                    <h2 className="text-4xl font-display uppercase tracking-tight">Dein {selectedStyle}-Edit</h2>
                    <div className="p-6 glass rounded-2xl">
                      <p className="text-lg leading-relaxed opacity-80 italic">
                        "{result.description.split('\n')[0]}"
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between items-end">
                      <h3 className="text-2xl font-display uppercase tracking-tight">Shop den Look</h3>
                      <span className="text-xs opacity-40 uppercase tracking-widest font-bold">Affiliate Picks</span>
                    </div>
                    
                    <div className="grid gap-4">
                      {result.recommendations.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>

                    <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex gap-4 items-start">
                      <div className="bg-emerald-500/20 p-2 rounded-lg">
                        <CheckCircle2 className="text-emerald-500 w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-emerald-400">Style-Garantie</h4>
                        <p className="text-sm opacity-60">Diese Artikel wurden von der KI ausgewählt, um perfekt zu deinem neuen Look zu passen. Preise sind geschätzt.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Hidden Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Footer */}
      <footer className="p-12 border-t border-white/10 mt-24">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="space-y-4 col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                <Sparkles className="text-black w-4 h-4" />
              </div>
              <span className="font-display text-xl tracking-tighter uppercase">StyleVibe AI</span>
            </div>
            <p className="opacity-40 max-w-xs text-sm">
              Revolutionierung der Mode durch KI. Probiere jeden Stil sofort aus, überall.
              StyleVibe AI kann eine Provision für Käufe erhalten, die über unsere Links getätigt werden.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold uppercase text-xs tracking-widest opacity-40">Unternehmen</h4>
            <ul className="space-y-2 text-sm opacity-60">
              <li><a href="#" className="hover:text-white">Über uns</a></li>
              <li><a href="#" className="hover:text-white">Karriere</a></li>
              <li><a href="#" className="hover:text-white">Datenschutz</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold uppercase text-xs tracking-widest opacity-40">Social Media</h4>
            <ul className="space-y-2 text-sm opacity-60">
              <li><a href="#" className="hover:text-white">Instagram</a></li>
              <li><a href="#" className="hover:text-white">TikTok</a></li>
              <li><a href="#" className="hover:text-white">Twitter</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}

function HeroSection({ onUpload }: { onUpload: () => void }) {
  return (
    <div className="flex flex-col items-center text-center space-y-12 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 max-w-4xl"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest mb-4">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span>Virtuelles Try-On der nächsten Generation</span>
        </div>
        <h1 className="text-6xl md:text-8xl font-display uppercase leading-[0.9] tracking-tighter">
          Dein persönlicher <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">KI-Stylist</span>
        </h1>
        <p className="text-xl opacity-60 max-w-2xl mx-auto leading-relaxed">
          Lade ein einziges Foto hoch und entdecke eine Welt voller Styles. Unsere KI stylt dich in Sekunden um und findet die passenden Outfits.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-md aspect-square glass rounded-[3rem] p-4 flex flex-col items-center justify-center gap-6 cursor-pointer hover:bg-white/10 transition-all group border-dashed border-2 border-white/20"
        onClick={onUpload}
      >
        <div className="w-24 h-24 bg-white text-black rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl shadow-white/20">
          <Upload className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold">Foto hochladen</h3>
          <p className="opacity-40 text-sm">Drag & Drop oder Klicken zum Auswählen</p>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8 w-full max-w-4xl pt-12">
        <Feature icon={<Camera className="w-5 h-5" />} title="Foto machen" desc="Ein einziges Foto genügt." />
        <Feature icon={<Sparkles className="w-5 h-5" />} title="KI-Transformation" desc="Sofortiges Umstyling in jedem Vibe." />
        <Feature icon={<ShoppingBag className="w-5 h-5" />} title="Shop den Look" desc="Kuratierte Affiliate-Empfehlungen." />
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-6 glass rounded-2xl text-left space-y-3">
      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
        {icon}
      </div>
      <h4 className="font-bold uppercase text-sm tracking-widest">{title}</h4>
      <p className="text-sm opacity-50">{desc}</p>
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  key?: React.Key;
}

function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="glass rounded-2xl p-4 flex gap-4 group hover:bg-white/10 transition-all">
      <div className="w-24 h-32 rounded-xl overflow-hidden bg-white/5">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold">{product.brand}</span>
            <span className="text-sm font-bold">{product.price}</span>
          </div>
          <h4 className="font-semibold text-lg leading-tight">{product.name}</h4>
        </div>
        <a 
          href={product.affiliateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:gap-3 transition-all text-white/60 hover:text-white"
        >
          Im Shop ansehen
          <ArrowRight className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
