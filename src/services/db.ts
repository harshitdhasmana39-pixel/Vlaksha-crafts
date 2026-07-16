import { Product, Order, Review, CartItem, AdminAnalytics, User, StudioSettings } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import { saveOrderToFirestore, updateOrderInFirestore, getOrdersFromFirestore, getUserByEmailFromFirestore, saveUserToFirestore, auth, GoogleAuthProvider, signInWithPopup, getSettingsFromFirestore, saveSettingsToFirestore } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';

const PRODUCTS_KEY = 'vlaksha_products';
const ORDERS_KEY = 'vlaksha_orders';
const REVIEWS_KEY = 'vlaksha_reviews';
const ADMIN_AUTH_KEY = 'vlaksha_admin_auth';
const USERS_KEY = 'vlaksha_users';
const CURRENT_USER_KEY = 'vlaksha_current_user';
const SETTINGS_KEY = 'vlaksha_settings';

export const DEFAULT_SETTINGS: StudioSettings = {
  announcementText: 'Handcrafted Mud-Mirror Lippan Art & Mandalas by Laksha Kandpal',
  heroSubtitle: 'Auspicious Sacred Geometry',
  heroTitle: 'Intricate Lippan Mud-Mirror reliefs & sacred mandalas',
  heroDescription: 'Bring divine order, harmony, and shimmering beauty to your home with hand-painted mud-reliefs, custom wall clocks, and personalized nameplates, masterfully painted by artist Laksha Kandpal.',
  heroButtonText: 'Explore Handcrafted Catalog',
  heroImageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600&auto=format&fit=crop',
  contactEmail: 'harshitdhasmana39@gmail.com',
  contactPhone: '+91 95481 23456',
  contactAddress: 'Noida, National Capital Region (NCR), India',
  founderImageUrl: 'https://images.unsplash.com/photo-1614283233556-f35b0c801ef1?q=80&w=600&auto=format&fit=crop',
  additionalAdmins: '',
  themePreset: 'classic',
  primaryColor: '#c5a059',
  accentColor: '#1a2a4e',
  bgColor: '#FCFBF7',
  bgAltColor: '#F4F1EA',
  announcementBg: '#1a2a4e',
  announcementTextColor: '#ffffff',
  enableGlowEffects: true,
  categories: [
    { 
      id: 'mandala-wall-plates', 
      label: 'Mandala Wall Plates', 
      desc: 'Circular mirror-inlays', 
      icon: '❃', 
      color: 'bg-[#f8f5ef]', 
      index: '01', 
      iconColor: 'text-amber-600 bg-amber-500/10', 
      imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600&auto=format&fit=crop',
      imageUrls: [
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1609137144813-2d2bc00938b8?q=80&w=600&auto=format&fit=crop'
      ]
    },
    { 
      id: 'wall-clocks', 
      label: 'Wall Clocks', 
      desc: 'Silent sweep movements', 
      icon: '◔', 
      color: 'bg-[var(--theme-accent)] text-white', 
      index: '02', 
      iconColor: 'text-[var(--theme-primary)] bg-white/10', 
      imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=600&auto=format&fit=crop',
      imageUrls: [
        'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600&auto=format&fit=crop'
      ]
    },
    { 
      id: 'personalized-name-plates', 
      label: 'Custom Name Plates', 
      desc: 'Sanskrit & Hindi calligraphy', 
      icon: '✎', 
      color: 'bg-[#f8f5ef]', 
      index: '03', 
      iconColor: 'text-emerald-700 bg-emerald-500/10', 
      imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop',
      imageUrls: [
        'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop'
      ]
    },
    { 
      id: 'religious-festive-art', 
      label: 'Religious & Festive', 
      desc: 'Auspicious puja wall panels', 
      icon: 'ॐ', 
      color: 'bg-[#f8f5ef]', 
      index: '04', 
      iconColor: 'text-red-700 bg-red-500/10', 
      imageUrl: 'https://images.unsplash.com/photo-1609137144813-2d2bc00938b8?q=80&w=600&auto=format&fit=crop',
      imageUrls: [
        'https://images.unsplash.com/photo-1609137144813-2d2bc00938b8?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600&auto=format&fit=crop'
      ]
    },
    { 
      id: 'decor-accents', 
      label: 'Décor Accents', 
      desc: 'Lotus medallions & gifts', 
      icon: '📿', 
      color: 'bg-[#f8f5ef]', 
      index: '05', 
      iconColor: 'text-purple-700 bg-purple-500/10', 
      imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop',
      imageUrls: [
        'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=600&auto=format&fit=crop'
      ]
    }
  ],
  studioTourVideoUrl: 'https://www.youtube.com/embed/N0fL9U6j_F4',
  studioTourThumbnailUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop',
  studioTourTitle: 'Watch Laksha Craft a Lippan Mirror Plate',
  studioTourDescription: 'Witness the mud relieving, the fine calligraphy detailing, and how dozens of glass shards are aligned to form sacred geometric mandalas.'
};

