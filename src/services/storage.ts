import { 
  Listing, 
  PrivateDetails, 
  UnlockRecord, 
  PaymentRequest, 
  ListingReport, 
  Review, 
  UserProfile,
  Tenant
} from '../types';
import { 
  INITIAL_LISTINGS, 
  INITIAL_PRIVATE_DETAILS, 
  INITIAL_USERS, 
  INITIAL_REVIEWS, 
  INITIAL_AGENT_FEE,
  INITIAL_TENANTS
} from '../data/initialData';

const STORAGE_KEYS = {
  LISTINGS: 'uninest_listings_v1',
  PRIVATE_DETAILS: 'uninest_private_details_v1',
  USERS: 'uninest_users_v1',
  UNLOCKS: 'uninest_unlocks_v1',
  PAYMENTS: 'uninest_payments_v1',
  REPORTS: 'uninest_reports_v1',
  REVIEWS: 'uninest_reviews_v1',
  FAVORITES: 'uninest_favorites_v1',
  AGENT_FEE: 'uninest_agent_fee_v1',
  TENANTS: 'uninest_tenants_v1',
};

// Safe storage helper with fallback
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn(`Storage load error for ${key}:`, e);
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Storage save error for ${key}:`, e);
  }
}

export const StorageService = {
  // --- Agent Settings ---
  getAgentFee(): number {
    return loadFromStorage<number>(STORAGE_KEYS.AGENT_FEE, INITIAL_AGENT_FEE);
  },

  setAgentFee(newFee: number): void {
    saveToStorage(STORAGE_KEYS.AGENT_FEE, newFee);
  },

  // --- Users ---
  getUsers(): UserProfile[] {
    return loadFromStorage<UserProfile[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  },

  getUserById(id: string): UserProfile | undefined {
    return this.getUsers().find((u) => u.id === id);
  },

  // --- Listings ---
  getListings(): Listing[] {
    return loadFromStorage<Listing[]>(STORAGE_KEYS.LISTINGS, INITIAL_LISTINGS);
  },

  getListingById(id: string): Listing | undefined {
    return this.getListings().find((l) => l.id === id);
  },

  saveListing(listing: Listing, privateDetails?: PrivateDetails): void {
    const listings = this.getListings();
    const index = listings.findIndex((l) => l.id === listing.id);
    if (index >= 0) {
      listings[index] = listing;
    } else {
      listings.unshift(listing);
    }
    saveToStorage(STORAGE_KEYS.LISTINGS, listings);

    if (privateDetails) {
      const privMap = this.getAllPrivateDetailsMap();
      privMap[listing.id] = privateDetails;
      saveToStorage(STORAGE_KEYS.PRIVATE_DETAILS, privMap);
    }
  },

  deleteListing(id: string): void {
    const listings = this.getListings().filter((l) => l.id !== id);
    saveToStorage(STORAGE_KEYS.LISTINGS, listings);

    const privMap = this.getAllPrivateDetailsMap();
    delete privMap[id];
    saveToStorage(STORAGE_KEYS.PRIVATE_DETAILS, privMap);
  },

  // --- Private Details Security (Section 8 of specification) ---
  getAllPrivateDetailsMap(): Record<string, PrivateDetails> {
    return loadFromStorage<Record<string, PrivateDetails>>(
      STORAGE_KEYS.PRIVATE_DETAILS,
      INITIAL_PRIVATE_DETAILS
    );
  },

  /**
   * Protected access gate: only returns landlord phone and exact address
   * if user is admin, owner landlord, or student has paid unlock fee.
   */
  getPrivateDetailsForUser(
    listingId: string,
    currentUserId: string,
    currentUserRole: string
  ): PrivateDetails | null {
    const privMap = this.getAllPrivateDetailsMap();
    const details = privMap[listingId];
    if (!details) return null;

    // Admin has full verification access
    if (currentUserRole === 'admin') {
      return details;
    }

    // Landlord owner has access to their own listing
    const listing = this.getListingById(listingId);
    if (listing && listing.landlordId === currentUserId) {
      return details;
    }

    // Check if student has unlocked this listing
    const isUnlocked = this.hasUnlocked(currentUserId, listingId);
    if (isUnlocked) {
      return details;
    }

    // Otherwise strictly locked!
    return null;
  },

  // --- Unlocks ---
  getUnlocks(): UnlockRecord[] {
    return loadFromStorage<UnlockRecord[]>(STORAGE_KEYS.UNLOCKS, [
      {
        id: 'unl-demo-1',
        studentId: 'user-student-1',
        listingId: 'listing-1',
        amountPaid: 25,
        paymentMethod: 'mtn_momo',
        paymentReference: 'MTN-ZM-948102',
        unlockedAt: '2026-10-23T11:20:00Z',
        receiptNumber: 'REC-UN-10492',
      },
    ]);
  },

  hasUnlocked(studentId: string, listingId: string): boolean {
    const unlocks = this.getUnlocks();
    return unlocks.some((u) => u.studentId === studentId && u.listingId === listingId);
  },

  getUserUnlocks(studentId: string): UnlockRecord[] {
    return this.getUnlocks().filter((u) => u.studentId === studentId);
  },

  recordUnlock(
    studentId: string,
    listingId: string,
    amountPaid: number,
    paymentMethod: 'mtn_momo' | 'airtel_money' | 'card' | 'manual',
    paymentReference: string
  ): UnlockRecord {
    const unlocks = this.getUnlocks();
    const existing = unlocks.find((u) => u.studentId === studentId && u.listingId === listingId);
    if (existing) return existing;

    const receiptNumber = `REC-UN-${Math.floor(10000 + Math.random() * 90000)}`;
    const newRecord: UnlockRecord = {
      id: `unl-${Date.now()}`,
      studentId,
      listingId,
      amountPaid,
      paymentMethod,
      paymentReference,
      unlockedAt: new Date().toISOString(),
      receiptNumber,
    };

    unlocks.push(newRecord);
    saveToStorage(STORAGE_KEYS.UNLOCKS, unlocks);

    // Increment listing unlock count
    const listings = this.getListings();
    const listing = listings.find((l) => l.id === listingId);
    if (listing) {
      listing.unlockCount = (listing.unlockCount || 0) + 1;
      saveToStorage(STORAGE_KEYS.LISTINGS, listings);
    }

    return newRecord;
  },

  // --- Manual Payment Queue ---
  getPaymentRequests(): PaymentRequest[] {
    return loadFromStorage<PaymentRequest[]>(STORAGE_KEYS.PAYMENTS, [
      {
        id: 'pay-sample-1',
        studentId: 'user-student-1',
        studentName: 'Chileshe Mwape',
        studentPhone: '+260 97 123 4567',
        listingId: 'listing-2',
        listingTitle: 'Spacious 2-in-1 Shared Bedroom with Built-in Wardrobes',
        amount: 25,
        method: 'airtel_money',
        reference: 'AIRTEL-TX-7782190',
        screenshotUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=300&auto=format&fit=crop&q=80',
        status: 'pending',
        submittedAt: '2026-10-24T02:15:00Z',
      },
    ]);
  },

  submitPaymentRequest(req: Omit<PaymentRequest, 'id' | 'status' | 'submittedAt'>): PaymentRequest {
    const list = this.getPaymentRequests();
    const newReq: PaymentRequest = {
      ...req,
      id: `pay-${Date.now()}`,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    list.unshift(newReq);
    saveToStorage(STORAGE_KEYS.PAYMENTS, list);
    return newReq;
  },

  approvePaymentRequest(requestId: string): void {
    const list = this.getPaymentRequests();
    const req = list.find((p) => p.id === requestId);
    if (!req) return;
    req.status = 'approved';
    saveToStorage(STORAGE_KEYS.PAYMENTS, list);

    // Grant unlock
    this.recordUnlock(
      req.studentId,
      req.listingId,
      req.amount,
      req.method,
      req.reference || `APPROVED-${req.id}`
    );
  },

  rejectPaymentRequest(requestId: string): void {
    const list = this.getPaymentRequests();
    const req = list.find((p) => p.id === requestId);
    if (req) {
      req.status = 'rejected';
      saveToStorage(STORAGE_KEYS.PAYMENTS, list);
    }
  },

  // --- Favorites / Bookmarks ---
  getFavorites(studentId: string): string[] {
    const allFavs = loadFromStorage<Record<string, string[]>>(STORAGE_KEYS.FAVORITES, {});
    return allFavs[studentId] || [];
  },

  toggleFavorite(studentId: string, listingId: string): boolean {
    const allFavs = loadFromStorage<Record<string, string[]>>(STORAGE_KEYS.FAVORITES, {});
    const userFavs = allFavs[studentId] || [];
    const index = userFavs.indexOf(listingId);
    let isNowFavorite = false;

    if (index >= 0) {
      userFavs.splice(index, 1);
      isNowFavorite = false;
    } else {
      userFavs.push(listingId);
      isNowFavorite = true;
    }

    allFavs[studentId] = userFavs;
    saveToStorage(STORAGE_KEYS.FAVORITES, allFavs);
    return isNowFavorite;
  },

  // --- Reports ---
  getReports(): ListingReport[] {
    return loadFromStorage<ListingReport[]>(STORAGE_KEYS.REPORTS, [
      {
        id: 'rep-sample-1',
        listingId: 'listing-4',
        listingTitle: 'Budget-Friendly Bedspace in 4-Sharing Hall',
        reporterId: 'user-student-1',
        reporterName: 'Chileshe Mwape',
        reason: 'price_mismatch',
        comment: 'Caretaker said price increased to K750 when I arrived to view.',
        status: 'pending',
        createdAt: '2026-10-23T18:00:00Z',
      },
    ]);
  },

  submitReport(report: Omit<ListingReport, 'id' | 'status' | 'createdAt'>): ListingReport {
    const list = this.getReports();
    const newReport: ListingReport = {
      ...report,
      id: `rep-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    list.unshift(newReport);
    saveToStorage(STORAGE_KEYS.REPORTS, list);
    return newReport;
  },

  updateReportStatus(id: string, status: ListingReport['status']): void {
    const list = this.getReports();
    const item = list.find((r) => r.id === id);
    if (item) {
      item.status = status;
      saveToStorage(STORAGE_KEYS.REPORTS, list);
    }
  },

  // --- Reviews ---
  getReviews(): Review[] {
    return loadFromStorage<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  },

  getReviewsForListing(listingId: string): Review[] {
    return this.getReviews().filter((r) => r.listingId === listingId);
  },

  addReview(review: Omit<Review, 'id' | 'createdAt'>): Review {
    const list = this.getReviews();
    const newRev: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newRev);
    saveToStorage(STORAGE_KEYS.REVIEWS, list);

    // Recompute listing rating
    const listingReviews = list.filter((r) => r.listingId === review.listingId);
    const avg =
      listingReviews.reduce((acc, curr) => acc + curr.rating, 0) /
      (listingReviews.length || 1);

    const listings = this.getListings();
    const target = listings.find((l) => l.id === review.listingId);
    if (target) {
      target.rating = Number(avg.toFixed(1));
      target.reviewCount = listingReviews.length;
      saveToStorage(STORAGE_KEYS.LISTINGS, listings);
    }

    return newRev;
  },

  // --- Tenants & Room Occupancy Roster ---
  getTenants(): Tenant[] {
    return loadFromStorage<Tenant[]>(STORAGE_KEYS.TENANTS, INITIAL_TENANTS);
  },

  getTenantsByLandlord(landlordId: string): Tenant[] {
    return this.getTenants().filter((t) => t.landlordId === landlordId);
  },

  addTenant(tenantData: Omit<Tenant, 'id'>): Tenant {
    const list = this.getTenants();
    const newTenant: Tenant = {
      ...tenantData,
      id: `ten-${Date.now()}`,
    };
    list.unshift(newTenant);
    saveToStorage(STORAGE_KEYS.TENANTS, list);
    return newTenant;
  },

  updateTenant(tenant: Tenant): void {
    const list = this.getTenants();
    const idx = list.findIndex((t) => t.id === tenant.id);
    if (idx >= 0) {
      list[idx] = tenant;
      saveToStorage(STORAGE_KEYS.TENANTS, list);
    }
  },

  removeTenant(id: string): void {
    const list = this.getTenants().filter((t) => t.id !== id);
    saveToStorage(STORAGE_KEYS.TENANTS, list);
  },

  recordTenantPayment(tenantId: string, additionalMonths: number): Tenant | null {
    const list = this.getTenants();
    const tenant = list.find((t) => t.id === tenantId);
    if (!tenant) return null;

    // Extend paidUntilDate by additionalMonths
    const currentExpiry = new Date(tenant.paidUntilDate);
    const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();
    baseDate.setMonth(baseDate.getMonth() + additionalMonths);

    tenant.paidUntilDate = baseDate.toISOString().split('T')[0];
    tenant.monthsPaid = (tenant.monthsPaid || 0) + additionalMonths;
    tenant.paymentStatus = 'paid';
    tenant.lastPaymentDate = new Date().toISOString().split('T')[0];

    saveToStorage(STORAGE_KEYS.TENANTS, list);
    return tenant;
  },

  // --- Reset demo data helper ---
  resetToDefaults(): void {
    localStorage.removeItem(STORAGE_KEYS.LISTINGS);
    localStorage.removeItem(STORAGE_KEYS.PRIVATE_DETAILS);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.UNLOCKS);
    localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
    localStorage.removeItem(STORAGE_KEYS.REPORTS);
    localStorage.removeItem(STORAGE_KEYS.REVIEWS);
    localStorage.removeItem(STORAGE_KEYS.FAVORITES);
    localStorage.removeItem(STORAGE_KEYS.AGENT_FEE);
    localStorage.removeItem(STORAGE_KEYS.TENANTS);
  },
};
