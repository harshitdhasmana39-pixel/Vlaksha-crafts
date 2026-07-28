import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, Send, Sliders, Zap, Download, Image, ArrowRight, Trash2, 
  Layers, Compass, Check, HelpCircle, Save, Calendar, MessageSquare,
  RefreshCw, Palette, ExternalLink, ShieldAlert
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Role {
  id: string;
  name: string;
  description: string;
  model: string;
  systemInstruction: string;
  initialMessage: string;
  badge: string;
  icon: "decor" | "designer" | "support";
  temperature?: number;
}

const ROLES: Role[] = [
  {
    id: "decor",
    name: "Vastu & Decor Consultant",
    description: "Personalized advice on colors, sizing, and auspicious placements for mud-mirror art.",
    model: "gemini-3.5-flash",
    systemInstruction: "You are Laksha's AI Vastu & Decor Consultant for Vlaksha Crafts. You specialize in traditional Indian Lippan (mud-mirror) art and mandala works. You provide beautiful advice on color schemes, optimal wall placements according to Vastu Shastra (e.g., North-East for water-colored pieces, East for solar-themed mandalas), and frame sizes. Keep your tone sophisticated, warm, and rich. Use formatting such as bullet points for readable guides. Drive the conversation forward by asking exactly one clarifying question at the end of your response.",
    initialMessage: "Namaste! I am your Vastu & Decor Consultant. Share details about the space you'd like to decorate (its direction, lighting, or room type), and I will guide you on the ideal colors and layouts to invite positive energy.",
    badge: "General | Vastu Advice",
    icon: "decor",
    temperature: 0.7
  },
  {
    id: "designer",
    name: "Artisanal Design Companion",
    description: "Brainstorm clay textures, mirror configurations, bespoke shapes, and pattern spacing.",
    model: "gemini-3.1-pro",
    systemInstruction: "You are Laksha's AI Artisanal Design Companion. You help clients detail custom design ideas for their bespoke orders. You are highly knowledgeable in mirror geometries (triangles, diamonds, circles, teardrops), clay line textures (thick lines, thin braids, circular reliefs), and backing board specifications (acrylic, treated MDF). Help users refine their design vocabulary and offer realistic craft combinations. Keep your tone inspiring, technical, and artistic. Drive the conversation forward by asking exactly one clarifying question at the end of your response.",
    initialMessage: "Hello, creative soul! I am your Design Companion. What patterns or symbols (peacocks, lotus medallions, radial waves) would you like to fuse into your custom masterpiece? Let's write down a detailed design plan.",
    badge: "Complex Reasoning | Custom Specs",
    icon: "designer",
    temperature: 0.8
  },
  {
    id: "support",
    name: "Art Studio Quick FAQ",
    description: "Instant help regarding delivery schedules, clay quality, wall hanging, and care guides (Low Latency).",
    model: "gemini-3.5-flash",
    systemInstruction: "You are Laksha's Art Studio Support assistant. You provide rapid, concise, high-efficiency answers regarding shipping (custom orders take 7-10 working days to prepare), materials (eco-friendly modeling clay, organic gum adhesive, genuine mirror glass fragments), installation (pre-installed saw-tooth hooks on the back, suitable for drywall or concrete), and care (dust with soft dry microfibre brush, avoid direct moisture). Keep answers extremely brief, practical, and precise.",
    initialMessage: "Welcome! Ask me any quick questions about custom order lead times, shipping safety, material composition, or hanging advice. I answer in a flash!",
    badge: "Low Latency | Rapid FAQ",
    icon: "support",
    temperature: 0.2
  }
];

export interface ArtColorPalette {
  id: string;
  name: string;
  colors: string[];
  description: string;
}