// Helper to initialize local storage with static data if empty
function initializeStorage() {
  if (!localStorage.getItem(SETTINGS_KEY)) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
  }
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(PRODUCTS_KEY)) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
  }
  if (!localStorage.getItem(ORDERS_KEY)) {
    // Let's seed a couple of orders so the Admin Panel has nice charts and data to show out-of-the-box!
    const seedOrders: Order[] = [
      {
        id: 'ord-1001',
        customerName: 'Aarav Sharma',
        email: 'aarav.sharma@example.com',
        phone: '+91 98765 43210',
        address: {
          street: 'Block C-4, Sector 62',
          city: 'Noida',
          state: 'Uttar Pradesh',
          zipCode: '201301',
          country: 'India'
        },
        items: [
          {
            id: 'p1-12-royal-indigo',
            product: INITIAL_PRODUCTS[0], // Royal Indigo Lippan Plate
            quantity: 1,
            size: '12 inches',
            color: { name: 'Royal Indigo', value: '#1E3A8A' }
          }
        ],
        paymentMethod: 'UPI',
        paymentStatus: 'completed',
        orderStatus: 'shipped',
        totalAmount: 1850,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
        customNotes: 'Please wrap it securely as a housewarming gift!'
      },
      {
        id: 'ord-1002',
        customerName: 'Priya Patel',
        email: 'priya.patel@gmail.com',
        phone: '+91 87654 32109',
        address: {
          street: 'Apt 402, Lotus Residency, Juhu',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400049',
          country: 'India'
        },
        items: [
          {
            id: 'p3-14-personalized',
            product: INITIAL_PRODUCTS[2], // Personalized Name Plate
            quantity: 1,
            size: '14 x 6 inches (Standard)',
            color: { name: 'Warm Saffron & Maroon', value: '#EA580C' },
            personalization: {
              text: 'राधा कृष्ण / RADHA & KRISHNA',
              language: 'Hindi'
            }
          }
        ],
        paymentMethod: 'Razorpay_Test',
        paymentStatus: 'completed',
        orderStatus: 'in_progress',
        totalAmount: 2950,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        customNotes: 'Please add blue tassels if possible'
      }
    ];
    localStorage.setItem(ORDERS_KEY, JSON.stringify(seedOrders));
  }
  
  if (!localStorage.getItem(REVIEWS_KEY)) {
    // Seed initial reviews
    const seedReviews: Review[] = [
      {
        id: 'rev-1',
        productId: 'p1',
        userName: 'Anjali Gupta',
        rating: 5,
        comment: 'This lippan art plate is absolutely stunning! The mirror placements are extremely precise, and the indigo color looks so royal on my wall. It has a beautiful handcrafted texture. Packaged really well too!',
        date: 'June 28, 2026'
      },
      {
        id: 'rev-2',
        productId: 'p1',
        userName: 'Rohan Mehta',
        rating: 5,
        comment: 'Beautiful craftsmanship. Lakshas attention to detail is evident in every single line. Will definitely purchase more wall plates as festive gifts.',
        date: 'July 2, 2026'
      },
      {
        id: 'rev-3',
        productId: 'p2',
        userName: 'Kiran Desai',
        rating: 5,
        comment: 'The clock looks gorgeous in my study. The quiet sweep mechanism is completely silent, and the hand-painted mandala is mesmerizing. Best artistic purchase of the year.',
        date: 'June 15, 2026'
      },
      {
        id: 'rev-4',
        productId: 'p3',
        userName: 'Meera Nair',
        rating: 5,
        comment: 'Extremely satisfied with the personalized name plate! The calligraphy is gorgeous, and the hanging tassels and pearls give it a true traditional look. Highly recommend!',
        date: 'July 5, 2026'
      }
    ];
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(seedReviews));
  }
}

