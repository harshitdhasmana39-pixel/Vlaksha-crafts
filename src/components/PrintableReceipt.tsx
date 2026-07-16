import React from 'react';
import { Order } from '../types';
import { Sparkles, ShoppingBag } from 'lucide-react';

interface PrintableReceiptProps {
  order: Order | null;
}

export default function PrintableReceipt({ order }: PrintableReceiptProps) {
  if (!order) return null;

  return (
    <div id="printable-receipt" className="hidden print:block bg-white text-[#111] p-10 max-w-4xl mx-auto font-sans">
      {/* 1. ORNAMENTAL BORDER / MARGIN HEADER FOR INDIAN AESTHETIC */}
      <div className="border-b-4 double border-[var(--theme-primary)] pb-6 mb-8 text-center relative">
        <div className="flex justify-center mb-3">
          {/* Stylized vector golden mandala centerpiece */}
          <div className="w-12 h-12 rounded-full border-2 border-[var(--theme-primary)] flex items-center justify-center bg-[var(--theme-accent)] text-white">
            <Sparkles className="w-6 h-6 text-[var(--theme-primary)]" />
          </div>
        </div>
        <h1 className="font-serif text-3xl font-light uppercase tracking-[0.2em] text-[var(--theme-accent)]">
          Vlaksha Crafts
        </h1>
        <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--theme-primary)] font-semibold mt-1">
          Handpainted Mud-Mirror Reliefs & Sacred Mandalas
        </p>
        <p className="text-xs text-stone-500 mt-2">
          Noida Studio, Uttar Pradesh, India | contact@vlakshacrafts.com | WhatsApp: +91 95481 23456
        </p>
      </div>

      {/* 2. RECEIPT META TITLE */}
      <div className="text-center mb-8">
        <h2 className="text-sm uppercase tracking-[0.25em] font-bold text-stone-800 bg-[#fbf9f4] border border-[var(--theme-primary)]/20 py-2 inline-block px-8">
          Official Order Receipt
        </h2>
      </div>

      {/* 3. TWO COLUMN METADATA INFO */}
      <div className="grid grid-cols-2 gap-8 mb-8 text-xs pb-6 border-b border-[var(--theme-primary)]/10">
        <div>
          <h3 className="font-semibold text-[var(--theme-accent)] uppercase tracking-wider text-[11px] mb-3 pb-1 border-b border-[var(--theme-primary)]/20">
            Order & Invoice Info
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-stone-500">Order ID:</span>
              <span className="font-mono font-bold text-stone-900">#{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Date:</span>
              <span className="font-medium text-stone-800">
                {new Date(order.createdAt).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Payment Status:</span>
              <span className={`uppercase font-bold tracking-wider text-[10px] ${
                order.paymentStatus === 'completed' ? 'text-emerald-700' : 'text-amber-700'
              }`}>
                {order.paymentStatus}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Payment Gateway:</span>
              <span className="font-medium text-stone-800">
                {order.paymentMethod === 'Razorpay_Test' ? 'Razorpay Test Gateway' : order.paymentMethod}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-[var(--theme-accent)] uppercase tracking-wider text-[11px] mb-3 pb-1 border-b border-[var(--theme-primary)]/20">
            Auspicious Delivery To
          </h3>
          <div className="space-y-1.5 leading-relaxed text-stone-800">
            <p className="font-bold text-stone-950">{order.customerName}</p>
            <p className="font-mono text-[11px]">Phone: {order.phone}</p>
            <p>Email: {order.email}</p>
            <div className="pt-1.5 text-stone-600 text-[11px]">
              <p>{order.address.street}</p>
              <p>
                {order.address.city}, {order.address.state} - {order.address.zipCode}
              </p>
              <p className="uppercase tracking-wider text-[9px] font-bold text-[var(--theme-primary)] mt-0.5">
                {order.address.country}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. ORDERED ITEMS TABLE */}
      <table className="w-full text-xs mb-8">
        <thead>
          <tr className="bg-[var(--theme-accent)] text-white uppercase text-[10px] tracking-wider">
            <th className="py-2.5 px-3 text-left font-semibold">Artifact / Description</th>
            <th className="py-2.5 px-3 text-left font-semibold">Size</th>
            <th className="py-2.5 px-3 text-left font-semibold">Color Accent</th>
            <th className="py-2.5 px-3 text-center font-semibold">Qty</th>
            <th className="py-2.5 px-3 text-right font-semibold">Unit Price</th>
            <th className="py-2.5 px-3 text-right font-semibold">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--theme-primary)]/10">
          {order.items.map((item) => (
            <tr key={item.id} className="text-stone-800">
              <td className="py-3 px-3">
                <span className="font-serif font-bold text-stone-950 block">{item.product.name}</span>
                {item.personalization && (
                  <span className="text-[10px] italic text-[var(--theme-primary)] font-medium block mt-1">
                    Custom Calligraphy ({item.personalization.language}): &ldquo;{item.personalization.text}&rdquo;
                  </span>
                )}
              </td>
              <td className="py-3 px-3 font-mono text-stone-600">{item.size}</td>
              <td className="py-3 px-3 text-stone-600">{item.color.name}</td>
              <td className="py-3 px-3 text-center font-bold text-stone-950">{item.quantity}</td>
              <td className="py-3 px-3 text-right font-mono text-stone-700">
                ₹{item.product.price.toLocaleString('en-IN')}
              </td>
              <td className="py-3 px-3 text-right font-mono font-bold text-stone-950">
                ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 5. SUMMARY FEES & TOTALS */}
      <div className="flex justify-end mb-10">
        <div className="w-80 space-y-2 text-xs">
          <div className="flex justify-between text-stone-500 pb-1.5 border-b border-stone-100">
            <span>Subtotal Items</span>
            <span className="font-mono text-stone-800">₹{order.totalAmount.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-stone-500 pb-1.5 border-b border-stone-100">
            <span>Clay Mud-Relief Base Prep</span>
            <span className="text-emerald-700 font-bold uppercase text-[10px]">Included / FREE</span>
          </div>
          <div className="flex justify-between text-stone-500 pb-1.5 border-b border-stone-100">
            <span>Auspicious Indian Delivery</span>
            <span className="text-emerald-700 font-bold uppercase text-[10px]">FREE</span>
          </div>
          <div className="flex justify-between font-bold text-stone-950 pt-2 border-t-2 border-[var(--theme-accent)] text-sm">
            <span>GRAND TOTAL PAID</span>
            <span className="font-mono text-[var(--theme-accent)]">₹{order.totalAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* 6. ARTISTIC CLOSING & SIGNATURE */}
      <div className="border-t border-[var(--theme-primary)]/20 pt-6 text-center space-y-4">
        <p className="font-serif italic text-stone-600 text-[11px] max-w-lg mx-auto leading-relaxed">
          &ldquo;Thank you for supporting hand-crafted artisan heritage. Each clay relief, mirror shard, and acrylic line is placed with pure mindfulness and positive vibration. May this artwork illuminate your dwelling.&rdquo;
        </p>
        <div className="space-y-1">
          <p className="font-serif text-xs font-semibold text-[var(--theme-accent)]">Laksha Kandpal</p>
          <p className="text-[9px] uppercase tracking-wider text-stone-400">Founder & Artist, Vlaksha Crafts</p>
        </div>
        <p className="text-[9px] text-stone-400 font-mono mt-4">
          This is an official document generated on {new Date().toLocaleDateString('en-IN')} &copy; Vlaksha Crafts. All rights reserved.
        </p>
      </div>
    </div>
  );
}
