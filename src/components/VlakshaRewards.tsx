import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Order, User } from '../types';
import { Coins, Gift, Award, CheckCircle, Copy, AlertCircle, Sparkles, HelpCircle } from 'lucide-react';

interface VlakshaRewardsProps {
  currentUser: User;
  orders: Order[];
}

interface SavedCoupon {
  code: string;
  discount: number;
  redeemedAt: string;
  isUsed: boolean;
}

export default function VlakshaRewards({ currentUser, orders }: VlakshaRewardsProps) {
  const [redeemedPoints, setRedeemedPoints] = useState<number>(0);
  const [coupons, setCoupons] = useState<SavedCoupon[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'status' | 'benefits' | 'history'>('status');

  const emailKey = currentUser.email.trim().toLowerCase();

  // Load redeemed points and coupons from localStorage on mount
  useEffect(() => {
    const savedRedeemed = localStorage.getItem(`vlaksha_redeemed_points_${emailKey}`);
    if (savedRedeemed) {
      setRedeemedPoints(parseInt(savedRedeemed, 10));
    } else {
      setRedeemedPoints(0);
    }

    const savedCoupons = localStorage.getItem(`vlaksha_coupons_${emailKey}`);
    if (savedCoupons) {
      setCoupons(JSON.parse(savedCoupons));
    } else {
      setCoupons([]);
    }
  }, [emailKey]);

  // Helper to calculate total order price
  const getOrderTotal = (order: Order) => {
    return order.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  // Base welcome bonus points
  const WELCOME_BONUS = 100;

  // Points earned from orders (1 point for every ₹10 spent)
  const pointsFromOrders = orders.reduce((sum, order) => {
    const total = getOrderTotal(order);
    return sum + Math.floor(total / 10);
  }, 0);

  const totalPointsEarned = WELCOME_BONUS + pointsFromOrders;
  const currentBalance = Math.max(0, totalPointsEarned - redeemedPoints);

  // Define tiers
  const getTier = (points: number) => {
    if (points >= 3000) return { name: 'Diamond Connoisseur', color: 'text-cyan-600 border-cyan-200 bg-cyan-50', discount: '15%' };
    if (points >= 1500) return { name: 'Gold Collector', color: 'text-amber-600 border-amber-200 bg-amber-50', discount: '10%' };
    if (points >= 500) return { name: 'Silver Patron', color: 'text-stone-600 border-stone-200 bg-stone-50', discount: '5%' };
    return { name: 'Bronze Crafter', color: 'text-orange-600 border-orange-200 bg-orange-50', discount: '0%' };
  };

  const currentTier = getTier(totalPointsEarned);

  // Calculate milestone progress (threshold is 500 points for a reward)
  const pointsNeededForNextReward = 500;
  const progressToNextReward = currentBalance >= 500 ? 500 : currentBalance;
  const progressPercentage = Math.min((progressToNextReward / pointsNeededForNextReward) * 100, 100);

  // Copy code to clipboard helper
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Redeem reward points handler
  const handleRedeemPoints = () => {
    if (currentBalance < 500) return;

    const newRedeemedPoints = redeemedPoints + 500;
    const randSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newCoupon: SavedCoupon = {
      code: `LAKSHA-250-${randSuffix}`,
      discount: 250,
      redeemedAt: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      isUsed: false
    };

    const updatedCoupons = [newCoupon, ...coupons];
    
    // Save to local state and localStorage
    setRedeemedPoints(newRedeemedPoints);
    setCoupons(updatedCoupons);
    localStorage.setItem(`vlaksha_redeemed_points_${emailKey}`, newRedeemedPoints.toString());
    localStorage.setItem(`vlaksha_coupons_${emailKey}`, JSON.stringify(updatedCoupons));
  };

  return (
    <div id="vlaksha-rewards-panel" className="bg-[var(--theme-bg)] border border-[var(--theme-primary)]/20 p-5 sm:p-6 space-y-6 relative overflow-hidden shadow-xs">
      {/* Decorative top border motif */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-200 via-[var(--theme-primary)] to-amber-200" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-[var(--theme-primary)]" />
          <h3 className="font-serif text-lg font-light text-[#1a1a1a]">Vlaksha Rewards</h3>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowTooltip(!showTooltip)}
            onBlur={() => setTimeout(() => setShowTooltip(false), 200)}
            className="text-stone-400 hover:text-stone-600 transition-colors focus:outline-none"
            aria-label="Loyalty info"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          <AnimatePresence>
            {showTooltip && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute right-0 top-6 w-60 p-3 bg-white border border-stone-200 shadow-lg text-[11px] leading-relaxed text-stone-600 font-sans z-30"
              >
                <p className="font-semibold text-stone-800 mb-1">How Points Work:</p>
                <p className="mb-2">✨ Receive <strong>100 Points</strong> upon account registration.</p>
                <p className="mb-2">✨ Earn <strong>1 Point</strong> for every ₹10 spent on any exquisite Lippan art plate, custom mandala, or personalized work.</p>
                <p>✨ Accumulate <strong>500 Points</strong> to instantly redeem a <strong>₹250 Discount Voucher</strong> valid on any item.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Rewards Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center bg-white border border-stone-100 p-4 shadow-2xs">
        
        {/* Circle Point Display */}
        <div className="md:col-span-5 flex flex-col items-center text-center py-2 md:border-r border-stone-100">
          <div className="relative flex items-center justify-center w-24 h-24 rounded-full border-2 border-dashed border-[var(--theme-primary)]/40 bg-[var(--theme-bg)]">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
              className="absolute inset-0.5 rounded-full border border-stone-100"
            />
            <div className="z-10 flex flex-col items-center">
              <span className="text-3xl font-mono font-bold text-[var(--theme-accent)] tracking-tight">{currentBalance}</span>
              <span className="text-[9px] font-sans uppercase tracking-widest text-[var(--theme-primary)] font-bold">Points</span>
            </div>
          </div>
          
          <div className="mt-3">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[9px] font-sans uppercase tracking-wider font-bold rounded-full border ${currentTier.color}`}>
              {currentTier.name}
            </span>
          </div>
          <p className="text-[10px] text-stone-400 font-sans mt-1">Total Earned: {totalPointsEarned} pts</p>
        </div>

        {/* Progress & Milestone Claim */}
        <div className="md:col-span-7 space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-sans">
              <span className="text-stone-500 font-medium">Progress to ₹250 Voucher</span>
              <span className="font-mono font-bold text-stone-800">{currentBalance >= 500 ? 'Ready!' : `${currentBalance}/500 pts`}</span>
            </div>
            
            {/* Elegant horizontal progress bar */}
            <div className="w-full h-2 bg-stone-100 overflow-hidden relative border border-stone-200/20">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-accent)]"
              />
            </div>
          </div>

          {currentBalance >= 500 ? (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleRedeemPoints}
              className="w-full py-2.5 px-4 bg-amber-500 hover:bg-[var(--theme-accent)] text-white text-[11px] font-sans font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm border border-amber-600"
            >
              <Gift className="w-3.5 h-3.5 animate-bounce" />
              <span>Redeem 500 Points for ₹250 Voucher</span>
            </motion.button>
          ) : (
            <div className="bg-stone-50 border border-stone-100 p-2.5 text-center">
              <p className="text-[10px] text-stone-500 font-sans">
                💡 Spend <strong>₹{Math.max(0, (500 - currentBalance) * 10)}</strong> more, or place orders to unlock your next ₹250 studio discount code.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-100">
        <button
          onClick={() => setActiveTab('status')}
          className={`flex-1 pb-2 text-[10px] font-sans uppercase tracking-wider font-semibold transition-all border-b-2 text-center ${activeTab === 'status' ? 'border-[var(--theme-primary)] text-stone-800' : 'border-transparent text-stone-400 hover:text-stone-600'}`}
        >
          My Vouchers ({coupons.length})
        </button>
        <button
          onClick={() => setActiveTab('benefits')}
          className={`flex-1 pb-2 text-[10px] font-sans uppercase tracking-wider font-semibold transition-all border-b-2 text-center ${activeTab === 'benefits' ? 'border-[var(--theme-primary)] text-stone-800' : 'border-transparent text-stone-400 hover:text-stone-600'}`}
        >
          Tier Benefits
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 pb-2 text-[10px] font-sans uppercase tracking-wider font-semibold transition-all border-b-2 text-center ${activeTab === 'history' ? 'border-[var(--theme-primary)] text-stone-800' : 'border-transparent text-stone-400 hover:text-stone-600'}`}
        >
          Points History
        </button>
      </div>

      {/* Tab Panels */}
      <div className="min-h-32">
        {activeTab === 'status' && (
          <div className="space-y-3">
            {coupons.length === 0 ? (
              <div className="text-center py-6 text-stone-400 space-y-1">
                <Coins className="w-7 h-7 mx-auto stroke-[1.25] text-stone-300" />
                <p className="text-[10px] font-sans uppercase tracking-wider">No active vouchers yet</p>
                <p className="text-[9px] text-stone-400 max-w-xs mx-auto leading-relaxed">
                  When you accumulate 500 points, redeem them above to generate active discount codes for your cart.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {coupons.map((coupon, idx) => (
                  <div key={idx} className="bg-white border border-[var(--theme-primary)]/20 p-3 flex flex-col justify-between relative overflow-hidden">
                    {/* Decorative corner circles to represent tickets */}
                    <div className="absolute top-1/2 -left-2 w-4 h-4 rounded-full bg-[var(--theme-bg)] border border-[var(--theme-primary)]/10 -translate-y-1/2" />
                    <div className="absolute top-1/2 -right-2 w-4 h-4 rounded-full bg-[var(--theme-bg)] border border-[var(--theme-primary)]/10 -translate-y-1/2" />
                    
                    <div className="flex justify-between items-start mb-2">
                      <div className="space-y-0.5 pl-2">
                        <span className="text-[10px] text-stone-400 font-sans block uppercase">Discount Voucher</span>
                        <span className="font-serif text-lg font-bold text-stone-800">₹{coupon.discount} OFF</span>
                      </div>
                      <span className="text-[8px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 font-bold uppercase">
                        Active
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-[var(--theme-bg)] border border-stone-100 p-1.5 rounded-none justify-between mt-1 pl-2">
                      <code className="text-xs font-mono text-[var(--theme-accent)] font-semibold">{coupon.code}</code>
                      <button
                        onClick={() => handleCopyCode(coupon.code)}
                        className="text-stone-400 hover:text-[var(--theme-primary)] transition-colors p-1"
                        title="Copy to clipboard"
                      >
                        {copiedCode === coupon.code ? (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    
                    <span className="text-[8px] text-stone-400 font-sans mt-2 pl-2">Redeemed: {coupon.redeemedAt}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'benefits' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
              
              <div className="bg-white border border-stone-100 p-3 space-y-2">
                <div className="flex items-center justify-between border-b border-stone-50 pb-1">
                  <span className="font-bold text-stone-800">🥉 Bronze Crafter</span>
                  <span className="text-[10px] text-stone-400">0 - 499 pts</span>
                </div>
                <ul className="text-[10px] text-stone-600 space-y-1 leading-relaxed">
                  <li>• 100 points signup bonus</li>
                  <li>• Earn 1 point per ₹10 spent on all artwork</li>
                  <li>• Redeem points for custom vouchers</li>
                </ul>
              </div>

              <div className="bg-white border border-amber-100 p-3 space-y-2 relative">
                <div className="absolute top-2 right-2 bg-amber-500 w-1.5 h-1.5 rounded-full" />
                <div className="flex items-center justify-between border-b border-stone-50 pb-1">
                  <span className="font-bold text-stone-800">🥈 Silver Patron</span>
                  <span className="text-[10px] text-amber-600">500 - 1499 pts</span>
                </div>
                <ul className="text-[10px] text-stone-600 space-y-1 leading-relaxed">
                  <li>• <strong>5% automatic checkout discount</strong></li>
                  <li>• Early previews of Laksha's new collections</li>
                  <li>• Digital design certificate for custom pieces</li>
                </ul>
              </div>

              <div className="bg-white border border-yellow-100 p-3 space-y-2">
                <div className="flex items-center justify-between border-b border-stone-50 pb-1">
                  <span className="font-bold text-stone-800">🥇 Gold Collector</span>
                  <span className="text-[10px] text-yellow-600">1500 - 2999 pts</span>
                </div>
                <ul className="text-[10px] text-stone-600 space-y-1 leading-relaxed">
                  <li>• <strong>10% automatic checkout discount</strong></li>
                  <li>• Complimentary woolen tassel charms</li>
                  <li>• Priority handmade crafting slot queue</li>
                </ul>
              </div>

              <div className="bg-white border border-cyan-100 p-3 space-y-2">
                <div className="flex items-center justify-between border-b border-stone-50 pb-1">
                  <span className="font-bold text-stone-800">💎 Diamond Connoisseur</span>
                  <span className="text-[10px] text-cyan-600">3000+ pts</span>
                </div>
                <ul className="text-[10px] text-stone-600 space-y-1 leading-relaxed">
                  <li>• <strong>15% automatic checkout discount</strong></li>
                  <li>• Free custom color revisions & direct consults</li>
                  <li>• Hand-written personal blessing card by Laksha</li>
                </ul>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white border border-stone-100 p-3">
            <div className="space-y-2 font-mono text-[10px] max-h-44 overflow-y-auto">
              
              <div className="flex justify-between items-center py-1 border-b border-stone-50">
                <span className="text-emerald-600 font-semibold">+100 pts</span>
                <span className="text-stone-500">Welcome Signup Gift</span>
                <span className="text-stone-400 text-[8px]">ACCOUNT BONUS</span>
              </div>

              {orders.map((order, index) => {
                const total = getOrderTotal(order);
                const points = Math.floor(total / 10);
                if (points === 0) return null;
                return (
                  <div key={index} className="flex justify-between items-center py-1 border-b border-stone-50">
                    <span className="text-emerald-600 font-semibold">+{points} pts</span>
                    <span className="text-stone-600 max-w-[120px] truncate">Order #{order.id}</span>
                    <span className="text-stone-400 text-[8px]">{new Date().toLocaleDateString('en-IN')}</span>
                  </div>
                );
              })}

              {redeemedPoints > 0 && (
                <div className="flex justify-between items-center py-1 border-b border-stone-50 text-rose-600">
                  <span>-{redeemedPoints} pts</span>
                  <span>Redeemed Voucher(s)</span>
                  <span className="text-[8px]">REDEEMED</span>
                </div>
              )}

            </div>
          </div>
        )}
      </div>

    </div>
  );
}