// Invoke initialization
initializeStorage();

export const dbService = {
  // PRODUCTS api
  getProducts(): Product[] {
    const data = localStorage.getItem(PRODUCTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  getProductById(id: string): Product | undefined {
    return this.getProducts().find(p => p.id === id);
  },

  saveProduct(product: Product): void {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index > -1) {
      products[index] = product;
    } else {
      products.push(product);
    }
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  },

  deleteProduct(id: string): void {
    const products = this.getProducts();
    const filtered = products.filter(p => p.id !== id);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(filtered));
  },

  // ORDERS api
  getOrders(): Order[] {
    const data = localStorage.getItem(ORDERS_KEY);
    const orders: Order[] = data ? JSON.parse(data) : [];
    // Sort from newest to oldest
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getOrderById(id: string): Order | undefined {
    return this.getOrders().find(o => o.id === id);
  },

  async createOrder(order: Order): Promise<void> {
    const orders = this.getOrders();
    orders.push(order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    // Save to Firestore in background/await
    await saveOrderToFirestore(order);
  },

  async updateOrderStatus(orderId: string, status: Order['orderStatus']): Promise<void> {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index > -1) {
      orders[index].orderStatus = status;
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
      // Save to Firestore
      await updateOrderInFirestore(orderId, { orderStatus: status });
    }
  },

  async updateOrder(orderId: string, updates: Partial<Order>): Promise<void> {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index > -1) {
      orders[index] = { ...orders[index], ...updates };
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
      // Save to Firestore
      await updateOrderInFirestore(orderId, updates);
    }
  },

  async updateOrderPaymentStatus(orderId: string, status: Order['paymentStatus']): Promise<void> {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index > -1) {
      orders[index].paymentStatus = status;
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
      // Save to Firestore
      await updateOrderInFirestore(orderId, { paymentStatus: status });
    }
  },

  // REVIEWS api
  getReviews(productId?: string): Review[] {
    const data = localStorage.getItem(REVIEWS_KEY);
    const reviews: Review[] = data ? JSON.parse(data) : [];
    if (productId) {
      return reviews.filter(r => r.productId === productId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    return reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  addReview(productId: string, userName: string, rating: number, comment: string, photoUrl?: string): void {
    const reviews = this.getReviews();
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      productId,
      userName: userName || 'Anonymous Client',
      rating,
      comment,
      photoUrl,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    };
    reviews.push(newReview);
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));

    // Update product average rating & reviewsCount
    const products = this.getProducts();
    const pIndex = products.findIndex(p => p.id === productId);
    if (pIndex > -1) {
      const productReviews = reviews.filter(r => r.productId === productId);
      const totalRating = productReviews.reduce((sum, r) => sum + r.rating, 0);
      products[pIndex].rating = parseFloat((totalRating / productReviews.length).toFixed(1));
      products[pIndex].reviewsCount = productReviews.length;
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    }
  },

  // AUTH api
  isEmailAuthorizedAdmin(email: string): boolean {
    const emailLower = email.trim().toLowerCase();
    if (emailLower === 'harshitdhasmana39@gmail.com') {
      return true;
    }
    const settings = this.getSettings();
    const additional = settings.additionalAdmins || '';
    const allowedList = additional.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
    return allowedList.includes(emailLower);
  },

  verifyAdminCredentials(email: string, pass: string): boolean {
    const emailNormalized = email.trim().toLowerCase();
    const passNormalized = pass.trim();
    
    if (!this.isEmailAuthorizedAdmin(emailNormalized)) {
      return false;
    }
    
    const isSuccess = passNormalized === '0789';
    if (isSuccess) {
      sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
      
      const adminUser: User = {
        id: 'admin-harshit',
        name: 'Harshit Dhasmana (Admin)',
        email: emailNormalized,
        phone: '+91 98765 43210',
        address: {
          street: 'Vlaksha Crafts HQ',
          city: 'Bhuj',
          state: 'Gujarat',
          zipCode: '370001',
          country: 'India'
        }
      };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(adminUser));
    }
    return isSuccess;
  },

  verifyAdminPasscode(passcode: string): boolean {
    // For backward compatibility or direct passcode entry, allow '0789' as the admin passcode
    const normalized = passcode.trim();
    const isSuccess = normalized === '0789';
    if (isSuccess) {
      const currentUser = this.getCurrentUser();
      if (currentUser && this.isEmailAuthorizedAdmin(currentUser.email)) {
        sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
        return true;
      }
    }
    return false;
  },

  isAdminAuthenticated(): boolean {
    const isSessionAuth = sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true';
    if (!isSessionAuth) return false;
    
    const currentUser = this.getCurrentUser();
    if (!currentUser) return false;
    
    return this.isEmailAuthorizedAdmin(currentUser.email);
  },

  logoutAdmin(): void {
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
  },

  // ANALYTICS api
  getAnalytics(ordersToUse?: Order[]): AdminAnalytics {
    const allOrders = ordersToUse || this.getOrders();
    const completedOrders = allOrders.filter(o => o.paymentStatus === 'completed');
    const totalOrders = completedOrders.length;
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    const ordersByStatus = {
      received: allOrders.filter(o => o.orderStatus === 'received').length,
      in_progress: allOrders.filter(o => o.orderStatus === 'in_progress').length,
      shipped: allOrders.filter(o => o.orderStatus === 'shipped').length,
      delivered: allOrders.filter(o => o.orderStatus === 'delivered').length,
    };

    // Calculate best sellers
    const productSalesMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
    completedOrders.forEach(o => {
      o.items.forEach(item => {
        const pId = item.product.id;
        const subtotal = item.product.price * item.quantity;
        if (!productSalesMap[pId]) {
          productSalesMap[pId] = {
            name: item.product.name,
            quantity: 0,
            revenue: 0
          };
        }
        productSalesMap[pId].quantity += item.quantity;
        productSalesMap[pId].revenue += subtotal;
      });
    });

    const bestSellers = Object.entries(productSalesMap).map(([id, stats]) => ({
      productId: id,
      productName: stats.name,
      quantity: stats.quantity,
      revenue: stats.revenue
    })).sort((a, b) => b.quantity - a.quantity).slice(0, 5);

    return {
      totalOrders,
      totalRevenue,
      ordersByStatus,
      bestSellers
    };
  },

  // USER AUTH api
  getUsers(): User[] {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  async registerUser(user: Omit<User, 'id'> & { password?: string }): Promise<{ success: boolean; error?: string; user?: User }> {
    const emailLower = user.email.trim().toLowerCase();
    const registerPassword = user.password || 'vlaksha123';

    try {
      // 1. Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, emailLower, registerPassword);
      const firebaseUser = userCredential.user;

      // 2. Prepare the custom User object with Firebase Auth's UID
      const newUser: User = {
        name: user.name,
        email: emailLower,
        phone: user.phone,
        address: user.address,
        id: firebaseUser.uid,
        password: user.password
      };

      // 3. Save profile to Firestore
      await saveUserToFirestore(newUser);

      // 4. Save/Sync to LocalStorage users list
      const localUsers = this.getUsers();
      const existingIndex = localUsers.findIndex(u => u.id === newUser.id || u.email === newUser.email);
      if (existingIndex > -1) {
        localUsers[existingIndex] = newUser;
      } else {
        localUsers.push(newUser);
      }
      localStorage.setItem(USERS_KEY, JSON.stringify(localUsers));

      this.setCurrentUser(newUser);
      return { success: true, user: newUser };
    } catch (e: any) {
      console.error("Firebase registration error:", e);
      let errorMsg = 'Registration failed.';
      if (e.code === 'auth/email-already-in-use') {
        errorMsg = 'This email is already registered with an account.';
      } else if (e.code === 'auth/weak-password') {
        errorMsg = 'The password must be at least 6 characters.';
      } else if (e.code === 'auth/invalid-email') {
        errorMsg = 'The email address is badly formatted.';
      } else {
        errorMsg = e.message || errorMsg;
      }
      return { success: false, error: errorMsg };
    }
  },

  async loginUser(email: string, password?: string): Promise<{ success: boolean; error?: string; user?: User }> {
    const emailLower = email.trim().toLowerCase();
    const loginPassword = password || 'vlaksha123';

    // Intercept administrative login
    if (this.isEmailAuthorizedAdmin(emailLower) && loginPassword === '0789') {
      this.verifyAdminCredentials(emailLower, loginPassword);
      const adminUser = this.getCurrentUser()!;
      return { success: true, user: adminUser };
    }

    try {
      // 1. Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, emailLower, loginPassword);
      const firebaseUser = userCredential.user;

      // 2. Load the user's profile from Firestore
      let userProfile = await getUserByEmailFromFirestore(emailLower);

      // 3. Fallback/Create profile if it doesn't exist yet in Firestore
      if (!userProfile) {
        const localUsers = this.getUsers();
        const localUser = localUsers.find(u => u.email.toLowerCase() === emailLower);
        if (localUser) {
          userProfile = {
            ...localUser,
            id: firebaseUser.uid
          };
        } else {
          userProfile = {
            id: firebaseUser.uid,
            name: emailLower.split('@')[0],
            email: emailLower,
            phone: 'N/A',
            address: {
              street: 'N/A',
              city: 'N/A',
              state: 'N/A',
              zipCode: 'N/A',
              country: 'India'
            }
          };
        }
        await saveUserToFirestore(userProfile);
      } else {
        // Ensure standard sync
        if (userProfile.id !== firebaseUser.uid) {
          userProfile.id = firebaseUser.uid;
          await saveUserToFirestore(userProfile);
        }
      }

      // 4. Save/Sync to LocalStorage
      const localUsers = this.getUsers();
      const existingIndex = localUsers.findIndex(u => u.id === userProfile!.id || u.email === userProfile!.email);
      if (existingIndex > -1) {
        localUsers[existingIndex] = userProfile;
      } else {
        localUsers.push(userProfile);
      }
      localStorage.setItem(USERS_KEY, JSON.stringify(localUsers));

      this.setCurrentUser(userProfile);
      return { success: true, user: userProfile };
    } catch (e: any) {
      console.error("Firebase login error:", e);
      let errorMsg = 'Authentication failed.';
      if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
        errorMsg = 'Incorrect password or invalid credentials.';
      } else if (e.code === 'auth/user-not-found') {
        errorMsg = 'No registered client found with this email.';
      } else if (e.code === 'auth/invalid-email') {
        errorMsg = 'The email address is badly formatted.';
      } else {
        errorMsg = e.message || errorMsg;
      }
      return { success: false, error: errorMsg };
    }
  },

  async loginUserWithGoogle(): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;
      const emailLower = (firebaseUser.email || "").trim().toLowerCase();

      if (!emailLower) {
        return { success: false, error: 'Failed to retrieve email from Google Account.' };
      }

      // Load user profile from Firestore
      let userProfile = await getUserByEmailFromFirestore(emailLower);

      if (!userProfile) {
        // Create new profile for Google user
        userProfile = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || emailLower.split('@')[0],
          email: emailLower,
          phone: firebaseUser.phoneNumber || 'N/A',
          address: {
            street: 'N/A',
            city: 'N/A',
            state: 'N/A',
            zipCode: 'N/A',
            country: 'India'
          }
        };
        await saveUserToFirestore(userProfile);
      } else {
        // Ensure standard sync
        if (userProfile.id !== firebaseUser.uid) {
          userProfile.id = firebaseUser.uid;
          await saveUserToFirestore(userProfile);
        }
      }

      // Save/Sync to LocalStorage
      const localUsers = this.getUsers();
      const existingIndex = localUsers.findIndex(u => u.id === userProfile!.id || u.email === userProfile!.email);
      if (existingIndex > -1) {
        localUsers[existingIndex] = userProfile;
      } else {
        localUsers.push(userProfile);
      }
      localStorage.setItem(USERS_KEY, JSON.stringify(localUsers));

      this.setCurrentUser(userProfile);
      return { success: true, user: userProfile };
    } catch (e: any) {
      console.error("Firebase Google Auth error:", e);
      let errorMsg = 'Google Sign-In failed.';
      if (e.code === 'auth/popup-closed-by-user') {
        errorMsg = 'Sign-in popup was closed before completing.';
      } else if (e.code === 'auth/cancelled-popup-request') {
        errorMsg = 'Sign-in request was cancelled.';
      } else {
        errorMsg = e.message || errorMsg;
      }
      return { success: false, error: errorMsg };
    }
  },

  async loginUserWithDemo(customName?: string, customEmail?: string): Promise<{ success: boolean; user: User }> {
    const demoEmail = (customEmail || "demo.client@vlakshacrafts.com").trim().toLowerCase();
    const demoName = customName || "Auspicious Client";
    const demoUserId = `demo-${Date.now()}`;
    const userProfile: User = {
      id: demoUserId,
      name: demoName,
      email: demoEmail,
      phone: "+91 98765 43210",
      address: {
        street: "Lippan Art Marg, Sector 4",
        city: "Bhuj",
        state: "Gujarat",
        zipCode: "370001",
        country: "India"
      }
    };

    // Save/Sync to Firestore in background (so orders show up)
    try {
      await saveUserToFirestore(userProfile);
    } catch (e) {
      console.warn("Could not sync demo user to Firestore, falling back to local simulation:", e);
    }

    // Save/Sync to LocalStorage
    const localUsers = this.getUsers();
    const existingIndex = localUsers.findIndex(u => u.id === userProfile.id || u.email === userProfile.email);
    if (existingIndex > -1) {
      localUsers[existingIndex] = userProfile;
    } else {
      localUsers.push(userProfile);
    }
    localStorage.setItem(USERS_KEY, JSON.stringify(localUsers));

    this.setCurrentUser(userProfile);
    return { success: true, user: userProfile };
  },

  getCurrentUser(): User | null {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  },

  logoutUser(): void {
    firebaseSignOut(auth).catch(err => console.error("Firebase signout error:", err));
    this.setCurrentUser(null);
  },

  async updateUserProfile(userId: string, updatedFields: Partial<User>): Promise<{ success: boolean; error?: string; user?: User }> {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    let updatedUser: User;

    if (index > -1) {
      updatedUser = { ...users[index], ...updatedFields };
      users[index] = updatedUser;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } else {
      const current = this.getCurrentUser();
      if (current && current.id === userId) {
        updatedUser = { ...current, ...updatedFields };
        users.push(updatedUser);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
      } else {
        return { success: false, error: 'User not found.' };
      }
    }

    // Sync to Firestore
    try {
      await saveUserToFirestore(updatedUser);
    } catch (e) {
      console.error("Failed to sync updated profile to Firestore:", e);
    }

    this.setCurrentUser(updatedUser);
    return { success: true, user: updatedUser };
  },

  // SETTINGS api
  getSettings(): StudioSettings {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) return DEFAULT_SETTINGS;
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: StudioSettings): void {
    const merged = { ...DEFAULT_SETTINGS, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
    saveSettingsToFirestore(merged).catch(err => {
      console.error("Failed to save settings to Firestore:", err);
    });
  },

  async syncSettingsFromFirestore(): Promise<StudioSettings> {
    try {
      const fsSettings = await getSettingsFromFirestore();
      if (fsSettings) {
        const merged = { ...DEFAULT_SETTINGS, ...fsSettings };
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
        return merged;
      }
    } catch (e) {
      console.error("Failed to sync settings from Firestore:", e);
    }
    return this.getSettings();
  }
};