export const ART_COLOR_PALETTES: ArtColorPalette[] = [
  { id: 'indigo-gold', name: 'Royal Indigo & Shimmering Gold', colors: ['#1E3A8A', '#D97706', '#FFFFFF'], description: 'Majestic deep blue with metallic gold clay outline and mirrors' },
  { id: 'terracotta-saffron', name: 'Terracotta Clay & Sacred Saffron', colors: ['#C2410C', '#EA580C', '#FEF3C7'], description: 'Traditional Kutchi rustic clay orange with auspicious saffron' },
  { id: 'turquoise-emerald', name: 'Turquoise Peacock & Emerald', colors: ['#0D9488', '#059669', '#E0F2FE'], description: 'Vibrant sea-teal and emerald green with pearl highlights' },
  { id: 'crimson-marigold', name: 'Sacred Crimson & Marigold', colors: ['#991B1B', '#DC2626', '#F59E0B'], description: 'Rich temple red with marigold yellow and mirror sparkles' },
  { id: 'magenta-violet', name: 'Magenta Fuchsia & Royal Violet', colors: ['#C026D3', '#7C3AED', '#FDF4FF'], description: 'Luxurious violet and fuchsia with white dotting work' },
  { id: 'golden-ivory', name: 'Golden Ochre & Ivory White', colors: ['#CA8A04', '#FEF08A', '#FAFAF9'], description: 'Auspicious mustard gold with clean white clay braids' },
  { id: 'sapphire-silver', name: 'Deep Sapphire & Antique Silver', colors: ['#0284C7', '#475569', '#F1F5F9'], description: 'Cool oceanic sapphire blue with silver mirror accents' }
];

interface GeneratedIdea {
  id: string;
  prompt: string;
  imageUrl: string;
  aspectRatio: string;
  imageSize: string;
  model: string;
  timestamp: string;
}

