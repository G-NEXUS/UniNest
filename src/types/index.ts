export type RoomType = 'single' | 'shared_2' | 'shared_4' | 'self_contained' | 'bedspace' | 'studio';

export type GenderRule = 'mixed' | 'female_only' | 'male_only';

export type ListingStatus = 'approved' | 'pending' | 'rejected' | 'taken';

export interface Amenity {
  id: string;
  name: string;
  icon: string;
  category: 'utilities' | 'comfort' | 'security';
}

export interface Listing {
  id: string;
  title: string;
  campus: string; // e.g. "Copperbelt University (CBU)", "University of Zambia (UNZA)"
  generalArea: string; // e.g. "Riverside, 5 mins from CBU West Gate" (NO plot/street number)
  price: number; // in ZMW
  pricePeriod: 'per_month' | 'per_term' | 'per_semester';
  roomType: RoomType;
  genderRule: GenderRule;
  distanceToCampus: string; // e.g. "400m / 5 min walk"
  photos: string[];
  description: string;
  amenities: string[];
  houseRules: string[];
  isVerifiedLandlord: boolean;
  status: ListingStatus;
  createdAt: string;
  landlordId: string;
  landlordNameDisplay: string; // e.g. "Mr. Banda (Hostel Manager)"
  rating: number;
  reviewCount: number;
  unlockCount: number;
  featured?: boolean;
}

export interface PrivateDetails {
  listingId: string;
  landlordFullName: string;
  landlordPhone: string;
  landlordWhatsApp: string;
  exactAddress: string; // e.g. "Plot 4182, Chitimukulu Road, Riverside, Kitwe"
  mapCoordinates: {
    lat: number;
    lng: number;
  };
  landmarkDirections: string;
  viewingHours: string;
  caretakerContact?: string;
  specialInstructions?: string;
}

export interface UnlockRecord {
  id: string;
  studentId: string;
  listingId: string;
  amountPaid: number;
  paymentMethod: 'mtn_momo' | 'airtel_money' | 'card' | 'manual';
  paymentReference: string;
  unlockedAt: string;
  receiptNumber: string;
}

export interface PaymentRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  listingId: string;
  listingTitle: string;
  amount: number;
  method: 'mtn_momo' | 'airtel_money' | 'card' | 'manual';
  reference: string;
  screenshotUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface ListingReport {
  id: string;
  listingId: string;
  listingTitle: string;
  reporterId: string;
  reporterName: string;
  reason: 'already_taken' | 'fake_listing' | 'wrong_phone' | 'price_mismatch' | 'safety_hazard' | 'other';
  comment: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface Review {
  id: string;
  listingId: string;
  studentName: string;
  studentProgram: string; // e.g. "2nd Year Engineering, CBU"
  rating: number;
  comment: string;
  createdAt: string;
  hasViewed: boolean;
}

export type UserRole = 'student' | 'landlord' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  isVerified?: boolean;
}

export interface Tenant {
  id: string;
  landlordId: string;
  listingId: string;
  roomNumber: string; // e.g. "Room 101", "Room 2B (Bed 1)"
  studentName: string;
  studentPhone: string;
  studentEmail?: string;
  studentProgram?: string; // e.g. "3rd Year Computer Science, CBU"
  nrcOrStudentId?: string;
  monthlyRent: number;
  monthsPaid: number;
  leaseStartDate: string;
  paidUntilDate: string; // e.g. "2027-01-24"
  paymentStatus: 'paid' | 'due_soon' | 'overdue';
  lastPaymentDate: string;
  notes?: string;
}

