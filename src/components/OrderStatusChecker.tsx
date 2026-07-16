import React, { useState } from 'react';
import { dbService } from '../services/db';
import { Order } from '../types';
import {
  Search,
  Sparkles,
  CheckCircle,
  Clock,
  Package,
  Truck,
  AlertTriangle,
  ArrowRight,
  Send,
  Calendar,
  User,
  ShoppingBag
} from 'lucide-react';

interface OrderStatusCheckerProps {
  initialOrderId?: string;
}

export default function OrderStatusChecker({ initialOrderId }: OrderStatusCheckerProps) {
  const [orderIdInput, setOrderIdInput] = useState(initialOrderId || '');
  const [searchedId, setSearchedId] = useState(initialOrderId || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  React.useEffect(() => {
    if (initialOrderId) {
      const normalizedId = initialOrderId.startsWith('#') ? initialOrderId.slice(1) : initialOrderId;
      const foundOrder = dbService.getOrderById(normalizedId);
      setOrder(foundOrder || null);
      setSearchedId(initialOrderId);
      setOrderIdInput(initialOrderId);
      setHasSearched(true);
      
      const element = document.getElementById('order-status-checker-section');
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 500);
      }
    }
  }, [initialOrderId]);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = orderIdInput.trim();
    if (!cleanId) return;

    // Search order in db (supporting with or without '#' prefix)
    const normalizedId = cleanId.startsWith('#') ? cleanId.slice(1) : cleanId;
    const foundOrder = dbService.getOrderById(normalizedId);

    setOrder(foundOrder || null);
    setSearchedId(cleanId);
    setHasSearched(true);
  };

  const useDemoOrder = (demoId: string) => {
    setOrderIdInput(demoId);
    const foundOrder = dbService.getOrderById(demoId);
    setOrder(foundOrder || null);
    setSearchedId(demoId);
    setHasSearched(true);
  };

  const getStatusStepIndex = (status: Order['orderStatus']) => {
    switch (status) {
      case 'received': return 0;
      case 'in_progress': return 1;
      case 'shipped': return 2;
      case 'delivered': return 3;
      default: return 0;
    }
  };

  const steps = [
    {
      title: 'Auspicious Start',
      label: 'Order Confirmed',
      description: 'Laksha has accepted your order and prepped the MDF backing template.',
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
    {
      title: 'Crafting & Modeling',
      label: 'In Progress',
      description: 'Hand-molding wet clay relief lines, setting glass mirrors, and painting base acrylic coats.',
      icon: Sparkles,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Auspicious Packaging',
      label: 'Shipped',
      description: 'Double-bubble-wrapped with decorative tassels and handed to premium logistics.',
      icon: Truck,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
    {
      title: 'Divine Entrance',
      label: 'Delivered',
      description: 'Arrived safely at your entrance threshold. May it bring positive energy!',
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    }
  ];

  const activeStep = order ? getStatusStepIndex(order.orderStatus) : 0;

  return (
    <div id="order-status-checker-section" className="bg-[var(--theme-bg)] border border-[var(--theme-primary)]/20 rounded-none p-6 sm:p-10 shadow-xs space-y-6">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-[10px] uppercase font-sans tracking-[0.25em] text-[var(--theme-primary)] font-semibold block">
          Track Your Handmade Creation
        </span>
        <h2 className="font-serif text-3xl font-light text-[#1a1a1a] tracking-tight">Check Order Progress</h2>
        <p className="text-xs text-stone-500 font-sans leading-relaxed">
          Each Lippan plate, custom nameplate, and sacred mandala takes days of patient hand-molding and drying. Enter your Order ID below to view its precise stage in Laksha's studio.
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleLookup} className="max-w-md mx-auto">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-stone-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              required
              placeholder="Enter Order ID (e.g. ord-1001, ord-1002)"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              className="w-full pl-9 pr-4 py-3 border border-[var(--theme-primary)]/25 focus:border-[var(--theme-accent)] focus:outline-hidden bg-white text-xs font-mono font-medium placeholder:font-sans placeholder:text-stone-400"
            />
          </div>
          <button
            type="submit"
            className="py-3 px-6 bg-[var(--theme-accent)] hover:bg-[var(--theme-primary)] text-white font-sans text-xs uppercase tracking-widest font-semibold transition-all shadow-xs shrink-0"
          >
            Track Order
          </button>
        </div>

        {/* Demo orders guide */}
        <div className="flex items-center justify-center gap-2 mt-3 text-[10px] text-stone-400 font-sans">
          <span>Or view a demo progress bar:</span>
          <button
            type="button"
            onClick={() => useDemoOrder('ord-1001')}
            className="text-[var(--theme-primary)] hover:text-[var(--theme-accent)] font-mono font-semibold underline"
          >
            ord-1001 (Shipped)
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => useDemoOrder('ord-1002')}
            className="text-[var(--theme-primary)] hover:text-[var(--theme-accent)] font-mono font-semibold underline"
          >
            ord-1002 (In Progress)
          </button>
        </div>
      </form>

      {/* Results Box */}
      {hasSearched && (
        <div className="mt-8 pt-6 border-t border-[var(--theme-primary)]/10 animate-fadeIn">
          {!order ? (
            <div className="max-w-md mx-auto text-center p-6 bg-amber-500/5 border border-amber-500/10 text-stone-600">
              <AlertTriangle className="w-8 h-8 text-[var(--theme-primary)] mx-auto mb-2" />
              <h3 className="font-serif text-sm font-bold text-stone-800">No Order Found</h3>
              <p className="text-xs mt-1 font-sans">
                We couldn't find an order with ID <strong className="font-mono text-[var(--theme-accent)]">"{searchedId}"</strong>.
              </p>
              <p className="text-[11px] mt-2 text-stone-500 leading-normal font-sans">
                Please make sure you have typed it correctly, or check your confirmation message. For urgent help, please contact Laksha.
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              
              {/* Order quick overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white border border-[var(--theme-primary)]/10 p-4 font-sans text-xs text-stone-600">
                <div className="flex items-start gap-2.5">
                  <User className="w-4 h-4 text-[var(--theme-primary)] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] uppercase text-stone-400 font-semibold block">Client Patron</span>
                    <strong className="text-[#1a1a1a]">{order.customerName}</strong>
                    <span className="block text-[10px] text-stone-400">{order.phone}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-[var(--theme-primary)] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] uppercase text-stone-400 font-semibold block">Placed On</span>
                    <strong className="text-[#1a1a1a]">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                    <span className="block text-[10px] text-stone-400 font-mono">Paid via {order.paymentMethod}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <ShoppingBag className="w-4 h-4 text-[var(--theme-primary)] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] uppercase text-stone-400 font-semibold block">Artworks Checked</span>
                    <strong className="text-[#1a1a1a] truncate block max-w-[200px]">
                      {order.items.map(it => `${it.product.name} (x${it.quantity})`).join(', ')}
                    </strong>
                    <span className="block text-[10px] text-[var(--theme-primary)] font-mono font-semibold">Total: ₹{order.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Progress Line visualizer */}
              <div className="space-y-4">
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-[var(--theme-primary)] font-bold font-sans">
                  Current Handcrafted Progress
                </h4>

                {/* Desktop horizontal stepper */}
                <div className="hidden md:flex items-center justify-between relative pt-4 pb-8">
                  {/* Connecting Line */}
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-4 h-1 bg-stone-200 z-0">
                    <div
                      className="h-full bg-gradient-to-r from-[var(--theme-accent)] to-[var(--theme-primary)] transition-all duration-500"
                      style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
                    />
                  </div>

                  {steps.map((step, idx) => {
                    const isCompleted = idx < activeStep;
                    const isActive = idx === activeStep;
                    const StepIcon = step.icon;

                    return (
                      <div key={idx} className="relative z-10 flex flex-col items-center flex-1 text-center px-2">
                        {/* Circle Node */}
                        <div
                          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                            isCompleted
                              ? 'bg-[var(--theme-accent)] border-[var(--theme-accent)] text-white shadow-md'
                              : isActive
                              ? 'bg-white border-[var(--theme-primary)] text-[var(--theme-primary)] scale-110 ring-4 ring-[var(--theme-primary)]/10 shadow-lg'
                              : 'bg-stone-50 border-stone-200 text-stone-400'
                          }`}
                        >
                          <StepIcon className="w-4 h-4" />
                        </div>

                        {/* Labels */}
                        <span className={`text-[10px] font-sans font-bold uppercase tracking-wider mt-3 ${
                          isActive ? 'text-[var(--theme-primary)]' : isCompleted ? 'text-[var(--theme-accent)]' : 'text-stone-400'
                        }`}>
                          {step.label}
                        </span>
                        <span className="text-[9px] text-stone-400 italic font-serif mt-0.5 block">
                          {step.title}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Mobile vertical stepper */}
                <div className="md:hidden space-y-6 pl-4 border-l-2 border-[var(--theme-primary)]/20 relative py-2">
                  {steps.map((step, idx) => {
                    const isCompleted = idx < activeStep;
                    const isActive = idx === activeStep;
                    const StepIcon = step.icon;

                    return (
                      <div key={idx} className="relative flex gap-4">
                        {/* Circle Indicator on the left border */}
                        <div
                          className={`absolute -left-[25px] top-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                            isCompleted
                              ? 'bg-[var(--theme-accent)] border-[var(--theme-accent)]'
                              : isActive
                              ? 'bg-white border-[var(--theme-primary)] ring-2 ring-[var(--theme-primary)]/20'
                              : 'bg-stone-100 border-stone-300'
                          }`}
                        />

                        {/* Icon & Details */}
                        <div className={`p-3 border rounded-xs w-full ${
                          isActive
                            ? 'bg-[#f8f5ef] border-[var(--theme-primary)] shadow-inner'
                            : isCompleted
                            ? 'bg-white border-[var(--theme-accent)]/10 opacity-75'
                            : 'bg-stone-50/50 border-stone-200/60 opacity-60'
                        }`}>
                          <div className="flex items-center gap-2">
                            <StepIcon className={`w-4 h-4 ${isActive ? 'text-[var(--theme-primary)]' : isCompleted ? 'text-[var(--theme-accent)]' : 'text-stone-400'}`} />
                            <span className="text-[10px] font-sans font-bold uppercase tracking-wider">
                              {step.label}
                            </span>
                            <span className="text-[9px] text-stone-400 font-serif italic ml-auto">
                              {step.title}
                            </span>
                          </div>
                          <p className="text-[10px] text-stone-600 mt-1.5 leading-normal">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status explanation & detailed description of active stage */}
              <div className="bg-[#f8f5ef] border border-[var(--theme-primary)]/25 p-4 rounded-none space-y-3">
                <div className="flex gap-2.5">
                  <Sparkles className="w-5 h-5 text-[var(--theme-primary)] shrink-0 mt-0.5 animate-pulse" />
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-sans tracking-widest text-[var(--theme-primary)] font-bold">
                      Current Stage Details: {steps[activeStep].label}
                    </span>
                    <h5 className="font-serif text-sm font-semibold text-stone-900 leading-tight">
                      {steps[activeStep].title}
                    </h5>
                    <p className="text-xs text-stone-600 leading-relaxed font-sans">
                      {steps[activeStep].description}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--theme-primary)]/10 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[10px] text-stone-500 font-sans">
                    Have changes or personalization queries for this order?
                  </span>
                  
                  {/* WhatsApp button with orderId injected */}
                  <a
                    href={`https://wa.me/919876543210?text=Namaste%20Laksha,%20I%20am%20checking%20the%20status%20of%20my%20order%20%23${order.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-1.5 px-3.5 bg-[#25D366] hover:bg-[#128C7E] text-white font-sans text-[10px] uppercase tracking-widest font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Send className="w-3.5 h-3.5 fill-current" />
                    <span>Inquire on WhatsApp</span>
                  </a>
                </div>
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
}
