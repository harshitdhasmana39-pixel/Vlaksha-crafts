import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import { Product, Order, AdminAnalytics, StudioSettings } from '../types';
import { ShieldCheck, Plus, Edit2, Trash2, Calendar, FileText, CheckCircle2, IndianRupee, Loader2, KeyRound, AlertTriangle, MessageSquare, ExternalLink, RefreshCw, BarChart3, Package, ShoppingCart, X, Truck, Sparkles, Download, Search } from 'lucide-react';
import MandalaDivider from './MandalaDivider';
import { getAllOrdersFromFirestore, saveOrderToFirestore, saveUserToFirestore } from '../services/firebase';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, Legend, PieChart, Pie } from 'recharts';

interface AdminPanelProps {
  onProductUpdated: () => void;
  onSettingsUpdated?: () => void;
}

export default function AdminPanel({ onProductUpdated, onSettingsUpdated }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [passcode, setPasscode] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  
  // Dashboard states
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'admin-orders' | 'products' | 'analytics' | 'settings'>('admin-orders');
  const [loadingFirestoreOrders, setLoadingFirestoreOrders] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Live Firestore-only orders
  const [firestoreOrders, setFirestoreOrders] = useState<Order[]>([]);
  const [loadingOnlyFirestore, setLoadingOnlyFirestore] = useState<boolean>(false);
  const [fsStatusFilter, setFsStatusFilter] = useState<string>('all');
  const [fsSearchQuery, setFsSearchQuery] = useState<string>('');

  // Form states for Add/Edit product
  const [isEditingProduct, setIsEditingProduct] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  // Form states for Edit Order Modal
  const [isEditingOrder, setIsEditingOrder] = useState<boolean>(false);
  const [selectedOrderToEdit, setSelectedOrderToEdit] = useState<Order | null>(null);
  const [editOrderStatus, setEditOrderStatus] = useState<Order['orderStatus']>('received');
  const [editOrderPaymentStatus, setEditOrderPaymentStatus] = useState<Order['paymentStatus']>('pending');
  const [editOrderTrackingNotes, setEditOrderTrackingNotes] = useState<string>('');
  const [formImageInput, setFormImageInput] = useState<string>('');
  const [formColorsInput, setFormColorsInput] = useState<string>('');
  const [formMaterialsInput, setFormMaterialsInput] = useState<string>('');

  // Settings customizer states
  const [settings, setSettings] = useState<StudioSettings | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);
  const [settingsSuccessMessage, setSettingsSuccessMessage] = useState<string>('');

  // Firebase project synchronization states
  const [syncingToFirestore, setSyncingToFirestore] = useState<boolean>(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string>('');

  const handleSyncDataToFirestore = async () => {
    setSyncingToFirestore(true);
    setSyncSuccessMessage('');
    try {
      const localOrders = dbService.getOrders();
      const localUsers = dbService.getUsers();
      
      let ordersSynced = 0;
      let usersSynced = 0;

      for (const order of localOrders) {
        await saveOrderToFirestore(order);
        ordersSynced++;
      }

      for (const user of localUsers) {
        await saveUserToFirestore(user);
        usersSynced++;
      }

      setSyncSuccessMessage(`Successfully synchronized ${usersSynced} users and ${ordersSynced} orders directly into your live Firebase Project "vlaksha-crafts-27a0d"!`);
      loadAdminData();
    } catch (err: any) {
      console.error("Failed to sync data to Firestore:", err);
      alert("Error syncing data to Firestore: " + err.message);
    } finally {
      setSyncingToFirestore(false);
    }
  };

  const handleExportCSV = (ordersToExport: Order[], suffix: string = "filtered") => {
    if (ordersToExport.length === 0) {
      alert("No orders to export!");
      return;
    }
    
    const headers = [
      'Order ID',
      'Customer Name',
      'Customer Email',
      'Phone',
      'Shipping Address',
      'Total Amount (INR)',
      'Order Status',
      'Payment Status',
      'Date Placed',
      'Items Count',
      'Items Summary',
      'Tracking Notes',
      'Personalization Details'
    ];

    const escapeCsvValue = (val: any) => {
      if (val === undefined || val === null) return '""';
      const stringVal = String(val);
      const escaped = stringVal.replace(/"/g, '""');
      return `"${escaped}"`;
    };

    const csvRows = [
      headers.join(','),
      ...ordersToExport.map(order => {
        const itemsSummary = (order.items || []).map(item => `${item.product?.name || 'Handmade Craft'} (Qty: ${item.quantity})`).join('; ');
        const personalization = (order.items || []).map(item => item.personalization?.text ? `[${item.product?.name || 'Craft'}: ${item.personalization.text} (${item.personalization.language})]` : '').filter(Boolean).join('; ');
        const addressStr = order.address ? `${order.address.street}, ${order.address.city}, ${order.address.state} ${order.address.zipCode}, ${order.address.country}` : '';
        
        const row = [
          order.id,
          order.customerName || '',
          order.email,
          order.phone || '',
          addressStr,
          order.totalAmount,
          order.orderStatus,
          order.paymentStatus || '',
          new Date(order.createdAt).toLocaleDateString(),
          (order.items || []).length,
          itemsSummary,
          order.trackingNotes || '',
          personalization
        ];
        return row.map(escapeCsvValue).join(',');
      })
    ];

    const csvString = csvRows.join('\r\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `vlaksha_crafts_orders_${suffix}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = (ordersToExport: Order[], suffix: string = "filtered") => {
    if (ordersToExport.length === 0) {
      alert("No orders to export!");
      return;
    }
    const jsonString = JSON.stringify(ordersToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `vlaksha_crafts_orders_${suffix}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    // Check if authenticated
    setIsAuthenticated(dbService.isAdminAuthenticated());
  }, []);

  const fetchFirestoreOnlyOrders = async () => {
    setLoadingOnlyFirestore(true);
    try {
      const fsOrders = await getAllOrdersFromFirestore();
      if (fsOrders) {
        // Sort by date descending
        const sorted = [...fsOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setFirestoreOrders(sorted);
      }
    } catch (err) {
      console.error("Failed to fetch live orders from Firestore:", err);
    } finally {
      setLoadingOnlyFirestore(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAdminData();
      fetchFirestoreOnlyOrders();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && activeTab === 'admin-orders') {
      fetchFirestoreOnlyOrders();
    }
  }, [activeTab, isAuthenticated]);

  const loadAdminData = async () => {
    setLoadingFirestoreOrders(true);
    const localProducts = dbService.getProducts();
    const localSettings = dbService.getSettings();
    setProducts(localProducts);
    setSettings(localSettings);

    try {
      const fsOrders = await getAllOrdersFromFirestore();
      if (fsOrders && fsOrders.length > 0) {
        setOrders(fsOrders);
        setAnalytics(dbService.getAnalytics(fsOrders));
      } else {
        const localOrders = dbService.getOrders();
        setOrders(localOrders);
        setAnalytics(dbService.getAnalytics(localOrders));
      }
    } catch (err) {
      console.error("Failed to load admin orders from Firestore:", err);
      const localOrders = dbService.getOrders();
      setOrders(localOrders);
      setAnalytics(dbService.getAnalytics(localOrders));
    } finally {
      setLoadingFirestoreOrders(false);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSavingSettings(true);
    
    setTimeout(() => {
      dbService.saveSettings(settings);
      setIsSavingSettings(false);
      setSettingsSuccessMessage('Website customizer settings saved successfully!');
      if (onSettingsUpdated) {
        onSettingsUpdated();
      }
      setTimeout(() => {
        setSettingsSuccessMessage('');
      }, 3000);
    }, 800);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const isSuccess = dbService.verifyAdminCredentials(adminEmail, passcode);
    if (isSuccess) {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Incorrect admin email or password.');
    }
  };

  const handleLogout = () => {
    dbService.logoutAdmin();
    setIsAuthenticated(false);
    setAdminEmail('');
    setPasscode('');
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['orderStatus']) => {
    await dbService.updateOrderStatus(orderId, status);
    loadAdminData();
    fetchFirestoreOnlyOrders();
  };

  const handleUpdatePaymentStatus = async (orderId: string, status: Order['paymentStatus']) => {
    await dbService.updateOrderPaymentStatus(orderId, status);
    loadAdminData();
    fetchFirestoreOnlyOrders();
  };

  const openEditOrderModal = (order: Order) => {
    setSelectedOrderToEdit(order);
    setEditOrderStatus(order.orderStatus);
    setEditOrderPaymentStatus(order.paymentStatus);
    setEditOrderTrackingNotes(order.trackingNotes || '');
    setIsEditingOrder(true);
  };

  const handleSaveOrderEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderToEdit) return;
    
    await dbService.updateOrder(selectedOrderToEdit.id, {
      orderStatus: editOrderStatus,
      paymentStatus: editOrderPaymentStatus,
      trackingNotes: editOrderTrackingNotes.trim()
    });
    
    setIsEditingOrder(false);
    setSelectedOrderToEdit(null);
    loadAdminData();
    fetchFirestoreOnlyOrders();
  };

  const handleAddOrEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct?.category || !editingProduct?.price) return;

    // Parse values
    const imagesArray = formImageInput.split(',').map(s => s.trim()).filter(Boolean);
    if (imagesArray.length === 0) {
      imagesArray.push('https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600&auto=format&fit=crop');
    }

    const colorsArray = formColorsInput.split(',').map(s => {
      const parts = s.split(':').map(p => p.trim());
      return {
        name: parts[0] || 'Default',
        value: parts[1] || '#92400e'
      };
    });

    const materialsArray = formMaterialsInput.split(',').map(s => s.trim()).filter(Boolean);

    const fullProduct: Product = {
      id: editingProduct.id || `p-${Date.now()}`,
      name: editingProduct.name,
      description: editingProduct.description || 'Intricate mud-mirror lippan painting.',
      category: editingProduct.category as any,
      price: Number(editingProduct.price),
      images: imagesArray,
      sizes: editingProduct.sizes || ['12 inches'],
      colors: colorsArray,
      isPersonalizable: !!editingProduct.isPersonalizable,
      leadTimeDays: Number(editingProduct.leadTimeDays || 7),
      materials: materialsArray.length > 0 ? materialsArray : ['MDF', 'Acrylic', 'Clay', 'Mirrors'],
      rating: editingProduct.rating || 5.0,
      reviewsCount: editingProduct.reviewsCount || 0,
      isReadyMade: !!editingProduct.isReadyMade
    };

    dbService.saveProduct(fullProduct);
    setIsEditingProduct(false);
    setEditingProduct(null);
    loadAdminData();
    onProductUpdated(); // inform parent component to update catalogs
  };

  const startEditProduct = (p: Product) => {
    setEditingProduct(p);
    setFormImageInput(p.images.join(', '));
    setFormColorsInput(p.colors.map(c => `${c.name}:${c.value}`).join(', '));
    setFormMaterialsInput(p.materials.join(', '));
    setIsEditingProduct(true);
  };

  const startNewProduct = () => {
    setEditingProduct({
      category: 'mandala-wall-plates',
      price: 1500,
      sizes: ['12 inches'],
      isPersonalizable: false,
      leadTimeDays: 7,
      rating: 5.0,
      reviewsCount: 0,
      isReadyMade: false
    });
    setFormImageInput('');
    setFormColorsInput('Royal Indigo:#1E3A8A, Saffron:#EA580C');
    setFormMaterialsInput('MDF Board, Acrylic Paints, Glass Mirrors, Clay Mud');
    setIsEditingProduct(true);
  };

  const handleDeleteProduct = (pId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      dbService.deleteProduct(pId);
      loadAdminData();
      onProductUpdated();
    }
  };

  // Generate a WhatsApp deep-link message for order status update notification to buyer
  const getWhatsAppMessageLink = (order: Order) => {
    const text = `Namaste ${order.customerName},\nThis is Laksha from Vlaksha Crafts. We have updated your order *${order.id}* status to: *${order.orderStatus.toUpperCase().replace('_', ' ')}*.\nThank you for supporting hand-painted Indian art! 🌸`;
    return `https://wa.me/${order.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;
  };

  if (!isAuthenticated) {
    return (
      <div id="admin-passcode-gateway" className="max-w-md mx-auto my-16 bg-[var(--theme-bg)] border border-[var(--theme-primary)]/25 rounded-none p-6 shadow-md text-center">
        <div className="w-14 h-14 rounded-none bg-[var(--theme-primary)]/5 border border-[var(--theme-primary)]/20 text-[var(--theme-accent)] flex items-center justify-center mx-auto mb-4">
          <KeyRound className="w-7 h-7 text-[var(--theme-primary)]" />
        </div>
        <h2 className="font-serif text-2xl font-light text-[#1a1a1a] tracking-tight">Artist Admin Portal</h2>
        <p className="text-xs text-stone-500 mt-2 max-w-[280px] mx-auto font-sans leading-relaxed">
          Authorized personnel only. Please sign in with your administrative credentials to access the crafts and orders console.
        </p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div className="text-left">
            <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-stone-700 mb-1.5">
              Admin Email
            </label>
            <input
              type="email"
              required
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full text-xs py-2.5 px-3 rounded-none border border-[var(--theme-primary)]/25 focus:outline-hidden focus:border-[var(--theme-accent)] bg-white font-sans"
            />
          </div>

          <div className="text-left">
            <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-stone-700 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="••••"
              className="w-full text-xs py-2.5 px-3 rounded-none border border-[var(--theme-primary)]/25 focus:outline-hidden focus:border-[var(--theme-accent)] bg-white font-mono"
            />
          </div>

          {authError && (
            <p className="text-xs text-red-600 font-sans flex items-center gap-1 justify-center bg-red-50 p-2 rounded-none border border-red-100">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-none bg-[var(--theme-accent)] text-white font-sans text-xs font-semibold tracking-widest uppercase hover:bg-[var(--theme-primary)] transition-colors shadow-xs"
          >
            Authenticate Credentials
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[var(--theme-primary)]/10 text-[10px] text-stone-400 font-sans">
          Secured with zero-trust Firestore state validation controls.
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === 'all') return true;
    return order.orderStatus === statusFilter;
  });

  // Live Firestore Orders Analytics computations for Recharts Dashboard
  const fsTotalRevenue = firestoreOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const fsCompletedRevenue = firestoreOrders
    .filter(o => o.paymentStatus === 'completed')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const fsTotalOrdersCount = firestoreOrders.length;
  
  const fsReceivedCount = firestoreOrders.filter(o => o.orderStatus === 'received').length;
  const fsInProgressCount = firestoreOrders.filter(o => o.orderStatus === 'in_progress').length;
  const fsShippedCount = firestoreOrders.filter(o => o.orderStatus === 'shipped').length;
  const fsDeliveredCount = firestoreOrders.filter(o => o.orderStatus === 'delivered').length;

  const fsChartData = [
    { name: 'Received', count: fsReceivedCount, fill: '#78716c' },
    { name: 'Painting', count: fsInProgressCount, fill: '#d97706' },
    { name: 'Shipped', count: fsShippedCount, fill: '#4f46e5' },
    { name: 'Delivered', count: fsDeliveredCount, fill: '#16a34a' },
  ];

  return (
    <div id="admin-dashboard-container" className="space-y-6">
      
      {/* Admin Dashboard header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--theme-primary)]/15 pb-4">
        <div>
          <span className="text-[10px] uppercase font-sans tracking-widest text-[var(--theme-primary)] font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[var(--theme-primary)] animate-ping inline-block" />
            Laksha Kandpal Connected
          </span>
          <h2 className="font-serif text-2xl font-light text-[#1a1a1a] tracking-tight mt-1">Vlaksha Crafts Studio Board</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadAdminData}
            title="Refresh Logs"
            className="p-2 border border-[var(--theme-primary)]/20 rounded-none text-stone-600 hover:bg-[#f8f5ef] bg-white transition-colors flex items-center gap-1.5 text-xs font-sans"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload Logs</span>
          </button>
          <button
            onClick={handleLogout}
            className="px-3.5 py-2 rounded-none border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors text-xs font-semibold uppercase tracking-wider font-sans"
          >
            Sign Out Panel
          </button>
        </div>
      </div>
 
      {/* Firebase Status & Synchronization Block */}
      <div className="bg-[#f8f5ef] border border-[var(--theme-primary)]/30 p-5 rounded-none flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h4 className="font-serif text-sm font-semibold text-[#1a1a1a]">Connected to Your Firebase Project: <code className="bg-[var(--theme-accent)]/5 px-1.5 py-0.5 text-xs rounded text-[var(--theme-accent)]">vlaksha-crafts-27a0d</code></h4>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed max-w-2xl">
            Success! Your website is now fully connected to your custom Firebase project. Since this database is completely fresh, your existing local customers and order history aren't inside your Firestore Console yet. Click the button to synchronize and upload them immediately.
          </p>
        </div>
        <div className="shrink-0">
          <button
            onClick={handleSyncDataToFirestore}
            disabled={syncingToFirestore}
            className="w-full md:w-auto px-5 py-2.5 bg-[var(--theme-accent)] hover:bg-[var(--theme-accent)]/90 text-white text-xs uppercase tracking-wider font-semibold font-sans rounded-none transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
          >
            {syncingToFirestore ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Syncing to Firestore...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync Local Data to Firebase</span>
              </>
            )}
          </button>
        </div>
      </div>

      {syncSuccessMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-sans rounded-none flex items-center gap-2 animate-fade-in">
          <span className="text-emerald-500 font-bold text-sm">✓</span>
          <span>{syncSuccessMessage}</span>
        </div>
      )}

      {/* Analytics Bento Mini Cards */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-[var(--theme-primary)]/15 rounded-none p-4 shadow-xs flex items-center gap-4">
            <div className="p-2.5 bg-[var(--theme-primary)]/10 rounded-none text-[var(--theme-accent)] shrink-0">
              <IndianRupee className="w-5 h-5 text-[var(--theme-primary)]" />
            </div>
            <div>
              <p className="text-[9px] font-sans uppercase tracking-widest text-stone-400 font-semibold">Completed Revenue</p>
              <h4 className="text-lg font-bold font-mono text-stone-900 mt-0.5">₹{analytics.totalRevenue.toLocaleString('en-IN')}</h4>
            </div>
          </div>

          <div className="bg-white border border-[var(--theme-primary)]/15 rounded-none p-4 shadow-xs flex items-center gap-4">
            <div className="p-2.5 bg-indigo-50 rounded-none text-indigo-800 shrink-0">
              <ShoppingCart className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-[9px] font-sans uppercase tracking-widest text-stone-400 font-semibold">Paid Orders</p>
              <h4 className="text-lg font-bold font-mono text-stone-900 mt-0.5">{analytics.totalOrders}</h4>
            </div>
          </div>

          <div className="bg-white border border-[var(--theme-primary)]/15 rounded-none p-4 shadow-xs flex items-center gap-4">
            <div className="p-2.5 bg-teal-50 rounded-none text-teal-800 shrink-0">
              <Package className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-[9px] font-sans uppercase tracking-widest text-stone-400 font-semibold">Catalog Crafts</p>
              <h4 className="text-lg font-bold font-mono text-stone-900 mt-0.5">{products.length}</h4>
            </div>
          </div>

          <div className="bg-white border border-[var(--theme-primary)]/15 rounded-none p-4 shadow-xs flex items-center gap-4">
            <div className="p-2.5 bg-amber-50 rounded-none text-amber-900 shrink-0">
              <BarChart3 className="w-5 h-5 text-[var(--theme-primary)]" />
            </div>
            <div>
              <p className="text-[9px] font-sans uppercase tracking-widest text-stone-400 font-semibold">In Progress</p>
              <h4 className="text-lg font-bold font-mono text-stone-900 mt-0.5">
                {orders.filter(o => o.orderStatus === 'in_progress').length} / {orders.length}
              </h4>
            </div>
          </div>
        </div>
      )}

      {/* Primary Dashboard Panel Sections */}
      <div className="flex flex-wrap border-b border-[var(--theme-primary)]/15">
        <button
          onClick={() => { setActiveTab('orders'); setIsEditingProduct(false); }}
          className={`px-4 py-2.5 font-serif text-sm font-light tracking-wide border-b-2 transition-all ${
            activeTab === 'orders' && !isEditingProduct
              ? 'border-[var(--theme-accent)] text-[var(--theme-accent)] font-semibold'
              : 'border-transparent text-stone-500 hover:text-[var(--theme-primary)]'
          }`}
        >
          Customer Orders ({orders.length})
        </button>
        <button
          onClick={() => { setActiveTab('admin-orders'); setIsEditingProduct(false); }}
          className={`px-4 py-2.5 font-serif text-sm font-light tracking-wide border-b-2 transition-all ${
            activeTab === 'admin-orders' && !isEditingProduct
              ? 'border-[var(--theme-accent)] text-[var(--theme-accent)] font-semibold'
              : 'border-transparent text-stone-500 hover:text-[var(--theme-primary)]'
          }`}
        >
          Admin Orders (Firestore) ({firestoreOrders.length})
        </button>
        <button
          onClick={() => { setActiveTab('products'); }}
          className={`px-4 py-2.5 font-serif text-sm font-light tracking-wide border-b-2 transition-all ${
            activeTab === 'products' || isEditingProduct
              ? 'border-[var(--theme-accent)] text-[var(--theme-accent)] font-semibold'
              : 'border-transparent text-stone-500 hover:text-[var(--theme-primary)]'
          }`}
        >
          Manage Handcrafted Catalog
        </button>
        <button
          onClick={() => { setActiveTab('analytics'); setIsEditingProduct(false); }}
          className={`px-4 py-2.5 font-serif text-sm font-light tracking-wide border-b-2 transition-all ${
            activeTab === 'analytics' && !isEditingProduct
              ? 'border-[var(--theme-accent)] text-[var(--theme-accent)] font-semibold'
              : 'border-transparent text-stone-500 hover:text-[var(--theme-primary)]'
          }`}
        >
          Sales Metrics Overview
        </button>
        <button
          onClick={() => { setActiveTab('settings'); setIsEditingProduct(false); }}
          className={`px-4 py-2.5 font-serif text-sm font-light tracking-wide border-b-2 transition-all ${
            activeTab === 'settings' && !isEditingProduct
              ? 'border-[var(--theme-accent)] text-[var(--theme-accent)] font-semibold'
              : 'border-transparent text-stone-500 hover:text-[var(--theme-primary)]'
          }`}
        >
          Website Customizer
        </button>
      </div>

      {/* VIEW: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && !isEditingProduct && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--theme-primary)]/10">
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-lg font-light text-[#1a1a1a]">Custom Order Placements</h3>
              <button
                onClick={loadAdminData}
                disabled={loadingFirestoreOrders}
                className="p-1 text-stone-400 hover:text-[var(--theme-primary)] disabled:text-stone-300 transition-colors"
                title="Sync with Firestore"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingFirestoreOrders ? 'animate-spin text-[var(--theme-primary)]' : ''}`} />
              </button>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500 font-sans">Filter by status:</span>
                <select
                  id="admin-order-status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[var(--theme-bg)] border border-[var(--theme-primary)]/35 text-stone-800 text-xs py-1 px-2.5 focus:outline-none focus:border-[#1a1a1a] font-sans rounded-none transition-all cursor-pointer hover:border-[var(--theme-primary)]"
                >
                  <option value="all">All Statuses ({orders.length})</option>
                  <option value="received">Received ({orders.filter(o => o.orderStatus === 'received').length})</option>
                  <option value="in_progress">In Progress ({orders.filter(o => o.orderStatus === 'in_progress').length})</option>
                  <option value="shipped">Shipped ({orders.filter(o => o.orderStatus === 'shipped').length})</option>
                  <option value="delivered">Delivered ({orders.filter(o => o.orderStatus === 'delivered').length})</option>
                </select>
              </div>

              {/* Action Export Buttons */}
              <div className="flex items-center gap-1.5 border-l border-stone-200 pl-3">
                <button
                  type="button"
                  onClick={() => handleExportCSV(filteredOrders, statusFilter)}
                  className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-sans font-bold uppercase tracking-wider bg-emerald-700 hover:bg-emerald-800 text-white transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Export currently filtered orders to CSV (Excel format)"
                >
                  <Download className="w-3 h-3" />
                  <span>CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExportJSON(filteredOrders, statusFilter)}
                  className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-sans font-bold uppercase tracking-wider bg-stone-700 hover:bg-stone-800 text-white transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Export currently filtered orders to JSON data"
                >
                  <Download className="w-3 h-3" />
                  <span>JSON</span>
                </button>
              </div>

              <span className="text-xs text-stone-400 font-sans bg-stone-100/60 border border-stone-200/40 px-2 py-0.5 rounded-none">
                Showing {filteredOrders.length} of {orders.length}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 bg-white border border-[var(--theme-primary)]/10 rounded-none p-6 text-stone-400">
                <ShoppingCart className="w-12 h-12 mx-auto stroke-[1.5] mb-2 text-stone-300" />
                <p className="text-xs font-sans uppercase tracking-widest text-stone-400">
                  {statusFilter === 'all' 
                    ? 'No custom orders received yet.' 
                    : `No orders match the "${statusFilter.replace('_', ' ')}" status filter.`
                  }
                </p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-[var(--theme-bg)] border border-[var(--theme-primary)]/15 rounded-none overflow-hidden shadow-xs hover:border-[var(--theme-primary)]/35 transition-all p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 relative"
                >
                  {/* Status header tags */}
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <span
                      className={`text-[9px] font-sans font-semibold uppercase tracking-wider px-2 py-0.5 rounded-none border ${
                        order.paymentStatus === 'completed'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : 'bg-amber-50 border-amber-200 text-[var(--theme-primary)]'
                      }`}
                    >
                      Payment: {order.paymentStatus}
                    </span>
                    <span
                      className={`text-[9px] font-sans font-semibold uppercase tracking-wider px-2 py-0.5 rounded-none border ${
                        order.orderStatus === 'delivered'
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                          : order.orderStatus === 'shipped'
                          ? 'bg-indigo-100 border-indigo-300 text-indigo-800'
                          : order.orderStatus === 'in_progress'
                          ? 'bg-amber-50 border-[var(--theme-primary)]/30 text-stone-800'
                          : 'bg-stone-100 border-stone-300 text-stone-700'
                      }`}
                    >
                      {order.orderStatus.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Order metadata */}
                  <div className="lg:col-span-3 space-y-2">
                    <div className="text-xs font-mono font-bold text-stone-900">#{order.id}</div>
                    <div className="text-xs text-stone-500 font-sans flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="space-y-1 pt-1">
                      <h4 className="text-xs uppercase tracking-wider font-semibold font-sans text-[#1a1a1a]">{order.customerName}</h4>
                      <p className="text-xs text-stone-500 truncate">{order.email}</p>
                      <p className="text-xs font-mono text-stone-600">{order.phone}</p>
                    </div>

                    {/* Address details */}
                    <div className="bg-[#f8f5ef] border border-[var(--theme-primary)]/10 p-2 rounded-none text-[10px] text-stone-600 max-w-full truncate whitespace-normal leading-normal">
                      <strong className="text-stone-700 uppercase font-sans font-semibold">Shipping:</strong> {order.address.street}, {order.address.city}, {order.address.state} - {order.address.zipCode}
                    </div>
                  </div>

                  {/* Items in the order & Customizations */}
                  <div className="lg:col-span-6 space-y-3">
                    <h5 className="text-[10px] font-sans font-semibold text-stone-400 uppercase tracking-widest">Requested Items</h5>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="bg-white border border-[var(--theme-primary)]/10 rounded-none p-2.5 flex gap-2.5">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full object-cover shrink-0 border border-[var(--theme-primary)]/10"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-serif font-bold text-stone-800 truncate">{item.product.name}</p>
                          <p className="text-[10px] text-stone-400 font-mono">Size: {item.size} | Color: {item.color.name}</p>

                          {/* Customizations display */}
                          {item.personalization && (
                            <div className="mt-1.5 bg-[#f8f5ef] border border-[var(--theme-primary)]/15 rounded-none p-2 text-[10px] text-stone-700 font-sans space-y-1">
                              <span className="font-bold text-[9px] uppercase tracking-wider text-[var(--theme-primary)]">
                                Personalization text ({item.personalization.language}):
                              </span>
                              <p className="italic font-serif font-medium bg-white px-1.5 py-0.5 rounded-none text-stone-900 border border-[var(--theme-primary)]/10 select-all">
                                &ldquo;{item.personalization.text}&rdquo;
                              </p>
                              {item.personalization.photoUrl && (
                                <div className="flex items-center gap-1.5 mt-1">
                                  <span className="text-[9px] text-emerald-800 font-bold">✓ Reference photo provided:</span>
                                  <a
                                    href={item.personalization.photoUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[9px] text-indigo-600 hover:underline flex items-center gap-0.5"
                                  >
                                    <span>View Photo</span> <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {order.customNotes && (
                      <div className="p-2 bg-indigo-50/50 border border-indigo-100/50 rounded-none text-[10px] text-indigo-950 flex gap-1 items-start">
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" />
                        <p className="font-sans italic leading-normal">Client Note: &ldquo;{order.customNotes}&rdquo;</p>
                      </div>
                    )}
                    {order.trackingNotes && (
                      <div className="p-2 bg-amber-50/30 border border-[var(--theme-primary)]/20 rounded-none text-[10px] text-stone-800 flex gap-1.5 items-start">
                        <Sparkles className="w-3.5 h-3.5 text-[var(--theme-primary)] mt-0.5 shrink-0" />
                        <div className="space-y-0.5">
                          <span className="font-bold text-[8px] uppercase tracking-wider text-[var(--theme-primary)] block">Tracking Notes (visible to customer):</span>
                          <p className="font-sans italic leading-normal text-stone-600">{order.trackingNotes}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions column */}
                  <div className="lg:col-span-3 border-l border-[var(--theme-primary)]/10 lg:pl-4 flex flex-col justify-between pt-4 lg:pt-0">
                    <div className="space-y-3">
                      <div className="text-right">
                        <span className="text-[9px] font-sans text-stone-400 block uppercase font-semibold">Total Price paid</span>
                        <span className="text-base font-bold font-mono text-stone-950">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                      </div>

                      {/* Status select dropdown */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-sans text-[var(--theme-primary)] uppercase font-semibold block">Craft Status</label>
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as any)}
                          className="w-full text-xs py-1.5 px-2 bg-white rounded-none border border-stone-300 focus:outline-hidden focus:border-[var(--theme-accent)]"
                        >
                          <option value="received">Received (New)</option>
                          <option value="in_progress">Painting In Progress</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </div>

                      {/* Payment state toggle */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-sans text-[var(--theme-primary)] uppercase font-semibold block">Payment Status</label>
                        <select
                          value={order.paymentStatus}
                          onChange={(e) => handleUpdatePaymentStatus(order.id, e.target.value as any)}
                          className="w-full text-xs py-1.5 px-2 bg-white rounded-none border border-stone-300 focus:outline-hidden focus:border-[var(--theme-accent)]"
                        >
                          <option value="pending">Pending</option>
                          <option value="completed">Completed (Paid)</option>
                          <option value="failed">Failed</option>
                        </select>
                      </div>

                      {/* Manual Edit Status and Notes Modal Trigger */}
                      <button
                        onClick={() => openEditOrderModal(order)}
                        className="w-full py-1.5 px-2 bg-[var(--theme-bg)] hover:bg-[var(--theme-primary)]/10 text-stone-700 hover:text-[var(--theme-accent)] border border-[var(--theme-primary)]/40 hover:border-[var(--theme-primary)] font-sans text-[9px] font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-1 mt-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit Order & Notes</span>
                      </button>
                    </div>

                    {/* Notify client link via Whatsapp */}
                    <a
                      href={getWhatsAppMessageLink(order)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 py-2 px-3 bg-[#25D366] hover:bg-[#128C7E] text-white text-[10px] font-bold tracking-widest uppercase rounded-none shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>Ping Update on WhatsApp</span>
                    </a>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* VIEW: LIVE FIRESTORE ORDERS MANAGEMENT */}
      {activeTab === 'admin-orders' && !isEditingProduct && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--theme-primary)]/10">
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-lg font-light text-[#1a1a1a]">Admin Orders (Live Firestore)</h3>
              <button
                onClick={fetchFirestoreOnlyOrders}
                disabled={loadingOnlyFirestore}
                className="p-1 text-stone-400 hover:text-[var(--theme-primary)] disabled:text-stone-300 transition-colors"
                title="Sync and Reload Live Firestore Data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingOnlyFirestore ? 'animate-spin text-[var(--theme-primary)]' : ''}`} />
              </button>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              {/* Search Bar */}
              <div className="relative w-full sm:w-60">
                <input
                  type="text"
                  placeholder="Search live orders..."
                  value={fsSearchQuery}
                  onChange={(e) => setFsSearchQuery(e.target.value)}
                  className="w-full text-xs py-1.5 pl-7 pr-2 bg-white rounded-none border border-stone-300 focus:outline-hidden focus:border-[var(--theme-accent)]"
                />
                <span className="absolute left-2.5 top-2.5 text-stone-400">
                  <Search className="w-3 h-3" />
                </span>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500 font-sans">Filter status:</span>
                <select
                  value={fsStatusFilter}
                  onChange={(e) => setFsStatusFilter(e.target.value)}
                  className="text-xs py-1.5 px-2 bg-white rounded-none border border-stone-300 focus:outline-hidden focus:border-[var(--theme-accent)]"
                >
                  <option value="all">All Orders ({firestoreOrders.length})</option>
                  <option value="received">Received ({firestoreOrders.filter(o => o.orderStatus === 'received').length})</option>
                  <option value="in_progress">Painting ({firestoreOrders.filter(o => o.orderStatus === 'in_progress').length})</option>
                  <option value="shipped">Shipped ({firestoreOrders.filter(o => o.orderStatus === 'shipped').length})</option>
                  <option value="delivered">Delivered ({firestoreOrders.filter(o => o.orderStatus === 'delivered').length})</option>
                </select>
              </div>

              {/* Live CSV/JSON Export */}
              <div className="flex items-center gap-1.5 border-l border-stone-200 pl-3">
                <button
                  type="button"
                  onClick={() => handleExportCSV(firestoreOrders.filter(order => {
                    const matchesStatus = fsStatusFilter === 'all' || order.orderStatus === fsStatusFilter;
                    const query = fsSearchQuery.toLowerCase().trim();
                    if (!query) return matchesStatus;
                    
                    const matchesId = order.id.toLowerCase().includes(query);
                    const matchesName = (order.customerName || '').toLowerCase().includes(query);
                    const matchesEmail = (order.email || '').toLowerCase().includes(query);
                    const matchesPhone = (order.phone || '').toLowerCase().includes(query);
                    const matchesItem = order.items.some(item => (item.product?.name || '').toLowerCase().includes(query));
                    
                    return matchesStatus && (matchesId || matchesName || matchesEmail || matchesPhone || matchesItem);
                  }), `firestore_${fsStatusFilter}`)}
                  className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-sans font-bold uppercase tracking-wider bg-emerald-700 hover:bg-emerald-800 text-white transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Export live filtered orders to CSV"
                >
                  <Download className="w-3 h-3" />
                  <span>CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExportJSON(firestoreOrders.filter(order => {
                    const matchesStatus = fsStatusFilter === 'all' || order.orderStatus === fsStatusFilter;
                    const query = fsSearchQuery.toLowerCase().trim();
                    if (!query) return matchesStatus;
                    
                    const matchesId = order.id.toLowerCase().includes(query);
                    const matchesName = (order.customerName || '').toLowerCase().includes(query);
                    const matchesEmail = (order.email || '').toLowerCase().includes(query);
                    const matchesPhone = (order.phone || '').toLowerCase().includes(query);
                    const matchesItem = order.items.some(item => (item.product?.name || '').toLowerCase().includes(query));
                    
                    return matchesStatus && (matchesId || matchesName || matchesEmail || matchesPhone || matchesItem);
                  }), `firestore_${fsStatusFilter}`)}
                  className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-sans font-bold uppercase tracking-wider bg-stone-700 hover:bg-stone-800 text-white transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Export live filtered orders to JSON"
                >
                  <Download className="w-3 h-3" />
                  <span>JSON</span>
                </button>
              </div>

              <span className="text-xs text-stone-400 font-sans bg-stone-100/60 border border-stone-200/40 px-2 py-0.5 rounded-none">
                Showing {firestoreOrders.filter(order => {
                  const matchesStatus = fsStatusFilter === 'all' || order.orderStatus === fsStatusFilter;
                  const query = fsSearchQuery.toLowerCase().trim();
                  if (!query) return matchesStatus;
                  
                  const matchesId = order.id.toLowerCase().includes(query);
                  const matchesName = (order.customerName || '').toLowerCase().includes(query);
                  const matchesEmail = (order.email || '').toLowerCase().includes(query);
                  const matchesPhone = (order.phone || '').toLowerCase().includes(query);
                  const matchesItem = order.items.some(item => (item.product?.name || '').toLowerCase().includes(query));
                  
                  return matchesStatus && (matchesId || matchesName || matchesEmail || matchesPhone || matchesItem);
                }).length} of {firestoreOrders.length}
              </span>
            </div>
          </div>

          {/* RECHARTS ORDERS SUMMARY DASHBOARD */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-[#fbfbf9] border border-[var(--theme-primary)]/10">
            {/* CARD 1: FINANCIAL OVERVIEW */}
            <div className="bg-white border border-stone-200 p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-stone-400 block mb-1">
                  Financial Overview
                </span>
                <div className="flex items-baseline gap-2">
                  <h4 className="font-serif text-2xl font-light text-stone-900">
                    ₹{fsTotalRevenue.toLocaleString('en-IN')}
                  </h4>
                  <span className="text-[10px] text-stone-500 font-sans">Total Sales</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-stone-100 space-y-1.5 text-xs text-stone-600 font-sans">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Paid (Completed):
                  </span>
                  <span className="font-mono font-bold text-emerald-800">
                    ₹{fsCompletedRevenue.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Pending Payment:
                  </span>
                  <span className="font-mono font-medium text-amber-700">
                    ₹{(fsTotalRevenue - fsCompletedRevenue).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden mt-1 flex">
                  <div 
                    className="bg-emerald-500 h-full" 
                    style={{ width: `${fsTotalRevenue > 0 ? (fsCompletedRevenue / fsTotalRevenue) * 100 : 0}%` }} 
                  />
                  <div 
                    className="bg-amber-400 h-full" 
                    style={{ width: `${fsTotalRevenue > 0 ? ((fsTotalRevenue - fsCompletedRevenue) / fsTotalRevenue) * 100 : 0}%` }} 
                  />
                </div>
              </div>
            </div>

            {/* CARD 2: ORDER VOLUME */}
            <div className="bg-white border border-stone-200 p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-stone-400 block mb-1">
                  Order Volume
                </span>
                <div className="flex items-baseline gap-2">
                  <h4 className="font-serif text-2xl font-light text-stone-900">
                    {fsTotalOrdersCount} Orders
                  </h4>
                  <span className="text-[10px] text-stone-500 font-sans">Registered</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-stone-100 grid grid-cols-2 gap-2 text-[11px] text-stone-600 font-sans">
                <div className="bg-stone-50 p-1.5 border border-stone-200/50">
                  <span className="text-[9px] text-stone-400 block uppercase">Received</span>
                  <strong className="text-stone-800 font-serif text-sm">{fsReceivedCount}</strong>
                </div>
                <div className="bg-amber-50/50 p-1.5 border border-amber-200/50">
                  <span className="text-[9px] text-amber-600 block uppercase font-medium">Painting</span>
                  <strong className="text-amber-800 font-serif text-sm">{fsInProgressCount}</strong>
                </div>
                <div className="bg-indigo-50/30 p-1.5 border border-indigo-100/30">
                  <span className="text-[9px] text-indigo-600 block uppercase font-medium">Shipped</span>
                  <strong className="text-indigo-800 font-serif text-sm">{fsShippedCount}</strong>
                </div>
                <div className="bg-emerald-50/50 p-1.5 border border-emerald-200/50">
                  <span className="text-[9px] text-emerald-600 block uppercase font-medium">Delivered</span>
                  <strong className="text-emerald-800 font-serif text-sm">{fsDeliveredCount}</strong>
                </div>
              </div>
            </div>

            {/* CARD 3: STATUS DISTRIBUTION CHART */}
            <div className="bg-white border border-stone-200 p-3 flex flex-col justify-between min-h-[140px]">
              <div>
                <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-stone-400 block mb-1">
                  Active Status Distribution
                </span>
              </div>
              <div className="w-full h-[100px] mt-1 relative">
                {fsTotalOrdersCount === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] text-stone-400 font-sans">
                    No orders to plot
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={fsChartData}
                      layout="vertical"
                      margin={{ top: 0, right: 10, left: -25, bottom: 0 }}
                    >
                      <XAxis type="number" hide />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        tick={{ fontSize: 9, fill: '#78716c', fontFamily: 'sans-serif' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{ 
                          fontSize: '10px', 
                          fontFamily: 'sans-serif', 
                          backgroundColor: '#1a1a1a', 
                          color: '#fff',
                          border: 'none',
                          borderRadius: '0px',
                          padding: '4px 8px'
                        }}
                        cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                        labelStyle={{ display: 'none' }}
                        formatter={(value: any) => [`${value} Orders`, 'Count']}
                      />
                      <Bar 
                        dataKey="count" 
                        radius={[0, 4, 4, 0]} 
                        barSize={12}
                      >
                        {fsChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {loadingOnlyFirestore ? (
              <div className="text-center py-20 bg-white border border-[var(--theme-primary)]/10 rounded-none shadow-xs">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--theme-accent)] mb-3" />
                <p className="text-xs font-sans uppercase tracking-widest text-stone-500 animate-pulse">
                  Querying live database...
                </p>
              </div>
            ) : firestoreOrders.filter(order => {
              const matchesStatus = fsStatusFilter === 'all' || order.orderStatus === fsStatusFilter;
              const query = fsSearchQuery.toLowerCase().trim();
              if (!query) return matchesStatus;
              
              const matchesId = order.id.toLowerCase().includes(query);
              const matchesName = (order.customerName || '').toLowerCase().includes(query);
              const matchesEmail = (order.email || '').toLowerCase().includes(query);
              const matchesPhone = (order.phone || '').toLowerCase().includes(query);
              const matchesItem = order.items.some(item => (item.product?.name || '').toLowerCase().includes(query));
              
              return matchesStatus && (matchesId || matchesName || matchesEmail || matchesPhone || matchesItem);
            }).length === 0 ? (
              <div className="text-center py-12 bg-white border border-[var(--theme-primary)]/10 rounded-none p-6 text-stone-400">
                <ShoppingCart className="w-12 h-12 mx-auto stroke-[1.5] mb-2 text-stone-300" />
                <p className="text-xs font-sans uppercase tracking-widest text-stone-400">
                  {fsStatusFilter === 'all' 
                    ? 'No orders found in Firestore.' 
                    : `No live orders match the "${fsStatusFilter.replace('_', ' ')}" status filter.`
                  }
                </p>
              </div>
            ) : (
              firestoreOrders.filter(order => {
                const matchesStatus = fsStatusFilter === 'all' || order.orderStatus === fsStatusFilter;
                const query = fsSearchQuery.toLowerCase().trim();
                if (!query) return matchesStatus;
                
                const matchesId = order.id.toLowerCase().includes(query);
                const matchesName = (order.customerName || '').toLowerCase().includes(query);
                const matchesEmail = (order.email || '').toLowerCase().includes(query);
                const matchesPhone = (order.phone || '').toLowerCase().includes(query);
                const matchesItem = order.items.some(item => (item.product?.name || '').toLowerCase().includes(query));
                
                return matchesStatus && (matchesId || matchesName || matchesEmail || matchesPhone || matchesItem);
              }).map((order) => (
                <div
                  key={order.id}
                  className="bg-[var(--theme-bg)] border border-[var(--theme-primary)]/15 rounded-none overflow-hidden shadow-xs hover:border-[var(--theme-primary)]/35 transition-all p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 relative animate-fade-in"
                >
                  {/* Status header tags */}
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <span
                      className={`text-[9px] font-sans font-semibold uppercase tracking-wider px-2 py-0.5 rounded-none border ${
                        order.paymentStatus === 'completed'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : 'bg-amber-50 border-amber-200 text-[var(--theme-primary)]'
                      }`}
                    >
                      Payment: {order.paymentStatus}
                    </span>
                    <span
                      className={`text-[9px] font-sans font-semibold uppercase tracking-wider px-2 py-0.5 rounded-none border ${
                        order.orderStatus === 'delivered'
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                          : order.orderStatus === 'shipped'
                          ? 'bg-indigo-100 border-indigo-300 text-indigo-800'
                          : order.orderStatus === 'in_progress'
                          ? 'bg-amber-50 border-[var(--theme-primary)]/30 text-stone-800'
                          : 'bg-stone-100 border-stone-300 text-stone-700'
                      }`}
                    >
                      {order.orderStatus.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Order metadata */}
                  <div className="lg:col-span-3 space-y-2">
                    <div className="text-xs font-mono font-bold text-stone-900">#{order.id}</div>
                    <div className="text-xs text-stone-500 font-sans flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      <span>{new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    
                    <div className="space-y-1 pt-1">
                      <h4 className="text-xs uppercase tracking-wider font-semibold font-sans text-[#1a1a1a]">{order.customerName}</h4>
                      <p className="text-xs text-stone-500 truncate">{order.email}</p>
                      <p className="text-xs font-mono text-stone-600">{order.phone}</p>
                    </div>

                    {/* Address details */}
                    <div className="bg-[#f8f5ef] border border-[var(--theme-primary)]/10 p-2 rounded-none text-[10px] text-stone-600 max-w-full truncate whitespace-normal leading-normal">
                      <strong className="text-stone-700 uppercase font-sans font-semibold">Shipping:</strong> {order.address.street}, {order.address.city}, {order.address.state} - {order.address.zipCode}
                    </div>
                  </div>

                  {/* Items in the order & Customizations */}
                  <div className="lg:col-span-6 space-y-3">
                    <h5 className="text-[10px] font-sans font-semibold text-stone-400 uppercase tracking-widest">Requested Items</h5>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="bg-white border border-[var(--theme-primary)]/10 rounded-none p-2.5 flex gap-2.5">
                        <img
                          src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600&auto=format&fit=crop'}
                          alt={item.product?.name || 'Vlaksha Craft'}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full object-cover shrink-0 border border-[var(--theme-primary)]/10"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-serif font-bold text-stone-800 truncate">{item.product?.name || 'Custom Lippan Painting'}</p>
                          <p className="text-[10px] text-stone-400 font-mono">Size: {item.size} | Color: {item.color?.name || 'Default'}</p>

                          {/* Customizations display */}
                          {item.personalization && (
                            <div className="mt-1.5 bg-[#f8f5ef] border border-[var(--theme-primary)]/15 rounded-none p-2 text-[10px] text-stone-700 font-sans space-y-1">
                              <span className="font-bold text-[9px] uppercase tracking-wider text-[var(--theme-primary)]">
                                Personalization text ({item.personalization.language}):
                              </span>
                              <p className="italic font-serif font-medium bg-white px-1.5 py-0.5 rounded-none text-stone-900 border border-[var(--theme-primary)]/10 select-all">
                                &ldquo;{item.personalization.text}&rdquo;
                              </p>
                              {item.personalization.photoUrl && (
                                <div className="flex items-center gap-1.5 mt-1">
                                  <span className="text-[9px] text-emerald-800 font-bold">✓ Reference photo provided:</span>
                                  <a
                                    href={item.personalization.photoUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[9px] text-indigo-600 hover:underline flex items-center gap-0.5"
                                  >
                                    <span>View Photo</span> <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {order.customNotes && (
                      <div className="p-2 bg-indigo-50/50 border border-indigo-100/50 rounded-none text-[10px] text-indigo-950 flex gap-1 items-start">
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" />
                        <p className="font-sans italic leading-normal">Client Note: &ldquo;{order.customNotes}&rdquo;</p>
                      </div>
                    )}
                    {order.trackingNotes && (
                      <div className="p-2 bg-amber-50/30 border border-[var(--theme-primary)]/20 rounded-none text-[10px] text-stone-800 flex gap-1.5 items-start">
                        <Sparkles className="w-3.5 h-3.5 text-[var(--theme-primary)] mt-0.5 shrink-0" />
                        <div className="space-y-0.5">
                          <span className="font-bold text-[8px] uppercase tracking-wider text-[var(--theme-primary)] block">Tracking Notes (visible to customer):</span>
                          <p className="font-sans italic leading-normal text-stone-600">{order.trackingNotes}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions column */}
                  <div className="lg:col-span-3 border-l border-[var(--theme-primary)]/10 lg:pl-4 flex flex-col justify-between pt-4 lg:pt-0">
                    <div className="space-y-3">
                      <div className="text-right">
                        <span className="text-[9px] font-sans text-stone-400 block uppercase font-semibold">Total Price paid</span>
                        <span className="text-base font-bold font-mono text-stone-950">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                      </div>

                      {/* Status select dropdown */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-sans text-[var(--theme-primary)] uppercase font-semibold block">Craft Status</label>
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as any)}
                          className="w-full text-xs py-1.5 px-2 bg-white rounded-none border border-stone-300 focus:outline-hidden focus:border-[var(--theme-accent)]"
                        >
                          <option value="received">Received (New)</option>
                          <option value="in_progress">Painting In Progress</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </div>

                      {/* Payment state toggle */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-sans text-[var(--theme-primary)] uppercase font-semibold block">Payment Status</label>
                        <select
                          value={order.paymentStatus}
                          onChange={(e) => handleUpdatePaymentStatus(order.id, e.target.value as any)}
                          className="w-full text-xs py-1.5 px-2 bg-white rounded-none border border-stone-300 focus:outline-hidden focus:border-[var(--theme-accent)]"
                        >
                          <option value="pending">Pending</option>
                          <option value="completed">Completed (Paid)</option>
                          <option value="failed">Failed</option>
                        </select>
                      </div>

                      {/* Manual Edit Status and Notes Modal Trigger */}
                      <button
                        onClick={() => openEditOrderModal(order)}
                        className="w-full py-1.5 px-2 bg-[var(--theme-bg)] hover:bg-[var(--theme-primary)]/10 text-stone-700 hover:text-[var(--theme-accent)] border border-[var(--theme-primary)]/40 hover:border-[var(--theme-primary)] font-sans text-[9px] font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-1 mt-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit Order & Notes</span>
                      </button>
                    </div>

                    {/* Notify client link via Whatsapp */}
                    <a
                      href={getWhatsAppMessageLink(order)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 py-2 px-3 bg-[#25D366] hover:bg-[#128C7E] text-white text-[10px] font-bold tracking-widest uppercase rounded-none shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>Ping Update on WhatsApp</span>
                    </a>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* VIEW: PRODUCTS CATALOG MANAGEMENT */}
      {activeTab === 'products' && !isEditingProduct && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-light text-[#1a1a1a]">Your Hand-Painted Catalog</h3>
            <button
              onClick={startNewProduct}
              className="py-2.5 px-4 bg-[var(--theme-accent)] text-white font-sans text-xs font-semibold uppercase tracking-widest rounded-none hover:bg-[var(--theme-primary)] transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Craft</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-[var(--theme-primary)]/15 rounded-none p-3 flex gap-3 relative hover:shadow-xs transition-shadow"
              >
                {/* Thumbnail circular image */}
                <div className="w-16 h-16 rounded-full border border-[var(--theme-primary)]/20 overflow-hidden shrink-0 shadow-inner p-1 bg-white">
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[9px] bg-[#f8f5ef] text-[var(--theme-primary)] font-sans font-bold px-1.5 py-0.5 uppercase tracking-wider rounded-none">
                    {p.category.replace('-', ' ')}
                  </span>
                  <h4 className="font-serif text-sm font-semibold text-stone-900 truncate mt-1.5">
                    {p.name}
                  </h4>
                  <p className="text-xs font-bold font-mono text-[var(--theme-primary)] mt-0.5">₹{p.price.toLocaleString('en-IN')}</p>
                  
                  <div className="flex gap-1.5 mt-2">
                    <button
                      onClick={() => startEditProduct(p)}
                      className="p-1 px-2 rounded-none text-stone-500 hover:text-[var(--theme-accent)] hover:bg-stone-50 border border-stone-200 flex items-center gap-1 text-[10px] font-sans"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      className="p-1 px-2 rounded-none text-stone-500 hover:text-red-600 hover:bg-red-50 border border-stone-200 flex items-center gap-1 text-[10px] font-sans"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                {/* Tags overlay */}
                <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                  {p.isPersonalizable && (
                    <span className="text-[8px] bg-stone-100 border border-stone-200 text-stone-600 font-bold px-1 rounded-none uppercase">
                      Custom
                    </span>
                  )}
                  {p.isReadyMade && (
                    <span className="text-[8px] bg-emerald-500/10 border border-emerald-600/20 text-emerald-900 font-bold px-1 rounded-none uppercase">
                      Ready
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: EDIT/ADD PRODUCT FORM */}
      {isEditingProduct && editingProduct && (
        <form
          onSubmit={handleAddOrEditProduct}
          className="bg-[var(--theme-bg)] border border-[var(--theme-primary)]/20 rounded-none p-6 shadow-sm space-y-4 max-w-2xl mx-auto"
        >
          <h3 className="font-serif text-lg font-light text-[#1a1a1a] border-b border-[var(--theme-primary)]/10 pb-2">
            {editingProduct.id ? 'Edit Craft Product' : 'Add New Handpainted Craft'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-stone-700 mb-1">
                Product Name
              </label>
              <input
                type="text"
                required
                value={editingProduct.name || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                placeholder="e.g. Peacock Feather Lippan Plate"
                className="w-full text-xs py-2 px-3 rounded-none border border-[var(--theme-primary)]/25 focus:outline-hidden focus:border-[var(--theme-accent)] bg-white font-sans"
              />
            </div>

            <div>
              <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-stone-700 mb-1">
                Price (INR)
              </label>
              <input
                type="number"
                required
                value={editingProduct.price || 0}
                onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                className="w-full text-xs py-2 px-3 rounded-none border border-[var(--theme-primary)]/25 focus:outline-hidden focus:border-[var(--theme-accent)] bg-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-stone-700 mb-1">
                Category
              </label>
              <select
                required
                value={editingProduct.category || (settings?.categories?.[0]?.id || 'mandala-wall-plates')}
                onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                className="w-full text-xs py-2 px-3 rounded-none border border-[var(--theme-primary)]/25 focus:outline-hidden bg-white font-sans"
              >
                {(settings?.categories || []).map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-stone-700 mb-1">
                Painting Lead Time (Days)
              </label>
              <input
                type="number"
                required
                value={editingProduct.leadTimeDays || 7}
                onChange={(e) => setEditingProduct({ ...editingProduct, leadTimeDays: Number(e.target.value) })}
                className="w-full text-xs py-2 px-3 rounded-none border border-[var(--theme-primary)]/25 focus:outline-hidden bg-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-stone-700 mb-1">
              Product Description
            </label>
            <textarea
              value={editingProduct.description || ''}
              onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
              rows={3}
              placeholder="Describe the clay motifs, colors, calligraphy details, clock sweeps, and ideal wall display placements."
              className="w-full text-xs py-2 px-3 rounded-none border border-[var(--theme-primary)]/25 focus:outline-hidden focus:border-[var(--theme-accent)] bg-white font-sans"
            />
          </div>

          {/* Visual Multi-Angle & Image Gallery Manager */}
          <div className="space-y-3 bg-[#fdfbf7] p-4 border border-[var(--theme-primary)]/20 rounded-none">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-stone-200/60 pb-2">
              <div>
                <label className="block text-[10px] font-sans uppercase tracking-widest font-extrabold text-[var(--theme-primary)]">
                  Product Image Angles & Gallery
                </label>
                <p className="text-[9px] text-stone-500 font-sans">
                  Provide multiple photo angles (Primary, Close-up, Wall context, etc.). Customers can view them in the Interactive Shimmer and 360° rotating rig.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const currentList = formImageInput.split(',').map(s => s.trim()).filter(Boolean);
                  const newList = [...currentList, 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600&auto=format&fit=crop'];
                  setFormImageInput(newList.join(', '));
                }}
                className="py-1 px-2.5 bg-[var(--theme-primary)]/10 hover:bg-[var(--theme-primary)] text-[var(--theme-primary)] hover:text-white transition-colors text-[9px] font-sans uppercase font-bold tracking-wider flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3 h-3" />
                Add Image Angle
              </button>
            </div>

            {/* List of angles */}
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {(() => {
                const list = formImageInput.split(',').map(s => s.trim()).filter(Boolean);
                if (list.length === 0) {
                  return (
                    <div className="text-center py-6 border border-dashed border-stone-200 text-stone-400 text-xs font-sans">
                      No images specified. Click "Add Image Angle" to insert your first photo!
                    </div>
                  );
                }

                const angleLabels = [
                  'Angle 1 (Primary / Catalog Cover)',
                  'Angle 2 (Detailed Motif / Clay Closeup)',
                  'Angle 3 (3D Side View / Rim)',
                  'Angle 4 (Living Room / Wall Display Context)',
                  'Angle 5 (Symmetrical Rotation / Alternate)',
                ];

                return list.map((url, index) => {
                  return (
                    <div key={index} className="flex gap-3 bg-white p-3 border border-stone-150 shadow-xs relative">
                      {/* Thumbnail Preview Area */}
                      <div className="w-16 h-16 bg-stone-50 border border-stone-200 shrink-0 overflow-hidden relative flex items-center justify-center">
                        <img
                          src={url}
                          alt={`Angle ${index + 1}`}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600&auto=format&fit=crop';
                          }}
                        />
                        <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] font-sans text-center py-0.5">
                          Preview
                        </span>
                      </div>

                      {/* Info & Input fields */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-stone-700">
                            {angleLabels[index] || `Angle ${index + 1} (Additional Gallery Image)`}
                          </span>
                          
                          <div className="flex items-center gap-1.5">
                            {/* Re-ordering buttons */}
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => {
                                const copy = [...list];
                                const temp = copy[index];
                                copy[index] = copy[index - 1];
                                copy[index - 1] = temp;
                                setFormImageInput(copy.join(', '));
                              }}
                              className="p-1 border border-stone-200 hover:bg-stone-50 text-[9px] font-sans disabled:opacity-30 disabled:hover:bg-transparent"
                              title="Move Up"
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              disabled={index === list.length - 1}
                              onClick={() => {
                                const copy = [...list];
                                const temp = copy[index];
                                copy[index] = copy[index + 1];
                                copy[index + 1] = temp;
                                setFormImageInput(copy.join(', '));
                              }}
                              className="p-1 border border-stone-200 hover:bg-stone-50 text-[9px] font-sans disabled:opacity-30 disabled:hover:bg-transparent"
                              title="Move Down"
                            >
                              ▼
                            </button>
                            {/* Delete button */}
                            <button
                              type="button"
                              onClick={() => {
                                const copy = list.filter((_, i) => i !== index);
                                setFormImageInput(copy.join(', '));
                              }}
                              className="p-1 text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                              title="Delete Image Angle"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* URL Paste input */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div>
                            <span className="block text-[8px] font-sans uppercase font-bold text-stone-400">
                              Image URL address
                            </span>
                            <input
                              type="text"
                              value={url}
                              onChange={(e) => {
                                const copy = [...list];
                                copy[index] = e.target.value;
                                setFormImageInput(copy.join(', '));
                              }}
                              placeholder="https://images.unsplash.com/photo-..."
                              className="w-full text-[10px] py-1 px-2 border border-stone-200 focus:outline-hidden bg-white font-mono"
                            />
                          </div>

                          {/* Upload local image */}
                          <div>
                            <span className="block text-[8px] font-sans uppercase font-bold text-stone-400">
                              Or upload from local device
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    if (typeof reader.result === 'string') {
                                      const copy = [...list];
                                      copy[index] = reader.result;
                                      setFormImageInput(copy.join(', '));
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="w-full text-[9px] text-stone-500 file:mr-2 file:py-1 file:px-2 file:border file:border-stone-200 file:text-[9px] file:font-sans file:bg-stone-50 file:text-stone-700 hover:file:bg-stone-100 file:cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
            {/* Direct code fallback (hidden or accessible for power users) */}
            <details className="text-[9px] font-sans text-stone-400 cursor-pointer">
              <summary>View raw comma-separated image URLs list</summary>
              <input
                type="text"
                value={formImageInput}
                onChange={(e) => setFormImageInput(e.target.value)}
                placeholder="https://images.unsplash.com/..., https://images.unsplash.com/..."
                className="w-full text-[10px] mt-1 py-1.5 px-2 border border-stone-200 bg-stone-50/50 font-mono focus:outline-hidden"
              />
            </details>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-stone-700 mb-1">
                Colors List (Format: Name:#HEX, Name:#HEX)
              </label>
              <input
                type="text"
                value={formColorsInput}
                onChange={(e) => setFormColorsInput(e.target.value)}
                placeholder="Indigo:#1E3A8A, Saffron:#EA580C"
                className="w-full text-xs py-2 px-3 rounded-none border border-[var(--theme-primary)]/25 focus:outline-hidden bg-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-stone-700 mb-1">
                Materials List (comma-separated)
              </label>
              <input
                type="text"
                value={formMaterialsInput}
                onChange={(e) => setFormMaterialsInput(e.target.value)}
                placeholder="MDF Backing, Heavy Acrylics, Glass Mirrors, Clay Mud"
                className="w-full text-xs py-2 px-3 rounded-none border border-[var(--theme-primary)]/25 focus:outline-hidden bg-white font-sans"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-6 py-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer select-none font-sans uppercase tracking-wider">
              <input
                type="checkbox"
                checked={!!editingProduct.isPersonalizable}
                onChange={(e) => setEditingProduct({ ...editingProduct, isPersonalizable: e.target.checked })}
                className="accent-[var(--theme-accent)] rounded-none border-stone-300"
              />
              <span>Supports Calligraphy Customization Form</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer select-none font-sans uppercase tracking-wider">
              <input
                type="checkbox"
                checked={!!editingProduct.isReadyMade}
                onChange={(e) => setEditingProduct({ ...editingProduct, isReadyMade: e.target.checked })}
                className="accent-[var(--theme-accent)] rounded-none border-stone-300"
              />
              <span>Ready-Made (Skip made-to-order lead time warning)</span>
            </label>
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t border-[var(--theme-primary)]/10">
            <button
              type="button"
              onClick={() => setIsEditingProduct(false)}
              className="py-2 px-4 rounded-none border border-stone-200 text-stone-700 hover:bg-[#f8f5ef] text-xs font-semibold font-sans uppercase tracking-wider transition-colors"
            >
              Cancel Edit
            </button>
            <button
              type="submit"
              className="py-2.5 px-5 rounded-none bg-[var(--theme-accent)] text-white font-sans text-xs font-semibold uppercase tracking-widest hover:bg-[var(--theme-primary)] transition-colors shadow-xs"
            >
              Save Craft to Catalog
            </button>
          </div>
        </form>
      )}

      {/* VIEW: SALES ANALYTICS DETAILS */}
      {activeTab === 'analytics' && !isEditingProduct && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Best selling chart list */}
            <div className="bg-white border border-[var(--theme-primary)]/15 rounded-none p-5 shadow-xs">
              <h3 className="font-serif text-lg font-light text-[#1a1a1a] border-b border-[var(--theme-primary)]/10 pb-2 mb-4">
                Popular Crafts (Best Sellers)
              </h3>
              {analytics.bestSellers.length === 0 ? (
                <p className="text-xs text-stone-400 text-center py-6 font-sans">No craft logs recorded yet.</p>
              ) : (
                <div className="space-y-4 font-sans">
                  {analytics.bestSellers.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-none bg-[var(--theme-primary)]/10 text-[var(--theme-accent)] text-xs font-bold flex items-center justify-center font-mono border border-[var(--theme-primary)]/20">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-serif font-semibold text-stone-800 truncate">{item.productName}</p>
                          <p className="text-[10px] text-stone-400 font-sans">{item.quantity} units sold</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold font-mono text-stone-900">
                        ₹{item.revenue.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order status allocation */}
            <div className="bg-white border border-[var(--theme-primary)]/15 rounded-none p-5 shadow-xs">
              <h3 className="font-serif text-lg font-light text-[#1a1a1a] border-b border-[var(--theme-primary)]/10 pb-2 mb-4">
                Active Order Pipeline allocation
              </h3>
              <div className="space-y-3 font-sans">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-500">Received (New Requests)</span>
                  <span className="font-bold font-mono">{analytics.ordersByStatus.received}</span>
                </div>
                <div className="w-full bg-stone-100 h-2 rounded-none overflow-hidden">
                  <div
                    className="bg-stone-400 h-full"
                    style={{ width: `${(analytics.ordersByStatus.received / (orders.length || 1)) * 100}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-500">Painting In Progress</span>
                  <span className="font-bold font-mono">{analytics.ordersByStatus.in_progress}</span>
                </div>
                <div className="w-full bg-stone-100 h-2 rounded-none overflow-hidden">
                  <div
                    className="bg-[var(--theme-primary)] h-full"
                    style={{ width: `${(analytics.ordersByStatus.in_progress / (orders.length || 1)) * 100}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-500">Shipped (En Route)</span>
                  <span className="font-bold font-mono">{analytics.ordersByStatus.shipped}</span>
                </div>
                <div className="w-full bg-stone-100 h-2 rounded-none overflow-hidden">
                  <div
                    className="bg-[var(--theme-accent)] h-full"
                    style={{ width: `${(analytics.ordersByStatus.shipped / (orders.length || 1)) * 100}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-500">Delivered</span>
                  <span className="font-bold font-mono">{analytics.ordersByStatus.delivered}</span>
                </div>
                <div className="w-full bg-stone-100 h-2 rounded-none overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full"
                    style={{ width: `${(analytics.ordersByStatus.delivered / (orders.length || 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* VIEW: WEBSITE SETTINGS CUSTOMIZER */}
      {activeTab === 'settings' && !isEditingProduct && settings && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--theme-primary)]/10 pb-4">
            <div>
              <h3 className="font-serif text-lg font-light text-[#1a1a1a]">Website Content Customizer</h3>
              <p className="text-xs text-stone-500 font-sans mt-0.5">Fully customize your home, navigation announcements, and contact information.</p>
            </div>
            <button
              onClick={() => {
                const defaults = dbService.getSettings();
                setSettings(defaults);
              }}
              className="px-3 py-1.5 border border-stone-200 hover:border-[var(--theme-primary)] text-stone-600 hover:text-[var(--theme-primary)] font-sans text-[10px] uppercase tracking-wider transition-colors"
            >
              Reset to Defaults
            </button>
          </div>

          {settingsSuccessMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs py-3 px-4 rounded-none font-sans text-center font-semibold flex items-center justify-center gap-1.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{settingsSuccessMessage}</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-6 bg-white border border-[var(--theme-primary)]/15 p-6 shadow-xs">
            <div className="space-y-4">
              <h4 className="text-xs font-sans uppercase tracking-[0.2em] text-[var(--theme-primary)] font-bold border-b border-stone-100 pb-2">
                Announcement & Alerts
              </h4>
              <div>
                <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-stone-700 mb-1.5">
                  Top Announcement Text
                </label>
                <input
                  type="text"
                  required
                  value={settings.announcementText}
                  onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })}
                  placeholder="e.g. Free Shipping Pan-India! Traditional mud-mirror designs by Artist Laksha"
                  className="w-full text-xs py-2 px-3 border border-stone-200 focus:outline-hidden focus:border-[var(--theme-accent)] bg-white font-sans"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-sans uppercase tracking-[0.2em] text-[var(--theme-primary)] font-bold border-b border-stone-100 pb-2">
                Homepage Hero Section
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-stone-700 mb-1.5">
                    Hero Auspicious Badge (Subtitle)
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.heroSubtitle}
                    onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                    placeholder="e.g. Auspicious Sacred Geometry"
                    className="w-full text-xs py-2 px-3 border border-stone-200 focus:outline-hidden focus:border-[var(--theme-accent)] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-stone-700 mb-1.5">
                    Hero CTA Button Label
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.heroButtonText}
                    onChange={(e) => setSettings({ ...settings, heroButtonText: e.target.value })}
                    placeholder="e.g. Explore Handcrafted Catalog"
                    className="w-full text-xs py-2 px-3 border border-stone-200 focus:outline-hidden focus:border-[var(--theme-accent)] bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-stone-700 mb-1.5">
                  Hero Main Heading
                </label>
                <input
                  type="text"
                  required
                  value={settings.heroTitle}
                  onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                  placeholder="e.g. Intricate Lippan Mud-Mirror reliefs & sacred mandalas"
                  className="w-full text-xs py-2 px-3 border border-stone-200 focus:outline-hidden focus:border-[var(--theme-accent)] bg-white"
                />
                <p className="text-[10px] text-stone-400 font-sans mt-1">
                  Tip: Use HTML spans like &lt;span className="text-[var(--theme-primary)] italic font-normal"&gt;text&lt;/span&gt; for golden italic accents.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-stone-700 mb-1.5">
                  Hero Descriptive Paragraph
                </label>
                <textarea
                  required
                  rows={3}
                  value={settings.heroDescription}
                  onChange={(e) => setSettings({ ...settings, heroDescription: e.target.value })}
                  placeholder="Introduce your handcrafted custom techniques, artist roots, shipping details..."
                  className="w-full text-xs py-2 px-3 border border-stone-200 focus:outline-hidden focus:border-[var(--theme-accent)] bg-white leading-relaxed font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-stone-700 mb-1.5">
                  Hero Showcase Image / Plate (URL)
                </label>
                <input
                  type="text"
                  required
                  value={settings.heroImageUrl}
                  onChange={(e) => setSettings({ ...settings, heroImageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full text-xs py-2 px-3 border border-stone-200 focus:outline-hidden focus:border-[var(--theme-accent)] bg-white font-mono"
                />
                <div className="mt-2 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden border border-[var(--theme-primary)]/20 shrink-0">
                    <img
                      src={settings.heroImageUrl}
                      alt="Hero Preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600&auto=format&fit=crop";
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-stone-500 font-sans">
                    This circular preview is showcased dynamically in the rotating 3D-style mandala frame on the main homepage.
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-sans uppercase tracking-[0.2em] text-[var(--theme-primary)] font-bold border-b border-stone-100 pb-2">
                Founder's Portrait Photo
              </h4>
              <div>
                <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-stone-700 mb-1.5">
                  Founder Portrait Photo Source (URL or Upload below)
                </label>
                <input
                  type="text"
                  required
                  value={settings.founderImageUrl}
                  onChange={(e) => setSettings({ ...settings, founderImageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full text-xs py-2 px-3 border border-stone-200 focus:outline-hidden focus:border-[var(--theme-accent)] bg-white font-mono mb-3"
                />
              </div>

              <div>
                <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-stone-700 mb-1.5">
                  Upload Portrait from Device
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        if (typeof reader.result === 'string') {
                          setSettings({ ...settings, founderImageUrl: reader.result });
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full text-xs text-stone-500 file:mr-4 file:py-1.5 file:px-3 file:border file:border-[var(--theme-primary)]/30 file:text-xs file:font-sans file:bg-[var(--theme-bg)] file:text-stone-800 hover:file:bg-[var(--theme-primary)]/10 file:cursor-pointer"
                />
              </div>

              <div className="mt-2 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden border border-[var(--theme-primary)]/20 shrink-0">
                  <img
                    src={settings.founderImageUrl}
                    alt="Founder Portrait Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1614283233556-f35b0c801ef1?q=80&w=600&auto=format&fit=crop";
                    }}
                  />
                </div>
                <span className="text-[10px] text-stone-500 font-sans">
                  This preview updates the artist story and about pages across the website. Standard 3:4 portrait or square files work best.
                </span>
              </div>
            </div>

            {/* Visual Studio Tour (Video) Configuration */}
            <div className="space-y-4 border-t border-stone-100 pt-6">
              <h4 className="text-xs font-sans uppercase tracking-[0.2em] text-[var(--theme-primary)] font-bold border-b border-stone-100 pb-2 flex items-center justify-between">
                <span>Visual Studio Tour (Video) Manager</span>
                <span className="text-[9px] lowercase font-normal text-stone-500 font-sans tracking-normal">
                  Configure the immersive studio process video
                </span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-stone-700 mb-1.5">
                    Section Headline / Title
                  </label>
                  <input
                    type="text"
                    value={settings.studioTourTitle || ''}
                    onChange={(e) => setSettings({ ...settings, studioTourTitle: e.target.value })}
                    placeholder="e.g. Watch Laksha Craft a Lippan Mirror Plate"
                    className="w-full text-xs py-2 px-3 border border-stone-200 focus:outline-hidden focus:border-[var(--theme-accent)] bg-white font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-stone-700 mb-1.5">
                    Video URL (YouTube or Direct video link)
                  </label>
                  <input
                    type="text"
                    value={settings.studioTourVideoUrl || ''}
                    onChange={(e) => setSettings({ ...settings, studioTourVideoUrl: e.target.value })}
                    placeholder="e.g. https://www.youtube.com/watch?v=N0fL9U6j_F4"
                    className="w-full text-xs py-2 px-3 border border-stone-200 focus:outline-hidden focus:border-[var(--theme-accent)] bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-stone-700 mb-1.5">
                  Section Subtitle / Description
                </label>
                <textarea
                  value={settings.studioTourDescription || ''}
                  onChange={(e) => setSettings({ ...settings, studioTourDescription: e.target.value })}
                  placeholder="Describe the studio process featured in this tour video..."
                  rows={2}
                  className="w-full text-xs py-2 px-3 border border-stone-200 focus:outline-hidden focus:border-[var(--theme-accent)] bg-white font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Video device upload */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-stone-700">
                    Or Upload Studio Video from Device
                  </label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 8 * 1024 * 1024) {
                          alert("Video file is too large! Please use a file smaller than 8MB, or paste a YouTube link instead.");
                          return;
                        }
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          if (typeof reader.result === 'string') {
                            setSettings({ ...settings, studioTourVideoUrl: reader.result });
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-xs text-stone-500 file:mr-4 file:py-1.5 file:px-3 file:border file:border-[var(--theme-primary)]/30 file:text-xs file:font-sans file:bg-[var(--theme-bg)] file:text-stone-800 hover:file:bg-[var(--theme-primary)]/10 file:cursor-pointer"
                  />
                  <p className="text-[9px] text-stone-400">Supported types: .mp4, .webm. Recommended: brief clips under 1 minute for local storage.</p>
                </div>

                {/* Thumbnail selection */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-stone-700">
                    Video Thumbnail Photo (URL or Device Upload)
                  </label>
                  <input
                    type="text"
                    value={settings.studioTourThumbnailUrl || ''}
                    onChange={(e) => setSettings({ ...settings, studioTourThumbnailUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full text-xs py-2 px-3 border border-stone-200 focus:outline-hidden focus:border-[var(--theme-accent)] bg-white font-mono mb-2"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          if (typeof reader.result === 'string') {
                            setSettings({ ...settings, studioTourThumbnailUrl: reader.result });
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-xs text-stone-500 file:mr-4 file:py-1 file:px-3 file:border file:border-stone-200 file:text-[10px] file:font-sans file:bg-stone-50 file:text-stone-700 hover:file:bg-stone-100 file:cursor-pointer"
                  />
                </div>
              </div>

              {/* Tour Preview Card */}
              <div className="p-3 bg-stone-50 border border-stone-200/80 rounded-none space-y-2">
                <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-stone-500 block">Live Homepage Section Preview</span>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <div className="md:col-span-5 aspect-video bg-stone-900 overflow-hidden relative border border-stone-300">
                    <img
                      src={settings.studioTourThumbnailUrl || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop'}
                      alt="Thumbnail Preview"
                      className="w-full h-full object-cover opacity-70"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-white/90 text-stone-900 flex items-center justify-center text-xs shadow-md">
                        ▶
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-7 space-y-1 text-left">
                    <span className="text-[9px] font-sans text-[var(--theme-primary)] uppercase tracking-wider font-semibold block">Visual Studio Tour</span>
                    <h5 className="text-xs font-serif text-stone-800 font-bold">{settings.studioTourTitle || 'Watch Laksha Craft...'}</h5>
                    <p className="text-[10px] text-stone-500 leading-snug line-clamp-2">{settings.studioTourDescription || 'Witness the mud relieving...'}</p>
                    <div className="pt-1 flex items-center gap-1 text-[9px] font-mono text-stone-400 truncate">
                      <span className="font-semibold text-stone-600">Video Source:</span> 
                      <span className="truncate max-w-[200px]">{settings.studioTourVideoUrl || 'YouTube Default'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-sans uppercase tracking-[0.2em] text-[var(--theme-primary)] font-bold border-b border-stone-100 pb-2">
                Studio Contact Details
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-stone-700 mb-1.5">
                    Studio Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                    placeholder="e.g. contact@vlakshacrafts.com"
                    className="w-full text-xs py-2 px-3 border border-stone-200 focus:outline-hidden focus:border-[var(--theme-accent)] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-stone-700 mb-1.5">
                    Studio Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.contactPhone}
                    onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                    placeholder="e.g. +91 95481 23456"
                    className="w-full text-xs py-2 px-3 border border-stone-200 focus:outline-hidden focus:border-[var(--theme-accent)] bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-stone-700 mb-1.5">
                  Studio Physical Address / Regional Location
                </label>
                <input
                  type="text"
                  required
                  value={settings.contactAddress}
                  onChange={(e) => setSettings({ ...settings, contactAddress: e.target.value })}
                  placeholder="e.g. Noida, Uttar Pradesh, India"
                  className="w-full text-xs py-2 px-3 border border-stone-200 focus:outline-hidden focus:border-[var(--theme-accent)] bg-white"
                />
              </div>
            </div>

            {/* Visual Branding & Theme Customization */}
            <div className="space-y-4 border-t border-stone-100 pt-4">
              <h4 className="text-xs font-sans uppercase tracking-[0.2em] text-[var(--theme-primary)] font-bold border-b border-stone-100 pb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--theme-primary)]" />
                Website Visual Branding & Palette
              </h4>

              <div className="bg-amber-50/20 p-4 border border-amber-900/10 rounded-none space-y-4">
                <span className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-stone-700">
                  Select Theme Color Preset
                </span>
                <p className="text-[10px] text-stone-500 font-sans -mt-2 leading-relaxed">
                  Choose an auspicious color palette inspired by Indian traditional Lippan art, mandalas, and natural festive tones. Click a preset to instantly pre-fill all colors!
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'classic',
                      name: 'Classic Golden Ivory',
                      primary: '#c5a059',
                      accent: '#1a2a4e',
                      bg: '#FCFBF7',
                      bgAlt: '#F4F1EA',
                      annBg: '#1a2a4e',
                      annText: '#ffffff'
                    },
                    {
                      id: 'saffron',
                      name: 'Festive Saffron & Rust',
                      primary: '#e05a10',
                      accent: '#7c2d12',
                      bg: '#FFFDF9',
                      bgAlt: '#FEF3C7',
                      annBg: '#7c2d12',
                      annText: '#ffffff'
                    },
                    {
                      id: 'indigo',
                      name: 'Celestial Indigo & Amber',
                      primary: '#F59E0B',
                      accent: '#1E1B4B',
                      bg: '#EEF2FF',
                      bgAlt: '#C7D2FE',
                      annBg: '#1E1B4B',
                      annText: '#F59E0B'
                    },
                    {
                      id: 'emerald',
                      name: 'Rich Emerald & Gold',
                      primary: '#D4AF37',
                      accent: '#064E3B',
                      bg: '#F0FDF4',
                      bgAlt: '#D1FAE5',
                      annBg: '#064E3B',
                      annText: '#ffffff'
                    },
                    {
                      id: 'ruby',
                      name: 'Traditional Ruby & Brass',
                      primary: '#D4AF37',
                      accent: '#991B1B',
                      bg: '#FFF5F5',
                      bgAlt: '#FEE2E2',
                      annBg: '#991B1B',
                      annText: '#ffffff'
                    },
                    {
                      id: 'sunset',
                      name: 'Sunset Peacock & Coral',
                      primary: '#FF7A59',
                      accent: '#0D5C75',
                      bg: '#F3FBCF',
                      bgAlt: '#E0F2FE',
                      annBg: '#0D5C75',
                      annText: '#FF7A59'
                    },
                    {
                      id: 'royal-rajasthani',
                      name: 'Vibrant Shahi Darbar',
                      primary: '#E0115F', // Fuchsia
                      accent: '#1E3A8A', // Royal Blue
                      bg: '#FFFDF5', // Creamy Gold White
                      bgAlt: '#FEF3C7', // Marigold Yellow
                      annBg: '#E0115F',
                      annText: '#FFFDF5'
                    },
                    {
                      id: 'peacock-glory',
                      name: 'Shimmering Mayur Majestic',
                      primary: '#0D9488', // Teal
                      accent: '#4338CA', // Indigo Purple
                      bg: '#F0FDFA', // Light Mint
                      bgAlt: '#E0F2FE', // Blue sky
                      annBg: '#4338CA',
                      annText: '#F59E0B'
                    },
                    {
                      id: 'holi-joy',
                      name: 'Holi Vibrant Bloom',
                      primary: '#EC4899', // Bright Pink
                      accent: '#06B6D4', // Vibrant Cyan
                      bg: '#FDF2F8', // Rose Blush
                      bgAlt: '#FFFBEB', // Golden sand
                      annBg: '#06B6D4',
                      annText: '#ffffff'
                    }
                  ].map((preset) => {
                    const isSelected = settings.themePreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setSettings({
                            ...settings,
                            themePreset: preset.id,
                            primaryColor: preset.primary,
                            accentColor: preset.accent,
                            bgColor: preset.bg,
                            bgAltColor: preset.bgAlt,
                            announcementBg: preset.annBg,
                            announcementTextColor: preset.annText
                          });
                        }}
                        className={`p-2 text-left border rounded-none transition-all flex flex-col gap-1.5 hover:shadow-xs relative ${
                          isSelected 
                            ? 'border-[var(--theme-primary)] bg-white ring-2 ring-[var(--theme-primary)]/20' 
                            : 'border-stone-200 bg-white hover:border-stone-400'
                        }`}
                      >
                        <span className="text-[9px] font-sans font-bold text-stone-800 truncate block">
                          {preset.name}
                        </span>
                        <div className="flex gap-1">
                          <span className="w-3 h-3 rounded-full border border-stone-200" style={{ backgroundColor: preset.primary }} title="Primary" />
                          <span className="w-3 h-3 rounded-full border border-stone-200" style={{ backgroundColor: preset.accent }} title="Accent" />
                          <span className="w-3 h-3 rounded-full border border-stone-200" style={{ backgroundColor: preset.bg }} title="Background" />
                          <span className="w-3 h-3 rounded-full border border-stone-200" style={{ backgroundColor: preset.annBg }} title="Announcement" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Fine-tuning Color Pickers */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-stone-700 mb-1.5">
                    Primary Theme Color
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="color"
                      value={settings.primaryColor || '#c5a059'}
                      onChange={(e) => setSettings({ ...settings, themePreset: 'custom', primaryColor: e.target.value })}
                      className="w-8 h-8 rounded-none border border-stone-200 cursor-pointer p-0 shrink-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={settings.primaryColor || '#c5a059'}
                      onChange={(e) => setSettings({ ...settings, themePreset: 'custom', primaryColor: e.target.value })}
                      className="w-full text-xs font-mono py-1 px-2 border border-stone-200 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-stone-700 mb-1.5">
                    Accent Theme Color
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="color"
                      value={settings.accentColor || '#1a2a4e'}
                      onChange={(e) => setSettings({ ...settings, themePreset: 'custom', accentColor: e.target.value })}
                      className="w-8 h-8 rounded-none border border-stone-200 cursor-pointer p-0 shrink-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={settings.accentColor || '#1a2a4e'}
                      onChange={(e) => setSettings({ ...settings, themePreset: 'custom', accentColor: e.target.value })}
                      className="w-full text-xs font-mono py-1 px-2 border border-stone-200 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-stone-700 mb-1.5">
                    App Background
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="color"
                      value={settings.bgColor || '#FCFBF7'}
                      onChange={(e) => setSettings({ ...settings, themePreset: 'custom', bgColor: e.target.value })}
                      className="w-8 h-8 rounded-none border border-stone-200 cursor-pointer p-0 shrink-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={settings.bgColor || '#FCFBF7'}
                      onChange={(e) => setSettings({ ...settings, themePreset: 'custom', bgColor: e.target.value })}
                      className="w-full text-xs font-mono py-1 px-2 border border-stone-200 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-stone-700 mb-1.5">
                    Secondary Card Bg
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="color"
                      value={settings.bgAltColor || '#F4F1EA'}
                      onChange={(e) => setSettings({ ...settings, themePreset: 'custom', bgAltColor: e.target.value })}
                      className="w-8 h-8 rounded-none border border-stone-200 cursor-pointer p-0 shrink-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={settings.bgAltColor || '#F4F1EA'}
                      onChange={(e) => setSettings({ ...settings, themePreset: 'custom', bgAltColor: e.target.value })}
                      className="w-full text-xs font-mono py-1 px-2 border border-stone-200 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-stone-700 mb-1.5">
                    Announcement Bar Bg
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="color"
                      value={settings.announcementBg || '#1a2a4e'}
                      onChange={(e) => setSettings({ ...settings, themePreset: 'custom', announcementBg: e.target.value })}
                      className="w-8 h-8 rounded-none border border-stone-200 cursor-pointer p-0 shrink-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={settings.announcementBg || '#1a2a4e'}
                      onChange={(e) => setSettings({ ...settings, themePreset: 'custom', announcementBg: e.target.value })}
                      className="w-full text-xs font-mono py-1 px-2 border border-stone-200 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-stone-700 mb-1.5">
                    Announcement Text
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="color"
                      value={settings.announcementTextColor || '#ffffff'}
                      onChange={(e) => setSettings({ ...settings, themePreset: 'custom', announcementTextColor: e.target.value })}
                      className="w-8 h-8 rounded-none border border-stone-200 cursor-pointer p-0 shrink-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={settings.announcementTextColor || '#ffffff'}
                      onChange={(e) => setSettings({ ...settings, themePreset: 'custom', announcementTextColor: e.target.value })}
                      className="w-full text-xs font-mono py-1 px-2 border border-stone-200 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Effects & Glow toggle */}
              <div className="flex items-center gap-3 bg-stone-50 p-3 border border-stone-100 rounded-none mt-2">
                <input
                  type="checkbox"
                  id="enableGlowEffects"
                  checked={settings.enableGlowEffects ?? true}
                  onChange={(e) => setSettings({ ...settings, enableGlowEffects: e.target.checked })}
                  className="w-4 h-4 text-[var(--theme-primary)] border-stone-300 focus:ring-[var(--theme-primary)] cursor-pointer rounded-xs"
                />
                <div className="flex flex-col text-left">
                  <label htmlFor="enableGlowEffects" className="text-[10px] font-sans uppercase tracking-widest font-bold text-stone-800 cursor-pointer">
                    Enable Glimmer & Mirror Sparkle Effects
                  </label>
                  <span className="text-[9px] text-stone-500 font-sans">
                    Adds premium reflection sweeps and beautiful shadows to central icons, mimicking real light bouncing off mirror tiles.
                  </span>
                </div>
              </div>
            </div>

            {/* Dynamic Categories Manager */}
            <div className="space-y-4 border-t border-stone-100 pt-6">
              <h4 className="text-xs font-sans uppercase tracking-[0.2em] text-[var(--theme-primary)] font-bold border-b border-stone-100 pb-2 flex items-center justify-between">
                <span>Shop Art Form Categories Manager</span>
                <span className="text-[9px] lowercase font-normal text-stone-500 font-sans tracking-normal">
                  Customize the art form collection sections and their images
                </span>
              </h4>

              <div className="space-y-4">
                {/* List of current categories */}
                <div className="grid grid-cols-1 gap-6">
                  {(settings.categories || []).map((cat, idx) => {
                    const catImages = cat.imageUrls && cat.imageUrls.length > 0 
                      ? cat.imageUrls 
                      : (cat.imageUrl ? [cat.imageUrl] : []);

                    return (
                      <div key={cat.id} className="p-4 border border-[var(--theme-primary)]/20 bg-stone-50/60 rounded-none space-y-4 relative">
                        <div className="flex justify-between items-center border-b border-stone-200/50 pb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[var(--theme-primary)] animate-pulse" />
                            <span className="text-[10px] font-sans font-bold text-stone-700 uppercase tracking-wider">
                              {cat.label || 'Unnamed Category'}
                            </span>
                            <span className="text-[9px] font-mono text-stone-400">({cat.id})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete the "${cat.label}" category? Products under this category won't be deleted, but you'll have to assign them to another category.`)) {
                                const updated = (settings.categories || []).filter(c => c.id !== cat.id);
                                setSettings({ ...settings, categories: updated });
                              }
                            }}
                            className="text-stone-400 hover:text-red-600 transition-colors p-1"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[9px] font-sans uppercase tracking-wider font-semibold text-stone-600 mb-1">
                              Label (Name)
                            </label>
                            <input
                              type="text"
                              value={cat.label}
                              onChange={(e) => {
                                const updated = (settings.categories || []).map(c => 
                                  c.id === cat.id ? { ...c, label: e.target.value } : c
                                );
                                setSettings({ ...settings, categories: updated });
                              }}
                              className="w-full text-xs py-1.5 px-2.5 border border-stone-200 bg-white focus:outline-hidden focus:border-[var(--theme-accent)] font-sans"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[9px] font-sans uppercase tracking-wider font-semibold text-stone-600 mb-1">
                              Short Description
                            </label>
                            <input
                              type="text"
                              value={cat.desc}
                              onChange={(e) => {
                                const updated = (settings.categories || []).map(c => 
                                  c.id === cat.id ? { ...c, desc: e.target.value } : c
                                );
                                setSettings({ ...settings, categories: updated });
                              }}
                              className="w-full text-xs py-1.5 px-2.5 border border-stone-200 bg-white focus:outline-hidden focus:border-[var(--theme-accent)] font-sans"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] font-sans uppercase tracking-wider font-semibold text-stone-600 mb-1">
                              Tile Index (e.g. 01, 02)
                            </label>
                            <input
                              type="text"
                              value={cat.index || `0${idx + 1}`}
                              onChange={(e) => {
                                const updated = (settings.categories || []).map(c => 
                                  c.id === cat.id ? { ...c, index: e.target.value } : c
                                );
                                setSettings({ ...settings, categories: updated });
                              }}
                              className="w-full text-xs py-1.5 px-2.5 border border-stone-200 bg-white font-mono focus:outline-hidden focus:border-[var(--theme-accent)]"
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] font-sans uppercase tracking-wider font-semibold text-stone-600 mb-1">
                              Primary Cover Image URL
                            </label>
                            <input
                              type="text"
                              value={cat.imageUrl || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = (settings.categories || []).map(c => {
                                  if (c.id === cat.id) {
                                    const currentUrls = c.imageUrls || [];
                                    const nextUrls = currentUrls.includes(val) ? currentUrls : (val ? [val, ...currentUrls] : currentUrls);
                                    return { ...c, imageUrl: val, imageUrls: nextUrls };
                                  }
                                  return c;
                                });
                                setSettings({ ...settings, categories: updated });
                              }}
                              placeholder="https://..."
                              className="w-full text-xs py-1.5 px-2.5 border border-stone-200 bg-white font-mono focus:outline-hidden focus:border-[var(--theme-accent)]"
                            />
                          </div>
                        </div>

                        {/* Category Image Gallery manager (Multiple image angles) */}
                        <div className="p-3 bg-white border border-stone-200/80 rounded-none space-y-3">
                          <div className="flex justify-between items-center border-b border-stone-100 pb-1.5">
                            <span className="text-[10px] font-sans uppercase tracking-wider font-extrabold text-[var(--theme-primary)] block">
                              Multiple Image Gallery ({catImages.length} items)
                            </span>
                            <span className="text-[8px] text-stone-400 font-sans">Click ★ to set cover photo</span>
                          </div>

                          {/* Thumbnail Gallery Row */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            {catImages.map((imgUrl, iIndex) => {
                              const isCover = cat.imageUrl === imgUrl;
                              return (
                                <div key={iIndex} className={`group/thumb p-1.5 border relative flex flex-col justify-between ${
                                  isCover ? 'border-amber-500 bg-amber-50/30' : 'border-stone-150 bg-stone-50/40 hover:bg-white transition-colors'
                                }`}>
                                  <div className="aspect-square w-full bg-stone-100 overflow-hidden relative border border-stone-200">
                                    <img
                                      src={imgUrl}
                                      alt={`Thumbnail ${iIndex + 1}`}
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600&auto=format&fit=crop';
                                      }}
                                    />
                                    {isCover && (
                                      <div className="absolute top-1 left-1 bg-amber-500 text-white text-[8px] font-sans px-1 py-0.5 rounded-none font-bold uppercase tracking-wider shadow-sm z-10">
                                        Cover
                                      </div>
                                    )}
                                    <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[8px] font-mono px-1 rounded-none">
                                      #{iIndex + 1}
                                    </span>
                                  </div>

                                  {/* Action buttons inside the thumbnail footer */}
                                  <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-stone-100">
                                    <div className="flex gap-1">
                                      <button
                                        type="button"
                                        disabled={iIndex === 0}
                                        onClick={() => {
                                          const nextImages = [...catImages];
                                          const temp = nextImages[iIndex];
                                          nextImages[iIndex] = nextImages[iIndex - 1];
                                          nextImages[iIndex - 1] = temp;
                                          const updated = (settings.categories || []).map(c => 
                                            c.id === cat.id ? { ...c, imageUrls: nextImages } : c
                                          );
                                          setSettings({ ...settings, categories: updated });
                                        }}
                                        className="p-1 border border-stone-200 hover:bg-stone-100 text-[8px] text-stone-500 disabled:opacity-30"
                                        title="Move Left"
                                      >
                                        ◀
                                      </button>
                                      <button
                                        type="button"
                                        disabled={iIndex === catImages.length - 1}
                                        onClick={() => {
                                          const nextImages = [...catImages];
                                          const temp = nextImages[iIndex];
                                          nextImages[iIndex] = nextImages[iIndex + 1];
                                          nextImages[iIndex + 1] = temp;
                                          const updated = (settings.categories || []).map(c => 
                                            c.id === cat.id ? { ...c, imageUrls: nextImages } : c
                                          );
                                          setSettings({ ...settings, categories: updated });
                                        }}
                                        className="p-1 border border-stone-200 hover:bg-stone-100 text-[8px] text-stone-500 disabled:opacity-30"
                                        title="Move Right"
                                      >
                                        ▶
                                      </button>
                                    </div>

                                    <div className="flex gap-1">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = (settings.categories || []).map(c => 
                                            c.id === cat.id ? { ...c, imageUrl: imgUrl } : c
                                          );
                                          setSettings({ ...settings, categories: updated });
                                        }}
                                        className={`p-1 border transition-colors text-[9px] ${
                                          isCover 
                                            ? 'border-amber-400 bg-amber-500 text-white' 
                                            : 'border-stone-200 hover:border-amber-400 text-stone-400 hover:text-amber-500'
                                        }`}
                                        title="Set as Cover Photo"
                                      >
                                        ★
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const nextImages = catImages.filter((_, idx) => idx !== iIndex);
                                          const isCurrentlyCover = cat.imageUrl === imgUrl;
                                          const nextCover = isCurrentlyCover 
                                            ? (nextImages[0] || '') 
                                            : cat.imageUrl;
                                          const updated = (settings.categories || []).map(c => 
                                            c.id === cat.id ? { ...c, imageUrls: nextImages, imageUrl: nextCover } : c
                                          );
                                          setSettings({ ...settings, categories: updated });
                                        }}
                                        className="p-1 border border-stone-200 hover:border-red-400 hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors"
                                        title="Remove Image"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}

                            {/* Empty State box */}
                            {catImages.length === 0 && (
                              <div className="border border-dashed border-stone-300 p-4 flex flex-col items-center justify-center gap-1 text-center bg-stone-50 col-span-2 sm:col-span-4">
                                <span className="text-[20px]">🖼️</span>
                                <span className="text-[10px] text-stone-400 font-sans">No images in gallery yet. Add some below!</span>
                              </div>
                            )}
                          </div>

                          {/* Inputs to add a new image angle to the category */}
                          <div className="pt-2 border-t border-stone-150 flex gap-2 items-end">
                            <div className="flex-1">
                              <label className="block text-[8px] font-sans uppercase font-bold text-stone-500 mb-0.5">
                                Add Image URL (Paste Address)
                              </label>
                              <input
                                type="text"
                                id={`new-img-url-${cat.id}`}
                                placeholder="https://images.unsplash.com/..."
                                className="w-full text-[10px] py-1.5 px-2 border border-stone-200 bg-white font-mono focus:outline-hidden"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const input = e.currentTarget;
                                    const val = input.value.trim();
                                    if (!val) return;
                                    const nextImages = [...catImages, val];
                                    const updated = (settings.categories || []).map(c => 
                                      c.id === cat.id ? { 
                                        ...c, 
                                        imageUrls: nextImages, 
                                        imageUrl: c.imageUrl ? c.imageUrl : val 
                                      } : c
                                    );
                                    setSettings({ ...settings, categories: updated });
                                    input.value = '';
                                  }
                                }}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const input = document.getElementById(`new-img-url-${cat.id}`) as HTMLInputElement;
                                const val = input?.value?.trim();
                                if (!val) {
                                  alert("Please paste an image URL first!");
                                  return;
                                }
                                const nextImages = [...catImages, val];
                                const updated = (settings.categories || []).map(c => 
                                  c.id === cat.id ? { 
                                    ...c, 
                                    imageUrls: nextImages, 
                                    imageUrl: c.imageUrl ? c.imageUrl : val 
                                  } : c
                                );
                                setSettings({ ...settings, categories: updated });
                                if (input) input.value = '';
                              }}
                              className="py-1.5 px-3 bg-[var(--theme-accent)] hover:bg-[var(--theme-primary)] text-white text-[9px] font-sans uppercase font-bold tracking-wider transition-colors shrink-0"
                            >
                              Add Image URL
                            </button>

                            {/* Upload Image for Category Button */}
                            <div className="shrink-0">
                              <label className="py-1.5 px-3 border border-stone-200 hover:border-[var(--theme-primary)] bg-stone-50 hover:bg-[var(--theme-primary)]/10 text-[9px] text-stone-700 font-sans uppercase font-bold tracking-wider cursor-pointer flex items-center justify-center gap-1">
                                <span>Upload Photo</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        if (typeof reader.result === 'string') {
                                          const nextImages = [...catImages, reader.result];
                                          const updated = (settings.categories || []).map(c => 
                                            c.id === cat.id ? { 
                                              ...c, 
                                              imageUrls: nextImages, 
                                              imageUrl: c.imageUrl ? c.imageUrl : reader.result 
                                            } : c
                                          );
                                          setSettings({ ...settings, categories: updated });
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  </div>

                {/* Add new category builder */}
                <div className="p-4 border border-dashed border-[var(--theme-primary)]/40 bg-stone-50 space-y-3">
                  <span className="block text-[10px] font-sans uppercase tracking-widest font-bold text-stone-800">
                    Add A New Art Category Section
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[9px] font-sans uppercase tracking-wider font-semibold text-stone-500 mb-1">
                        Unique ID (alphanumeric/hyphen)
                      </label>
                      <input
                        type="text"
                        id="new-cat-id"
                        placeholder="e.g. wall-mirrors"
                        className="w-full text-xs py-1.5 px-2 border border-stone-200 bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-sans uppercase tracking-wider font-semibold text-stone-500 mb-1">
                        Display Name
                      </label>
                      <input
                        type="text"
                        id="new-cat-label"
                        placeholder="e.g. Wall Mirrors"
                        className="w-full text-xs py-1.5 px-2 border border-stone-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-sans uppercase tracking-wider font-semibold text-stone-500 mb-1">
                        Short Subtitle/Description
                      </label>
                      <input
                        type="text"
                        id="new-cat-desc"
                        placeholder="e.g. Handpainted lacing mirrors"
                        className="w-full text-xs py-1.5 px-2 border border-stone-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-sans uppercase tracking-wider font-semibold text-stone-500 mb-1">
                        Image URL
                      </label>
                      <input
                        type="text"
                        id="new-cat-image"
                        placeholder="https://images.unsplash.com/..."
                        className="w-full text-xs py-1.5 px-2 border border-stone-200 bg-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        const idInput = document.getElementById('new-cat-id') as HTMLInputElement;
                        const labelInput = document.getElementById('new-cat-label') as HTMLInputElement;
                        const descInput = document.getElementById('new-cat-desc') as HTMLInputElement;
                        const imageInput = document.getElementById('new-cat-image') as HTMLInputElement;

                        if (!idInput?.value || !labelInput?.value) {
                          alert('Please provide at least a unique Category ID and Display Name.');
                          return;
                        }

                        const cleanedId = idInput.value.trim().toLowerCase().replace(/\s+/g, '-');
                        
                        // Check duplicate
                        const exists = (settings.categories || []).some(c => c.id === cleanedId);
                        if (exists) {
                          alert(`A category with ID "${cleanedId}" already exists! Please use a different ID.`);
                          return;
                        }

                        const primaryUrl = imageInput.value.trim() || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600&auto=format&fit=crop';
                        const newCat = {
                          id: cleanedId,
                          label: labelInput.value.trim(),
                          desc: descInput.value.trim() || 'Handcrafted traditional series',
                          imageUrl: primaryUrl,
                          imageUrls: [primaryUrl],
                          color: 'bg-[#f8f5ef]',
                          index: `0${(settings.categories || []).length + 1}`,
                          icon: '❃',
                          iconColor: 'text-amber-600 bg-amber-500/10'
                        };

                        const updated = [...(settings.categories || []), newCat];
                        setSettings({ ...settings, categories: updated });

                        // Reset fields
                        idInput.value = '';
                        labelInput.value = '';
                        descInput.value = '';
                        imageInput.value = '';
                      }}
                      className="px-4 py-2 bg-[var(--theme-primary)] hover:bg-[var(--theme-accent)] text-white text-[10px] font-sans uppercase font-bold tracking-wider transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Category Section
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {(() => {
              const currentUser = dbService.getCurrentUser();
              const isPrimaryAdmin = currentUser?.email?.toLowerCase() === 'harshitdhasmana39@gmail.com';
              if (!isPrimaryAdmin) return null;
              return (
                <div className="space-y-4 border-t border-stone-200 pt-4">
                  <h4 className="text-xs font-sans uppercase tracking-[0.2em] text-[var(--theme-primary)] font-bold border-b border-stone-100 pb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[var(--theme-primary)]" />
                    Authorized Administrators Delegation
                  </h4>
                  <div>
                    <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-stone-700 mb-1.5">
                      Delegated Admin Emails (Comma-separated)
                    </label>
                    <input
                      type="text"
                      value={settings.additionalAdmins || ''}
                      onChange={(e) => setSettings({ ...settings, additionalAdmins: e.target.value })}
                      placeholder="e.g. delegate@vlakshacrafts.com, helper@gmail.com"
                      className="w-full text-xs py-2 px-3 border border-stone-200 focus:outline-hidden focus:border-[var(--theme-accent)] bg-white font-mono"
                    />
                    <p className="text-[10px] text-stone-500 font-sans mt-1.5 leading-relaxed">
                      As the primary administrator (<strong>harshitdhasmana39@gmail.com</strong>), you can authorize other email addresses to access this admin panel using the secure passcode (<strong>0789</strong>). Separate multiple emails with commas.
                    </p>
                  </div>
                </div>
              );
            })()}

            <button
              type="submit"
              disabled={isSavingSettings}
              className="w-full py-3 px-4 bg-[var(--theme-accent)] hover:bg-[var(--theme-primary)] text-white font-sans text-xs font-semibold tracking-widest uppercase transition-colors shadow-md flex items-center justify-center gap-1.5"
            >
              {isSavingSettings ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Customizations...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Apply Website Customizations</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* EDIT ORDER DETAILS & TRACKING NOTES MODAL */}
      {isEditingOrder && selectedOrderToEdit && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[var(--theme-bg)] border-2 border-[var(--theme-primary)] w-full max-w-lg shadow-2xl relative overflow-hidden text-left">
            {/* Top decorative gold border */}
            <div className="h-1.5 bg-[var(--theme-primary)] w-full" />
            
            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                setIsEditingOrder(false);
                setSelectedOrderToEdit(null);
              }}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-8 space-y-5">
              <div>
                <span className="text-[10px] font-sans text-[var(--theme-primary)] tracking-[0.2em] font-semibold uppercase block mb-1">
                  Commission Management
                </span>
                <h3 className="font-serif text-xl font-light text-[#1a1a1a] tracking-tight">
                  Edit Order <span className="font-mono font-bold text-sm text-[var(--theme-accent)]">#{selectedOrderToEdit.id}</span>
                </h3>
                <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                  Adjust craft progress, payment status, and supply progress updates for <strong>{selectedOrderToEdit.customerName}</strong>.
                </p>
              </div>

              <form onSubmit={handleSaveOrderEdit} className="space-y-4 text-left">
                {/* Order Status */}
                <div>
                  <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-stone-700 mb-1">
                    Order Craft Status
                  </label>
                  <select
                    value={editOrderStatus}
                    onChange={(e) => setEditOrderStatus(e.target.value as any)}
                    className="w-full text-xs py-2 px-3 bg-white border border-stone-200 focus:outline-hidden focus:border-[var(--theme-accent)] rounded-none shadow-xs font-sans text-stone-800"
                  >
                    <option value="received">Received (New Request)</option>
                    <option value="in_progress">Painting In Progress (Clay & Mirrors)</option>
                    <option value="shipped">Shipped (En Route)</option>
                    <option value="delivered">Delivered to Home</option>
                  </select>
                </div>

                {/* Payment Status */}
                <div>
                  <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-stone-700 mb-1">
                    Payment Verification
                  </label>
                  <select
                    value={editOrderPaymentStatus}
                    onChange={(e) => setEditOrderPaymentStatus(e.target.value as any)}
                    className="w-full text-xs py-2 px-3 bg-white border border-stone-200 focus:outline-hidden focus:border-[var(--theme-accent)] rounded-none shadow-xs font-sans text-stone-800"
                  >
                    <option value="pending">Pending Verification</option>
                    <option value="completed">Completed (Funds Secured)</option>
                    <option value="failed">Failed / Cancelled</option>
                  </select>
                </div>

                {/* Tracking & Progress Notes */}
                <div>
                  <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-stone-700 mb-1 flex items-center justify-between">
                    <span>Artist Progress & Tracking Notes</span>
                    <span className="text-[9px] text-[var(--theme-primary)] font-medium lowercase italic">visible to customer</span>
                  </label>
                  <textarea
                    rows={4}
                    value={editOrderTrackingNotes}
                    onChange={(e) => setEditOrderTrackingNotes(e.target.value)}
                    placeholder="e.g. Clay relief mud-work completed. Adding mirrors and painting tomorrow. OR: Dispatched via Delhivery, Tracking ID: DLV-872391."
                    className="w-full text-xs py-2 px-3 bg-white border border-stone-200 focus:outline-hidden focus:border-[var(--theme-accent)] rounded-none shadow-xs font-sans text-stone-800 resize-none leading-relaxed"
                  />
                  <p className="text-[9px] text-stone-400 font-sans mt-1 leading-normal">
                    This message will instantly update on the customer's personal dashboard so they stay updated on their commission's progress.
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingOrder(false);
                      setSelectedOrderToEdit(null);
                    }}
                    className="flex-1 py-2 px-4 border border-stone-300 hover:bg-stone-50 text-stone-700 font-sans text-xs uppercase tracking-widest transition-colors rounded-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 px-4 bg-[var(--theme-accent)] hover:bg-[var(--theme-primary)] text-white font-sans text-xs uppercase tracking-widest font-semibold transition-colors shadow-md rounded-none"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
