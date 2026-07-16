import React, { useState, useRef } from 'react';
import { Upload, X, HelpCircle, FileText, Check } from 'lucide-react';

interface CustomizeFormProps {
  onCustomize: (data: {
    text: string;
    language: 'Hindi' | 'English' | 'Sanskrit';
    photoUrl?: string;
  }) => void;
  leadTimeDays: number;
}

export default function CustomizeForm({ onCustomize, leadTimeDays }: CustomizeFormProps) {
  const [text, setText] = useState('');
  const [language, setLanguage] = useState<'Hindi' | 'English' | 'Sanskrit'>('Hindi');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setIsSaved(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setIsSaved(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    onCustomize({
      text: text.trim(),
      language,
      photoUrl: uploadedImage || undefined
    });
    
    setIsSaved(true);
    // Visual auto-reset alert feedback
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <form
      id="customize-form"
      onSubmit={handleSubmit}
      className="bg-[var(--theme-bg)] border border-[var(--theme-primary)]/20 rounded-none p-5 shadow-xs relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-[3px] bg-[var(--theme-primary)]" />
      
      <h3 className="font-serif text-lg font-light text-[#1a1a1a] tracking-tight mb-1">
        Personalization Details
      </h3>
      <p className="text-xs text-stone-500 mb-4 font-sans">
        Laksha hand-paints each letter and ornament. Custom pieces require extra attention.
      </p>

      {/* Script Language Selection */}
      <div className="mb-4">
        <label className="block text-[10px] font-sans uppercase tracking-[0.1em] font-semibold text-stone-700 mb-2">
          Select Calligraphy Script
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['Hindi', 'Sanskrit', 'English'] as const).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => {
                setLanguage(lang);
                setIsSaved(false);
              }}
              className={`py-1.5 px-3 text-xs rounded-none font-medium border transition-all ${
                language === lang
                  ? 'bg-[var(--theme-accent)] border-[var(--theme-accent)] text-white font-semibold'
                  : 'bg-white border-[var(--theme-primary)]/20 text-stone-600 hover:bg-[#f8f5ef]'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Personalization Text Input */}
      <div className="mb-4">
        <label className="block text-[10px] font-sans uppercase tracking-[0.1em] font-semibold text-stone-700 mb-2 flex items-center justify-between">
          <span>Name or Phrase to Paint</span>
          <span className="text-[10px] text-stone-400 capitalize normal-case font-normal">Max 30 chars</span>
        </label>
        <input
          type="text"
          maxLength={30}
          required
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setIsSaved(false);
          }}
          placeholder={
            language === 'Hindi'
              ? 'e.g. राधा कृष्ण / शुभ लाभ'
              : language === 'Sanskrit'
              ? 'e.g. वसुधैव कुटुम्बकम्'
              : 'e.g. Welcome to Kandpals'
          }
          className="w-full text-xs py-2.5 px-3 rounded-none border border-[var(--theme-primary)]/20 focus:outline-hidden focus:border-[var(--theme-accent)] bg-white font-sans"
        />
        <p className="text-[10px] text-stone-400 mt-1 italic font-sans leading-normal">
          * Please verify spellings. Devanagari script letters will be rendered using authentic calligraphy.
        </p>
      </div>

      {/* Reference Photo Upload (Drag & Drop or Click) */}
      <div className="mb-5">
        <label className="block text-[10px] font-sans uppercase tracking-[0.1em] font-semibold text-stone-700 mb-2 flex items-center gap-1">
          <span>Reference Image (Optional)</span>
          <span className="text-[10px] text-stone-400 font-normal normal-case">(for custom photo-insets)</span>
        </label>

        {uploadedImage ? (
          <div className="relative rounded-none border border-[var(--theme-primary)]/25 p-2 bg-stone-50 flex items-center gap-3">
            <img
              src={uploadedImage}
              alt="Reference"
              className="w-12 h-12 object-cover rounded-none border border-stone-200"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-stone-700 truncate font-sans">Reference_Image_Attached.png</p>
              <p className="text-[10px] text-stone-400 font-sans">Successfully attached to draft customization</p>
            </div>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="p-1 rounded-none text-stone-400 hover:bg-[#f8f5ef] hover:text-stone-600 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[var(--theme-primary)]/20 hover:border-[var(--theme-accent)] transition-colors rounded-none p-4 text-center cursor-pointer bg-white font-sans"
          >
            <Upload className="w-5 h-5 text-stone-400 mx-auto mb-1.5" />
            <span className="block text-xs font-medium text-stone-700">Drag & drop or browse photos</span>
            <span className="block text-[10px] text-stone-400 mt-0.5">Supports JPG, PNG up to 5MB</span>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          className={`flex-1 py-3 px-4 rounded-none font-sans text-xs font-semibold tracking-widest uppercase transition-all flex items-center justify-center gap-1.5 ${
            isSaved
              ? 'bg-emerald-700 text-white hover:bg-emerald-800'
              : 'bg-[var(--theme-accent)] text-white hover:bg-[var(--theme-primary)] shadow-xs'
          }`}
        >
          {isSaved ? (
            <>
              <Check className="w-4 h-4 animate-bounce" /> Customization Saved!
            </>
          ) : (
            'Apply Customization'
          )}
        </button>
      </div>

      {/* Production Warning / Custom Note Banner */}
      <div className="mt-4 pt-3 border-t border-[var(--theme-primary)]/15 flex items-start gap-1.5 text-stone-500 font-sans">
        <HelpCircle className="w-4 h-4 text-[var(--theme-primary)] shrink-0 mt-0.5" />
        <p className="text-[10px] leading-normal">
          This piece is individually handmade to order. Hand-painting will require an estimated{' '}
          <strong className="text-stone-900 font-bold">{leadTimeDays} days</strong> lead time before shipping.
        </p>
      </div>
    </form>
  );
}
