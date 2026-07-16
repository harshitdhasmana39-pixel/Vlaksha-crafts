import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { dbService } from './services/db';
import { Product, CartItem, Order, Review, User, StudioSettings, ArtCategory } from './types';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProductCard from './components/ProductCard';
import ThreeDViewer from './components/ThreeDViewer';
import CustomizeForm from './components/CustomizeForm';
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import OrderStatusChecker from './components/OrderStatusChecker';
import MandalaDivider from './components/MandalaDivider';
import PetalLoader from './components/PetalLoader';
import TasselAccent from './components/TasselAccent';
import AdminPanel from './components/AdminPanel';
import AIDesignStudio from './components/AIDesignStudio';
import LakshaPortrait from './components/LakshaPortrait';
import PrintableReceipt from './components/PrintableReceipt';
import UserAuth from './components/UserAuth';
import UserAccount from './components/UserAccount';
import { 
  Star, Sparkles, ChevronRight, Settings, ArrowLeft, Heart, 
  ShoppingBag, ShieldCheck, Mail, Phone, Clock, AlertCircle, 
  MapPin, Check, Plus, Minus, User as UserIcon, Send, CheckCircle2, ChevronDown,
  X, Loader2, Share2, Copy, Download, Printer, KeyRound, Tag, Gift, Percent
} from 'lucide-react';

