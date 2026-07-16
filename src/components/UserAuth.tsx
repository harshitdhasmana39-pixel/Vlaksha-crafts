import React, { useState } from 'react';
import { dbService } from '../services/db';
import { User } from '../types';
import { Sparkles, Mail, Lock, User as UserIcon, Phone, MapPin, Eye, EyeOff, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import MandalaDivider from './MandalaDivider';

interface UserAuthProps {
  onAuthSuccess: (user: User) => void;
  onCancel: () => void;
  initialMode?: 'login' | 'register';
}

export default function UserAuth({ onAuthSuccess, onCancel, initialMode = 'login' }: UserAuthProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Signup-specific fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('India');

  const [registerSuccess, setRegisterSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await dbService.loginUser(email, password);
        if (res.success && res.user) {
          onAuthSuccess(res.user);
        } else if (res.error && (res.error.includes('operation-not-allowed') || res.error.includes('auth/operation-not-allowed'))) {
          // Automatic login fallback
          console.warn("Email/Password Auth disabled. Falling back to local-first sandbox profile.");
          const fallbackRes = await dbService.loginUserWithDemo(email.split('@')[0], email);
          if (fallbackRes.success && fallbackRes.user) {
            onAuthSuccess(fallbackRes.user);
          } else {
            setError(res.error || 'Authentication failed.');
          }
        } else {
          setError(res.error || 'Authentication failed.');
        }
      } else {
        // Validate registration
        if (!name || !email || !phone) {
          setError('Please fill in all required fields.');
          setLoading(false);
          return;
        }

        const res = await dbService.registerUser({
          name,
          email,
          phone,
          password,
          address: {
            street: street || 'N/A',
            city: city || 'N/A',
            state: state || 'N/A',
            zipCode: zipCode || 'N/A',
            country: country || 'India',
          },
        });

        if (res.success && res.user) {
          setRegisterSuccess(true);
          setTimeout(() => {
            onAuthSuccess(res.user!);
          }, 1500);
        } else if (res.error && (res.error.includes('operation-not-allowed') || res.error.includes('auth/operation-not-allowed'))) {
          // Automatic registration fallback
          console.warn("Email/Password Auth disabled. Falling back to local-first sandbox profile.");
          const fallbackRes = await dbService.loginUserWithDemo(name, email);
          
          if (fallbackRes.success && fallbackRes.user) {
            // Sync custom fields
            fallbackRes.user.phone = phone;
            fallbackRes.user.address = {
              street: street || 'N/A',
              city: city || 'N/A',
              state: state || 'N/A',
              zipCode: zipCode || 'N/A',
              country: country || 'India',
            };

            // Save to local storage list
            const localUsers = dbService.getUsers();
            const existingIndex = localUsers.findIndex(u => u.email === email.trim().toLowerCase());
            if (existingIndex > -1) {
              localUsers[existingIndex] = fallbackRes.user;
            } else {
              localUsers.push(fallbackRes.user);
            }
            localStorage.setItem('vlaksha_users', JSON.stringify(localUsers));
            dbService.setCurrentUser(fallbackRes.user);

            setRegisterSuccess(true);
            setTimeout(() => {
              onAuthSuccess(fallbackRes.user);
            }, 1500);
          } else {
            setError(res.error || 'Registration failed.');
          }
        } else {
          setError(res.error || 'Registration failed.');
        }
      }
    } catch (err) {
      console.error("Authentication error:", err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="vlaksha-user-auth" className="max-w-2xl mx-auto my-8 bg-[var(--theme-bg)] border border-[var(--theme-primary)]/25 rounded-none p-6 sm:p-8 shadow-lg relative">
      <div className="absolute top-4 right-4">
        <button
          onClick={onCancel}
          className="text-stone-400 hover:text-stone-700 font-sans text-xs tracking-wider uppercase font-semibold cursor-pointer"
        >
          Cancel
        </button>
      </div>

      <div className="text-center max-w-md mx-auto space-y-2">
        <div className="w-12 h-12 rounded-full border border-[var(--theme-primary)]/30 bg-[var(--theme-accent)] text-white flex items-center justify-center mx-auto mb-3">
          <Sparkles className="w-5 h-5 text-[var(--theme-primary)]" />
        </div>
        <h2 className="font-serif text-3xl font-light text-[#1a1a1a] tracking-tight">
          {mode === 'login' ? 'Namaste, Welcome Back' : 'Create Auspicious Profile'}
        </h2>
        <p className="text-xs text-stone-500 font-sans leading-relaxed">
          {mode === 'login'
            ? 'Sign in to access your customized dashboard, track your handpainted clay reliefs, and checkout effortlessly.'
            : 'Join Vlaksha Crafts to purchase sacred geometry reliefs, save customized calligraphy mockups, and track orders.'}
        </p>
      </div>

      <div className="my-6">
        <MandalaDivider />
      </div>

      {registerSuccess ? (
        <div className="text-center py-12 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="font-serif text-xl font-light text-stone-900">Auspicious Account Created!</h3>
          <p className="text-xs text-stone-500 font-sans">Logging you into Vlaksha Crafts Studio...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 text-xs py-3 px-4 rounded-none font-sans">
              {error.includes('operation-not-allowed') ? (
                <div className="text-left space-y-3">
                  <div className="font-bold text-sm text-red-900 flex items-center gap-1.5">
                    ⚠️ Email/Password Auth Disabled in Firebase Project
                  </div>
                  <p className="text-xs text-red-800 leading-relaxed">
                    The <strong>Email/Password</strong> sign-in provider is not enabled in your custom Firebase project (<code>vlaksha-crafts-27a0d</code>) yet.
                  </p>
                  <div className="bg-white/60 p-3 border border-red-200/50 space-y-2 text-[11px] text-stone-700 leading-relaxed">
                    <p className="font-semibold text-[var(--theme-accent)]">How to enable it:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Go to the <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-[var(--theme-primary)] underline font-bold">Firebase Console</a></li>
                      <li>Select your project <strong>vlaksha-crafts-27a0d</strong></li>
                      <li>Go to <strong>Authentication</strong> &gt; <strong>Sign-in method</strong></li>
                      <li>Click <strong>Add new provider</strong>, select <strong>Email/Password</strong>, check <strong>Enable</strong>, and click <strong>Save</strong>.</li>
                    </ol>
                  </div>
                  <div className="pt-2 border-t border-red-200/40">
                    <button
                      type="button"
                      onClick={async () => {
                        setError('');
                        setLoading(true);
                        try {
                          const res = await dbService.loginUserWithDemo();
                          if (res.success && res.user) {
                            onAuthSuccess(res.user);
                          }
                        } catch (err: any) {
                          setError('Failed to login with demo client.');
                        } finally {
                          setLoading(false);
                        }
                      }}
                      className="w-full py-2 bg-[var(--theme-accent)] hover:bg-[var(--theme-primary)] text-white font-sans text-[11px] font-semibold uppercase tracking-wider transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[var(--theme-primary)]" />
                      <span>✨ Instant Sandbox Client Bypass (Single Click)</span>
                    </button>
                  </div>
                </div>
              ) : error.includes('popup-closed-by-user') || error.includes('popup') ? (
                <div className="text-left space-y-3">
                  <div className="font-bold text-sm text-red-900 flex items-center gap-1.5">
                    ⚠️ Google Auth Popup Blocked or Closed
                  </div>
                  <p className="text-xs text-red-800 leading-relaxed">
                    The Google Sign-In popup window was closed, or blocked by your browser because the preview runs inside an <code>iframe</code> environment.
                  </p>
                  <div className="pt-2 border-t border-red-200/40">
                    <button
                      type="button"
                      onClick={async () => {
                        setError('');
                        setLoading(true);
                        try {
                          const res = await dbService.loginUserWithDemo();
                          if (res.success && res.user) {
                            onAuthSuccess(res.user);
                          }
                        } catch (err: any) {
                          setError('Failed to login with demo client.');
                        } finally {
                          setLoading(false);
                        }
                      }}
                      className="w-full py-2 bg-[var(--theme-accent)] hover:bg-[var(--theme-primary)] text-white font-sans text-[11px] font-semibold uppercase tracking-wider transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[var(--theme-primary)]" />
                      <span>✨ Instant Sandbox Client Bypass (Single Click)</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-center">{error}</div>
                  <div className="pt-1 flex justify-center">
                    <button
                      type="button"
                      onClick={async () => {
                        setError('');
                        setLoading(true);
                        try {
                          const res = await dbService.loginUserWithDemo();
                          if (res.success && res.user) {
                            onAuthSuccess(res.user);
                          }
                        } catch (err: any) {
                          setError('Failed to login with demo client.');
                        } finally {
                          setLoading(false);
                        }
                      }}
                      className="py-1.5 px-4 bg-stone-100 hover:bg-[var(--theme-accent)] hover:text-white border border-stone-300 text-stone-700 font-sans text-[10px] font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-[var(--theme-primary)]" />
                      <span>Single-Click Demo Sign In</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab switches */}
          <div className="flex border-b border-[var(--theme-primary)]/15">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-3 text-center font-serif text-sm font-light tracking-wide border-b-2 transition-all ${
                mode === 'login'
                  ? 'border-[var(--theme-accent)] text-[var(--theme-accent)] font-semibold'
                  : 'border-transparent text-stone-400 hover:text-[var(--theme-primary)]'
              }`}
            >
              Sign In to Account
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-3 text-center font-serif text-sm font-light tracking-wide border-b-2 transition-all ${
                mode === 'register'
                  ? 'border-[var(--theme-accent)] text-[var(--theme-accent)] font-semibold'
                  : 'border-transparent text-stone-400 hover:text-[var(--theme-primary)]'
              }`}
            >
              Register New Client
            </button>
          </div>

          <div className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-stone-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-4 w-4 text-stone-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Harshit Dhasmana"
                    className="w-full text-xs py-2.5 pl-10 pr-3 rounded-none border border-[var(--theme-primary)]/25 focus:outline-hidden focus:border-[var(--theme-accent)] bg-white font-sans"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-stone-700 mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-stone-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. client@example.com"
                    className="w-full text-xs py-2.5 pl-10 pr-3 rounded-none border border-[var(--theme-primary)]/25 focus:outline-hidden focus:border-[var(--theme-accent)] bg-white font-sans"
                  />
                </div>
              </div>

              {mode === 'register' ? (
                <div>
                  <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-stone-700 mb-1.5">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-4 w-4 text-stone-400" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full text-xs py-2.5 pl-10 pr-3 rounded-none border border-[var(--theme-primary)]/25 focus:outline-hidden focus:border-[var(--theme-accent)] bg-white font-mono"
                    />
                  </div>
                </div>
              ) : null}
            </div>

            <div>
              <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-stone-700 mb-1.5">
                Password <span className="text-red-500">*</span> {mode === 'register' ? <span className="text-stone-400 font-normal">(Min. 6 characters)</span> : ''}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-stone-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs py-2.5 pl-10 pr-10 rounded-none border border-[var(--theme-primary)]/25 focus:outline-hidden focus:border-[var(--theme-accent)] bg-white font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div className="mt-4 pt-4 border-t border-[var(--theme-primary)]/10 space-y-3">
                <span className="text-[10px] font-sans uppercase tracking-widest font-bold text-[var(--theme-primary)] block">
                  Shipping Address (Pre-fills checkout form)
                </span>
                
                <div>
                  <label className="block text-[9px] font-sans uppercase tracking-wider text-stone-500 mb-1">
                    Street Address / Sector / Flat No
                  </label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="e.g. Flat 501, Tower B, Sector 15"
                    className="w-full text-xs py-2 px-3 rounded-none border border-stone-200 focus:outline-hidden focus:border-[var(--theme-accent)] bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-sans uppercase tracking-wider text-stone-500 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Noida"
                      className="w-full text-xs py-2 px-3 rounded-none border border-stone-200 focus:outline-hidden bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-sans uppercase tracking-wider text-stone-500 mb-1">
                      State / Region
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. Uttar Pradesh"
                      className="w-full text-xs py-2 px-3 rounded-none border border-stone-200 focus:outline-hidden bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-sans uppercase tracking-wider text-stone-500 mb-1">
                      ZIP / Postal Code
                    </label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="e.g. 201301"
                      className="w-full text-xs py-2 px-3 rounded-none border border-stone-200 focus:outline-hidden bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-sans uppercase tracking-wider text-stone-500 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="e.g. India"
                      className="w-full text-xs py-2 px-3 rounded-none border border-stone-200 focus:outline-hidden bg-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[var(--theme-accent)] hover:bg-[var(--theme-primary)] disabled:bg-stone-300 disabled:text-stone-500 text-white font-sans text-xs font-semibold tracking-widest uppercase transition-colors shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>{loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create & Login')}</span>
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-stone-500" />
            ) : (
              <ArrowRight className="w-3.5 h-3.5" />
            )}
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-[var(--theme-primary)]/15"></div>
            <span className="flex-shrink mx-4 text-[9px] font-sans uppercase tracking-widest text-stone-400">or use google</span>
            <div className="flex-grow border-t border-[var(--theme-primary)]/15"></div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={async () => {
              setError('');
              setLoading(true);
              try {
                const res = await dbService.loginUserWithGoogle();
                if (res.success && res.user) {
                  onAuthSuccess(res.user);
                } else {
                  setError(res.error || 'Google Sign-In failed.');
                }
              } catch (err: any) {
                console.error("Google login component error:", err);
                setError(err.message || 'Google Sign-In failed.');
              } finally {
                setLoading(false);
              }
            }}
            className="w-full py-2.5 px-4 bg-white hover:bg-stone-50 text-stone-700 border border-stone-300/80 font-sans text-xs font-semibold tracking-wide transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-[var(--theme-primary)]/15"></div>
            <span className="flex-shrink mx-4 text-[9px] font-sans uppercase tracking-widest text-stone-400">or bypass auth</span>
            <div className="flex-grow border-t border-[var(--theme-primary)]/15"></div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={async () => {
              setError('');
              setLoading(true);
              try {
                const res = await dbService.loginUserWithDemo();
                if (res.success && res.user) {
                  onAuthSuccess(res.user);
                }
              } catch (err: any) {
                console.error("Demo login error:", err);
                setError('Failed to login with demo client.');
              } finally {
                setLoading(false);
              }
            }}
            className="w-full py-2.5 px-4 bg-amber-50/20 hover:bg-amber-50/50 text-stone-850 border border-amber-500/30 font-sans text-xs font-semibold tracking-wide transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-[var(--theme-primary)] animate-pulse" />
            <span>⚡ Instant Sandbox Client Bypass (Single Click)</span>
          </button>
        </form>
      )}

      {/* Footer hint */}
      <div className="mt-6 pt-4 border-t border-[var(--theme-primary)]/10 text-center">
        <p className="text-[10px] font-sans text-stone-400">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => { setMode('register'); setError(''); }}
                className="text-[var(--theme-primary)] font-bold hover:underline"
              >
                Register as new client
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => { setMode('login'); setError(''); }}
                className="text-[var(--theme-primary)] font-bold hover:underline"
              >
                Sign in here
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
