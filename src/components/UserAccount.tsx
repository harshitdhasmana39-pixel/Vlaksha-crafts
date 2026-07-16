import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import { User, Order, CartItem } from '../types';
import { Sparkles, ShoppingBag, Package, Truck, CheckCircle, ExternalLink, Calendar, MapPin, Phone, Mail, Edit2, Check, Download, Printer, Loader2, RotateCcw } from 'lucide-react';
import MandalaDivider from './MandalaDivider';
import PrintableReceipt from './PrintableReceipt';
import { getOrdersFromFirestore, saveOrderToFirestore } from '../services/firebase';
import VlakshaRewards from './VlakshaRewards';

interface UserAccountProps {
  currentUser: User;
  onUpdateProfile: (updated: User) => void;
  onNavigateToCatalog: () => void;
  onReorder: (items: CartItem[]) => void;
}

export default function UserAccount({ currentUser, onUpdateProfile, onNavigateToCatalog, onReorder }: UserAccountProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone);
  const [street, setStreet] = useState(currentUser.address?.street || '');
  const [city, setCity] = useState(currentUser.address?.city || '');
  const [state, setState] = useState(currentUser.address?.state || '');
  const [zipCode, setZipCode] = useState(currentUser.address?.zipCode || '');
  const [successMsg, setSuccessMsg] = useState('');

  // Selected order for full printable receipt overlay or view
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        const email = currentUser.email.trim().toLowerCase();
        // Fetch live past orders directly from Firestore
        const firestoreOrders = await getOrdersFromFirestore(email);
        
        if (!isMounted) return;

        // If Firestore has orders, load them
        if (firestoreOrders.length > 0) {
          setOrders(firestoreOrders);
        } else {
          // Fallback: If no orders in Firestore, find any local storage orders for this email and migrate them to Firestore
          const allLocalOrders = dbService.getOrders();
          const localUserOrders = allLocalOrders.filter(
            (o) => o.email.trim().toLowerCase() === email
          );
          if (localUserOrders.length > 0) {
            for (const order of localUserOrders) {
              await saveOrderToFirestore(order);
            }
            setOrders(localUserOrders);
          } else {
            setOrders([]);
          }
        }
      } catch (error) {
        console.error("Failed to load user orders from Firestore:", error);
        // Resilient fallback to offline local storage
        const allLocalOrders = dbService.getOrders();
        const localUserOrders = allLocalOrders.filter(
          (o) => o.email.trim().toLowerCase() === currentUser.email.trim().toLowerCase()
        );
        if (isMounted) {
          setOrders(localUserOrders);
        }
      } finally {
        if (isMounted) {
          setLoadingOrders(false);
        }
      }
    };

    fetchOrders();
    return () => {
      isMounted = false;
    };
  }, [currentUser.email]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await dbService.updateUserProfile(currentUser.id, {
      name,
      phone,
      address: {
        street,
        city,
        state,
        zipCode,
        country: currentUser.address?.country || 'India',
      },
    });

    if (res.success && res.user) {
      onUpdateProfile(res.user);
      setIsEditing(false);
      setSuccessMsg('Auspicious profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const getStatusBadge = (status: Order['orderStatus']) => {
    switch (status) {
      case 'received':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-medium font-sans uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
            Order Received
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-medium font-sans uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            Clay Relief In Progress
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-medium font-sans uppercase tracking-wider bg-indigo-50 text-indigo-800 border border-indigo-200">
            <Truck className="w-3 h-3 text-indigo-600" />
            Shipped (En Route)
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-medium font-sans uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            Delivered to Home
          </span>
        );
    }
  };

  // Helper to trigger receipt printing
  const handlePrintReceipt = (order: Order) => {
    setSelectedReceiptOrder(order);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // Helper to trigger HTML receipt download
  const handleDownloadReceipt = (order: Order) => {
    const receiptHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt_#${order.id} - Vlaksha Crafts</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
    body {
      font-family: 'Inter', sans-serif;
      color: #292524;
      background: #fafaf9;
      padding: 40px 20px;
    }
    .receipt-container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e7e5e4;
      padding: 40px;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid var(--theme-primary);
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo-text {
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      letter-spacing: 2px;
      color: var(--theme-accent);
      text-transform: uppercase;
    }
    .subtitle {
      font-size: 11px;
      letter-spacing: 3px;
      color: var(--theme-primary);
      text-transform: uppercase;
      margin-top: 5px;
    }
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
      font-size: 12px;
    }
    .section-title {
      font-family: 'Playfair Display', serif;
      font-size: 14px;
      color: var(--theme-accent);
      border-bottom: 1px solid #f5f5f4;
      padding-bottom: 5px;
      margin-bottom: 10px;
      text-transform: uppercase;
    }
    .item-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
      font-size: 12px;
    }
    .item-table th {
      border-bottom: 1px solid #e7e5e4;
      text-align: left;
      padding: 8px 0;
      color: #78716c;
    }
    .item-table td {
      border-bottom: 1px solid #f5f5f4;
      padding: 12px 0;
    }
    .total-row {
      font-weight: bold;
      font-size: 14px;
      color: var(--theme-accent);
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-t: 1px solid #e7e5e4;
      font-size: 11px;
      color: #a8a29e;
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <div class="header">
      <div class="logo-text">Vlaksha Crafts</div>
      <div class="subtitle">Handpainted Mud-Mirror Lippan Art & Sacred Mandalas</div>
      <p style="font-size: 10px; color: #78716c;">Noida, NCR, India | contact@vlakshacrafts.com</p>
    </div>
    
    <div class="details-grid">
      <div>
        <div class="section-title">Order Info</div>
        <strong>Order ID:</strong> ${order.id}<br>
        <strong>Placed Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}<br>
        <strong>Payment:</strong> ${order.paymentMethod} (${order.paymentStatus})<br>
        <strong>Status:</strong> ${order.orderStatus.toUpperCase()}
      </div>
      <div>
        <div class="section-title">Shipping To</div>
        <strong>${order.customerName}</strong><br>
        ${order.address.street}<br>
        ${order.address.city}, ${order.address.state} - ${order.address.zipCode}<br>
        Phone: ${order.phone}
      </div>
    </div>

    <div class="section-title">Purchased Items</div>
    <table class="item-table">
      <thead>
        <tr>
          <th>Item</th>
          <th>Size / Options</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${order.items
          .map(
            (item) => `
          <tr>
            <td>
              <strong>${item.product.name}</strong><br>
              <span style="font-size: 10px; color: #78716c;">Category: ${item.product.category.replace(/-/g, ' ')}</span>
            </td>
            <td>
              Size: ${item.size}<br>
              Color: ${item.color.name}
              ${item.personalization?.text ? `<br>Personalization: "${item.personalization.text}" (${item.personalization.language})` : ''}
            </td>
            <td style="text-align: center;">${item.quantity}</td>
            <td style="text-align: right;">₹${(item.product.price * item.quantity).toLocaleString('en-IN')}</td>
          </tr>
        `
          )
          .join('')}
        <tr class="total-row">
          <td colspan="3" style="text-align: right; padding-top: 15px;">Total Paid:</td>
          <td style="text-align: right; padding-top: 15px;">₹${order.totalAmount.toLocaleString('en-IN')}</td>
        </tr>
      </tbody>
    </table>

    <div class="footer">
      <p>Thank you for supporting traditional Indian art heritage.</p>
      <p>© 2026 Vlaksha Crafts. Created with pure mindfulness by Artist Laksha Kandpal.</p>
    </div>
  </div>