const downloadHtmlReceipt = (order: Order) => {
  const itemRows = order.items.map(item => `
    <tr>
      <td style="padding: 12px 10px; border-bottom: 1px solid rgba(197, 160, 89, 0.2);">
        <div style="font-family: serif; font-weight: bold; color: #111; font-size: 14px;">${item.product.name}</div>
        ${item.personalization ? `<div style="font-size: 10px; color: var(--theme-primary); font-style: italic; margin-top: 4px; font-weight: 500;">Custom Calligraphy (${item.personalization.language}): "${item.personalization.text}"</div>` : ''}
      </td>
      <td style="padding: 12px 10px; border-bottom: 1px solid rgba(197, 160, 89, 0.2); font-family: monospace; color: #555;">${item.size}</td>
      <td style="padding: 12px 10px; border-bottom: 1px solid rgba(197, 160, 89, 0.2); color: #555;">${item.color.name}</td>
      <td style="padding: 12px 10px; border-bottom: 1px solid rgba(197, 160, 89, 0.2); text-align: center; font-weight: bold;">${item.quantity}</td>
      <td style="padding: 12px 10px; border-bottom: 1px solid rgba(197, 160, 89, 0.2); text-align: right; font-family: monospace;">₹${item.product.price.toLocaleString('en-IN')}</td>
      <td style="padding: 12px 10px; border-bottom: 1px solid rgba(197, 160, 89, 0.2); text-align: right; font-family: monospace; font-weight: bold;">₹${(item.product.price * item.quantity).toLocaleString('en-IN')}</td>
    </tr>
  `).join('');

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt_#${order.id} - Vlaksha Crafts</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #292524;
      line-height: 1.5;
      padding: 40px 20px;
      background-color: var(--theme-bg);
    }
    .receipt-container {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      padding: 50px 40px;
      border: 1px solid var(--theme-primary);
      box-shadow: 0 10px 30px rgba(197, 160, 89, 0.08);
      position: relative;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 4px double var(--theme-primary);
      padding-bottom: 30px;
    }
    .logo-text {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 32px;
      font-weight: 300;
      letter-spacing: 6px;
      color: var(--theme-accent);
      margin: 0;
      text-transform: uppercase;
    }
    .subtitle {
      font-size: 10px;
      letter-spacing: 3px;
      color: var(--theme-primary);
      text-transform: uppercase;
      font-weight: 600;
      margin: 8px 0 0 0;
    }
    .address-line {
      margin: 12px 0 0 0;
      font-size: 11px;
      color: #78716c;
    }
    .invoice-title {
      font-size: 16px;
      font-weight: 600;
      letter-spacing: 3px;
      margin: 30px 0;
      color: #1c1917;
      text-align: center;
      text-transform: uppercase;
      background-color: #faf9f5;
      border: 1px solid rgba(197, 160, 89, 0.2);
      padding: 10px;
    }
    .grid {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
      font-size: 13px;
    }
    .col {
      width: 48%;
    }
    .col-title {
      font-weight: 600;
      color: var(--theme-accent);
      border-bottom: 1px solid rgba(197, 160, 89, 0.3);
      padding-bottom: 6px;
      margin-bottom: 12px;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 1.5px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .label {
      color: #78716c;
    }
    .value {
      font-weight: 600;
      color: #1c1917;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 40px;
      font-size: 13px;
    }
    th {
      background-color: var(--theme-accent);
      color: #ffffff;
      font-weight: 500;
      padding: 12px 10px;
      text-align: left;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 1.5px;
    }
    .summary-section {
      display: flex;
      justify-content: flex-end;
      font-size: 13px;
    }
    .summary-box {
      width: 320px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #f5f5f4;
    }
    .grand-total {
      font-size: 16px;
      font-weight: 700;
      color: var(--theme-accent);
      border-top: 2px solid var(--theme-accent);
      border-bottom: 2px solid var(--theme-accent);
      padding: 12px 0;
      margin-top: 12px;
    }
    .footer {
      text-align: center;
      margin-top: 50px;
      font-size: 11px;
      color: #78716c;
      border-top: 1px solid #e7e5e4;
      padding-top: 30px;
    }
    .quote {
      font-family: 'Playfair Display', Georgia, serif;
      font-style: italic;
      color: #44403c;
      margin-bottom: 20px;
      font-size: 13px;
    }
    .print-btn {
      display: block;
      width: 200px;
      margin: 30px auto 0 auto;
      padding: 12px;
      background: var(--theme-accent);
      color: white;
      border: none;
      font-family: inherit;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 2px;
      cursor: pointer;
      text-align: center;
      transition: background 0.2s;
    }
    .print-btn:hover {
      background: var(--theme-primary);
    }
    @media print {
      body {
        padding: 0;
        background-color: #ffffff;
      }
      .receipt-container {
        border: none;
        box-shadow: none;
        padding: 0;
      }
      .print-btn {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <div class="header">
      <div class="logo-text">Vlaksha Crafts</div>
      <div class="subtitle">Handpainted Mud-Mirror Reliefs & Sacred Mandalas</div>
      <p class="address-line">
        Noida Studio, Uttar Pradesh, India | contact@vlakshacrafts.com | WhatsApp: +91 95481 23456
      </p>
    </div>

    <div class="invoice-title">Official Order Receipt</div>

    <div class="grid">
      <div class="col">
        <div class="col-title">Order Information</div>
        <div class="info-row">
          <span class="label">Order ID:</span>
          <span class="value" style="font-family: monospace;">#${order.id}</span>
        </div>
        <div class="info-row">
          <span class="label">Date & Time:</span>
          <span class="value">${new Date(order.createdAt).toLocaleString('en-IN')}</span>
        </div>
        <div class="info-row">
          <span class="label">Order Status:</span>
          <span class="value" style="text-transform: uppercase; color: var(--theme-accent);">${order.orderStatus}</span>
        </div>
        <div class="info-row">
          <span class="label">Payment Method:</span>
          <span class="value">${order.paymentMethod === 'Razorpay_Test' ? 'Razorpay Test Simulation' : order.paymentMethod}</span>
        </div>
        <div class="info-row">
          <span class="label">Payment Status:</span>
          <span class="value" style="text-transform: uppercase; color: ${order.paymentStatus === 'completed' ? '#047857' : '#b45309'}">${order.paymentStatus}</span>
        </div>
      </div>
      <div class="col">
        <div class="col-title">Shipping & Contact</div>
        <div class="info-row">
          <span class="label">Auspicious Customer:</span>
          <span class="value">${order.customerName}</span>
        </div>
        <div class="info-row">
          <span class="label">Phone:</span>
          <span class="value" style="font-family: monospace;">${order.phone}</span>
        </div>
        <div class="info-row">
          <span class="label">Email:</span>
          <span class="value">${order.email}</span>
        </div>
        <div class="info-row" style="margin-top: 10px;">
          <span class="label" style="display: block; margin-bottom: 4px;">Delivery Address:</span>
          <span class="value" style="display: block; font-weight: normal; color: #44403c; line-height: 1.4;">
            ${order.address.street}<br>
            ${order.address.city}, ${order.address.state} - ${order.address.zipCode}<br>
            ${order.address.country}
          </span>
        </div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 40%">Item / Artifact Description</th>
          <th style="width: 15%">Size</th>
          <th style="width: 15%">Color Theme</th>
          <th style="width: 10%; text-align: center;">Qty</th>
          <th style="width: 10%; text-align: right;">Unit Price</th>
          <th style="width: 10%; text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>

    <div class="summary-section">
      <div class="summary-box">
        <div class="summary-row">
          <span class="label">Subtotal</span>
          <span class="value" style="font-family: monospace;">₹${order.totalAmount.toLocaleString('en-IN')}</span>
        </div>
        <div class="summary-row">
          <span class="label">Molding Base & Mirror Pack</span>
          <span class="value" style="color: #047857; font-weight: 600;">Included / FREE</span>
        </div>
        <div class="summary-row">
          <span class="label">Auspicious Shipping</span>
          <span class="value" style="color: #047857; font-weight: 600;">FREE</span>
        </div>
        <div class="summary-row grand-total">
          <span>GRAND TOTAL PAID</span>
          <span style="font-family: monospace;">₹${order.totalAmount.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>

    <div class="footer">
      <p class="quote">"Thank you for supporting hand-crafted artisan heritage. Each clay relief, mirror shard, and acrylic line is placed with pure mindfulness and positive vibration."</p>
      <div style="margin-bottom: 20px;">
        <p style="margin: 0; font-family: 'Playfair Display', Georgia, serif; font-weight: bold; color: var(--theme-accent); font-size: 14px;">Laksha Kandpal</p>
        <p style="margin: 2px 0 0 0; font-size: 9px; text-transform: uppercase; letter-spacing: 1.5px; color: #a8a29e;">Founder & Artist, Vlaksha Crafts</p>
      </div>
      <p style="font-size: 10px; color: #a8a29e; margin-top: 30px;">This is an officially generated order receipt. &copy; 2026 Vlaksha Crafts. All rights reserved.</p>
    </div>
    
    <button class="print-btn" onclick="window.print()">Print This Receipt</button>
  </div>
</body>
</html>
  `;

  // Create a blob and download it
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Vlaksha_Receipt_${order.id}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

function CategoryTile({ cat, idx, onSelect }: { cat: ArtCategory; idx: number; onSelect: () => void; key?: any }) {
  const images = cat.imageUrls && cat.imageUrls.length > 0 ? cat.imageUrls : (cat.imageUrl ? [cat.imageUrl] : []);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % images.length);
    }, 2500); // Cycle every 2.5s for a rich, visual gallery transition
    return () => clearInterval(interval);
  }, [images]);

  const hasBgImage = images.length > 0;

  return (
    <div
      onClick={onSelect}
      className="relative overflow-hidden aspect-square border border-[var(--theme-primary)]/20 flex flex-col justify-end p-4 group cursor-pointer transition-all duration-500 hover:scale-[1.03] hover:shadow-xl hover:border-[var(--theme-primary)] rounded-xs bg-[#1a1a1a]"
    >
      {/* Dynamic multiple image fader background */}
      {hasBgImage ? (
        <>
          {images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`${cat.label} angle ${i + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1000ms] ${
                i === currentImgIndex ? 'opacity-60 group-hover:opacity-80 scale-100 group-hover:scale-110 transition-all duration-[2500ms]' : 'opacity-0'
              }`}
              referrerPolicy="no-referrer"
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
          
          {/* Subtle multi-image slide progress indicators */}
          {images.length > 1 && (
            <div className="absolute top-2.5 right-2.5 flex gap-1 z-20">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`w-1 h-1 rounded-full transition-all duration-300 ${
                    i === currentImgIndex ? 'bg-[var(--theme-primary)] scale-125' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="absolute inset-0 bg-stone-950 z-10" />
      )}

      {/* Background Mandala Watermark Pattern */}
      <div className="absolute -right-8 -bottom-8 w-32 h-32 pointer-events-none transition-all duration-700 ease-out transform translate-x-4 translate-y-4 opacity-15 group-hover:opacity-30 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:rotate-45 z-20">
        <svg className="w-full h-full text-[var(--theme-primary)]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.75">
          <circle cx="50" cy="50" r="45" strokeDasharray="2 2" />
          <circle cx="50" cy="50" r="35" />
          <circle cx="50" cy="50" r="25" strokeDasharray="3 3" />
          <path d="M50 0 L50 100 M0 50 L100 50" />
        </svg>
      </div>

      <div className="relative z-30">
        <span className="text-[9px] uppercase tracking-widest font-sans text-[var(--theme-primary)] font-bold block mb-1">
          {cat.index || `0${idx + 1}`}
        </span>
        <h4 className="text-xs font-sans font-bold tracking-wider uppercase leading-snug text-white group-hover:text-[var(--theme-primary)] transition-colors">
          {cat.label}
        </h4>
        <p className="text-[10px] mt-0.5 font-sans leading-tight text-stone-300 line-clamp-2">
          {cat.desc}
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'shop' | 'about' | 'admin' | 'product-detail' | 'checkout' | 'order-confirmation' | 'ai-studio' | 'user-account' | 'user-login'>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<StudioSettings>(dbService.getSettings());
  const [userAuthMode, setUserAuthMode] = useState<'login' | 'register'>('login');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [urlOrderId, setUrlOrderId] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Wishlist Notification Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info'>('success');
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerToast = (message: string, type: 'success' | 'info' = 'success') => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(message);
    setToastType(type);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);
  
  // Catalogs
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [navbarSearchQuery, setNavbarSearchQuery] = useState<string>('');
  const [isTourPlaying, setIsTourPlaying] = useState<boolean>(false);
  const [selectedPriceRange, setSelectedPriceRange] = useState<number>(4000);
  const [selectedLeadTime, setSelectedLeadTime] = useState<string>('all');

  // PDP current customization state
  const [currentSize, setCurrentSize] = useState<string>('');
  const [currentColor, setCurrentColor] = useState<{ name: string; value: string }>({ name: '', value: '' });
  const [pdpCustomization, setPdpCustomization] = useState<{
    text: string;
    language: 'Hindi' | 'English' | 'Sanskrit';
    photoUrl?: string;
  } | null>(null);

  // Review form states
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSaved, setReviewSaved] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Checkout Form States
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingStreet, setShippingStreet] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingState, setShippingState] = useState('');
  const [shippingZip, setShippingZip] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'Netbanking' | 'Razorpay_Test'>('Razorpay_Test');

  // Coupon & Discount states
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Razorpay payment simulation modal
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);
  const [razorpayStep, setRazorpayStep] = useState<'qr' | 'processing' | 'success'>('qr');
  const [isPaying, setIsPaying] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial loading simulation for premium feel
    setTimeout(() => {
      setProducts(dbService.getProducts());
      setIsAdmin(dbService.isAdminAuthenticated());
      setCurrentUser(dbService.getCurrentUser());
      const initialSettings = dbService.getSettings();
      setSettings(initialSettings);
      
      dbService.syncSettingsFromFirestore().then((fsSettings) => {
        setSettings(fsSettings);
      });
      
       // Load cart from local storage if exists
      const savedCart = localStorage.getItem('vlaksha_cart');
      if (savedCart) setCart(JSON.parse(savedCart));
      
      // Load wishlist from local storage if exists
      const savedWishlist = localStorage.getItem('vlaksha_wishlist');
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

      // Deep link product check
      const params = new URLSearchParams(window.location.search);
      let deepLinkProductId = params.get('product');
      if (!deepLinkProductId && window.location.hash) {
        const hashMatch = window.location.hash.match(/#product=(.+)/);
        if (hashMatch) {
          deepLinkProductId = hashMatch[1];
        }
      }
      if (deepLinkProductId) {
        const p = dbService.getProductById(deepLinkProductId);
        if (p) {
          setSelectedProductId(deepLinkProductId);
          setCurrentSize(p.sizes[0]);
          setCurrentColor(p.colors[0]);
          setPdpCustomization(null);
          setCurrentView('product-detail');
        }
      }

      // Deep link order lookup check
      const queryOrderId = params.get('orderId');
      if (queryOrderId) {
        setUrlOrderId(queryOrderId);
        setCurrentView('home');
      }
      
      setIsLoading(false);
    }, 1200);
  }, []);

  // Sync cart with localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('vlaksha_cart', JSON.stringify(cart));
    }
  }, [cart, isLoading]);

  // Sync wishlist with localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('vlaksha_wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, isLoading]);

  // Sync customer checkout info when currentUser logs in
  useEffect(() => {
    setIsAdmin(dbService.isAdminAuthenticated());
    if (currentUser) {
      setCustomerName(currentUser.name);
      setCustomerEmail(currentUser.email);
      setCustomerPhone(currentUser.phone);
      setShippingStreet(currentUser.address?.street !== 'N/A' ? (currentUser.address?.street || '') : '');
      setShippingCity(currentUser.address?.city !== 'N/A' ? (currentUser.address?.city || '') : '');
      setShippingState(currentUser.address?.state !== 'N/A' ? (currentUser.address?.state || '') : '');
      setShippingZip(currentUser.address?.zipCode !== 'N/A' ? (currentUser.address?.zipCode || '') : '');
    } else {
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setShippingStreet('');
      setShippingCity('');
      setShippingState('');
      setShippingZip('');
    }
  }, [currentUser]);

  const handleProductUpdated = () => {
    setProducts(dbService.getProducts());
    setIsAdmin(dbService.isAdminAuthenticated());
  };

  const handleNavigate = (view: typeof currentView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewProduct = (pId: string) => {
    setSelectedProductId(pId);
    const p = dbService.getProductById(pId);
    if (p) {
      setCurrentSize(p.sizes[0]);
      setCurrentColor(p.colors[0]);
      setPdpCustomization(null); // reset customization form
    }
    setReviewSaved(false);
    setReviewComment('');
    setReviewName('');
    setReviewRating(5);
    handleNavigate('product-detail');
  };

  // Cart operations
  const handleAddToCart = () => {
    if (!selectedProductId) return;
    const product = dbService.getProductById(selectedProductId);
    if (!product) return;

    // Generate custom unique ID based on product ID, size, and color to keep separate basket lines
    const customHash = `${product.id}-${currentSize}-${currentColor.name}-${pdpCustomization?.text || ''}`;
    
    const existingIndex = cart.findIndex(item => item.id === customHash);
    if (existingIndex > -1) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += 1;
      setCart(newCart);
    } else {
      const newItem: CartItem = {
        id: customHash,
        product,
        quantity: 1,
        size: currentSize,
        color: currentColor,
        personalization: pdpCustomization || undefined
      };
      setCart([...cart, newItem]);
    }
    setIsCartOpen(true);
  };

  const handleToggleWishlist = (productId: string) => {
    const product = dbService.getProductById(productId);
    const productName = product ? product.name : 'Item';

    setWishlist(prev => {
      if (prev.includes(productId)) {
        triggerToast(`"${productName}" removed from wishlist.`, 'info');
        return prev.filter(id => id !== productId);
      } else {
        triggerToast(`"${productName}" added to wishlist!`, 'success');
        return [...prev, productId];
      }
    });
  };

  const handleShareProduct = async (product: Product) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?product=${product.id}`;
    const shareData = {
      title: product.name,
      text: `Take a look at this gorgeous handpainted ${product.category.replace('-', ' ')} craft by Vlaksha: "${product.name}"!`,
      url: shareUrl
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing via Web Share API:', err);
        handleCopyLink(shareUrl);
      }
    } else {
      handleCopyLink(shareUrl);
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    }).catch(err => {
      console.error('Failed to copy link:', err);
    });
  };

  const handleQuickAddToCart = (productId: string) => {
    const product = dbService.getProductById(productId);
    if (!product) return;

    const size = product.sizes[0] || '';
    const color = product.colors[0] || { name: '', value: '' };
    const customHash = `${product.id}-${size}-${color.name}-`;

    const existingIndex = cart.findIndex(item => item.id === customHash);
    if (existingIndex > -1) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += 1;
      setCart(newCart);
    } else {
      const newItem: CartItem = {
        id: customHash,
        product,
        quantity: 1,
        size,
        color
      };
      setCart([...cart, newItem]);
    }
    setIsCartOpen(true);
  };

  const handleReorder = (items: CartItem[]) => {
    if (!items || items.length === 0) return;
    
    setCart(prevCart => {
      let updatedCart = [...prevCart];
      items.forEach(newItem => {
        const customHash = `${newItem.product.id}-${newItem.size}-${newItem.color.name}-${newItem.personalization?.text || ''}`;
        const existingIndex = updatedCart.findIndex(item => item.id === customHash);
        
        if (existingIndex > -1) {
          updatedCart[existingIndex] = {
            ...updatedCart[existingIndex],
            quantity: updatedCart[existingIndex].quantity + newItem.quantity
          };
        } else {
          updatedCart.push({
            ...newItem,
            id: customHash
          });
        }
      });
      return updatedCart;
    });
    
    setIsCartOpen(true);
    triggerToast('All items from this order have been added to your cart!', 'success');
  };

  const handleUpdateCartQuantity = (itemId: string, delta: number) => {
    const updated = cart.map(item => {
      if (item.id === itemId) {
        const nextQ = item.quantity + delta;
        return { ...item, quantity: Math.max(1, nextQ) };
      }
      return item;
    });
    setCart(updated);
  };

  const handleRemoveCartItem = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    handleNavigate('checkout');
  };

  // Razorpay payment success handler
  const handleRazorpayMockPayment = () => {
    setRazorpayStep('processing');
    setTimeout(() => {
      setRazorpayStep('success');
      setTimeout(() => {
        setIsRazorpayModalOpen(false);
        finalizeOrder();
      }, 1500);
    }, 2000);
  };

  const handleApplyCoupon = (codeToApply: string) => {
    setCouponError('');
    setCouponSuccess('');
    const code = codeToApply.trim().toUpperCase();
    if (!code) {
      setCouponError('Please enter a coupon/voucher code.');
      return;
    }

    // Check if the code matches the user's earned rewards vouchers
    if (currentUser) {
      const emailKey = currentUser.email.trim().toLowerCase();
      const savedCouponsStr = localStorage.getItem(`vlaksha_coupons_${emailKey}`);
      if (savedCouponsStr) {
        const savedCoupons = JSON.parse(savedCouponsStr);
        const matchedCoupon = savedCoupons.find((c: any) => c.code.toUpperCase() === code);
        if (matchedCoupon) {
          if (matchedCoupon.isUsed) {
            setCouponError('This discount voucher has already been used on a previous order.');
            return;
          }
          setAppliedCoupon({ code: matchedCoupon.code, discount: matchedCoupon.discount });
          setCouponSuccess(`Voucher LAKSHA-250 applied successfully! ₹${matchedCoupon.discount} has been deducted from your order.`);
          return;
        }
      }
    }

    // Generic fallbacks for testing/promotion
    if (code === 'WELCOME100') {
      setAppliedCoupon({ code: 'WELCOME100', discount: 100 });
      setCouponSuccess('Promo code WELCOME100 applied successfully! ₹100 discount has been deducted.');
    } else if (code === 'FESTIVE500') {
      setAppliedCoupon({ code: 'FESTIVE500', discount: 500 });
      setCouponSuccess('Promo code FESTIVE500 applied successfully! ₹500 discount has been deducted.');
    } else {
      setCouponError('Invalid coupon code. Try signing in to apply your earned discount vouchers, or use WELCOME100!');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponSuccess('');
    setCouponError('');
    setCouponCodeInput('');
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const initiateRazorpayPayment = async (amount: number) => {
    setIsPaying(true);
    try {
      // 1. Get Razorpay configurations from backend
      const configRes = await fetch('/api/payment/config');
      const config = await configRes.json();
      
      if (!config.isActive) {
        throw new Error("Razorpay is not active or configured.");
      }

      // 2. Load the checkout.js script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay Checkout SDK. Check your internet connection.");
      }

      // 3. Create the Razorpay Order on the backend
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      
      if (!orderRes.ok) {
        const errData = await orderRes.json();
        throw new Error(errData.error || "Failed to create order on Razorpay servers.");
      }

      const rzpOrder = await orderRes.json();

      // 4. Open Razorpay Checkout standard UI
      const options = {
        key: config.keyId,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency || "INR",
        name: "Vlaksha Crafts",
        description: `Order Receipt ${rzpOrder.receipt}`,
        image: "https://vlakshacrafts.com/assets/logo.png",
        order_id: rzpOrder.id,
        handler: async function (response: any) {
          try {
            setIsPaying(true);
            // Verify payment on backend
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            const verification = await verifyRes.json();
            if (verification.success) {
              triggerToast('Payment verified successfully via Razorpay!', 'success');
              // Finalize order with completed status
              finalizeOrder();
            } else {
              throw new Error(verification.error || "Payment signature verification failed.");
            }
          } catch (verifyErr: any) {
            console.error("Payment verification error:", verifyErr);
            triggerToast(`Payment verification error: ${verifyErr.message || "Please contact support."}`, "info");
          } finally {
            setIsPaying(false);
          }
        },
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },
        theme: {
          color: "#1a2a4e",
        },
        modal: {
          ondismiss: function () {
            setIsPaying(false);
            triggerToast('Payment window closed. You can retry paying.', 'info');
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.warn("Real Razorpay error or unconfigured, falling back to Sandbox simulation modal:", err.message);
      // Fallback gracefully to the Sandbox Simulation Modal so flow is NEVER interrupted
      setIsPaying(false);
      setRazorpayStep('qr');
      setIsRazorpayModalOpen(true);
    }
  };

  const handlePlaceOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (paymentMethod === 'Razorpay_Test') {
      // Calculate final total to pay
      const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const userOrdersList = currentUser
        ? dbService.getOrders().filter(o => o.email.trim().toLowerCase() === currentUser.email.trim().toLowerCase())
        : [];
      const welcomeBonusVal = 100;
      const userPointsVal = userOrdersList.reduce((sum, order) => {
        const total = order.items.reduce((itemSum, item) => itemSum + (item.product.price * item.quantity), 0);
        return sum + Math.floor(total / 10);
      }, 0);
      const userTotalPointsVal = welcomeBonusVal + userPointsVal;
      
      let tierDiscountPercent = 0;
      if (currentUser) {
        if (userTotalPointsVal >= 3000) tierDiscountPercent = 15;
        else if (userTotalPointsVal >= 1500) tierDiscountPercent = 10;
        else if (userTotalPointsVal >= 500) tierDiscountPercent = 5;
      }
      
      const tierDiscountAmount = Math.floor(subtotal * (tierDiscountPercent / 100));
      const couponDiscountAmount = appliedCoupon ? appliedCoupon.discount : 0;
      const finalTotal = Math.max(0, subtotal - tierDiscountAmount - couponDiscountAmount);

      initiateRazorpayPayment(finalTotal);
    } else {
      finalizeOrder();
    }
  };

  const finalizeOrder = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    
    // Points & Tier calculations
    const userOrdersList = currentUser
      ? dbService.getOrders().filter(o => o.email.trim().toLowerCase() === currentUser.email.trim().toLowerCase())
      : [];
    const welcomeBonusVal = 100;
    const userPointsVal = userOrdersList.reduce((sum, order) => {
      const total = order.items.reduce((itemSum, item) => itemSum + (item.product.price * item.quantity), 0);
      return sum + Math.floor(total / 10);
    }, 0);
    const userTotalPointsVal = welcomeBonusVal + userPointsVal;
    
    let tierDiscountPercent = 0;
    if (currentUser) {
      if (userTotalPointsVal >= 3000) tierDiscountPercent = 15;
      else if (userTotalPointsVal >= 1500) tierDiscountPercent = 10;
      else if (userTotalPointsVal >= 500) tierDiscountPercent = 5;
    }
    
    const tierDiscountAmount = Math.floor(subtotal * (tierDiscountPercent / 100));
    const couponDiscountAmount = appliedCoupon ? appliedCoupon.discount : 0;
    const finalTotal = Math.max(0, subtotal - tierDiscountAmount - couponDiscountAmount);

    const newOrder: Order = {
      id: `VLX-${Math.floor(1000 + Math.random() * 9000)}`,
      items: cart,
      customerName,
      email: customerEmail,
      phone: customerPhone,
      address: {
        street: shippingStreet,
        city: shippingCity,
        state: shippingState,
        zipCode: shippingZip,
        country: 'India'
      },
      paymentMethod,
      paymentStatus: paymentMethod === 'Razorpay_Test' ? 'completed' : 'pending',
      orderStatus: 'received',
      totalAmount: finalTotal,
      createdAt: new Date().toISOString(),
      customNotes
    };

    // Pre-compose WhatsApp direct link message for order confirmation deep link
    const itemString = cart.map(item => `- ${item.product.name} (Size: ${item.size}, Qty: ${item.quantity}${item.personalization ? `, Custom Calligraphy: "${item.personalization.text}"` : ''})`).join('\n');
    const whatsappMsg = `Namaste Laksha,\n\nI have placed an order on Vlaksha Crafts!\n\n*Order ID:* ${newOrder.id}\n*Name:* ${customerName}\n*Phone:* ${customerPhone}\n*Items:*\n${itemString}\n\n*Total Paid:* ₹${finalTotal.toLocaleString('en-IN')}\n\nThank you! 🌸`;
    newOrder.whatsappLink = `https://wa.me/919548123456?text=${encodeURIComponent(whatsappMsg)}`;

    dbService.createOrder(newOrder);

    // Mark coupon as used in rewards program if applicable
    if (currentUser && appliedCoupon) {
      const emailKey = currentUser.email.trim().toLowerCase();
      const savedCouponsStr = localStorage.getItem(`vlaksha_coupons_${emailKey}`);
      if (savedCouponsStr) {
        const savedCoupons = JSON.parse(savedCouponsStr);
        const index = savedCoupons.findIndex((c: any) => c.code.toUpperCase() === appliedCoupon.code.toUpperCase());
        if (index !== -1) {
          savedCoupons[index].isUsed = true;
          localStorage.setItem(`vlaksha_coupons_${emailKey}`, JSON.stringify(savedCoupons));
        }
      }
    }

    // Reset coupon application states
    setAppliedCoupon(null);
    setCouponCodeInput('');
    setCouponSuccess('');
    setCouponError('');

    // Trigger automated server-side email upon order placement
    fetch('/api/send-order-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId: newOrder.id,
        customerName: newOrder.customerName,
        customerEmail: newOrder.email,
        customerPhone: newOrder.phone,
        totalAmount: newOrder.totalAmount,
        items: newOrder.items
      })
    })
    .then(res => res.json())
    .then(data => console.log('Server email automation response:', data))
    .catch(err => console.error('Failed to trigger automated order email:', err));

    setPlacedOrder(newOrder);
    setCart([]); // Clear cart
    handleNavigate('order-confirmation');
  };

  // Submit client review
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !reviewComment.trim()) return;

    dbService.addReview(selectedProductId, reviewName, reviewRating, reviewComment);
    setReviewSaved(true);
    // Reload products to update PDP average rating
    setProducts(dbService.getProducts());
  };

  // Filter Catalog logic
  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategoryFilter === 'all' || p.category === activeCategoryFilter;
    const matchesPrice = p.price <= selectedPriceRange;
    const matchesLeadTime = selectedLeadTime === 'all' 
      ? true 
      : selectedLeadTime === 'ready' 
      ? p.isReadyMade 
      : !p.isReadyMade;
    const matchesSearch = !navbarSearchQuery.trim() || 
      p.name.toLowerCase().includes(navbarSearchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(navbarSearchQuery.toLowerCase()) ||
      (p.materials && p.materials.some(m => m.toLowerCase().includes(navbarSearchQuery.toLowerCase())));
    return matchesCategory && matchesPrice && matchesLeadTime && matchesSearch;
  });

  const activeProduct = selectedProductId ? dbService.getProductById(selectedProductId) : null;
  const pdpReviews = selectedProductId ? dbService.getReviews(selectedProductId) : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex flex-col items-center justify-center p-6">
        <PetalLoader size="lg" text="Invoking Vlaksha Crafts Studio..." />
        <p className="text-[10px] text-amber-900/40 uppercase tracking-widest font-sans mt-2 animate-pulse">
          Crafting Mud-Mirror Shimmer & Mandalas
        </p>
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --theme-primary: ${settings.primaryColor || '#c5a059'};
          --theme-accent: ${settings.accentColor || '#1a2a4e'};
          --theme-bg: ${settings.bgColor || '#FCFBF7'};
          --theme-bg-alt: ${settings.bgAltColor || '#F4F1EA'};
          --theme-announcement-bg: ${settings.announcementBg || '#1a2a4e'};
          --theme-announcement-text: ${settings.announcementTextColor || '#ffffff'};
        }
        body {
          background-color: var(--theme-bg);
          color: #1a1a1a;
        }
        ${settings.enableGlowEffects ? `
        .glow-active {
          filter: drop-shadow(0 0 12px ${settings.primaryColor || '#c5a059'});
        }
        .shimmer-active {
          position: relative;
          overflow: hidden;
        }
        .shimmer-active::after {
          content: '';
          position: absolute;
          top: -150%;
          left: -150%;
          width: 300%;
          height: 300%;
          background: linear-gradient(
            45deg,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,0) 40%,
            rgba(255,255,255,0.4) 50%,
            rgba(255,255,255,0) 60%,
            rgba(255,255,255,0) 100%
          );
          transform: rotate(45deg);
          animation: mirrorGlimmer 6s infinite linear;
        }
        @keyframes mirrorGlimmer {
          0% { transform: translate(-30%, -30%) rotate(45deg); }
          100% { transform: translate(30%, 30%) rotate(45deg); }
        }
        ` : ''}
      ` }} />
      <div className="min-h-screen bg-[var(--theme-bg)] flex flex-col font-sans text-[#1a1a1a] selection:bg-[var(--theme-primary)] selection:text-white print:hidden">
      
      {/* Navigation Header */}
      <Navbar
        cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        wishlistCount={wishlist.length}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onNavigate={(v) => {
          if (v === 'admin') setIsAdmin(dbService.isAdminAuthenticated());
          handleNavigate(v);
        }}
        currentView={currentView}
        isAdmin={isAdmin}
        onAdminLogout={() => {
          dbService.logoutAdmin();
          setIsAdmin(false);
          handleNavigate('home');
        }}
        currentUser={currentUser}
        onOpenUserAuth={(mode) => {
          setUserAuthMode(mode || 'login');
          handleNavigate('user-login');
        }}
        onLogoutUser={() => {
          dbService.logoutUser();
          setCurrentUser(null);
          handleNavigate('home');
          triggerToast('Successfully signed out of your account.', 'info');
        }}
        announcementText={settings.announcementText}
        searchQuery={navbarSearchQuery}
        onSearchChange={(q) => {
          setNavbarSearchQuery(q);
          if (q.trim() && currentView !== 'shop') {
            handleNavigate('shop');
          }
        }}
      />

      {/* Main Container Stage */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* VIEW: HOME PAGE */}
        {currentView === 'home' && (
          <div className="space-y-16">
            
            {/* Elegant Hero Banner */}
            <div className="bg-[var(--theme-accent)] text-white rounded-xs overflow-hidden shadow-md relative grid grid-cols-1 lg:grid-cols-12 border border-[var(--theme-primary)]/20">
              {/* Background watermarks */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(197,160,89,0.08)_0%,transparent_50%)] pointer-events-none" />
              
              <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16 flex flex-col justify-center space-y-6 relative z-10">
                <span className="text-[var(--theme-primary)] font-sans text-[10px] tracking-[0.25em] flex items-center gap-1.5 uppercase font-medium">
                  <Sparkles className="w-4 h-4 animate-pulse text-[var(--theme-primary)]" />
                  <span>{settings.heroSubtitle || "Auspicious Sacred Geometry"}</span>
                </span>
                
                <h1 
                  className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight leading-tight text-white"
                  dangerouslySetInnerHTML={{ __html: settings.heroTitle || 'Intricate <span className="text-[var(--theme-primary)] italic font-normal">Lippan Mud-Mirror</span> reliefs & sacred mandalas' }}
                />
                
                <p className="text-xs sm:text-sm text-white/80 max-w-xl leading-relaxed font-sans font-light">
                  {settings.heroDescription || "Bring divine order, harmony, and shimmering beauty to your home with hand-painted mud-reliefs, custom wall clocks, and personalized nameplates, masterfully painted by artist Laksha Kandpal."}
                </p>

                <div className="flex flex-wrap gap-4 pt-2">
                  <button
                    onClick={() => {
                      setActiveCategoryFilter('all');
                      handleNavigate('shop');
                    }}
                    className="py-3 px-6 bg-[var(--theme-primary)] hover:bg-white hover:text-[var(--theme-accent)] text-white font-sans text-[11px] uppercase tracking-widest transition-all shadow-md"
                  >
                    {settings.heroButtonText || "Explore Handcrafted Catalog"}
                  </button>
                  <button
                    onClick={() => handleNavigate('about')}
                    className="py-3 px-6 border border-white/20 hover:border-[var(--theme-primary)] hover:text-[var(--theme-primary)] text-white font-sans text-[11px] uppercase tracking-widest transition-all"
                  >
                    Meet the Artist
                  </button>
                </div>

                {/* Handcrafted materials banner */}
                <div className="pt-4 border-t border-white/10 flex items-center gap-6 text-[9px] text-white/50 uppercase tracking-[0.2em] font-sans">
                  <span>MDF Backing</span>
                  <span className="text-[var(--theme-primary)]">•</span>
                  <span>Pure Glass Mirrors</span>
                  <span className="text-[var(--theme-primary)]">•</span>
                  <span>Fine Mud Relieving</span>
                </div>
              </div>

              {/* Decorative signature-piece side container */}
              <div className="lg:col-span-5 bg-[var(--theme-bg)] border-t lg:border-t-0 lg:border-l border-[var(--theme-primary)]/20 p-8 flex items-center justify-center relative">
                <div className="absolute top-4 right-4 flex gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--theme-accent)] shadow-sm" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--theme-primary)] shadow-sm" />
                  <span className="w-2.5 h-2.5 rounded-full bg-stone-300 shadow-sm" />
                </div>

                {/* Hero Showcase Item - Royal Indigo Wall Plate */}
                <div className="relative group select-none flex flex-col items-center">
                  <div className="relative w-64 h-64 rounded-full overflow-hidden border-[10px] border-[var(--theme-primary)]/10 shadow-lg transition-all duration-700 ease-out hover:scale-105 hover:rotate-12 cursor-pointer"
                    onClick={() => handleViewProduct('p1')}
                  >
                    <img
                      src={settings.heroImageUrl || "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600&auto=format&fit=crop"}
                      alt="Indigo Lippan Plate"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/10 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  </div>
                  
                  {/* Decorative tassel sway */}
                  <div className="flex gap-3 -mt-2.5 z-10">
                    <TasselAccent colors={['var(--theme-primary)', 'var(--theme-accent)']} length="sm" />
                    <TasselAccent colors={['#991B1B', 'var(--theme-primary)']} length="md" className="scale-105" />
                    <TasselAccent colors={['var(--theme-primary)', 'var(--theme-accent)']} length="sm" />
                  </div>

                  <span className="text-[10px] text-[var(--theme-primary)] font-sans tracking-[0.2em] font-medium uppercase mt-4 block">
                    Signature Indigo Lippan Plate
                  </span>
                  <span className="text-[10px] text-stone-500 font-sans tracking-wide mt-0.5">Click to rotate in 3D</span>
                </div>
              </div>
            </div>

            <MandalaDivider />

            {/* Category tiles */}
            <div className="space-y-8">
              <div className="text-center">
                <span className="text-[10px] uppercase font-sans tracking-[0.25em] text-[var(--theme-primary)] font-semibold block mb-1">
                  Sacred Collection
                </span>
                <h2 className="font-serif text-3xl font-light text-[#1a1a1a] tracking-tight">Shop by Art Form Category</h2>
                <p className="text-xs text-stone-500 max-w-md mx-auto mt-1 font-sans">
                  Each category showcases specific hand-molding and painting techniques on engineered wood bases.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {(settings.categories || []).map((cat, idx) => (
                  <CategoryTile
                    key={cat.id}
                    cat={cat}
                    idx={idx}
                    onSelect={() => {
                      setActiveCategoryFilter(cat.id);
                      handleNavigate('shop');
                    }}
                  />
                ))}
              </div>
            </div>

            <MandalaDivider />

            {/* Featured Crafts Products */}
            <div className="space-y-6">
              <div className="flex items-end justify-between border-b border-[var(--theme-primary)]/20 pb-2">
                <div>
                  <span className="text-[10px] uppercase font-sans tracking-[0.25em] text-[var(--theme-primary)] font-semibold block mb-1">
                    Fine Masterpieces
                  </span>
                  <h2 className="font-serif text-3xl font-light text-[#1a1a1a]">Hand-Picked Signatures</h2>
                </div>
                <button
                  onClick={() => {
                    setActiveCategoryFilter('all');
                    handleNavigate('shop');
                  }}
                  className="text-[11px] uppercase tracking-widest font-sans text-[var(--theme-primary)] font-semibold hover:text-[var(--theme-accent)] transition-colors flex items-center gap-1.5"
                >
                  <span>View entire collection</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.filter(p => p.featured).slice(0, 3).map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onViewDetails={handleViewProduct}
                    isWishlisted={wishlist.includes(p.id)}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
              </div>
            </div>

            <MandalaDivider />

            {/* Meet Laksha Kandpal Story Strip in Editorial style */}
            <div className="bg-white/40 border border-[var(--theme-primary)]/20 rounded-xs p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-xs">
              <div className="lg:col-span-5 flex justify-center relative">
                <div className="relative aspect-square w-full max-w-[280px] bg-[#f8f5ef] rounded-full overflow-hidden p-2 border border-[var(--theme-primary)]/30">
                  <LakshaPortrait variant="circle" className="w-full h-full rounded-full" />
                  {/* Glowing absolute jewel overlay */}
                  <div className="absolute bottom-2 right-2 p-1.5 rounded-full bg-[var(--theme-accent)] text-white border border-[var(--theme-primary)]/30 shadow-md">
                    <Sparkles className="w-4 h-4 text-[var(--theme-primary)]" />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-4">
                <span className="text-[10px] uppercase font-sans tracking-[0.25em] text-[var(--theme-primary)] font-semibold block">
                  The Maker Behind Vlaksha
                </span>
                <h2 className="font-serif text-3xl font-light text-[#1a1a1a]">Laksha Kandpal</h2>
                <blockquote className="font-serif italic text-stone-600 text-sm border-l-2 border-[var(--theme-primary)] pl-4 py-1 leading-relaxed">
                  &ldquo;For me, mud-mirror Lippan art and mandalas are not just crafts; they are spiritual practices of symmetry and focus. I want every single brushstroke to carry auspicious positive energy into your threshold.&rdquo;
                </blockquote>
                <p className="text-xs text-stone-600 leading-relaxed font-sans">
                  Founded by artist Laksha Kandpal, Vlaksha Crafts preserves traditional regional Indian relief art while incorporating customized nameplate calligraphy and contemporary jewel colors (Indigo, Saffron, Fuchsia). Every single piece is individually molded and hand-painted in her studio.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => handleNavigate('about')}
                    className="py-3 px-6 bg-[var(--theme-accent)] hover:bg-[var(--theme-primary)] text-white font-sans text-[11px] uppercase tracking-widest transition-all shadow-md"
                  >
                    Read Our Complete Story
                  </button>
                </div>
              </div>
            </div>

            <MandalaDivider />

            {/* Order Progress / Status Lookup Tracker */}
            <OrderStatusChecker initialOrderId={urlOrderId} />

            <MandalaDivider />

            {/* Testimonials Panel */}
            <div className="space-y-6">
              <div className="text-center">
                <span className="text-[10px] uppercase font-sans tracking-[0.25em] text-[var(--theme-primary)] font-semibold block mb-1">
                  Patron Testimonials
                </span>
                <h2 className="font-serif text-3xl font-light text-[#1a1a1a] tracking-tight">Appreciated by Art Patrons</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { name: 'Dr. Shruti Iyer', loc: 'Delhi', text: 'Placed the Ganesha Lippan panel in my temple. The mirror arrangement is highly precise, creating a glorious shine when lit. Extremely pleased with Lakshas work!' },
                  { name: 'Abhishek Sharma', loc: 'Bangalore', text: 'The customized Sanskrit calligraphy nameplate has become the center of attention on our entrance threshold. Exceptional tassel finish!' },
                  { name: 'Ritu Phogat', loc: 'Gurugram', text: 'Highly recommend the Mandala Clocks. It works with a silent sweeping hand which is completely noise-free, and the hand-painted dots are incredibly uniform.' }
                ].map((test, i) => (
                  <div key={i} className="bg-[var(--theme-bg)] border border-[var(--theme-primary)]/20 rounded-xs p-5 shadow-xs relative">
                    <div className="flex text-[var(--theme-primary)] gap-0.5 mb-3">
                      {[...Array(5)].map((_, idx) => <Star key={idx} className="w-3.5 h-3.5 fill-current" />)}
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed italic font-sans mb-4">&ldquo;{test.text}&rdquo;</p>
                    <div className="border-t border-[var(--theme-primary)]/10 pt-3">
                      <span className="font-serif text-xs font-semibold text-stone-900 block">{test.name}</span>
                      <span className="text-[10px] text-stone-400 block font-mono">{test.loc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* VIEW: SHOP CATALOG PAGE */}
        {currentView === 'shop' && (
          <div className="space-y-8">
            <div className="border-b border-[var(--theme-primary)]/20 pb-4">
              <h2 className="font-serif text-3xl font-light text-[#1a1a1a] tracking-tight">The Handcrafted Crafts Catalog</h2>
              <p className="text-xs text-stone-500 mt-1 font-sans">
                Each mud-mirror relief is made-to-order. Filter by category, color palettes, or price.
              </p>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left sidebar filters */}
              <div className="lg:col-span-3 bg-[var(--theme-bg)] border border-[var(--theme-primary)]/20 rounded-xs p-5 space-y-6">
                
                {/* Category Filters */}
                <div>
                  <h4 className="text-[10px] font-semibold font-sans uppercase tracking-[0.2em] text-[var(--theme-primary)] mb-4">
                    Craft Categories
                  </h4>
                  <div className="space-y-1">
                    {[
                      { id: 'all', label: 'All Hand-Crafts' },
                      ...(settings.categories || []).map(c => ({ id: c.id, label: c.label }))
                    ].map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategoryFilter(cat.id)}
                        className={`w-full text-left px-3 py-2 rounded-none text-xs font-serif transition-all flex justify-between items-center ${
                          activeCategoryFilter === cat.id
                            ? 'bg-[var(--theme-accent)]/5 text-[var(--theme-accent)] font-semibold border-l-2 border-[var(--theme-primary)]'
                            : 'text-stone-600 hover:bg-[#f8f5ef] hover:text-stone-950'
                        }`}
                      >
                        <span>{cat.label}</span>
                        {activeCategoryFilter === cat.id && <span className="w-1.5 h-1.5 rounded-full bg-[var(--theme-primary)]" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-[10px] font-semibold font-sans uppercase tracking-[0.2em] text-[var(--theme-primary)]">
                      Price Threshold
                    </h4>
                    <span className="text-xs font-mono font-medium text-[#1a1a1a]">₹{selectedPriceRange}</span>
                  </div>
                  <input
                    type="range"
                    min="700"
                    max="4000"
                    step="100"
                    value={selectedPriceRange}
                    onChange={(e) => setSelectedPriceRange(Number(e.target.value))}
                    className="w-full accent-[var(--theme-primary)] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400 font-mono mt-1">
                    <span>₹700</span>
                    <span>₹4,000</span>
                  </div>
                </div>

                {/* Lead Time Filter */}
                <div>
                  <h4 className="text-[10px] font-semibold font-sans uppercase tracking-[0.2em] text-[var(--theme-primary)] mb-3">
                    Availability
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedLeadTime('all')}
                      className={`py-2 px-2.5 rounded-none text-[10px] uppercase tracking-wider font-sans transition-all border ${
                        selectedLeadTime === 'all'
                          ? 'bg-[var(--theme-accent)] text-white border-[var(--theme-accent)]'
                          : 'bg-white border-[var(--theme-primary)]/20 text-stone-600 hover:bg-[#f8f5ef]'
                      }`}
                    >
                      All Crafts
                    </button>
                    <button
                      onClick={() => setSelectedLeadTime('ready')}
                      className={`py-2 px-2.5 rounded-none text-[10px] uppercase tracking-wider font-sans transition-all border ${
                        selectedLeadTime === 'ready'
                          ? 'bg-[var(--theme-accent)] text-white border-[var(--theme-accent)]'
                          : 'bg-white border-[var(--theme-primary)]/20 text-stone-600 hover:bg-[#f8f5ef]'
                      }`}
                    >
                      Ready-Made
                    </button>
                  </div>
                </div>

              </div>

              {/* Right products grid */}
              <div className="lg:col-span-9 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-stone-500 font-mono">
                    Showing {filteredProducts.length} unique handcrafted pieces
                  </span>
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="text-center py-16 bg-white border border-[var(--theme-primary)]/15 rounded-none p-6 text-stone-400">
                    <AlertCircle className="w-12 h-12 mx-auto text-[var(--theme-primary)]/50 mb-3 stroke-[1.5]" />
                    <p className="font-serif text-sm">No crafts match your filter constraints.</p>
                    <button
                      onClick={() => {
                        setActiveCategoryFilter('all');
                        setSelectedPriceRange(4000);
                        setSelectedLeadTime('all');
                      }}
                      className="mt-4 text-xs font-serif text-[var(--theme-primary)] font-semibold hover:underline"
                    >
                      Reset all filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((p) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        onViewDetails={handleViewProduct}
                        isWishlisted={wishlist.includes(p.id)}
                        onToggleWishlist={handleToggleWishlist}
                      />
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* VIEW: PRODUCT DETAIL PAGE (PDP) */}
        {currentView === 'product-detail' && activeProduct && (
          <div className="space-y-12">
            
            {/* Back button */}
            <button
              onClick={() => handleNavigate('shop')}
              className="text-[10px] uppercase tracking-widest font-sans text-stone-600 hover:text-[var(--theme-primary)] flex items-center gap-1.5 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Craft Catalog</span>
            </button>

            {/* Main Details Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Interactive 3D Viewer Area */}
              <div className="lg:col-span-6 space-y-4">
                <ThreeDViewer product={activeProduct} selectedColor={currentColor} />
              </div>

              {/* Right Description & Customization form Area */}
              <div className="lg:col-span-6 space-y-6">
                <div>
                  <span className="text-[10px] font-sans tracking-[0.25em] text-[var(--theme-primary)] font-semibold block uppercase">
                    {activeProduct.category.replace('-', ' ')}
                  </span>
                  <h1 className="font-serif text-3xl font-light text-[#1a1a1a] mt-1 tracking-tight">
                    {activeProduct.name}
                  </h1>
                  
                  {/* Rating overview */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex text-[var(--theme-primary)] gap-0.5">
                      {[...Array(5)].map((_, idx) => (
                        <Star
                          key={idx}
                          className={`w-4 h-4 ${idx < Math.floor(activeProduct.rating) ? 'fill-current' : ''}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-stone-700 font-semibold">{activeProduct.rating} Stars</span>
                    <span className="text-stone-300">•</span>
                    <span className="text-xs text-stone-500">{activeProduct.reviewsCount} verified reviews</span>
                  </div>
                </div>

                <div className="bg-[var(--theme-bg)] border border-[var(--theme-primary)]/20 p-4 rounded-none space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.15em] font-sans text-[var(--theme-primary)] font-semibold">Craft Price</span>
                    <span className="text-xl font-bold font-mono text-stone-950">
                      ₹{activeProduct.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-[10px] text-stone-500 flex items-center gap-1 pt-1.5 border-t border-[var(--theme-primary)]/10">
                    <Clock className="w-3.5 h-3.5 text-[var(--theme-primary)] shrink-0" />
                    <span>Estimated hand-painting timeline: <strong className="text-stone-900 font-bold">{activeProduct.leadTimeDays} days</strong> lead-time</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
                  {activeProduct.description}
                </p>

                {/* Diameter / Size selection */}
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.15em] font-semibold text-[var(--theme-primary)] mb-2 font-sans">
                    Select Dimensions / Diameter
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {activeProduct.sizes.map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setCurrentSize(sz)}
                        className={`py-1.5 px-3.5 text-xs rounded-none font-mono font-bold border transition-colors ${
                          currentSize === sz
                            ? 'bg-[var(--theme-accent)] text-white border-[var(--theme-accent)] shadow-xs'
                            : 'bg-white border-[var(--theme-primary)]/20 text-stone-600 hover:bg-[#f8f5ef]'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selector */}
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.15em] font-semibold text-[var(--theme-primary)] mb-2 font-sans flex items-center justify-between">
                    <span>Select Color Theme Palette</span>
                    <span className="text-[10px] text-[var(--theme-primary)] font-medium italic font-serif">Alters 3D Viewer rim color</span>
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {activeProduct.colors.map((col) => (
                      <button
                        key={col.name}
                        onClick={() => setCurrentColor(col)}
                        className={`p-1 rounded-full border-2 transition-all flex items-center justify-center ${
                          currentColor.name === col.name ? 'border-[var(--theme-accent)] scale-110' : 'border-transparent'
                        }`}
                        title={col.name}
                      >
                        <span
                          className="w-5 h-5 rounded-full inline-block border border-black/10 shadow-inner"
                          style={{ backgroundColor: col.value }}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] text-stone-500 font-sans block mt-1">Selected theme: <strong>{currentColor.name}</strong></span>
                </div>

                {/* Personalization Calligraphy Form (if customizable) */}
                {activeProduct.isPersonalizable && (
                  <CustomizeForm
                    onCustomize={(data) => setPdpCustomization(data)}
                    leadTimeDays={activeProduct.leadTimeDays}
                  />
                )}

                {/* Core Add to basket CTA button */}
                <div className="space-y-2 pt-2">
                  {activeProduct.isPersonalizable && !pdpCustomization && (
                    <p className="text-[10px] text-stone-700 font-semibold flex items-center gap-1 bg-[var(--theme-primary)]/5 p-2 rounded-none border border-[var(--theme-primary)]/20">
                      <Settings className="w-3.5 h-3.5 animate-spin-slow" />
                      <span>Note: Please fill in personalization text above before adding to basket.</span>
                    </p>
                  )}
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handleAddToCart}
                      disabled={activeProduct.isPersonalizable && !pdpCustomization}
                      className={`flex-1 py-3.5 rounded-none font-sans text-[11px] uppercase tracking-widest font-bold transition-all shadow-md flex items-center justify-center gap-1.5 ${
                        activeProduct.isPersonalizable && !pdpCustomization
                          ? 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed shadow-none'
                          : 'bg-[var(--theme-accent)] text-white hover:bg-[var(--theme-primary)] hover:scale-[1.01]'
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add Handpainted Craft to Basket</span>
                    </button>

                    <button
                      onClick={() => handleToggleWishlist(activeProduct.id)}
                      className={`px-4 rounded-none border transition-all flex items-center justify-center ${
                        wishlist.includes(activeProduct.id)
                          ? 'border-red-200 bg-red-50/95 text-red-500 scale-105 shadow-xs'
                          : 'border-[var(--theme-primary)]/25 hover:border-red-200 text-stone-500 hover:text-red-500 hover:bg-red-50/50'
                      }`}
                      title={wishlist.includes(activeProduct.id) ? "Remove from Saved" : "Save for Later"}
                    >
                      <Heart className={`w-5 h-5 ${wishlist.includes(activeProduct.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Custom Elegant Share Block */}
                <div className="border-t border-[var(--theme-primary)]/15 pt-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.15em] font-semibold font-sans text-stone-500">
                      Share This Craft
                    </span>
                    {shareCopied && (
                      <span className="text-[10px] text-emerald-600 font-sans font-bold flex items-center gap-1 bg-emerald-50 border border-emerald-200/50 px-2.5 py-0.5 animate-fadeIn">
                        <Check className="w-3 h-3" />
                        <span>Link copied!</span>
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {/* Primary Web Share API button */}
                    <button
                      onClick={() => handleShareProduct(activeProduct)}
                      className="flex items-center gap-1.5 py-2 px-3 border border-[var(--theme-primary)]/25 bg-[var(--theme-bg)] hover:bg-[var(--theme-accent)] hover:text-white hover:border-[var(--theme-accent)] text-[var(--theme-accent)] font-sans text-[10px] uppercase tracking-widest font-bold transition-all shadow-xs"
                      title="Share using device options"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Device Share</span>
                    </button>

                    {/* Copy Link fallback explicitly */}
                    <button
                      onClick={() => {
                        const url = `${window.location.origin}${window.location.pathname}?product=${activeProduct.id}`;
                        handleCopyLink(url);
                      }}
                      className="flex items-center gap-1.5 py-2 px-3 border border-stone-200 hover:bg-stone-50 text-stone-600 font-sans text-[10px] uppercase tracking-widest font-bold transition-all"
                      title="Copy link to clipboard"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </button>

                    {/* WhatsApp social share */}
                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this gorgeous handpainted craft by Vlaksha: "${activeProduct.name}"! ${window.location.origin}${window.location.pathname}?product=${activeProduct.id}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 py-2 px-3 border border-[#25D366]/30 hover:bg-[#25D366]/5 text-[#128C7E] font-sans text-[10px] uppercase tracking-widest font-bold transition-all"
                      title="Share on WhatsApp"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.488 1.98 14.024.954 11.411.954c-5.454 0-9.897 4.373-9.9 9.801-.001 1.737.472 3.428 1.368 4.908l-.946 3.454 3.593-.933zm11.758-6.113c-.312-.156-1.848-.91-2.13-.1.101-.282-.117-.312-.424-.468-.31-.156-1.313-.483-2.5-.154-1.187.329-2.05.975-2.612 1.54-.562.565-1.564 1.562-1.564 3.41 0 1.847 1.344 3.633 1.53 3.883.187.25 2.64 4.03 6.398 5.656.895.388 1.592.619 2.136.793.899.285 1.717.244 2.363.148.72-.108 2.13-.87 2.43-1.71.3-.84.3-1.56.21-1.71-.09-.15-.312-.24-.624-.396z" />
                      </svg>
                      <span>WhatsApp</span>
                    </a>

                    {/* Pinterest social share */}
                    <a
                      href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(`${window.location.origin}${window.location.pathname}?product=${activeProduct.id}`)}&media=${encodeURIComponent(activeProduct.images[0])}&description=${encodeURIComponent(activeProduct.description)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 py-2 px-3 border border-red-200 hover:bg-red-50/40 text-red-600 font-sans text-[10px] uppercase tracking-widest font-bold transition-all"
                      title="Pin on Pinterest"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.4 7.63 11.16-.1-.95-.2-2.4.04-3.43.22-.93 1.4-5.93 1.4-5.93s-.36-.72-.36-1.77c0-1.66.96-2.9 2.12-2.9 1 0 1.48.75 1.48 1.65 0 1-.64 2.5-.97 3.89-.28 1.18.59 2.14 1.75 2.14 2.1 0 3.72-2.22 3.72-5.43 0-2.84-2.04-4.82-4.94-4.82-3.37 0-5.35 2.53-5.35 5.14 0 1.02.39 2.11.88 2.7.1.12.11.23.08.35-.09.37-.3 1.22-.34 1.39-.06.23-.19.28-.44.17-1.63-.76-2.65-3.14-2.65-5.05 0-4.11 3-7.89 8.61-7.89 4.52 0 8.04 3.22 8.04 7.54 0 4.5-2.83 8.11-6.76 8.11-1.32 0-2.56-.69-2.99-1.51l-.81 3.1c-.29 1.12-1.09 2.53-1.62 3.39C10.15 23.86 11.06 24 12 24c6.63 0 12-5.37 12-12S18.63 0 12 0z" />
                      </svg>
                      <span>Pinterest</span>
                    </a>
                  </div>
                </div>

                {/* Materials & Technique Description details accordion */}
                <div className="border-t border-[var(--theme-primary)]/20 pt-4 space-y-2">
                  <h4 className="text-[10px] uppercase tracking-[0.15em] font-semibold font-sans text-[var(--theme-primary)]">Materials & Care Instructions</h4>
                  <ul className="text-xs text-stone-500 space-y-1 font-sans list-disc pl-4 leading-relaxed">
                    {activeProduct.materials.map((m, idx) => <li key={idx}>{m}</li>)}
                    <li>Care: Wipe gently with a dry micro-fiber cloth. Keep away from direct water splashes and heavy moisture environments.</li>
                  </ul>
                </div>

              </div>
            </div>

            <MandalaDivider />

            {/* Product Reviews & Star Feedback Submission Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Star rating summary & Write Review Form */}
              <div className="lg:col-span-5 bg-[var(--theme-bg)] border border-[var(--theme-primary)]/20 p-5 rounded-none shadow-xs space-y-4">
                <h3 className="font-serif text-lg font-light text-[#1a1a1a]">Add Customer Review</h3>
                <p className="text-xs text-stone-500 font-sans">Have you purchased work from Laksha? Share your photo and rating feedback with our community.</p>

                {reviewSaved ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-none text-center font-sans space-y-1">
                    <p className="font-bold">✓ Review Submitted successfully!</p>
                    <p className="text-[10px]">Your feedback is now visible in the list on the right.</p>
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-sans uppercase tracking-[0.1em] font-semibold text-stone-700 mb-1">Your Full Name</label>
                      <input
                        type="text"
                        required
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        placeholder="e.g. Shruti Pathak"
                        className="w-full text-xs py-2 px-3 bg-white border border-[var(--theme-primary)]/20 rounded-none focus:outline-hidden focus:border-[var(--theme-accent)]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-sans uppercase tracking-[0.1em] font-semibold text-stone-700 mb-1">Star Rating (1 - 5)</label>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map(num => (
                          <button
                            type="button"
                            key={num}
                            onClick={() => setReviewRating(num)}
                            className="p-0.5 text-[var(--theme-primary)] focus:outline-hidden"
                          >
                            <Star className={`w-5 h-5 ${num <= reviewRating ? 'fill-current' : ''}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-sans uppercase tracking-[0.1em] font-semibold text-stone-700 mb-1">Comment & Experience Details</label>
                      <textarea
                        required
                        rows={3}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Details about packaging, mirror sheen, paint, or custom tassel elements..."
                        className="w-full text-xs py-2 px-3 bg-white border border-[var(--theme-primary)]/20 rounded-none focus:outline-hidden focus:border-[var(--theme-accent)]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[var(--theme-accent)] hover:bg-[var(--theme-primary)] text-white font-sans text-[11px] uppercase tracking-widest rounded-none transition-colors"
                    >
                      Publish Client Feedback
                    </button>
                  </form>
                )}
              </div>

              {/* Reviews List */}
              <div className="lg:col-span-7 space-y-4">
                <h3 className="font-serif text-lg font-light text-[#1a1a1a] border-b border-[var(--theme-primary)]/20 pb-2">
                  Verified Client Reviews ({pdpReviews.length})
                </h3>

                {pdpReviews.length === 0 ? (
                  <p className="text-xs text-stone-400 italic text-center py-6">No client reviews registered yet. Be the first to add!</p>
                ) : (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {pdpReviews.map((rev) => (
                      <div key={rev.id} className="bg-white border border-[var(--theme-primary)]/15 rounded-none p-4 shadow-xs relative">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-serif text-xs font-semibold text-stone-800 block">{rev.userName}</span>
                            <span className="text-[10px] text-stone-400 block font-mono">{rev.date}</span>
                          </div>
                          <div className="flex text-[var(--theme-primary)] gap-0.5">
                            {[...Array(5)].map((_, idx) => (
                              <Star
                                key={idx}
                                className={`w-3 h-3 ${idx < rev.rating ? 'fill-current' : ''}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-stone-600 font-sans leading-relaxed mt-2 italic">&ldquo;{rev.comment}&rdquo;</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* VIEW: CHECKOUT PAGE */}
        {currentView === 'checkout' && (
          <div className="space-y-8">
            <div className="border-b border-amber-900/10 pb-4 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl text-stone-900 font-medium">Boutique Checkout</h2>
                <p className="text-xs text-stone-500 mt-1">Please provide shipping address and select checkout options.</p>
              </div>
              <button
                onClick={() => handleNavigate('shop')}
                className="text-xs text-stone-500 hover:text-amber-800 font-serif italic"
              >
                Continue Shopping
              </button>
            </div>

            {!currentUser ? (
              <div className="max-w-2xl mx-auto my-4 space-y-6">
                <div className="text-center bg-[var(--theme-bg)] border border-[var(--theme-primary)]/20 p-5 shadow-xs">
                  <p className="text-xs text-stone-600 font-sans max-w-lg mx-auto leading-relaxed">
                    ✨ <strong>Account Sign-In Required:</strong> To securely manage your custom handmade Lippan orders, coordinate mirror placements with Laksha, and receive real-time updates, please sign in or create an account.
                  </p>
                </div>
                <UserAuth
                  initialMode={userAuthMode}
                  onAuthSuccess={(user) => {
                    setCurrentUser(user);
                    triggerToast(`Namaste, ${user.name}! Welcome back to Vlaksha Crafts.`, 'success');
                  }}
                  onCancel={() => handleNavigate('shop')}
                />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Form column */}
              <form onSubmit={handlePlaceOrderSubmit} className="lg:col-span-7 space-y-6">
                
                {/* Personal Information */}
                <div className="bg-[var(--theme-bg)] border border-amber-900/10 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-stone-200/55 pb-2">
                    <h3 className="font-serif text-base font-semibold text-stone-900">1. Contact & Customer Details</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-stone-500 font-sans">Logged in as {currentUser.name.split(' ')[0]}</span>
                      <button
                        type="button"
                        onClick={() => {
                          dbService.logoutUser();
                          setCurrentUser(null);
                          triggerToast('Signed out successfully.', 'info');
                        }}
                        className="text-[10px] text-red-600 hover:text-red-800 font-sans uppercase tracking-wider font-semibold bg-red-50 hover:bg-red-100/40 px-2 py-0.5 border border-red-200/30 transition-all rounded-sm"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-sans uppercase tracking-wider font-semibold text-stone-700 mb-1">Full Client Name</label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Shruti Pathak"
                        className="w-full text-xs py-2 px-3 bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-sans uppercase tracking-wider font-semibold text-stone-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="e.g. shruti@example.com"
                        className="w-full text-xs py-2 px-3 bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-600"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-sans uppercase tracking-wider font-semibold text-stone-700 mb-1">
                        Active WhatsApp Mobile Number <span className="text-[9px] text-stone-400 lowercase">(Required for order updates)</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="e.g. +91 95481 23456"
                        className="w-full text-xs py-2 px-3 bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Details */}
                <div className="bg-[var(--theme-bg)] border border-amber-900/10 rounded-2xl p-5 shadow-xs space-y-4">
                  <h3 className="font-serif text-base font-semibold text-stone-900">2. Delivery Address</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-sans uppercase tracking-wider font-semibold text-stone-700 mb-1">Street address, Block, Sector</label>
                      <input
                        type="text"
                        required
                        value={shippingStreet}
                        onChange={(e) => setShippingStreet(e.target.value)}
                        placeholder="e.g. Flat 501, Tulip Heights, Sector 15"
                        className="w-full text-xs py-2 px-3 bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-600"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-sans uppercase tracking-wider font-semibold text-stone-700 mb-1">City</label>
                        <input
                          type="text"
                          required
                          value={shippingCity}
                          onChange={(e) => setShippingCity(e.target.value)}
                          placeholder="e.g. Noida"
                          className="w-full text-xs py-2 px-3 bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-sans uppercase tracking-wider font-semibold text-stone-700 mb-1">State</label>
                        <input
                          type="text"
                          required
                          value={shippingState}
                          onChange={(e) => setShippingState(e.target.value)}
                          placeholder="e.g. Uttar Pradesh"
                          className="w-full text-xs py-2 px-3 bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-sans uppercase tracking-wider font-semibold text-stone-700 mb-1">Pincode / ZIP</label>
                        <input
                          type="text"
                          required
                          value={shippingZip}
                          onChange={(e) => setShippingZip(e.target.value)}
                          placeholder="e.g. 201301"
                          className="w-full text-xs py-2 px-3 bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-600 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-sans uppercase tracking-wider font-semibold text-stone-700 mb-1">Country</label>
                        <input
                          type="text"
                          disabled
                          value="India"
                          className="w-full text-xs py-2 px-3 bg-stone-100 border border-stone-200 rounded-lg text-stone-500 font-sans"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Custom Notes */}
                <div className="bg-[var(--theme-bg)] border border-amber-900/10 rounded-2xl p-5 shadow-xs space-y-4">
                  <h3 className="font-serif text-base font-semibold text-stone-900">3. Notes for Artist Laksha Kandpal</h3>
                  
                  <div>
                    <label className="block text-[10px] font-sans uppercase tracking-wider font-semibold text-stone-700 mb-1">Custom demands or Gifting notes (Optional)</label>
                    <textarea
                      rows={2}
                      value={customNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      placeholder="e.g. Please wrap it securely as a housewarming gift. Or add blue tassels if possible..."
                      className="w-full text-xs py-2 px-3 bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-600"
                    />
                  </div>
                </div>

                {/* Checkout Payment choice */}
                <div className="bg-[var(--theme-bg)] border border-amber-900/10 rounded-2xl p-5 shadow-xs space-y-4">
                  <h3 className="font-serif text-base font-semibold text-stone-900">4. Payment Gateway</h3>
                  
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-amber-600 bg-amber-500/5 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="payment_choice"
                        checked={paymentMethod === 'Razorpay_Test'}
                        onChange={() => setPaymentMethod('Razorpay_Test')}
                        className="accent-amber-900 scale-110"
                      />
                      <div className="flex-1">
                        <span className="text-xs font-bold text-stone-900 block font-sans">Razorpay Secure Sandbox (UPI QR, Cards, UPI)</span>
                        <span className="text-[10px] text-[#4A5568] block mt-0.5">Test simulation gateway. Highly recommended for testing orders.</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-lg border border-stone-200 hover:bg-stone-50 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="payment_choice"
                        checked={paymentMethod === 'UPI'}
                        onChange={() => setPaymentMethod('UPI')}
                        className="accent-amber-900 scale-110"
                      />
                      <div className="flex-1">
                        <span className="text-xs font-bold text-stone-950 block">Offline Bank / Manual Transfer</span>
                        <span className="text-[10px] text-stone-500 block mt-0.5">Pay via direct UPI afterwards. Status remains Pending until verified by founder.</span>
                      </div>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPaying}
                  className="w-full py-3.5 rounded-none bg-[var(--theme-accent)] hover:bg-[var(--theme-primary)] disabled:bg-stone-400 text-white font-sans text-xs font-semibold tracking-widest uppercase transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  {isPaying ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing Secure Payment...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" />
                      <span>Verify and Place Handpainted Order</span>
                    </>
                  )}
                </button>

              </form>

              {/* Right Basket summary column */}
              <div className="lg:col-span-5 bg-[var(--theme-bg)] border border-[var(--theme-primary)]/20 rounded-none p-5 shadow-xs sticky top-24 space-y-4">
                <h3 className="font-serif text-base font-light text-[#1a1a1a] tracking-tight border-b border-[var(--theme-primary)]/15 pb-2">
                  Basket Summary
                </h3>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-2.5 items-start">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover shrink-0 border border-stone-200"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-serif font-bold text-stone-800 truncate">{item.product.name}</p>
                        <p className="text-[10px] text-stone-400 font-mono">Size: {item.size} | Qty: {item.quantity}</p>
                        {item.personalization && (
                          <p className="text-[9px] italic text-[var(--theme-primary)] font-serif font-medium truncate font-sans">Custom: &ldquo;{item.personalization.text}&rdquo;</p>
                        )}
                      </div>
                      <span className="text-xs font-bold font-mono text-stone-900 shrink-0">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                {(() => {
                  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
                  
                  // Points & Tier calculations
                  const userOrdersList = currentUser
                    ? dbService.getOrders().filter(o => o.email.trim().toLowerCase() === currentUser.email.trim().toLowerCase())
                    : [];
                  const welcomeBonusVal = 100;
                  const userPointsVal = userOrdersList.reduce((sum, order) => {
                    const total = order.items.reduce((itemSum, item) => itemSum + (item.product.price * item.quantity), 0);
                    return sum + Math.floor(total / 10);
                  }, 0);
                  const userTotalPointsVal = welcomeBonusVal + userPointsVal;
                  
                  // Fetch redeemed points from localStorage to calculate remaining balance
                  let redeemedPointsVal = 0;
                  if (currentUser) {
                    const emailKey = currentUser.email.trim().toLowerCase();
                    const savedRedeemed = localStorage.getItem(`vlaksha_redeemed_points_${emailKey}`);
                    if (savedRedeemed) {
                      redeemedPointsVal = parseInt(savedRedeemed, 10);
                    }
                  }
                  const currentBalanceVal = Math.max(0, userTotalPointsVal - redeemedPointsVal);
                  
                  let tierName = 'Bronze Crafter';
                  let tierDiscountPercent = 0;
                  let tierColor = 'text-stone-500 bg-stone-50 border-stone-200';
                  
                  if (currentUser) {
                    if (userTotalPointsVal >= 3000) {
                      tierName = 'Diamond Connoisseur';
                      tierDiscountPercent = 15;
                      tierColor = 'text-cyan-700 bg-cyan-50 border-cyan-200';
                    } else if (userTotalPointsVal >= 1500) {
                      tierName = 'Gold Collector';
                      tierDiscountPercent = 10;
                      tierColor = 'text-amber-700 bg-amber-50 border-amber-200';
                    } else if (userTotalPointsVal >= 500) {
                      tierName = 'Silver Patron';
                      tierDiscountPercent = 5;
                      tierColor = 'text-stone-700 bg-stone-50 border-stone-200';
                    }
                  }
                  
                  const tierDiscountAmount = Math.floor(subtotal * (tierDiscountPercent / 100));
                  const couponDiscountAmount = appliedCoupon ? appliedCoupon.discount : 0;
                  const finalTotal = Math.max(0, subtotal - tierDiscountAmount - couponDiscountAmount);

                  // Fetch available unused vouchers
                  let userUnusedVouchersList: any[] = [];
                  if (currentUser) {
                    const emailKey = currentUser.email.trim().toLowerCase();
                    const savedCouponsStr = localStorage.getItem(`vlaksha_coupons_${emailKey}`);
                    if (savedCouponsStr) {
                      userUnusedVouchersList = JSON.parse(savedCouponsStr).filter((c: any) => !c.isUsed);
                    }
                  }

                  return (
                    <div className="space-y-4 border-t border-[var(--theme-primary)]/15 pt-3">
                      {/* Pricing Breakdown */}
                      <div className="space-y-1.5 font-sans text-xs text-stone-500">
                        <div className="flex justify-between">
                          <span>Artwork Subtotal</span>
                          <span className="font-mono text-stone-800 font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
                        </div>
                        
                        {/* Tier automatic loyalty discount */}
                        {currentUser && tierDiscountPercent > 0 && (
                          <div className="flex justify-between text-emerald-700 font-medium bg-emerald-50/40 p-1 rounded-sm">
                            <span className="flex items-center gap-1">
                              <Percent className="w-3.5 h-3.5" />
                              <span>Loyalty Tier Discount ({tierName} - {tierDiscountPercent}%)</span>
                            </span>
                            <span className="font-mono font-bold">-₹{tierDiscountAmount.toLocaleString('en-IN')}</span>
                          </div>
                        )}

                        {/* Applied Coupon/Voucher discount */}
                        {appliedCoupon && (
                          <div className="flex justify-between text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 p-2">
                            <span className="flex items-center gap-1.5">
                              <Tag className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Voucher: {appliedCoupon.code}</span>
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono">-₹{couponDiscountAmount.toLocaleString('en-IN')}</span>
                              <button
                                type="button"
                                onClick={handleRemoveCoupon}
                                className="text-red-600 hover:text-red-800 font-sans text-[10px] uppercase font-bold tracking-wider underline cursor-pointer"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between">
                          <span>Shipping Delivery fee</span>
                          <span className="font-bold text-emerald-700">FREE Auspicious Delivery</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Moulding Base & Acrylic Pack</span>
                          <span>Included</span>
                        </div>
                        
                        <div className="flex justify-between text-sm font-bold border-t border-[var(--theme-primary)]/10 pt-3 text-stone-950">
                          <span>Total Amount</span>
                          <span className="font-mono text-stone-950 text-base">
                            ₹{finalTotal.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Manual Coupon Input Form */}
                      <div className="border-t border-[var(--theme-primary)]/10 pt-3 space-y-2">
                        <label className="block text-[10px] font-sans uppercase tracking-wider font-semibold text-stone-600">
                          Apply Discount Voucher / Promo Code
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. WELCOME100 or rewards code"
                            value={couponCodeInput}
                            onChange={(e) => setCouponCodeInput(e.target.value)}
                            className="flex-1 text-xs py-1.5 px-3 bg-white border border-stone-300 focus:outline-hidden focus:border-[var(--theme-accent)] uppercase font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => handleApplyCoupon(couponCodeInput)}
                            className="py-1.5 px-3 bg-stone-800 hover:bg-stone-900 text-white font-sans text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                          >
                            Apply
                          </button>
                        </div>
                        {couponError && (
                          <p className="text-[10px] font-sans text-red-600 flex items-center gap-1 font-medium bg-red-50/50 px-2 py-1 border border-red-200">
                            <span>⚠</span> <span>{couponError}</span>
                          </p>
                        )}
                        {couponSuccess && (
                          <p className="text-[10px] font-sans text-emerald-700 flex items-center gap-1 font-semibold bg-emerald-50 px-2 py-1 border border-emerald-200">
                            <span>✓</span> <span>{couponSuccess}</span>
                          </p>
                        )}
                      </div>

                      {/* Suggest logged-in user rewards & click-to-apply vouchers */}
                      {currentUser && (
                        <div className="border-t border-[var(--theme-primary)]/10 pt-3 space-y-2 bg-[#f8f5ef]/40 p-3 border border-[var(--theme-primary)]/10">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-stone-500 flex items-center gap-1">
                              <Gift className="w-3.5 h-3.5 text-[var(--theme-primary)]" />
                              <span>Your Studio Rewards</span>
                            </span>
                            <span className={`text-[8px] font-sans uppercase tracking-wider px-2 py-0.5 rounded-full border ${tierColor} font-bold`}>
                              {tierName}
                            </span>
                          </div>
                          
                          <div className="text-[10px] text-stone-500 font-sans flex justify-between items-center">
                            <span>Available Points Balance:</span>
                            <strong className="text-stone-800">{currentBalanceVal} Points</strong>
                          </div>

                          {/* Quick selection list */}
                          {userUnusedVouchersList.length > 0 ? (
                            <div className="space-y-1.5 pt-1">
                              <span className="text-[8px] font-sans uppercase tracking-wider text-[var(--theme-primary)] font-bold block">
                                Quick Apply Your Active Vouchers:
                              </span>
                              <div className="flex flex-col gap-1">
                                {userUnusedVouchersList.map((voucher) => (
                                  <button
                                    key={voucher.code}
                                    type="button"
                                    onClick={() => {
                                      setCouponCodeInput(voucher.code);
                                      handleApplyCoupon(voucher.code);
                                    }}
                                    className="w-full flex items-center justify-between px-2.5 py-1.5 text-[10px] font-mono border border-amber-300 hover:border-amber-500 bg-amber-50/50 hover:bg-amber-100/50 text-amber-950 transition-all cursor-pointer shadow-xs"
                                    title="Click to instantly apply this ₹250 discount"
                                  >
                                    <span className="flex items-center gap-1">
                                      <Tag className="w-3 h-3 text-amber-600" />
                                      <strong>{voucher.code}</strong>
                                    </span>
                                    <span className="text-emerald-700 font-bold">Apply ₹{voucher.discount} OFF</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <p className="text-[9px] text-stone-400 font-sans italic leading-normal">
                              No unused vouchers ready. Accrue 500 points in Vlaksha Rewards tab to generate active checkout discount codes!
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Made to order warning */}
                <div className="p-3 rounded-none bg-[#f8f5ef]/40 border border-[var(--theme-primary)]/15 text-[10px] text-stone-600 font-sans flex gap-2">
                  <AlertCircle className="w-4 h-4 text-[var(--theme-primary)] shrink-0 mt-0.5" />
                  <p className="leading-normal">
                    This order contains custom hand-painting. Please expect{' '}
                    <strong className="font-bold">7–12 days</strong> hand-molding and drying time before shipment.
                  </p>
                </div>
              </div>

            </div>
          </>
        )}
          </div>
        )}

        {/* VIEW: ORDER CONFIRMATION SPLASH */}
        {currentView === 'order-confirmation' && placedOrder && (
          <div className="max-w-md mx-auto my-8 bg-[var(--theme-bg)] border border-[var(--theme-primary)]/20 rounded-none p-6 sm:p-8 shadow-md text-center space-y-6">
            
            {/* Glowing Golden Sacred Mandala Icon */}
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full bg-[var(--theme-primary)]/10 animate-ping" />
              <div className="absolute inset-0 rounded-full bg-[var(--theme-primary)]/20 animate-pulse" />
              <div className="w-20 h-20 rounded-full bg-[var(--theme-accent)] border border-[var(--theme-primary)] flex items-center justify-center shadow-lg relative z-10 text-white">
                <Check className="w-10 h-10 stroke-[3]" />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-sans tracking-[0.25em] text-[var(--theme-primary)] font-bold block">
                Auspicious Order Confirmed
              </span>
              <h2 className="font-serif text-2xl font-light tracking-tight text-stone-900">Namaste! Order Placed</h2>
              <p className="text-xs text-stone-500 max-w-sm mx-auto font-sans leading-relaxed">
                Laksha has received your request and will soon begin molding the clay relief and prepping acrylic base coats.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-white border border-[var(--theme-primary)]/15 rounded-none p-4 text-left space-y-3 font-sans text-xs">
              <div className="flex justify-between items-center border-b border-[var(--theme-primary)]/10 pb-2">
                <span className="text-stone-500 font-semibold uppercase">Order ID</span>
                <span className="font-mono font-bold text-stone-950 text-sm">#{placedOrder.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Auspicious Customer</span>
                <span className="font-bold text-stone-800">{placedOrder.customerName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Contact Number</span>
                <span className="font-mono font-bold text-stone-800">{placedOrder.phone}</span>
              </div>
              <div className="flex justify-between items-center border-t border-[var(--theme-primary)]/10 pt-2">
                <span className="text-stone-500 font-bold">Total Paid</span>
                <span className="font-mono font-extrabold text-stone-950 text-sm font-bold">₹{placedOrder.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Download/Print Receipt Action Section */}
            <div className="bg-[#f8f5ef]/40 border border-[var(--theme-primary)]/20 p-4 rounded-none space-y-3">
              <div className="text-[10px] uppercase font-sans tracking-[0.15em] text-[var(--theme-primary)] font-bold text-center">
                Download & Records
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => downloadHtmlReceipt(placedOrder)}
                  className="py-2.5 px-3 border border-stone-200 hover:bg-[var(--theme-accent)] hover:text-white hover:border-[var(--theme-accent)] text-stone-700 bg-white font-sans text-[10px] uppercase tracking-widest font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Download offline-compatible HTML receipt file for your records"
                >
                  <Download className="w-3.5 h-3.5 text-[var(--theme-primary)]" />
                  <span>Download file</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="py-2.5 px-3 border border-stone-200 hover:bg-[var(--theme-accent)] hover:text-white hover:border-[var(--theme-accent)] text-stone-700 bg-white font-sans text-[10px] uppercase tracking-widest font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Open system print dialog to print or save as vector PDF"
                >
                  <Printer className="w-3.5 h-3.5 text-[var(--theme-primary)]" />
                  <span>Print / PDF</span>
                </button>
              </div>
              <p className="text-[9px] text-stone-400 font-sans leading-normal text-center">
                Generate a high-fidelity printable receipt or save locally as a vector PDF
              </p>
            </div>

            {/* WhatsApp CTA Deep Link */}
            {placedOrder.whatsappLink && (
              <div className="space-y-2">
                <a
                  href={placedOrder.whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#128C7E] text-white font-sans text-xs font-semibold tracking-widest uppercase rounded-none shadow-md flex items-center justify-center gap-2 transition-colors"
                >
                  <Send className="w-4 h-4 fill-current" />
                  <span>Message Laksha on WhatsApp</span>
                </a>
                <p className="text-[10px] text-stone-400 font-sans leading-normal">
                  * Ping Laksha Kandpal directly to submit custom photo insets, coordinate Sanskrit script spellings, or request color updates!
                </p>
              </div>
            )}

            <button
              onClick={() => handleNavigate('home')}
              className="py-2.5 px-5 rounded-none border border-stone-200 hover:bg-[#f8f5ef] text-stone-700 text-xs font-sans uppercase tracking-wider transition-all"
            >
              Back to Home Stage
            </button>
          </div>
        )}

        {/* VIEW: AI ARTISAN DESIGN STUDIO */}
        {currentView === 'ai-studio' && (
          <AIDesignStudio />
        )}

        {/* VIEW: ADMIN PANEL */}
        {currentView === 'admin' && (
          <AdminPanel 
            onProductUpdated={handleProductUpdated} 
            onSettingsUpdated={() => {
              setSettings(dbService.getSettings());
            }}
          />
        )}

        {/* VIEW: MEET THE ARTIST (ABOUT) PAGE */}
        {currentView === 'about' && (
          <div className="space-y-12">
            
            {/* Header banner */}
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <span className="text-[10px] uppercase font-sans tracking-[0.25em] text-[var(--theme-primary)] font-semibold block">
                Meet the Hand-Painter
              </span>
              <h2 className="font-serif text-3xl font-light text-[#1a1a1a] tracking-tight">About Laksha Kandpal & Her Art</h2>
              <p className="text-xs text-stone-500 font-sans">
                A journey of geometry, clay molding, fine brushwork, and spiritual focus.
              </p>
            </div>

            {/* Detailed bio blocks with layout grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative aspect-square w-full max-w-[320px] rounded-xs overflow-hidden shadow-md p-3 border border-[var(--theme-primary)]/20 bg-white">
                  <div className="absolute inset-1 border border-[var(--theme-primary)]/10 rounded-xs pointer-events-none" />
                  <LakshaPortrait variant="square" className="w-full h-full rounded-none" />
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-[var(--theme-accent)]/95 px-2.5 py-1 text-[var(--theme-bg)] text-[9px] font-sans tracking-widest uppercase border border-[var(--theme-primary)]/30">
                    <Sparkles className="w-3 h-3 text-[var(--theme-primary)]" /> Noida Studio
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-4 text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
                <h3 className="font-serif text-lg font-semibold text-[#1a1a1a]">Traditional Mud-Mirror Lippan Heritage</h3>
                <p>
                  Originally from Uttarakhand, and now based out of her studio in Noida, NCR, artist <strong>Laksha Kandpal</strong> has spent years mastering traditional Indian folk crafts, with a specialized focus on <strong>Lippan Kaam</strong> (mud-mirror relief art native to the Kutch region of Gujarat) and fine radial **Mandalas**.
                </p>
                <p>
                  Lippan art is traditionally done on mud walls of village huts in Kutch using mud mixes and camels dung, acting as an insulating layer against scorching heat while the mirrored shards reflect lamplight beautifully. Laksha reimagines this heritage by molding premium craft-clay relief lines on sturdy lightweight MDF board, using modern saturated jewel tones (indigo, saffron, emerald, magenta) sealed under multi-layer waterproof varnishes, allowing these pieces to serve as timeless interior accents.
                </p>
                <p>
                  Each piece is created completely by hand without stencils. From outlining symmetrical grids to clay rolling, embossing, paint dotting, and mirror inlay, a typical wall clock or statement plate takes anywhere from 5 to 12 days of intensive crafting.
                </p>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--theme-primary)]/15 text-stone-800">
                  <div className="p-3 bg-[#f8f5ef]/40 border border-[var(--theme-primary)]/15 rounded-none">
                    <span className="text-xs font-semibold uppercase tracking-wider block text-[var(--theme-accent)] font-sans mb-1">100% Customized</span>
                    <span className="text-[10px] text-stone-500 block leading-snug">Personalize Hindi/Sanskrit names with tasselled details.</span>
                  </div>
                  <div className="p-3 bg-[#f8f5ef]/40 border border-[var(--theme-primary)]/15 rounded-none">
                    <span className="text-xs font-semibold uppercase tracking-wider block text-[var(--theme-accent)] font-sans mb-1">Auspicious Vibe</span>
                    <span className="text-[10px] text-stone-500 block leading-snug">Symmetrical geometry designed to invite spiritual calm.</span>
                  </div>
                </div>
              </div>
            </div>

            <MandalaDivider />

            {/* Video Placeholder / Process Section */}
            <div className="bg-[var(--theme-accent)] text-white rounded-none p-6 sm:p-10 text-center space-y-4 max-w-3xl mx-auto border border-[var(--theme-primary)]/30 shadow-md">
              <span className="text-[10px] uppercase font-sans tracking-[0.25em] text-[var(--theme-primary)] font-semibold block">
                Visual Studio Tour
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-light text-white tracking-tight">
                {settings.studioTourTitle || 'Watch Laksha Craft a Lippan Mirror Plate'}
              </h3>
              <p className="text-xs text-[var(--theme-bg)]/70 max-w-lg mx-auto font-sans">
                {settings.studioTourDescription || 'Witness the mud relieving, the fine calligraphy detailing, and how dozens of glass shards are aligned to form sacred geometric mandalas.'}
              </p>
              
              {/* Video Player Container */}
              <div className="relative aspect-video w-full max-w-md mx-auto rounded-none overflow-hidden border border-[var(--theme-primary)]/20 shadow-lg bg-[#0e1629] flex items-center justify-center group">
                {isTourPlaying ? (
                  (() => {
                    const url = settings.studioTourVideoUrl || 'https://www.youtube.com/embed/N0fL9U6j_F4';
                    if (url.includes('youtube.com/') || url.includes('youtu.be/')) {
                      let embedUrl = url;
                      if (!url.includes('youtube.com/embed/')) {
                        try {
                          let videoId = '';
                          if (url.includes('youtu.be/')) {
                            videoId = url.split('youtu.be/')[1]?.split('?')[0];
                          } else if (url.includes('v=')) {
                            videoId = url.split('v=')[1]?.split('&')[0];
                          } else if (url.includes('youtube.com/shorts/')) {
                            videoId = url.split('youtube.com/shorts/')[1]?.split('?')[0];
                          }
                          if (videoId) {
                            embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
                          }
                        } catch (e) {
                          console.error(e);
                        }
                      } else {
                        if (!embedUrl.includes('autoplay=')) {
                          embedUrl += (embedUrl.includes('?') ? '&' : '?') + 'autoplay=1';
                        }
                      }
                      return (
                        <iframe
                          src={embedUrl}
                          title="Visual Studio Tour"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full border-0 absolute inset-0"
                        />
                      );
                    } else {
                      return (
                        <video
                          src={url}
                          controls
                          autoPlay
                          className="w-full h-full object-cover absolute inset-0 bg-black"
                        />
                      );
                    }
                  })()
                ) : (
                  <>
                    <img
                      src={settings.studioTourThumbnailUrl || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop'}
                      alt="Video thumbnail"
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover opacity-35"
                    />
                    <div 
                      onClick={() => setIsTourPlaying(true)}
                      className="w-12 h-12 rounded-full bg-[var(--theme-primary)] hover:bg-white text-stone-950 flex items-center justify-center cursor-pointer shadow-lg group-hover:scale-105 transition-all relative z-10"
                    >
                      <span className="text-lg translate-x-0.5 text-[var(--theme-accent)]">▶</span>
                    </div>
                    <div className="absolute bottom-4 right-4 bg-black/60 px-2.5 py-1 rounded-none text-[9px] font-sans text-white border border-white/10 uppercase tracking-widest">
                      Studio_Process_Demo (Click to Play)
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>
        )}

        {/* VIEW: USER REGISTRATION / LOGIN */}
        {currentView === 'user-login' && (
          <UserAuth
            onAuthSuccess={(user) => {
              setCurrentUser(user);
              setIsAdmin(dbService.isAdminAuthenticated());
              triggerToast(`Namaste, ${user.name}! Welcome back to Vlaksha Crafts.`, 'success');
              if (dbService.isAdminAuthenticated()) {
                handleNavigate('admin');
              } else if (cart.length > 0) {
                handleNavigate('checkout');
              } else {
                handleNavigate('user-account');
              }
            }}
            onCancel={() => handleNavigate('home')}
          />
        )}

        {/* VIEW: USER SECURE ACCOUNT PORTAL */}
        {currentView === 'user-account' && currentUser && (
          <UserAccount
            currentUser={currentUser}
            onUpdateProfile={(updated) => {
              setCurrentUser(updated);
            }}
            onNavigateToCatalog={() => {
              handleNavigate('shop');
            }}
            onReorder={handleReorder}
          />
        )}

      </main>

      {/* Slideout Shopping Cart Drawer panel */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={handleCheckoutClick}
      />

      {/* Slideout Wishlist Drawer panel */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlist={wishlist}
        products={products}
        onToggleWishlist={(productId) => handleToggleWishlist(productId)}
        onViewProduct={handleViewProduct}
        onAddToCartDirect={handleQuickAddToCart}
      />

      {/* RAZORPAY TEST PAYMENT MODAL OVERLAY GATEWAY */}
      {isRazorpayModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#1C1613] border border-amber-500/20 text-[#FAF9F5] rounded-3xl p-6 w-full max-w-sm text-center space-y-4 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-[#3399FF] to-blue-600" />
            
            {/* Razorpay Brand wordmark Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-1.5 font-bold font-sans tracking-wide">
                <span className="text-xs uppercase bg-[#3399FF] text-white font-extrabold px-1.5 py-0.5 rounded-xs">Razorpay</span>
                <span className="text-[10px] text-white/60 tracking-wider">Secure Sandbox</span>
              </div>
              <button
                onClick={() => setIsRazorpayModalOpen(false)}
                className="text-white/40 hover:text-white transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Steps simulation */}
            {razorpayStep === 'qr' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-sans text-stone-400">Merchant: Vlaksha Crafts</p>
                  <h4 className="text-sm font-serif font-semibold text-white">UPI QR Code Transfer</h4>
                  <div className="text-xl font-bold font-mono text-[#3399FF]">
                    ₹{cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0).toLocaleString('en-IN')}
                  </div>
                </div>

                {/* Mock SVG QR Code */}
                <div className="w-44 h-44 bg-white p-3 rounded-2xl mx-auto border-2 border-dashed border-[#3399FF] flex items-center justify-center shadow-inner">
                  <div className="w-full h-full bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.85)_1px,transparent_1px)] bg-[size:11px_11px] opacity-80 relative flex items-center justify-center">
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-amber-500 to-yellow-600 border border-white flex items-center justify-center text-[10px] font-bold text-[#1C1613] shadow-xs">
                      VLX
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={handleRazorpayMockPayment}
                    className="w-full py-2 bg-[#3399FF] hover:bg-blue-600 text-white font-sans text-xs font-bold uppercase rounded-lg transition-colors shadow-xs"
                  >
                    Simulate Paid Success
                  </button>
                  <p className="text-[9px] text-white/40 leading-snug">
                    Scan the mock code or click simulation button. Razorpay test mode does not capture actual money.
                  </p>
                </div>
              </div>
            )}

            {razorpayStep === 'processing' && (
              <div className="py-8 space-y-3">
                <Loader2 className="w-10 h-10 animate-spin text-[#3399FF] mx-auto" />
                <h4 className="text-sm font-sans font-bold">Verifying UPI Merchant Ledger...</h4>
                <p className="text-[10px] text-white/50">Processing secure card network tokenization...</p>
              </div>
            )}

            {razorpayStep === 'success' && (
              <div className="py-8 space-y-3 text-emerald-400">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-sm font-sans font-bold">Payment Captured Successfully!</h4>
                <p className="text-[10px] text-white/50">Securing order receipt with Vlaksha Ledger...</p>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Toast Notification for Wishlist Confirmation */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[var(--theme-accent)]/95 backdrop-blur-md border border-[var(--theme-primary)]/40 text-[#FAF9F5] px-4 py-3 rounded-xl shadow-2xl max-w-sm pointer-events-auto"
            style={{ originY: 1 }}
          >
            {toastType === 'success' ? (
              <div className="w-8 h-8 rounded-full bg-[var(--theme-primary)]/25 flex items-center justify-center shrink-0 border border-[var(--theme-primary)]/30">
                <Heart className="w-4 h-4 text-[var(--theme-primary)] fill-[var(--theme-primary)]" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-stone-50/10 flex items-center justify-center shrink-0 border border-stone-50/20">
                <Heart className="w-4 h-4 text-stone-300" />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <p className="text-xs font-sans font-medium text-white/95 leading-snug">
                {toastMessage}
              </p>
            </div>
            
            <button
              onClick={() => setToastMessage(null)}
              className="p-1 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

       {/* Visual footer details */}
      <Footer onNavigate={(v) => handleNavigate(v)} />

    </div>

    {/* High-fidelity Vector Printable Receipt */}
    <PrintableReceipt order={placedOrder} />
    </>
  );
}