export default function AIDesignStudio() {
  // Chat state
  const [activeRoleId, setActiveRoleId] = useState<string>("decor");
  const [chatHistories, setChatHistories] = useState<Record<string, Message[]>>({
    decor: [{ role: "assistant", content: ROLES[0].initialMessage, timestamp: new Date() }],
    designer: [{ role: "assistant", content: ROLES[1].initialMessage, timestamp: new Date() }],
    support: [{ role: "assistant", content: ROLES[2].initialMessage, timestamp: new Date() }]
  });
  const [inputText, setInputText] = useState<string>("");
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // Image generator state
  const [imgPrompt, setImgPrompt] = useState<string>("");
  const [selectedPaletteId, setSelectedPaletteId] = useState<string>("indigo-gold");
  const [selectedModel, setSelectedModel] = useState<string>("gemini-2.5-flash-image");
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<string>("1:1");
  const [selectedImageSize, setSelectedImageSize] = useState<string>("1K");
  const [isGeneratingImg, setIsGeneratingImg] = useState<boolean>(false);
  const [generatedImgUrl, setGeneratedImgUrl] = useState<string | null>(null);
  const [imgError, setImgError] = useState<string | null>(null);
  
  // Local saved ideas
  const [savedIdeas, setSavedIdeas] = useState<GeneratedIdea[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const activeRole = ROLES.find(r => r.id === activeRoleId) || ROLES[0];
  const currentChatHistory = chatHistories[activeRoleId] || [];

  // Load saved ideas from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("vlaksha_ai_ideas");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Clean up broken URLs from previous sessions
        const cleaned = parsed.map((idea: any) => {
           if (idea.imageUrl && !idea.imageUrl.startsWith('http') && !idea.imageUrl.startsWith('data:')) {
               return { ...idea, imageUrl: `data:image/jpeg;base64,${idea.imageUrl}` };
           }
           return idea;
        });
        setSavedIdeas(cleaned);
      } catch (e) {
        console.error("Failed to parse saved AI ideas", e);
      }
    }
  }, []);

  // Auto scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChatHistory]);

  const handleRoleChange = (roleId: string) => {
    setActiveRoleId(roleId);
    setChatError(null);
  };

  // Core send logic, reusable by both the chat input form and any button
  // that wants to inject a message (e.g. "Inquire Custom Order").
  // Takes roleId explicitly instead of relying on activeRoleId state, since
  // React state updates (like setActiveRoleId) are async and won't have
  // landed yet if this is called right after switching roles.
  const sendChatMessage = async (text: string, roleId: string) => {
    const trimmed = text.trim();
    if (!trimmed || isChatLoading) return;

    const role = ROLES.find(r => r.id === roleId) || ROLES[0];
    setChatError(null);

    const newUserMessage: Message = {
      role: "user",
      content: trimmed,
      timestamp: new Date()
    };

    const baseHistory = chatHistories[roleId] || [];
    const updatedHistory = [...baseHistory, newUserMessage];

    setChatHistories(prev => ({
      ...prev,
      [roleId]: updatedHistory
    }));

    setIsChatLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedHistory
            .filter((m, idx) => !(idx === 0 && m.role === "assistant"))
            .map(m => ({
              role: m.role,
              content: m.content
            })),
          systemInstruction: role.systemInstruction,
          model: role.model,
          temperature: role.temperature
        })
      });

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.text || "Namaste! I am here to help you design your Lippan art piece. What colors or sizes do you have in mind?",
        timestamp: new Date()
      };

      setChatHistories(prev => ({
        ...prev,
        [roleId]: [...(prev[roleId] || []), assistantMessage]
      }));
    } catch (err: any) {
      console.error(err);
      const fallbackMsg: Message = {
        role: "assistant",
        content: "Namaste! I am here to assist with your custom Lippan art order. Feel free to share your wall dimensions or preferred colors!",
        timestamp: new Date()
      };
      setChatHistories(prev => ({
        ...prev,
        [roleId]: [...(prev[roleId] || []), fallbackMsg]
      }));
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isChatLoading) return;
    const text = inputText.trim();
    setInputText("");
    await sendChatMessage(text, activeRoleId);
  };

  const handleGenerateImage = async () => {
    if (!imgPrompt.trim() || isGeneratingImg) return;

    setIsGeneratingImg(true);
    setImgError(null);
    setGeneratedImgUrl(null);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: imgPrompt,
          model: selectedModel,
          aspectRatio: selectedAspectRatio,
          imageSize: selectedImageSize
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to generate your traditional artwork model.");
      }

      const data = await response.json();
      if (data.imageUrl) {
        setGeneratedImgUrl(data.imageUrl);
      } else {
        throw new Error("No artwork preview returned.");
      }
    } catch (err: any) {
      console.error(err);
      setImgError(err.message || "Artwork generation failed. Please check your credentials or parameters.");
    } finally {
      setIsGeneratingImg(false);
    }
  };

  const handleSaveIdea = () => {
    if (!generatedImgUrl || !imgPrompt) return;

    const newIdea: GeneratedIdea = {
      id: Math.random().toString(36).substr(2, 9),
      prompt: imgPrompt,
      imageUrl: generatedImgUrl,
      aspectRatio: selectedAspectRatio,
      imageSize: selectedImageSize,
      model: selectedModel,
      timestamp: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      })
    };

    const updated = [newIdea, ...savedIdeas];
    setSavedIdeas(updated);
    localStorage.setItem("vlaksha_ai_ideas", JSON.stringify(updated));
  };

  const handleDeleteIdea = (id: string) => {
    const updated = savedIdeas.filter(idea => idea.id !== id);
    setSavedIdeas(updated);
    localStorage.setItem("vlaksha_ai_ideas", JSON.stringify(updated));
  };

  const activePalette = ART_COLOR_PALETTES.find(p => p.id === selectedPaletteId) || ART_COLOR_PALETTES[0];

  const handleSelectPalette = (palette: ArtColorPalette) => {
    setSelectedPaletteId(palette.id);
    if (!imgPrompt.trim()) {
      setImgPrompt(`Traditional Lippan mud-mirror art painted in ${palette.name} color palette with fine mirrors`);
    } else {
      const paletteShort = palette.name.split('&')[0].trim();
      if (!imgPrompt.toLowerCase().includes(paletteShort.toLowerCase())) {
        setImgPrompt(prev => `${prev.trim()}, rendered in ${palette.name} color scheme`);
      }
    }
  };

  // Pre-configured inspiration prompts with rich art colors
  const suggestionTags = [
    "Royal Indigo Lippan mandala with gold mirror trim",
    "Terracotta Clay & Sacred Saffron Kutchi mud plaque",
    "Turquoise Peacock & Emerald green floral lippan panel",
    "Sacred Crimson & Marigold Ganesha wall art",
    "Magenta Fuchsia & Royal Violet mud-mirror clock face"
  ];

  const handleApplyTag = (tag: string) => {
    setImgPrompt(tag);
  };

  const getAspectRatioPreviewClass = (ratio: string) => {
    switch(ratio) {
      case "16:9": return "aspect-video";
      case "9:16": return "aspect-[9/16]";
      case "4:3": return "aspect-4/3";
      case "3:4": return "aspect-3/4";
      case "3:2": return "aspect-[3/2]";
      case "2:3": return "aspect-[2/3]";
      case "21:9": return "aspect-[21/9]";
      default: return "aspect-square";
    }
  };

  return (
    <div id="ai-creative-studio" className="bg-[#FAF9F5] py-8 px-4 sm:px-6 lg:px-8 min-h-screen">
      {/* Decorative Traditional Header */}
      <div className="max-w-7xl mx-auto text-center mb-12 relative">
        <span className="text-[10px] tracking-[0.35em] font-sans uppercase text-[var(--theme-primary)] font-medium block mb-2">
          Co-Create with GenAI Intelligence
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-[var(--theme-accent)] font-light tracking-tight mb-3">
          AI ARTISAN DESIGN STUDIO
        </h2>
        <p className="max-w-2xl mx-auto text-stone-600 font-sans text-xs sm:text-sm leading-relaxed">
          Unlock your inner traditional artist. Consult with specialized Gemini companions on design layouts, 
          harmonize spaces with Vastu guidance, or render premium Lippan mud-mirror compositions instantly.
        </p>

        {/* Auspicious Floral Line Ornament */}
        <div className="flex items-center justify-center gap-3 mt-5 opacity-40">
          <div className="h-[1px] w-20 bg-[var(--theme-primary)]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--theme-primary)] rotate-45" />
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--theme-accent)] rotate-45" />
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--theme-primary)] rotate-45" />
          <div className="h-[1px] w-20 bg-[var(--theme-primary)]" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Multi-turn Chat Companion (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[var(--theme-primary)]/20 rounded-lg shadow-xs flex flex-col h-[650px] overflow-hidden">
          
          {/* Companion Banner / Role Selector Header */}
          <div className="p-4 bg-[var(--theme-accent)] text-white border-b border-[var(--theme-primary)]/20">
            <div className="flex items-center gap-2 mb-3">
              <Compass className="w-4 h-4 text-[var(--theme-primary)] animate-spin-slow" />
              <span className="text-[9px] tracking-[0.25em] uppercase font-sans text-[#FAF9F5]/70">
                Choose Advisor Persona
              </span>
            </div>
            
            {/* Horizontal Tabs */}
            <div className="grid grid-cols-3 gap-1.5">
              {ROLES.map((role) => {
                const isActive = activeRoleId === role.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => handleRoleChange(role.id)}
                    className={`p-2 rounded-sm text-center flex flex-col items-center gap-1 transition-all ${
                      isActive 
                        ? "bg-[var(--theme-primary)] text-[var(--theme-accent)] font-semibold" 
                        : "bg-white/5 hover:bg-white/10 text-white/90"
                    }`}
                  >
                    {role.icon === "decor" && <Palette className="w-4 h-4" />}
                    {role.icon === "designer" && <Sliders className="w-4 h-4" />}
                    {role.icon === "support" && <Zap className="w-4 h-4" />}
                    <span className="text-[9px] font-sans uppercase tracking-wider block truncate w-full">
                      {role.name.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Advisor Info */}
          <div className="px-4 py-2 bg-amber-50/40 border-b border-[var(--theme-primary)]/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono uppercase text-stone-600">
                Model: <strong className="text-[var(--theme-accent)]">{activeRole.model}</strong>
              </span>
            </div>
            <span className="px-2 py-0.5 text-[8px] bg-[var(--theme-accent)]/10 text-[var(--theme-accent)] uppercase font-semibold font-mono tracking-wider rounded-xs">
              {activeRole.badge}
            </span>
          </div>

          {/* Scrollable Message Box */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FCFBF9]">
            {currentChatHistory.map((msg, index) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={index}
                  className={`flex ${isUser ? "justify-end" : "justify-start"} items-start gap-2.5`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-full bg-[var(--theme-accent)] border border-[var(--theme-primary)]/40 flex items-center justify-center text-[var(--theme-primary)] text-xs font-serif shrink-0 shadow-sm">
                      L
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg p-3 text-xs leading-relaxed font-sans ${
                      isUser
                        ? "bg-[var(--theme-primary)]/15 text-stone-800 border border-[var(--theme-primary)]/30 rounded-tr-none"
                        : "bg-white text-stone-800 border border-stone-100 rounded-tl-none shadow-xs"
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.content}</div>
                    <span className="text-[8px] text-stone-400 mt-1 block text-right font-mono">
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  {isUser && (
                    <div className="w-8 h-8 rounded-full bg-[var(--theme-primary)]/20 border border-[var(--theme-primary)]/40 flex items-center justify-center text-[var(--theme-accent)] text-xs font-semibold shrink-0">
                      You
                    </div>
                  )}
                </div>
              );
            })}

            {isChatLoading && (
              <div className="flex justify-start items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[var(--theme-accent)] border border-[var(--theme-primary)]/40 flex items-center justify-center text-[var(--theme-primary)] text-xs font-serif shrink-0 animate-pulse">
                  L
                </div>
                <div className="bg-white border border-stone-100 rounded-lg rounded-tl-none p-3 flex items-center gap-2 shadow-xs">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-[var(--theme-primary)] rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-[var(--theme-primary)] rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-[var(--theme-primary)] rounded-full animate-bounce" />
                  </div>
                  <span className="text-[10px] text-stone-500 font-sans italic">
                    {activeRoleId === "support" ? "Replying instantly..." : "Laksha's companion is drafting..."}
                  </span>
                </div>
              </div>
            )}

            {chatError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2 text-red-700 text-xs font-sans">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                <div>
                  <p className="font-semibold">Chat System Alert</p>
                  <p>{chatError}</p>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Send Input Area */}
          <form onSubmit={handleSendChatMessage} className="p-3 bg-white border-t border-stone-100 flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Ask ${activeRole.name}...`}
              className="flex-1 bg-stone-50 border border-stone-200 rounded-sm px-3 py-2 text-xs focus:outline-hidden focus:border-[var(--theme-primary)] focus:ring-1 focus:ring-[var(--theme-primary)]/40"
              disabled={isChatLoading}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isChatLoading}
              className={`px-4 py-2 rounded-sm text-xs font-sans uppercase tracking-wider font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                inputText.trim() && !isChatLoading
                  ? "bg-[var(--theme-accent)] text-white hover:bg-[var(--theme-primary)] hover:text-[var(--theme-accent)]"
                  : "bg-stone-100 text-stone-400 cursor-not-allowed"
              }`}
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Right Column: AI Mud-Mirror Mud Art Visualizer (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-[var(--theme-primary)]/20 rounded-lg p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <Image className="w-5 h-5 text-[var(--theme-primary)]" />
              <h3 className="font-serif text-lg text-[var(--theme-accent)] font-medium tracking-wide">
                Mud-Mirror Visualizer Engine
              </h3>
            </div>

            {/* Inspiration tags */}
            <div className="mb-4">
              <label className="text-[10px] uppercase tracking-wider font-mono text-stone-500 block mb-1.5">
                Inspiration Templates (Click to fill)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {suggestionTags.map((tag, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyTag(tag)}
                    className="px-2 py-1 text-[10px] bg-stone-50 hover:bg-[var(--theme-primary)]/10 hover:text-[var(--theme-accent)] text-stone-600 rounded-xs border border-stone-100 transition-colors cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Art Color Palette Selection */}
            <div className="mb-5 p-3.5 bg-[#FAF9F5] border border-[var(--theme-primary)]/20 rounded-md">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-[var(--theme-accent)] block mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-[var(--theme-primary)]" />
                  Select Art Color Palette
                </span>
                <span className="text-[9px] text-stone-600 font-mono font-normal">
                  Active Scheme: <strong className="text-[var(--theme-accent)]">{activePalette.name}</strong>
                </span>
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {ART_COLOR_PALETTES.map((palette) => {
                  const isSelected = selectedPaletteId === palette.id;
                  return (
                    <button
                      key={palette.id}
                      type="button"
                      onClick={() => handleSelectPalette(palette)}
                      className={`p-2 rounded-xs border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[var(--theme-accent)] bg-white ring-2 ring-[var(--theme-accent)]/30 shadow-xs scale-[1.03]'
                          : 'border-stone-200 bg-white hover:bg-stone-100/80 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-1 mb-1.5">
                        {palette.colors.map((c, i) => (
                          <span
                            key={i}
                            className="w-3 h-3 rounded-full border border-stone-300/60 shadow-2xs shrink-0"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      <span className="text-[9px] font-sans font-semibold text-stone-800 line-clamp-1 leading-tight">
                        {palette.name.split('&')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
              
              <p className="text-[10px] text-stone-500 mt-2 font-sans italic leading-tight">
                ✨ {activePalette.description}
              </p>
            </div>

            {/* Visual Prompt Input */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="imgPrompt" className="text-[10px] uppercase tracking-wider font-semibold text-[var(--theme-accent)] block">
                    AI Craft Composition Prompt
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const randomTag = suggestionTags[Math.floor(Math.random() * suggestionTags.length)];
                      setImgPrompt(randomTag);
                    }}
                    className="text-[9px] text-[var(--theme-primary)] hover:underline font-semibold uppercase flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-[var(--theme-primary)]" />
                    Random Idea
                  </button>
                </div>
                <textarea
                  id="imgPrompt"
                  value={imgPrompt}
                  onChange={(e) => setImgPrompt(e.target.value)}
                  placeholder="Describe your Lippan artwork design idea in detail (e.g. Traditional circular Lippan board with clay floral shapes, mirror geometric border, golden background)"
                  rows={3}
                  className="w-full bg-stone-50 border border-stone-200 rounded-sm p-3 text-xs focus:outline-hidden focus:border-[var(--theme-primary)] focus:ring-1 focus:ring-[var(--theme-primary)]/40 font-sans"
                />

                {/* Quick Inspiration Prompt Pills */}
                <div className="mt-2.5 space-y-1.5">
                  <span className="text-[9px] uppercase tracking-wider text-stone-400 font-mono block">
                    Tap a design prompt to load:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestionTags.map((tag, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplyTag(tag)}
                        className={`px-2.5 py-1 text-[10px] rounded-full border transition-all cursor-pointer ${
                          imgPrompt === tag
                            ? "bg-[var(--theme-primary)] text-[var(--theme-accent)] font-semibold border-[var(--theme-primary)]"
                            : "bg-white text-stone-600 border-stone-200 hover:border-[var(--theme-primary)] hover:text-[var(--theme-accent)]"
                        }`}
                      >
                        ✨ {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Grid of controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Model selection */}
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-[var(--theme-accent)] block mb-1">
                    AI Rendering Model
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-sm p-2 text-xs focus:outline-hidden focus:border-[var(--theme-primary)]"
                  >
                    <option value="gemini-3.1-flash-image">gemini-3.1-flash-image (High Quality)</option>
                    <option value="gemini-3-pro-image">gemini-3-pro-image (Studio Pro - Paid)</option>
                    <option value="gemini-3.1-flash-lite-image">gemini-3.1-flash-lite-image (General)</option>
                  </select>
                </div>

                {/* Aspect ratio */}
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-[var(--theme-accent)] block mb-1">
                    Aspect Ratio
                  </label>
                  <select
                    value={selectedAspectRatio}
                    onChange={(e) => setSelectedAspectRatio(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-sm p-2 text-xs focus:outline-hidden focus:border-[var(--theme-primary)]"
                  >
                    <option value="1:1">1:1 (Square Plaque)</option>
                    <option value="2:3">2:3 (Portrait Panel)</option>
                    <option value="3:2">3:2 (Landscape Panel)</option>
                    <option value="3:4">3:4 (Standard Portrait)</option>
                    <option value="4:3">4:3 (Standard Landscape)</option>
                    <option value="9:16">9:16 (Tall Pillar)</option>
                    <option value="16:9">16:9 (Panoramic Mural)</option>
                    <option value="21:9">21:9 (Ultra Wide Mural)</option>
                  </select>
                </div>

                {/* Image Size / Resolution */}
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-[var(--theme-accent)] block mb-1">
                    Affordance Resolution
                  </label>
                  <select
                    value={selectedImageSize}
                    onChange={(e) => setSelectedImageSize(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-sm p-2 text-xs focus:outline-hidden focus:border-[var(--theme-primary)]"
                  >
                    <option value="1K">1K (Web Standard)</option>
                    <option value="2K">2K (High Resolution)</option>
                    <option value="4K">4K (Ultra HD Print)</option>
                  </select>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleGenerateImage}
                disabled={!imgPrompt.trim() || isGeneratingImg}
                className={`w-full py-2.5 rounded-sm text-xs font-sans uppercase tracking-widest font-semibold transition-all flex items-center justify-center gap-2 ${
                  imgPrompt.trim() && !isGeneratingImg
                    ? "bg-[var(--theme-accent)] text-white hover:bg-[var(--theme-primary)] hover:text-[var(--theme-accent)] shadow-sm"
                    : "bg-stone-100 text-stone-400 cursor-not-allowed"
                }`}
              >
                {isGeneratingImg ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[var(--theme-primary)]" />
                    <span>Lippan Art Engine is Hand-painting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[var(--theme-primary)]" />
                    <span>Generate Artisanal Mud Art Preview</span>
                  </>
                )}
              </button>
            </div>

            {/* Preview Box */}
            <div className="mt-6 border border-dashed border-[var(--theme-primary)]/20 rounded-lg p-4 bg-[#FCFBF9] flex flex-col items-center justify-center min-h-[300px]">
              {isGeneratingImg ? (
                <div className="text-center py-10 space-y-4">
                  <div className="relative flex justify-center">
                    <div className="w-14 h-14 rounded-full border-2 border-stone-200 border-t-[var(--theme-primary)] animate-spin" />
                    <Compass className="w-6 h-6 text-[var(--theme-accent)] absolute top-4 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-medium text-[var(--theme-accent)]">Crafting Geometric Layout</h4>
                    <p className="text-[10px] text-stone-500 font-sans mt-0.5 max-w-xs">
                      Arranging authentic clay braids, embedding mirror shards, and baking digital textures...
                    </p>
                  </div>
                </div>
              ) : generatedImgUrl ? (
                <div className="w-full space-y-4">
                  <span className="text-[9px] uppercase tracking-wider font-mono text-[var(--theme-primary)] block text-center">
                    Render Complete • Frame Simulated Below
                  </span>
                  
                  {/* Photo Frame Styling */}
                  <div className="flex justify-center">
                    <div 
                      className="p-3 bg-stone-950 border-4 shadow-xl rounded-xs max-w-md w-full relative group transition-colors duration-500"
                      style={{ borderColor: activePalette.colors[0] }}
                    >
                      {/* Glass Shimmer Refraction Overlay */}
                      <div className="absolute inset-0 bg-linear-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none mix-blend-overlay z-10" />
                      
                      <div className={`overflow-hidden bg-[#faf8f5] ${getAspectRatioPreviewClass(selectedAspectRatio)}`}>
                        <img
                          src={generatedImgUrl}
                          alt="AI generated mud art concept"
                          className="w-full h-full object-cover select-none"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions for generated artwork */}
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <a
                      href={generatedImgUrl}
                      download={`vlaksha-ai-${selectedAspectRatio}.png`}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] uppercase font-semibold font-sans tracking-wider rounded-xs flex items-center gap-1 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-[var(--theme-primary)]" />
                      Download Image
                    </a>
                    
                    <button
                      onClick={handleSaveIdea}
                      type="button"
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] uppercase font-semibold font-sans tracking-wider rounded-xs flex items-center gap-1 transition-colors"
                    >
                      <Save className="w-3.5 h-3.5 text-[var(--theme-primary)]" />
                      Save to AI Gallery
                    </button>

                    <button
                      onClick={() => {
                        // Switch to the designer chatbot and trigger custom order inquiry message
                        setActiveRoleId("designer");
                        const inquiryText = `I have generated a preview of custom art: "${imgPrompt}". I would love to order a physical handcrafted Lippan version of this on a backing board size of your choice. How can we get started?`;
                        sendChatMessage(inquiryText, "designer");
                        window.scrollTo({ top: document.getElementById("ai-creative-studio")?.offsetTop, behavior: "smooth" });
                      }}
                      className="px-3 py-1.5 bg-[var(--theme-accent)] text-white hover:bg-[var(--theme-primary)] hover:text-[var(--theme-accent)] text-[10px] uppercase font-semibold font-sans tracking-wider rounded-xs flex items-center gap-1 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Inquire Custom Order
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-stone-400 max-w-xs">
                  <Image className="w-8 h-8 mx-auto text-[var(--theme-primary)]/40 mb-2" />
                  <p className="text-xs font-serif italic text-stone-500">Your design is currently empty.</p>
                  <p className="text-[10px] mt-1 text-stone-400">
                    Input a description above and click &quot;Generate Preview&quot; to inspect mud art layout models.
                  </p>
                </div>
              )}

              {imgError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md w-full text-red-700 text-xs font-sans">
                  <div className="flex gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                    <div>
                      <p className="font-semibold">Generator Issue</p>
                      <p>{imgError}</p>
                      <p className="text-[10px] text-stone-500 mt-1">
                        Ensure you have approved the model key settings or choose a smaller resolution / default model.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Local Saved Ideas Shelf */}
          {savedIdeas.length > 0 && (
            <div className="bg-white border border-[var(--theme-primary)]/20 rounded-lg p-5 shadow-xs">
              <h4 className="font-serif text-sm text-[var(--theme-accent)] font-semibold tracking-wide uppercase mb-3 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[var(--theme-primary)]" />
                My AI Saved Idea Gallery ({savedIdeas.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {savedIdeas.map((idea) => (
                  <div key={idea.id} className="group relative bg-[#FCFBF9] border border-stone-100 rounded-xs overflow-hidden p-2">
                    <div className="aspect-square w-full overflow-hidden bg-stone-100 border border-stone-200 mb-1.5 relative">
                      <img
                        src={idea.imageUrl}
                        alt={idea.prompt}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        onClick={() => handleDeleteIdea(idea.id)}
                        className="absolute top-1 right-1 p-1 bg-white/90 hover:bg-red-500 hover:text-white rounded-xs text-stone-500 shadow-xs transition-colors z-20"
                        title="Delete Idea"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-[9px] text-stone-600 line-clamp-2 leading-normal" title={idea.prompt}>
                      {idea.prompt}
                    </div>
                    <div className="text-[8px] font-mono text-stone-400 mt-1 flex justify-between items-center">
                      <span>{idea.aspectRatio}</span>
                      <span>{idea.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