</body>
</html>
    `;

    const blob = new Blob([receiptHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Vlaksha_Receipt_${order.id}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="vlaksha-user-account" className="space-y-12 my-6">
      
      {/* Title Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-[var(--theme-primary)] font-sans text-[10px] tracking-[0.25em] flex items-center gap-1.5 justify-center uppercase font-medium">
          <Sparkles className="w-4 h-4 text-[var(--theme-primary)]" />
          <span>Namaste, Respected Customer</span>
        </span>
        <h2 className="font-serif text-3xl font-light text-stone-900 tracking-tight">
          Your Creative Studio Portal
        </h2>
        <p className="text-xs text-stone-500 font-sans leading-relaxed">
          Track the creation progress of your handcrafted custom mud-relief plates, update your delivery address, and view historic order receipts.
        </p>
      </div>

      <MandalaDivider />

      {successMsg && (
        <div className="max-w-3xl mx-auto bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs py-3 px-4 font-sans text-center font-medium animate-fadeIn">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto">
        
        {/* Profile Card left panel */}
        <div className="lg:col-span-4 space-y-6 h-fit">
          <div className="bg-white border border-[var(--theme-primary)]/15 p-6 relative shadow-xs space-y-6">
            <div className="absolute top-4 right-4">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-stone-400 hover:text-[var(--theme-primary)] flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            )}
          </div>

          <div className="space-y-2 text-center pb-4 border-b border-stone-100">
            <div className="w-14 h-14 rounded-full bg-[var(--theme-accent)] text-white flex items-center justify-center mx-auto text-lg font-serif">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <h3 className="font-serif text-lg font-medium text-stone-900">{currentUser.name}</h3>
            <span className="text-[10px] font-sans uppercase tracking-widest text-[var(--theme-primary)] font-bold">Registered client</span>
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-[9px] font-sans uppercase tracking-wider text-stone-500 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs py-1.5 px-2 border border-stone-200 focus:outline-hidden focus:border-[var(--theme-accent)] bg-white"
                />
              </div>

              <div>
                <label className="block text-[9px] font-sans uppercase tracking-wider text-stone-500 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs py-1.5 px-2 border border-stone-200 focus:outline-hidden bg-white font-mono"
                />
              </div>

              <div className="pt-2 border-t border-stone-100 space-y-3">
                <span className="text-[9px] font-sans uppercase tracking-widest font-bold text-[var(--theme-primary)] block">
                  Delivery Address
                </span>
                
                <div>
                  <label className="block text-[8px] font-sans uppercase tracking-wider text-stone-400 mb-0.5">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full text-xs py-1.5 px-2 border border-stone-200 focus:outline-hidden bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[8px] font-sans uppercase tracking-wider text-stone-400 mb-0.5">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full text-xs py-1.5 px-2 border border-stone-200 focus:outline-hidden bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-sans uppercase tracking-wider text-stone-400 mb-0.5">
                      State
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full text-xs py-1.5 px-2 border border-stone-200 focus:outline-hidden bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[8px] font-sans uppercase tracking-wider text-stone-400 mb-0.5">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="w-full text-xs py-1.5 px-2 border border-stone-200 focus:outline-hidden bg-white font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 bg-[var(--theme-accent)] hover:bg-[var(--theme-primary)] text-white font-sans text-[10px] uppercase tracking-wider font-semibold transition-colors flex items-center justify-center gap-1 shadow-xs"
                >
                  <Check className="w-3 h-3" />
                  <span>Save</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2 px-3 border border-stone-200 hover:bg-stone-50 text-stone-600 font-sans text-[10px] uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 text-xs font-sans">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-stone-600">
                  <Mail className="w-4 h-4 text-[var(--theme-primary)]" />
                  <span>{currentUser.email}</span>
                </div>
                <div className="flex items-center gap-2 text-stone-600">
                  <Phone className="w-4 h-4 text-[var(--theme-primary)]" />
                  <span className="font-mono">{currentUser.phone}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 space-y-2">
                <span className="text-[10px] font-sans uppercase tracking-widest font-bold text-[var(--theme-primary)] block">
                  Saved Delivery Address
                </span>
                <div className="flex items-start gap-2 text-stone-600 leading-relaxed">
                  <MapPin className="w-4 h-4 text-[var(--theme-primary)] shrink-0 mt-0.5" />
                  <div>
                    {currentUser.address?.street !== 'N/A' && currentUser.address?.street ? (
                      <>
                        <p>{currentUser.address.street}</p>
                        <p>
                          {currentUser.address.city}, {currentUser.address.state}
                        </p>
                        <p className="font-mono text-[11px] text-[var(--theme-primary)] mt-0.5">{currentUser.address.zipCode}</p>
                      </>
                    ) : (
                      <span className="italic text-stone-400">No address saved yet. Click "Edit" to save address.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Elegant Rewards Card */}
        <VlakshaRewards currentUser={currentUser} orders={orders} />
      </div>

      {/* Order History right panel */}
      <div className="lg:col-span-8 space-y-6">
          <h3 className="font-serif text-xl font-light text-stone-900 border-b border-stone-100 pb-3 flex items-center justify-between">
            <span>Your Handcrafted Orders</span>
            <span className="text-xs text-stone-400 font-sans normal-case font-normal">Active designs: {orders.length}</span>
          </h3>

          {loadingOrders ? (
            <div className="bg-white border border-[var(--theme-primary)]/15 p-16 text-center space-y-4 shadow-xs flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 text-[var(--theme-primary)] animate-spin" />
              <div className="space-y-1">
                <h4 className="font-serif text-base text-stone-700 font-light">Retrieving Your Sacred Artworks...</h4>
                <p className="text-[11px] text-stone-400 font-sans max-w-xs mx-auto leading-relaxed">
                  Fetching live order status and hand-painted progress updates from our secure Firestore database.
                </p>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white border border-[var(--theme-primary)]/15 p-12 text-center space-y-4 shadow-xs">
              <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto" />
              <div className="space-y-1">
                <h4 className="font-serif text-lg text-stone-700">No Orders Placed Yet</h4>
                <p className="text-xs text-stone-500 font-sans max-w-sm mx-auto leading-relaxed">
                  You haven't commissioned any custom Lippan relief panels, nameplates, or wall clocks. Start your handcrafted artisan journey today!
                </p>
              </div>
              <button
                onClick={onNavigateToCatalog}
                className="py-2.5 px-6 bg-[var(--theme-accent)] hover:bg-[var(--theme-primary)] text-white font-sans text-[10px] uppercase tracking-widest transition-colors shadow-sm"
              >
                Browse Traditional Catalog
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-white border border-[var(--theme-primary)]/15 shadow-xs overflow-hidden">
                  
                  {/* Order header banner */}
                  <div className="bg-stone-50 border-b border-[var(--theme-primary)]/10 px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-sans font-bold uppercase text-stone-400">Order Placed</span>
                      <p className="text-xs text-stone-800 font-sans font-semibold flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[var(--theme-primary)]" />
                        <span>{new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</span>
                      </p>
                    </div>
                    <div className="space-y-0.5 sm:text-right">
                      <span className="text-[10px] font-sans font-bold uppercase text-stone-400">Commission ID</span>
                      <p className="text-xs font-mono font-bold text-[var(--theme-accent)]">#{order.id}</p>
                    </div>
                    <div className="space-y-0.5 text-right">
                      <span className="text-[10px] font-sans font-bold uppercase text-stone-400">Total Paid</span>
                      <p className="text-xs font-mono font-bold text-[var(--theme-primary)]">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  {/* Order content body */}
                  <div className="p-4 sm:p-6 space-y-4">
                    
                    {/* Status Tracker */}
                    <div className="flex flex-wrap items-center justify-between border-b border-stone-100 pb-4 gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-sans tracking-wider text-stone-400 block font-semibold">Artist Status</span>
                        {getStatusBadge(order.orderStatus)}
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => onReorder(order.items)}
                          className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-sans font-semibold uppercase tracking-wider bg-[var(--theme-accent)] hover:bg-[var(--theme-primary)] text-white border border-[var(--theme-accent)] hover:border-[var(--theme-primary)] transition-all cursor-pointer shadow-xs"
                          title="Reorder all items from this order"
                        >
                          <RotateCcw className="w-3 h-3 animate-reverse" />
                          <span>Reorder</span>
                        </button>
                        <button
                          onClick={() => handleDownloadReceipt(order)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-sans font-medium uppercase tracking-wider border border-stone-200 hover:border-[var(--theme-primary)] text-stone-600 hover:text-[var(--theme-primary)] bg-white transition-colors"
                          title="Download Receipt HTML file"
                        >
                          <Download className="w-3 h-3" />
                          <span>Receipt File</span>
                        </button>
                        <button
                          onClick={() => handlePrintReceipt(order)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-sans font-medium uppercase tracking-wider bg-stone-50 border border-stone-200 hover:bg-[var(--theme-accent)] hover:text-white hover:border-[var(--theme-accent)] text-stone-700 transition-all"
                          title="Print Receipt"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Print / PDF</span>
                        </button>
                      </div>
                    </div>

                    {/* Ordered Items List */}
                    <div className="divide-y divide-stone-100">
                      {order.items.map((item) => (
                        <div key={item.id} className="py-3 flex gap-4 items-center">
                          <div className="w-12 h-12 rounded-full border border-stone-100 overflow-hidden shrink-0 shadow-xs">
                            <img
                              src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=200&auto=format&fit=crop'}
                              alt={item.product.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-serif text-sm font-medium text-stone-900 truncate">
                              {item.product.name}
                            </h4>
                            <p className="text-[10px] font-sans text-stone-400 uppercase tracking-wider">
                              Qty: {item.quantity} • Size: {item.size} • Color: {item.color.name}
                            </p>
                            {item.personalization?.text && (
                              <p className="text-[10px] italic text-[var(--theme-primary)] font-sans mt-0.5">
                                Custom Text: "{item.personalization.text}" ({item.personalization.language})
                              </p>
                            )}
                          </div>
                          <div className="text-right text-xs font-mono font-semibold text-stone-700 shrink-0">
                            ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                          </div>
                        </div>
                      ))}
                    </div>

                    {order.trackingNotes && (
                      <div className="mt-2 p-3 bg-[var(--theme-bg)] border-l-2 border-[var(--theme-primary)] text-xs text-stone-700 font-sans space-y-1">
                        <span className="font-bold text-[10px] uppercase tracking-wider text-[var(--theme-primary)] flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Artist Progress & Delivery Update:</span>
                        </span>
                        <p className="italic leading-relaxed text-stone-600">{order.trackingNotes}</p>
                      </div>
                    )}

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Hidden container for printing single specific order receipts */}
      {selectedReceiptOrder && (
        <div className="hidden print:block absolute inset-0 bg-white z-50 p-8">
          <PrintableReceipt order={selectedReceiptOrder} />
        </div>
      )}

    </div>
  );
}
