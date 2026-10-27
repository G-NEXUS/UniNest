// UniNest is implemented with browser APIs only: semantic HTML templates, events, and localStorage.

// --- Sample records ---------------------------------------------------------
// These in-browser records keep the demonstration usable without a server.
const AMENITIES = [
  { id: "wifi", name: "High-speed Wi-Fi" },
  { id: "solar", name: "Solar / Inverter Backup" },
  { id: "water", name: "24/7 Borehole Water & Tank" },
  { id: "security", name: "Gated & Electric Fence" },
  { id: "guard", name: "Night Security Guard" },
  { id: "kitchen", name: "Communal Kitchen & Gas" },
  { id: "shower", name: "Hot Water Geyser" },
  { id: "desk", name: "Study Desk & Chair" },
  { id: "tiles", name: "Tiled Floor & Ceiling" },
  { id: "laundry", name: "Laundry Washing Bay" },
];

function svgDataUrl(svg) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function svgText(value) {
  return String(value || "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[character]));
}

function createLocalScene(label, palette = ["#0b1120", "#1d4ed8", "#38bdf8"]) {
  const [base, accent, highlight] = palette;
  const safeLabel = svgText(label).slice(0, 24);
  return svgDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520">
      <defs>
        <linearGradient id="room-bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${base}"/>
          <stop offset="100%" stop-color="${accent}"/>
        </linearGradient>
      </defs>
      <rect width="800" height="520" fill="url(#room-bg)"/>
      <rect x="0" y="310" width="800" height="210" fill="#081120" opacity="0.76"/>
      <rect x="58" y="142" width="298" height="168" rx="18" fill="${highlight}" opacity="0.28"/>
      <rect x="86" y="168" width="246" height="118" rx="12" fill="#0f172a" stroke="#93c5fd" stroke-width="6"/>
      <rect x="116" y="194" width="92" height="70" rx="10" fill="#dbeafe" opacity="0.9"/>
      <rect x="226" y="194" width="78" height="70" rx="10" fill="#bfdbfe" opacity="0.78"/>
      <rect x="430" y="170" width="250" height="146" rx="18" fill="#111827" stroke="#60a5fa" stroke-width="6"/>
      <rect x="466" y="210" width="84" height="72" rx="12" fill="#c7d2fe" opacity="0.95"/>
      <rect x="568" y="210" width="80" height="72" rx="12" fill="#93c5fd" opacity="0.8"/>
      <rect x="448" y="328" width="210" height="54" rx="12" fill="#1d4ed8" opacity="0.9"/>
      <path d="M100 378h600" stroke="#93c5fd" stroke-width="8" stroke-linecap="round" opacity="0.8"/>
      <circle cx="665" cy="108" r="42" fill="#facc15" opacity="0.8"/>
      <text x="58" y="96" fill="#e2e8f0" font-size="28" font-family="Arial, sans-serif" font-weight="700">${safeLabel}</text>
    </svg>
  `);
}

function createLocalAvatar(initials, palette = ["#1d4ed8", "#38bdf8", "#dbeafe"]) {
  const [primary, secondary, text] = palette;
  return svgDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <defs>
        <linearGradient id="avatar-bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${primary}"/>
          <stop offset="100%" stop-color="${secondary}"/>
        </linearGradient>
      </defs>
      <rect width="160" height="160" rx="32" fill="url(#avatar-bg)"/>
      <circle cx="80" cy="58" r="24" fill="${text}" opacity="0.92"/>
      <path d="M44 126c8-18 28-28 36-28s28 10 36 28" fill="${text}" opacity="0.92"/>
      <text x="80" y="128" text-anchor="middle" fill="#0f172a" font-size="32" font-weight="700" font-family="Arial, sans-serif">${svgText(initials)}</text>
    </svg>
  `);
}

const SAMPLE_PHOTOS = [
  createLocalScene("Executive room"),
  createLocalScene("Study desk"),
  createLocalScene("Shared suite"),
];
const FALLBACK_PHOTO = createLocalScene("UniNest room", ["#07142f", "#1d4ed8", "#93c5fd"]);
const PHOTO_DATABASE = "uninest_photos_v1";
const PHOTO_STORE = "photos";
const MAX_PHOTOS_PER_UPLOAD = 5;
const MAX_PHOTOS_PER_LISTING = 8;
const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;
const photoObjectUrls = new Map();
const pendingPhotoLoads = new Map();
const selectedPreviewUrls = [];
let photoDatabasePromise;
let slideshowTimer;

const INITIAL_USERS = [
  {
    id: "user-student-1",
    name: "Chileshe Mwape",
    phone: "+260 97 123 4567",
    email: "chileshe.m@cbu.edu.zm",
    role: "student",
    avatarUrl: createLocalAvatar("CM", ["#0f172a", "#3b82f6", "#eff6ff"]),
    isVerified: true,
  },
  {
    id: "user-landlord-1",
    name: "Mr. Emmanuel Banda",
    phone: "+260 96 888 2145",
    email: "emmanuel.banda@gmail.com",
    role: "landlord",
    avatarUrl: createLocalAvatar("EB", ["#172554", "#2563eb", "#dbeafe"]),
    isVerified: true,
  },
  {
    id: "user-landlord-2",
    name: "Mrs. Gertrude Phiri",
    phone: "+260 97 555 4321",
    email: "gertrude.phiri@outlook.com",
    role: "landlord",
    avatarUrl: createLocalAvatar("GP", ["#111827", "#60a5fa", "#f8fafc"]),
    isVerified: true,
  },
  {
    id: "user-admin-1",
    name: "UniNest Verification Agent",
    phone: "+260 97 999 0000",
    email: "agent@uninest.zm",
    role: "admin",
    avatarUrl: createLocalAvatar("UA", ["#0f172a", "#38bdf8", "#e0f2fe"]),
    isVerified: true,
  },
];

const INITIAL_LISTINGS = [
  {
    id: "listing-1",
    title: "Modern Executive Single Room with Backup Solar",
    campus: "Copperbelt University (CBU)",
    generalArea: "Riverside, 4 mins to CBU West Gate",
    price: 1850,
    pricePeriod: "per_month",
    roomType: "single",
    genderRule: "mixed",
    distanceToCampus: "350m / 4 min walk",
    photos: [
      createLocalScene("Executive room", ["#0b1120", "#1d4ed8", "#93c5fd"]),
      createLocalScene("Study desk", ["#0f172a", "#2563eb", "#cbd5e1"]),
      createLocalScene("Solar backup", ["#020617", "#1d4ed8", "#7dd3fc"]),
    ],
    description: "Freshly painted executive single room inside a quiet, newly paved compound. Features a dedicated study desk, heavy ceiling fan, and automated solar inverter that powers lights and Wi-Fi during ZESCO load shedding. Borehole water flows 24/7.",
    amenities: ["wifi", "solar", "water", "security", "guard", "kitchen", "shower", "desk", "tiles"],
    houseRules: ["No loud music after 21:00", "Visitors must leave by 20:00", "Clean kitchen after use"],
    isVerifiedLandlord: true,
    status: "approved",
    createdAt: "2026-10-18T10:00:00Z",
    landlordId: "user-landlord-1",
    landlordNameDisplay: "Mr. Banda (Banda Hostels)",
    rating: 4.9,
    reviewCount: 14,
    unlockCount: 28,
    featured: true,
  },
  {
    id: "listing-2",
    title: "Spacious 2-in-1 Shared Bedroom with Built-in Wardrobes",
    campus: "Copperbelt University (CBU)",
    generalArea: "Kwacha East, Near St. Kizito Catholic Church",
    price: 950,
    pricePeriod: "per_month",
    roomType: "shared_2",
    genderRule: "female_only",
    distanceToCampus: "800m / 9 min walk",
    photos: [
      createLocalScene("Shared room", ["#111827", "#2563eb", "#bfdbfe"]),
      createLocalScene("Wardrobe", ["#0f172a", "#1e3a8a", "#dbeafe"]),
      createLocalScene("Female suite", ["#111827", "#3b82f6", "#e0f2fe"]),
    ],
    description: "Clean, safe shared room for 2 female students. Each student gets their own 3x6 single bed, orthopaedic mattress, wide study desk, and 2-door wardrobe. The hostel is enclosed in high walls with electric wire fencing.",
    amenities: ["wifi", "water", "security", "guard", "kitchen", "shower", "desk", "tiles", "laundry"],
    houseRules: ["Strictly Female Students only", "Gate locked strictly at 21:30", "No overnight male visitors"],
    isVerifiedLandlord: true,
    status: "approved",
    createdAt: "2026-10-19T14:30:00Z",
    landlordId: "user-landlord-2",
    landlordNameDisplay: "Mrs. Phiri (Queen Esther Lodge)",
    rating: 4.8,
    reviewCount: 9,
    unlockCount: 42,
    featured: true,
  },
  {
    id: "listing-3",
    title: "Self-Contained Studio Flat with Private Toilet & Kitchenette",
    campus: "Copperbelt University (CBU)",
    generalArea: "Riverside Extension, 7 mins to CBU East Gate",
    price: 2400,
    pricePeriod: "per_month",
    roomType: "self_contained",
    genderRule: "mixed",
    distanceToCampus: "600m / 7 min walk",
    photos: [
      createLocalScene("Studio flat", ["#0b1120", "#2563eb", "#c7d2fe"]),
      createLocalScene("Kitchenette", ["#020617", "#1d4ed8", "#93c5fd"]),
      createLocalScene("Private bath", ["#111827", "#3b82f6", "#dbeafe"]),
    ],
    description: "High-end student studio apartment featuring private internal bathroom, instant hot shower, private sink & cooking station, plus prepaid ZESCO meter with shared backup generator.",
    amenities: ["wifi", "solar", "water", "security", "guard", "shower", "desk", "tiles"],
    houseRules: ["Respect fellow tenants during exam periods", "No loud parties on weeknights"],
    isVerifiedLandlord: true,
    status: "approved",
    createdAt: "2026-10-20T08:15:00Z",
    landlordId: "user-landlord-1",
    landlordNameDisplay: "Mr. Banda (Riverside Suites)",
    rating: 4.9,
    reviewCount: 21,
    unlockCount: 56,
    featured: true,
  },
  {
    id: "listing-4",
    title: "Budget-Friendly Bedspace in 4-Sharing Hall",
    campus: "Copperbelt University (CBU)",
    generalArea: "Eastlea, Near Riverside Police Post",
    price: 650,
    pricePeriod: "per_month",
    roomType: "shared_4",
    genderRule: "male_only",
    distanceToCampus: "500m / 6 min walk",
    photos: [
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&auto=format&fit=crop&q=80",
    ],
    description: "Affordable boarding bedspace for serious male students. Spacious room with 2 sturdy bunk beds, study library corner, high-speed fiber internet, and borehole water with 5,000L reserve tank.",
    amenities: ["wifi", "water", "security", "desk", "laundry", "kitchen"],
    houseRules: ["Male students only", "Strict study hours 19:00 - 22:00", "No alcohol in premises"],
    isVerifiedLandlord: false,
    status: "approved",
    createdAt: "2026-10-21T11:45:00Z",
    landlordId: "user-landlord-2",
    landlordNameDisplay: "Hostel Supervisor Lubinda",
    rating: 4.5,
    reviewCount: 6,
    unlockCount: 19,
    featured: false,
  },
  {
    id: "listing-5",
    title: "Prime Single Room in Quiet Residential Cul-de-Sac",
    campus: "Copperbelt University (CBU)",
    generalArea: "Parklands, 5 mins from CBU Main Campus",
    price: 1400,
    pricePeriod: "per_month",
    roomType: "single",
    genderRule: "mixed",
    distanceToCampus: "450m / 5 min walk",
    photos: [
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&auto=format&fit=crop&q=80",
    ],
    description: "Serene single room in a walled residential property with mango trees. Ideal for postgraduate or medical students who require absolute peace and zero noise for study.",
    amenities: ["wifi", "solar", "water", "security", "shower", "desk", "tiles", "kitchen"],
    houseRules: ["Strict quiet hours at all times", "No loud visitors", "Smoking prohibited"],
    isVerifiedLandlord: true,
    status: "approved",
    createdAt: "2026-10-22T09:00:00Z",
    landlordId: "user-landlord-1",
    landlordNameDisplay: "Dr. Musonda (Residential Court)",
    rating: 5,
    reviewCount: 8,
    unlockCount: 31,
    featured: false,
  },
  {
    id: "listing-6",
    title: "Brand New Self-Contained 1-Bed Apartment",
    campus: "Copperbelt University (CBU)",
    generalArea: "Nkana East, Near CBU Medical Campus",
    price: 2600,
    pricePeriod: "per_month",
    roomType: "self_contained",
    genderRule: "mixed",
    distanceToCampus: "300m / 3 min walk",
    photos: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80",
    ],
    description: "Ultra-modern studio flat with private balcony, fitted stove, full security gate, and solar backup system that powers everything during outages.",
    amenities: ["wifi", "solar", "water", "security", "guard", "shower", "desk", "tiles", "kitchen"],
    houseRules: ["Respect noise curfews", "Pets not permitted"],
    isVerifiedLandlord: true,
    status: "approved",
    createdAt: "2026-10-23T16:00:00Z",
    landlordId: "user-landlord-2",
    landlordNameDisplay: "Villa Prime Living",
    rating: 4.7,
    reviewCount: 5,
    unlockCount: 22,
    featured: false,
  },
  {
    id: "listing-7",
    title: "Pending Review: Twin En-Suite Bedroom near West Gate",
    campus: "Copperbelt University (CBU)",
    generalArea: "Riverside, Opposite Northrise Junction",
    price: 1100,
    pricePeriod: "per_month",
    roomType: "shared_2",
    genderRule: "female_only",
    distanceToCampus: "600m / 7 min walk",
    photos: ["https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?w=800&auto=format&fit=crop&q=80"],
    description: "Newly finished boarding house awaiting final agent inspection. Tile finishing, borehole with solar pump, and inside washroom.",
    amenities: ["wifi", "solar", "water", "security", "shower", "desk", "tiles"],
    houseRules: ["Female students only", "Gate closes at 21:00"],
    isVerifiedLandlord: true,
    status: "pending",
    createdAt: "2026-10-24T01:30:00Z",
    landlordId: "user-landlord-1",
    landlordNameDisplay: "Mr. Emmanuel Banda",
    rating: 0,
    reviewCount: 0,
    unlockCount: 0,
    featured: false,
  },
];

// Exact contact information is only rendered after the app's role/unlock check.
const INITIAL_PRIVATE_DETAILS = {
  "listing-1": {
    listingId: "listing-1",
    landlordFullName: "Mr. Emmanuel Banda",
    landlordPhone: "+260 96 888 2145",
    landlordWhatsApp: "+260968882145",
    exactAddress: "Plot 4182, Chitimukulu Road (3rd gate on left after Blue Kiosk), Riverside, Kitwe",
    mapCoordinates: { lat: -12.8024, lng: 28.2198 },
    landmarkDirections: "From CBU West Gate, walk down Chitimukulu Road past Riverside Police Post. It is the big navy blue sliding gate with black spikes and solar lamp on the right.",
    viewingHours: "Monday - Saturday: 08:30 to 17:30 (Ask for caretaker Mr. Mwila at the gate)",
    caretakerContact: "+260 97 441 9022 (Mr. Mwila)",
    specialInstructions: "Mention UniNest Agent Code #UN-4182 upon arrival. Please do NOT give rent cash to anyone other than Mr. Banda after physical room inspection.",
  },
  "listing-2": {
    listingId: "listing-2",
    landlordFullName: "Mrs. Gertrude Phiri",
    landlordPhone: "+260 97 555 4321",
    landlordWhatsApp: "+260975554321",
    exactAddress: "Plot 104, St. Kizito Crescent, Kwacha East, Kitwe",
    mapCoordinates: { lat: -12.8122, lng: 28.2312 },
    landmarkDirections: "Directly behind St. Kizito Catholic Church parish office, white wall fence with green razor wire.",
    viewingHours: "Daily 09:00 - 18:00 (Call 30 mins before arrival)",
    caretakerContact: "+260 95 332 1109 (Auntie Miriam)",
    specialInstructions: "Only prospective female students and guardians permitted for viewing inside the ladies wing.",
  },
  "listing-3": {
    listingId: "listing-3",
    landlordFullName: "Mr. Kangwa Chilufya (Property Manager)",
    landlordPhone: "+260 97 712 8890",
    landlordWhatsApp: "+260977128890",
    exactAddress: "Stand 2901, Corner of Zambezi Way & Luangwa Street, Marshlands, Lusaka",
    mapCoordinates: { lat: -15.3941, lng: 28.3294 },
    landmarkDirections: "Turn off Great East Road at the Marshlands shell station, 200m down Zambezi Way. Grey modern brick building with electric sliding gate.",
    viewingHours: "Weekdays 10:00 - 16:30, Saturdays 10:00 - 14:00",
    caretakerContact: "+260 96 220 8941 (Security Desk)",
    specialInstructions: "Show your UniNest unlock receipt on your phone to security at gate for visitor parking access.",
  },
  "listing-4": {
    listingId: "listing-4",
    landlordFullName: "Supervisor Lubinda Musonda",
    landlordPhone: "+260 96 345 6789",
    landlordWhatsApp: "+260963456789",
    exactAddress: "Plot 882, Eastlea Extension, off Riverside Road, Kitwe",
    mapCoordinates: { lat: -12.8055, lng: 28.2255 },
    landmarkDirections: "50 meters behind Eastlea mini-market, tall brick fence with yellow gate.",
    viewingHours: "Mon - Sun: 07:30 - 19:00",
    caretakerContact: "+260 97 888 1234",
    specialInstructions: "Ask for Lubinda. Bring student ID card for entry verification.",
  },
  "listing-5": {
    listingId: "listing-5",
    landlordFullName: "Dr. Patrick Musonda",
    landlordPhone: "+260 97 456 7890",
    landlordWhatsApp: "+260974567890",
    exactAddress: "Plot 14, Jacaranda Avenue, Town Centre Area, Kabwe",
    mapCoordinates: { lat: -14.4421, lng: 28.4489 },
    landmarkDirections: "Opposite Kabwe High School sports pavilion, cream gate with botanical garden.",
    viewingHours: "Weekdays after 16:00, Weekends 09:00 - 17:00",
    caretakerContact: "+260 96 991 2233 (Joseph)",
    specialInstructions: "Quiet residential property. Prior appointment via WhatsApp required.",
  },
  "listing-6": {
    listingId: "listing-6",
    landlordFullName: "Mrs. Violet Sinkala",
    landlordPhone: "+260 97 333 9988",
    landlordWhatsApp: "+260973339988",
    exactAddress: "Villa 18, Independence Avenue extension, Villa Elizabetha, Lusaka",
    mapCoordinates: { lat: -15.4182, lng: 28.2811 },
    landmarkDirections: "Right behind Cavendish University town campus, black gate with number 18 plaque.",
    viewingHours: "Daily 08:00 - 18:00",
    caretakerContact: "+260 95 111 4455",
    specialInstructions: "Self-guided smart lock viewing available upon calling Mrs. Sinkala.",
  },
  "listing-7": {
    listingId: "listing-7",
    landlordFullName: "Mr. Emmanuel Banda",
    landlordPhone: "+260 96 888 2145",
    landlordWhatsApp: "+260968882145",
    exactAddress: "Plot 554, Northrise Bypass Road, Riverside, Kitwe",
    mapCoordinates: { lat: -12.8033, lng: 28.2211 },
    landmarkDirections: "Beside Northrise junction bus stop.",
    viewingHours: "10:00 - 16:00",
  },
};

const INITIAL_REVIEWS = [
  {
    id: "rev-1",
    listingId: "listing-1",
    studentName: "Tembo K.",
    studentProgram: "3rd Year Computer Science, CBU",
    rating: 5,
    comment: "The solar inverter is real! During the 8-hour load shedding, my laptop and Wi-Fi remained fully operational. Mr. Banda is very prompt and courteous.",
    createdAt: "2026-10-21T12:00:00Z",
    hasViewed: true,
  },
  {
    id: "rev-2",
    listingId: "listing-1",
    studentName: "Natasha S.",
    studentProgram: "2nd Year Architecture, CBU",
    rating: 5,
    comment: "Exactly as shown in photos. Very clean study desk and strong water pressure in the shower.",
    createdAt: "2026-10-22T15:30:00Z",
    hasViewed: true,
  },
  {
    id: "rev-3",
    listingId: "listing-2",
    studentName: "Mercy B.",
    studentProgram: "1st Year Medicine, CBU",
    rating: 5,
    comment: "Super secure for female students. Auntie Miriam keeps the common areas clean and gate discipline is top notch.",
    createdAt: "2026-10-23T08:20:00Z",
    hasViewed: true,
  },
  {
    id: "rev-4",
    listingId: "listing-3",
    studentName: "Kondwani Z.",
    studentProgram: "4th Year Law, UNZA",
    rating: 5,
    comment: "Worth every Ngwee for peace of mind. Private kitchen means I can study late without disturbing anyone.",
    createdAt: "2026-10-23T19:10:00Z",
    hasViewed: true,
  },
];

const INITIAL_TENANTS = [
  {
    id: "ten-1", landlordId: "user-landlord-1", listingId: "listing-1",
    roomNumber: "Room 101 (Executive Single)", studentName: "Chileshe Mwape",
    studentPhone: "+260 97 123 4567", studentEmail: "chileshe.m@cbu.edu.zm",
    studentProgram: "3rd Year Computer Science, CBU", nrcOrStudentId: "CBU-2023-CS-041",
    monthlyRent: 1850, monthsPaid: 5, leaseStartDate: "2026-09-01",
    paidUntilDate: "2027-01-31", paymentStatus: "paid", lastPaymentDate: "2026-09-01",
    notes: "Paid 5 months upfront for semester 1. Key and gate remote issued.",
  },
  {
    id: "ten-2", landlordId: "user-landlord-1", listingId: "listing-1",
    roomNumber: "Room 102 (Single with Inverter)", studentName: "Mwamba Kangwa",
    studentPhone: "+260 96 441 8820", studentEmail: "mwamba.k@cbu.edu.zm",
    studentProgram: "2nd Year Electrical Engineering, CBU", nrcOrStudentId: "CBU-2024-ENG-119",
    monthlyRent: 1850, monthsPaid: 2, leaseStartDate: "2026-09-15",
    paidUntilDate: "2026-11-15", paymentStatus: "due_soon", lastPaymentDate: "2026-09-15",
    notes: "Due for renewal in less than 1 month.",
  },
  {
    id: "ten-3", landlordId: "user-landlord-1", listingId: "listing-1",
    roomNumber: "Room 103 (Standard Single)", studentName: "Natasha Simukonda",
    studentPhone: "+260 97 889 0012", studentEmail: "natasha.s@cbu.edu.zm",
    studentProgram: "2nd Year Architecture, CBU", nrcOrStudentId: "CBU-2024-ARC-088",
    monthlyRent: 1850, monthsPaid: 1, leaseStartDate: "2026-09-10",
    paidUntilDate: "2026-10-10", paymentStatus: "overdue", lastPaymentDate: "2026-09-10",
    notes: "Rent is 14 days overdue. Promised payment by Friday after allowance clears.",
  },
  {
    id: "ten-4", landlordId: "user-landlord-1", listingId: "listing-3",
    roomNumber: "Studio Flat 2A (En-suite Master)", studentName: "Kondwani Zulu",
    studentPhone: "+260 97 719 3321", studentEmail: "kondwani.z@unza.zm",
    studentProgram: "4th Year Law, UNZA", nrcOrStudentId: "UNZA-2022-LAW-302",
    monthlyRent: 2400, monthsPaid: 6, leaseStartDate: "2026-08-01",
    paidUntilDate: "2027-02-01", paymentStatus: "paid", lastPaymentDate: "2026-08-01",
    notes: "Full academic year deposit and first semester cleared.",
  },
  {
    id: "ten-5", landlordId: "user-landlord-2", listingId: "listing-2",
    roomNumber: "Room 2B - Bed 1 (Shared)", studentName: "Mercy Banda",
    studentPhone: "+260 95 330 9182", studentEmail: "mercy.b@cbu.edu.zm",
    studentProgram: "1st Year Medicine, CBU", nrcOrStudentId: "CBU-2025-MED-054",
    monthlyRent: 950, monthsPaid: 4, leaseStartDate: "2026-09-01",
    paidUntilDate: "2026-12-31", paymentStatus: "paid", lastPaymentDate: "2026-09-01",
    notes: "Quiet student, verified by Auntie Miriam.",
  },
];

const DEFAULT_UNLOCKS = [{
  id: "unl-demo-1",
  studentId: "user-student-1",
  listingId: "listing-1",
  amountPaid: 25,
  paymentMethod: "mtn_momo",
  paymentReference: "MTN-ZM-948102",
  unlockedAt: "2026-10-23T11:20:00Z",
  receiptNumber: "REC-UN-10492",
}];

const DEFAULT_PAYMENTS = [{
  id: "pay-sample-1",
  studentId: "user-student-1",
  studentName: "Chileshe Mwape",
  studentPhone: "+260 97 123 4567",
  listingId: "listing-2",
  listingTitle: "Spacious 2-in-1 Shared Bedroom with Built-in Wardrobes",
  amount: 25,
  method: "airtel_money",
  reference: "AIRTEL-TX-7782190",
  screenshotUrl: "",
  status: "pending",
  submittedAt: "2026-10-24T02:15:00Z",
}];

const DEFAULT_REPORTS = [{
  id: "rep-sample-1",
  listingId: "listing-4",
  listingTitle: "Budget-Friendly Bedspace in 4-Sharing Hall",
  reporterId: "user-student-1",
  reporterName: "Chileshe Mwape",
  reason: "price_mismatch",
  comment: "Caretaker said price increased to K750 when I arrived to view.",
  status: "pending",
  createdAt: "2026-10-23T18:00:00Z",
}];

// --- State and local persistence -------------------------------------------
// State holds transient screen selections; durable records use the original storage keys.
const STORAGE_KEYS = {
  listings: "uninest_listings_v1",
  privateDetails: "uninest_private_details_v1",
  users: "uninest_users_v1",
  unlocks: "uninest_unlocks_v1",
  payments: "uninest_payments_v1",
  reports: "uninest_reports_v1",
  reviews: "uninest_reviews_v1",
  favorites: "uninest_favorites_v1",
  fee: "uninest_agent_fee_v1",
  tenants: "uninest_tenants_v1",
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function readStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored === null ? clone(fallback) : JSON.parse(stored);
  } catch (error) {
    console.warn(`UniNest could not read local storage key "${key}".`, error);
    return clone(fallback);
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`UniNest could not save local storage key "${key}".`, error);
    toast("Your browser could not save this change. Check available storage and try again.");
    return false;
  }
}

const state = {
  users: readStorage(STORAGE_KEYS.users, INITIAL_USERS),
  currentUserId: "user-student-1",
  listings: readStorage(STORAGE_KEYS.listings, INITIAL_LISTINGS),
  privateDetails: readStorage(STORAGE_KEYS.privateDetails, INITIAL_PRIVATE_DETAILS),
  unlocks: readStorage(STORAGE_KEYS.unlocks, DEFAULT_UNLOCKS),
  payments: readStorage(STORAGE_KEYS.payments, DEFAULT_PAYMENTS),
  reports: readStorage(STORAGE_KEYS.reports, DEFAULT_REPORTS),
  reviews: readStorage(STORAGE_KEYS.reviews, INITIAL_REVIEWS),
  favoritesByUser: readStorage(STORAGE_KEYS.favorites, {}),
  tenants: readStorage(STORAGE_KEYS.tenants, INITIAL_TENANTS),
  agentFee: readStorage(STORAGE_KEYS.fee, 25),
  menuOpen: false,
  filtersOpen: false,
  search: "",
  roomType: "all",
  gender: "all",
  maxPrice: 3000,
  amenities: [],
  sortBy: "featured",
  adminTab: "listings",
  adminLandlordId: "",
  landlordTab: "roster",
  tenantSearch: "",
  tenantStatus: "all",
  tenantListing: "all",
  modal: null,
  photoIndex: {},
};

// Correct a missing or stale current profile without relying on fixed array ordering.
if (!Array.isArray(state.users) || !state.users.some((user) => user.id === state.currentUserId)) {
  state.users = clone(INITIAL_USERS);
  writeStorage(STORAGE_KEYS.users, state.users);
}

function roomCapacityForListing(listing) {
  if (listing.roomType === "shared_2") return 2;
  if (listing.roomType === "shared_4") return 4;
  return 1;
}

function normalizeRoomName(name) {
  return String(name || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function ensureRoomInventory() {
  let changed = false;
  state.listings.forEach((listing) => {
    if (!Array.isArray(listing.rooms)) {
      const tenants = state.tenants.filter((tenant) => tenant.listingId === listing.id);
      const roomGroups = new Map();
      tenants.forEach((tenant) => {
        const name = String(tenant.roomNumber || "").trim() || `${roomTypeLabel(listing.roomType)} 1`;
        const key = normalizeRoomName(name);
        if (!roomGroups.has(key)) roomGroups.set(key, { name, tenants: [] });
        roomGroups.get(key).tenants.push(tenant);
      });
      if (!roomGroups.size) {
        const name = `${roomTypeLabel(listing.roomType)} 1`;
        roomGroups.set(normalizeRoomName(name), { name, tenants: [] });
      }
      listing.rooms = Array.from(roomGroups.values()).map(({ name, tenants: occupants }, index) => {
        const roomId = `room-${listing.id}-${index + 1}`;
        occupants.forEach((tenant) => { tenant.roomId = roomId; });
        return {
          id: roomId,
          name,
          price: Number(occupants[0]?.monthlyRent || listing.price),
          advancePayment: 0,
          totalSpaces: roomCapacityForListing(listing),
          features: [...(listing.amenities || [])],
        };
      });
      changed = true;
    } else {
      state.tenants.filter((tenant) => tenant.listingId === listing.id && !tenant.roomId).forEach((tenant) => {
        const room = listing.rooms.find((item) => normalizeRoomName(item.name) === normalizeRoomName(tenant.roomNumber));
        if (room) {
          tenant.roomId = room.id;
          changed = true;
        }
      });
    }
  });
  if (changed) {
    saveListings();
    persistCollection("tenants", STORAGE_KEYS.tenants);
  }
}

ensureRoomInventory();

// --- Small rendering and formatting helpers -------------------------------
// Dynamic text is escaped before it is inserted into HTML templates.
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function money(amount) {
  return `K${Number(amount || 0).toLocaleString()}`;
}

function getUser(id = state.currentUserId) {
  return state.users.find((user) => user.id === id) || state.users[0];
}

function getListing(id) {
  return state.listings.find((listing) => listing.id === id);
}

function getPrivateDetails(listingId, user = getUser()) {
  const listing = getListing(listingId);
  const canView = user.role === "admin"
    || listing?.landlordId === user.id
    || state.unlocks.some((unlock) => unlock.studentId === user.id && unlock.listingId === listingId);
  return canView ? state.privateDetails[listingId] || null : null;
}

function favoritesForCurrentUser() {
  return state.favoritesByUser[getUser().id] || [];
}

function statusLabel(status) {
  return String(status || "").replaceAll("_", " ");
}

function roomTypeLabel(type) {
  return ({
    single: "Single Room",
    shared_2: "2-in-1 Shared",
    shared_4: "4-Bed Sharing",
    self_contained: "Self-Contained Studio",
    bedspace: "Bedspace",
    studio: "Studio",
  })[type] || "Room";
}

function genderLabel(rule) {
  return ({
    mixed: "Mixed Gender",
    female_only: "Ladies Only",
    male_only: "Men Only",
  })[rule] || "Mixed Gender";
}

function amenityName(id) {
  return AMENITIES.find((amenity) => amenity.id === id)?.name || id;
}

function image(url, alt, className = "") {
  const uploadedKey = String(url || "").startsWith("uploaded:") ? String(url).slice("uploaded:".length) : "";
  const source = uploadedKey ? FALLBACK_PHOTO : url || SAMPLE_PHOTOS[0];
  const photoAttribute = uploadedKey ? ` data-photo-ref="${escapeHtml(uploadedKey)}"` : "";
  return `<img class="${escapeHtml(className)}" src="${escapeHtml(source)}"${photoAttribute} alt="${escapeHtml(alt)}" loading="lazy">`;
}

function button(action, label, options = {}) {
  const className = options.className || "button";
  const extra = options.extra || "";
  const type = options.type || "button";
  return `<button type="${type}" class="${className}" data-action="${escapeHtml(action)}" ${extra}>${label}</button>`;
}

function field(name, label, value = "", options = {}) {
  const type = options.type || "text";
  const required = options.required ? "required" : "";
  const placeholder = options.placeholder ? `placeholder="${escapeHtml(options.placeholder)}"` : "";
  const min = options.min !== undefined ? `min="${escapeHtml(options.min)}"` : "";
  const max = options.max !== undefined ? `max="${escapeHtml(options.max)}"` : "";
  const wide = options.wide ? " full" : "";
  const control = options.multiline
    ? `<textarea class="textarea" name="${escapeHtml(name)}" ${required} ${placeholder}>${escapeHtml(value)}</textarea>`
    : `<input class="field" name="${escapeHtml(name)}" type="${escapeHtml(type)}" value="${escapeHtml(value)}" ${required} ${placeholder} ${min} ${max}>`;
  return `<div class="form-field${wide}"><label class="field-label" for="field-${escapeHtml(name)}">${escapeHtml(label)}</label>${control.replace(`name="${escapeHtml(name)}"`, `id="field-${escapeHtml(name)}" name="${escapeHtml(name)}"`)}</div>`;
}

function selectField(name, label, options, selected, wide = false) {
  const optionMarkup = options.map(([value, text]) =>
    `<option value="${escapeHtml(value)}" ${value === selected ? "selected" : ""}>${escapeHtml(text)}</option>`
  ).join("");
  return `<div class="form-field${wide ? " full" : ""}"><label class="field-label" for="field-${escapeHtml(name)}">${escapeHtml(label)}</label><select class="select" id="field-${escapeHtml(name)}" name="${escapeHtml(name)}">${optionMarkup}</select></div>`;
}

function toast(message) {
  const root = document.querySelector("#toast-root");
  if (!root) return;
  const item = document.createElement("div");
  item.className = "toast";
  item.textContent = message;
  root.append(item);
  window.setTimeout(() => item.remove(), 3200);
}

function persistCollection(collection, key) {
  writeStorage(key, state[collection]);
}

function sortListings(listings) {
  return [...listings].sort((a, b) => {
    if (state.sortBy === "price_asc") return a.price - b.price;
    if (state.sortBy === "price_desc") return b.price - a.price;
    if (state.sortBy === "rating") return b.rating - a.rating;
    if (state.sortBy === "unlocks") return (b.unlockCount || 0) - (a.unlockCount || 0);
    return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
  });
}

// --- Shared page shell ------------------------------------------------------
// Each render updates the stable header, main content, footer, and dialog region.
function render() {
  selectedPreviewUrls.splice(0).forEach((url) => URL.revokeObjectURL(url));
  document.querySelector("#site-header").innerHTML = renderHeader();
  document.querySelector("#app-main").innerHTML = renderMain();
  document.querySelector("#site-footer").innerHTML = renderFooter();
  document.querySelector("#modal-root").innerHTML = renderModal();
  document.querySelectorAll("img").forEach((photo) => {
    photo.addEventListener("error", () => {
      if (photo.dataset.fallback) return;
      photo.dataset.fallback = "true";
      photo.src = FALLBACK_PHOTO;
    }, { once: true });
  });
  refreshUploadedImages();
  startCardSlideshow();
}

function openPhotoDatabase() {
  if (!window.indexedDB) {
    return Promise.reject(new Error("This browser does not support local photo storage."));
  }
  if (!photoDatabasePromise) {
    photoDatabasePromise = new Promise((resolve, reject) => {
      const request = window.indexedDB.open(PHOTO_DATABASE, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(PHOTO_STORE)) {
          request.result.createObjectStore(PHOTO_STORE, { keyPath: "key" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("Could not open local photo storage."));
      request.onblocked = () => reject(new Error("Local photo storage is blocked by another browser tab."));
    });
  }
  return photoDatabasePromise;
}

function getUploadedPhotoUrl(key) {
  if (photoObjectUrls.has(key)) return Promise.resolve(photoObjectUrls.get(key));
  if (pendingPhotoLoads.has(key)) return pendingPhotoLoads.get(key);
  const load = openPhotoDatabase().then((database) => new Promise((resolve, reject) => {
    const request = database.transaction(PHOTO_STORE, "readonly").objectStore(PHOTO_STORE).get(key);
    request.onsuccess = () => {
      if (!request.result?.blob) {
        resolve("");
        return;
      }
      const url = URL.createObjectURL(request.result.blob);
      photoObjectUrls.set(key, url);
      resolve(url);
    };
    request.onerror = () => reject(request.error || new Error("Could not read an uploaded photo."));
  })).finally(() => pendingPhotoLoads.delete(key));
  pendingPhotoLoads.set(key, load);
  return load;
}

function refreshUploadedImages(root = document) {
  root.querySelectorAll("img[data-photo-ref]").forEach((photo) => {
    const key = photo.dataset.photoRef;
    if (photo.dataset.photoLoaded === "true") return;
    photo.dataset.photoLoaded = "true";
    getUploadedPhotoUrl(key).then((url) => {
      if (url && photo.isConnected) photo.src = url;
      else if (!url && photo.isConnected) photo.src = FALLBACK_PHOTO;
    }).catch((error) => {
      console.warn("UniNest could not load an uploaded photo.", error);
      if (photo.isConnected) photo.src = FALLBACK_PHOTO;
    });
  });
}

function startCardSlideshow() {
  window.clearInterval(slideshowTimer);
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  slideshowTimer = window.setInterval(() => {
    if (document.hidden) return;
    document.querySelectorAll(".listing-photo[data-carousel-listing]").forEach((container) => {
      if (container.matches(":hover, :focus-within")) return;
      const listing = getListing(container.dataset.carouselListing);
      if (!listing || listing.photos.length < 2) return;
      const index = ((state.photoIndex[listing.id] || 0) + 1) % listing.photos.length;
      state.photoIndex[listing.id] = index;
      const photo = container.querySelector("img");
      if (!photo) return;
      if (String(listing.photos[index]).startsWith("uploaded:")) {
        photo.dataset.photoRef = listing.photos[index].slice("uploaded:".length);
        photo.dataset.photoLoaded = "";
        photo.src = FALLBACK_PHOTO;
        refreshUploadedImages(container);
      } else {
        delete photo.dataset.photoRef;
        delete photo.dataset.photoLoaded;
        photo.src = listing.photos[index];
      }
      photo.classList.remove("photo-slide");
      void photo.offsetWidth;
      photo.classList.add("photo-slide");
    });
  }, 4500);
}

async function preparePhoto(file) {
  if (!file.type.startsWith("image/")) throw new Error(`${file.name} is not an image.`);
  if (file.size > MAX_UPLOAD_BYTES) throw new Error(`${file.name} is larger than 12 MB.`);
  if (typeof createImageBitmap !== "function") {
    throw new Error("This browser cannot process uploaded photos. Try a current version of Chrome, Firefox, or Safari.");
  }
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not process the selected photo.");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return await new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error(`Could not compress ${file.name}.`));
      }, "image/jpeg", 0.84);
    });
  } finally {
    bitmap.close();
  }
}

async function storeUploadedPhotos(files) {
  if (!files.length) return [];
  if (files.length > MAX_PHOTOS_PER_UPLOAD) {
    throw new Error(`Select no more than ${MAX_PHOTOS_PER_UPLOAD} photos at a time.`);
  }
  const blobs = await Promise.all(files.map(preparePhoto));
  const records = blobs.map((blob) => ({
    key: (window.crypto?.randomUUID?.() || `photo-${Date.now()}-${Math.random().toString(36).slice(2)}`),
    blob,
  }));
  const database = await openPhotoDatabase();
  await new Promise((resolve, reject) => {
    const transaction = database.transaction(PHOTO_STORE, "readwrite");
    const store = transaction.objectStore(PHOTO_STORE);
    records.forEach((record) => store.put(record));
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error || new Error("Could not save uploaded photos."));
    transaction.onabort = () => reject(transaction.error || new Error("Saving uploaded photos was cancelled."));
  });
  return records.map((record) => `uploaded:${record.key}`);
}

async function removeUploadedPhotos(photoReferences) {
  const keys = photoReferences
    .filter((reference) => String(reference).startsWith("uploaded:"))
    .map((reference) => String(reference).slice("uploaded:".length));
  if (!keys.length) return;
  const database = await openPhotoDatabase();
  await new Promise((resolve, reject) => {
    const transaction = database.transaction(PHOTO_STORE, "readwrite");
    const store = transaction.objectStore(PHOTO_STORE);
    keys.forEach((key) => store.delete(key));
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error || new Error("Could not remove listing photos."));
    transaction.onabort = () => reject(transaction.error || new Error("Removing listing photos was cancelled."));
  });
  keys.forEach((key) => {
    const url = photoObjectUrls.get(key);
    if (url) URL.revokeObjectURL(url);
    photoObjectUrls.delete(key);
  });
}

async function clearUploadedPhotos() {
  const database = await openPhotoDatabase();
  await new Promise((resolve, reject) => {
    const transaction = database.transaction(PHOTO_STORE, "readwrite");
    transaction.objectStore(PHOTO_STORE).clear();
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error || new Error("Could not clear uploaded photos."));
    transaction.onabort = () => reject(transaction.error || new Error("Clearing uploaded photos was cancelled."));
  });
  photoObjectUrls.forEach((url) => URL.revokeObjectURL(url));
  photoObjectUrls.clear();
}

function previewSelectedPhotos(input) {
  const preview = document.getElementById(input.dataset.previewTarget);
  if (!preview) return;
  selectedPreviewUrls.splice(0).forEach((url) => URL.revokeObjectURL(url));
  preview.replaceChildren();
  Array.from(input.files || []).slice(0, MAX_PHOTOS_PER_UPLOAD).forEach((file) => {
    if (!file.type.startsWith("image/")) return;
    const tile = document.createElement("div");
    tile.className = "photo-preview-tile";
    const photo = document.createElement("img");
    photo.src = URL.createObjectURL(file);
    selectedPreviewUrls.push(photo.src);
    photo.alt = file.name;
    const name = document.createElement("span");
    name.textContent = file.name;
    tile.append(photo, name);
    preview.append(tile);
  });
}

async function uploadPhotosToListing(listing, files) {
  const user = getUser();
  if (!listing || (user.role !== "admin" && listing.landlordId !== user.id)) {
    toast("You can only upload photos to listings you manage.");
    return;
  }
  if (!files.length) return;
  if (listing.photos.length + files.length > MAX_PHOTOS_PER_LISTING) {
    toast(`A listing can have no more than ${MAX_PHOTOS_PER_LISTING} photos.`);
    return;
  }
  try {
    const uploadedPhotos = await storeUploadedPhotos(files);
    listing.photos.push(...uploadedPhotos);
    saveListings();
    render();
    toast(`${uploadedPhotos.length} photo${uploadedPhotos.length === 1 ? "" : "s"} added to the listing.`);
  } catch (error) {
    console.error("UniNest could not upload photos.", error);
    toast(error.message || "Could not save the selected photos. Please try again.");
  }
}

function photoUploadControls(listing, prefix) {
  const inputId = `${prefix}-photos-${listing.id}`;
  const remaining = Math.max(0, MAX_PHOTOS_PER_LISTING - listing.photos.length);
  return `<div class="photo-upload-actions"><button class="button button-small" type="button" data-action="choose-photos" data-input="${escapeHtml(inputId)}" ${remaining ? "" : "disabled"}>＋ Add Photos (${listing.photos.length}/${MAX_PHOTOS_PER_LISTING})</button><input id="${escapeHtml(inputId)}" class="visually-hidden" type="file" accept="image/*" multiple data-upload-listing="${escapeHtml(listing.id)}" data-upload-limit="${remaining}" aria-label="Upload photos for ${escapeHtml(listing.title)}"></div>`;
}

function renderHeader() {
  const user = getUser();
  const quickButtons = user.role === "student"
    ? `${button("show-favorites", `♥ Saved (${favoritesForCurrentUser().length})`, { className: "button button-small" })}${button("show-unlocked", `▣ Unlocked (${state.unlocks.filter((unlock) => unlock.studentId === user.id).length})`, { className: "button button-small" })}`
    : "";
  const usersMarkup = state.users.map((account) => `
    <button class="role-option ${account.id === user.id ? "active" : ""}" type="button" data-user="${escapeHtml(account.id)}">
      <span class="row">${image(account.avatarUrl, account.name, "avatar")}<span><strong>${escapeHtml(account.name)}</strong><small class="muted" style="display:block;text-transform:capitalize">${escapeHtml(account.role)}</small></span></span>
      <span>${account.id === user.id ? "✓" : ""}</span>
    </button>
  `).join("");
  const contactLinks = `<div class="quick-actions">
    ${quickButtons}
    <a class="button button-small" href="https://wa.me/260979990000?text=Hello%20UniNest%20CBU%20Agent" target="_blank" rel="noopener noreferrer">◉ Agent WhatsApp</a>
    <a class="button button-small" href="tel:+260979990000">☎ Call agent</a>
    ${button("reset-data", "↻ Reset demo", { className: "button button-small button-quiet" })}
  </div>`;
  return `
    <div class="trust-strip"><strong>CBU Student Safety:</strong> Inspect rooms physically before paying rent. Unlock fee is only <strong>${money(state.agentFee)}</strong>.</div>
    <div class="container nav-shell">
      <a class="brand" href="#" data-action="home" aria-label="UniNest home">
        <span class="brand-mark" aria-hidden="true">⌑</span>
        <span><span class="brand-name">Uni<span>Nest</span><span class="brand-label">CBU AGENT</span></span><span class="brand-subtitle">Copperbelt University Verified Boarding Houses</span></span>
      </a>
      <div class="zone-badge"><span class="live-dot" aria-hidden="true"></span>CBU Kitwe Zone · Riverside, Kwacha, Eastlea</div>
      <div class="nav-actions">
        <button class="user-trigger desktop-user" type="button" data-action="toggle-menu" aria-expanded="${state.menuOpen}">
          ${image(user.avatarUrl, user.name, "avatar")}
          <span><span class="user-name">${escapeHtml(user.name)} ${user.isVerified ? "✓" : ""}</span><span class="user-role">${escapeHtml(user.role)}</span></span>
          <span aria-hidden="true">⌄</span>
        </button>
        <button class="button button-icon menu-toggle" type="button" data-action="toggle-menu" aria-label="Toggle navigation menu" aria-expanded="${state.menuOpen}">${state.menuOpen ? "×" : "☰"}</button>
        ${state.menuOpen ? `<section class="dropdown" aria-label="Account menu">
          <div class="dropdown-profile">
            <strong>${escapeHtml(user.name)}</strong>
            <p class="fine-print">${escapeHtml(user.email)}<br>${escapeHtml(user.phone)}</p>
            <span class="status-pill">${escapeHtml(user.role)} account</span>
          </div>
          <p class="eyebrow">Switch account role</p>
          <div class="role-list">${usersMarkup}</div>
          <p class="eyebrow">Agent support line</p>
          ${contactLinks}
        </section>` : ""}
      </div>
    </div>`;
}

function renderFooter() {
  return `
    <div class="container">
      <div class="footer-grid">
        <section class="stack">
          <a class="brand" href="#" data-action="home"><span class="brand-mark" aria-hidden="true">⌑</span><span class="brand-name">Uni<span>Nest</span></span></a>
          <p>Zambia's verified university boarding house discovery platform. Protecting students through transparent room specs and safe landlord contact unlocking.</p>
          <p class="eyebrow">✓ Verified Agent License #ZM-BH-2026</p>
        </section>
        <section><h3>CBU Boarding Zones</h3><ul><li>Riverside (CBU West & East Gates)</li><li>Kwacha East & St. Kizito area</li><li>Eastlea & Riverside Extension</li><li>Parklands & Nkana East (CBU Medical)</li></ul></section>
        <section><h3>Student Safety Rules</h3><ul><li>✓ Inspect the room physically before paying rent</li><li>✓ Demand a written tenancy agreement and receipt</li><li>✓ Verify solar backup and borehole water on site</li><li>✓ Report fraudulent or occupied rooms</li></ul></section>
        <section class="stack"><h3>Agent Support Line</h3><p>Questions or need manual verification of a boarding house?</p><a class="button" href="https://wa.me/260979990000?text=Hello%20UniNest%20Agent%2C%20I%20need%20assistance" target="_blank" rel="noopener noreferrer">◉ Agent WhatsApp: +260 97 999 0000</a><a class="button" href="tel:+260979990000">☎ Direct Hotline: +260 97 999 0000</a></section>
      </div>
      <div class="footer-bottom"><span>© 2026 UniNest Boarding House Services. All rights reserved.</span><span>Theme: Deep Black & Electric Blue · Powered by UniNest Agent Engine</span></div>
    </div>`;
}

function renderMain() {
  const user = getUser();
  if (user.role === "landlord") return renderLandlord();
  if (user.role === "admin") return renderAdmin();
  return renderStudent();
}

// --- Student discovery view -------------------------------------------------
// Search, configuration, gender, rent, amenities, and sort choices stay in state.
function matchingListings() {
  const query = state.search.trim().toLowerCase();
  const filtered = state.listings.filter((listing) => {
    if (listing.status !== "approved") return false;
    if (state.roomType !== "all" && listing.roomType !== state.roomType) return false;
    if (state.gender !== "all" && listing.genderRule !== state.gender) return false;
    if (listing.price > state.maxPrice) return false;
    if (!state.amenities.every((amenity) => listing.amenities.includes(amenity))) return false;
    if (query && ![listing.title, listing.generalArea, listing.streetName, listing.description].some((value) => String(value || "").toLowerCase().includes(query))) return false;
    return true;
  });
  return sortListings(filtered);
}

function renderStudent() {
  return `
    <div class="page-stack">
      <section class="section">
        <div class="panel search-panel">
          <div class="search-row">
            <label class="search-input-wrap"><span class="is-hidden">Search boarding rooms</span><input id="listing-search" class="field" type="search" value="${escapeHtml(state.search)}" placeholder="Search CBU area (e.g. Riverside, Kwacha East, Eastlea, West Gate), room type..."></label>
            <div class="search-controls">
              ${button("toggle-filters", `${state.filtersOpen ? "×" : "☷"} Filters${hasActiveFilters() ? " •" : ""}`, { className: `button ${state.filtersOpen ? "button-primary" : ""}` })}
              <label class="is-hidden" for="listing-sort">Sort listings</label>
              <select id="listing-sort" class="select" aria-label="Sort listings">
                <option value="featured" ${state.sortBy === "featured" ? "selected" : ""}>Featured First</option>
                <option value="price_asc" ${state.sortBy === "price_asc" ? "selected" : ""}>Price: Low to High</option>
                <option value="price_desc" ${state.sortBy === "price_desc" ? "selected" : ""}>Price: High to Low</option>
                <option value="rating" ${state.sortBy === "rating" ? "selected" : ""}>Highest Rated</option>
                <option value="unlocks" ${state.sortBy === "unlocks" ? "selected" : ""}>Most Unlocked</option>
              </select>
            </div>
          </div>
          ${state.filtersOpen ? renderFilters() : ""}
        </div>
      </section>
      <section class="section">
        <div class="between wrap" style="margin-bottom:1rem">
          <div><h1 style="margin:0;color:#fff;font-size:clamp(1.2rem,3vw,1.55rem)">Available CBU Boarding Houses <span class="status-pill">Kitwe</span></h1><p id="listing-count" class="fine-print">Showing ${matchingListings().length} verified rooms near Copperbelt University (Riverside, Kwacha East, Eastlea, West Gate)</p></div>
        </div>
        <div id="listing-results">${renderListingResults()}</div>
      </section>
      <section class="section">
        <div class="panel" style="background:linear-gradient(180deg,rgba(7,20,47,.58),#090d17 55%,#030712)">
          <div class="text-center" style="max-width:38rem;margin:0 auto 1.5rem"><span class="eyebrow">Safe & Scam-Free Process</span><h2 style="margin:.45rem 0;color:#fff;font-size:1.55rem">How UniNest CBU Agent Works</h2><p class="fine-print">Built to protect CBU students from fake middlemen and avoid wasted trips.</p></div>
          <div class="steps-grid">
            <article class="step-card"><div class="step-number">1</div><h3>Browse Safe Info</h3><p>View photos, amenities, backup solar, distance to campus, and safe general area without fake broker spam.</p></article>
            <article class="step-card"><div class="step-number">2</div><h3>Unlock Contact</h3><p>Pay the small ${money(state.agentFee)} agent verification fee via MTN MoMo or Airtel Money for the exact listing.</p></article>
            <article class="step-card"><div class="step-number">3</div><h3>Direct WhatsApp</h3><p>Receive the landlord's verified phone, exact plot number, caretaker instructions, and map directions.</p></article>
            <article class="step-card"><div class="step-number">4</div><h3>Inspect Before Paying</h3><p>Visit the boarding house physically and inspect the room before paying any rent to the landlord.</p></article>
          </div>
        </div>
      </section>
    </div>`;
}

function hasActiveFilters() {
  return state.roomType !== "all" || state.gender !== "all" || state.amenities.length > 0 || state.maxPrice < 3000;
}

function renderFilters() {
  const roomTypes = [
    ["all", "All Configurations"],
    ["single", "Single Room"],
    ["shared_2", "2-in-1 Shared"],
    ["shared_4", "4-Bed Sharing"],
    ["self_contained", "Self-Contained Studio"],
    ["bedspace", "Bedspace"],
  ];
  const genders = [["all", "Any"], ["female_only", "Female Only"], ["male_only", "Male Only"], ["mixed", "Mixed"]];
  return `<div class="filter-panel">
    <div class="filter-group"><span class="field-label">Room Configuration:</span><div class="chip-list">${roomTypes.map(([id, label]) => `<button class="chip ${state.roomType === id ? "active" : ""}" type="button" data-filter="roomType" data-value="${id}">${label}</button>`).join("")}</div></div>
    <div class="form-grid">
      <div class="filter-group"><span class="field-label">Gender Preference:</span><div class="chip-list">${genders.map(([id, label]) => `<button class="chip ${state.gender === id ? "active" : ""}" type="button" data-filter="gender" data-value="${id}">${label}</button>`).join("")}</div></div>
      <div class="filter-group"><label class="range-row" for="max-price"><span>Maximum Rent:</span><strong id="price-value">${money(state.maxPrice)} / mo</strong></label><input id="max-price" type="range" min="500" max="3500" step="50" value="${state.maxPrice}"><div class="between fine-print"><span>K500</span><span>K2,000</span><span>K3,500</span></div></div>
    </div>
    <div class="filter-group"><span class="field-label">Must Have Amenities:</span><div class="chip-list">${AMENITIES.map((amenity) => `<button class="chip ${state.amenities.includes(amenity.id) ? "active" : ""}" type="button" data-filter="amenity" data-value="${amenity.id}">${state.amenities.includes(amenity.id) ? "✓ " : ""}${escapeHtml(amenity.name)}</button>`).join("")}</div></div>
    <div class="between"><span></span>${button("reset-filters", "↻ Reset All Filters", { className: "button button-small button-quiet" })}</div>
  </div>`;
}

function renderListingResults() {
  const listings = matchingListings();
  if (listings.length === 0) {
    return `<section class="empty-state"><p aria-hidden="true" style="font-size:2rem;color:#60a5fa">⌂</p><h2>No CBU Boarding Rooms Match Your Search</h2><p>Try adjusting your price range or clearing amenity filters to find available rooms.</p>${button("reset-filters", "Reset Filters", { className: "button button-primary" })}</section>`;
  }
  return `<div class="listing-grid">${listings.map(renderListingCard).join("")}</div>`;
}

function renderListingCard(listing) {
  const unlocked = Boolean(getPrivateDetails(listing.id));
  const favorite = favoritesForCurrentUser().includes(listing.id);
  const photoIndex = state.photoIndex[listing.id] || 0;
  const photo = listing.photos[photoIndex] || listing.photos[0];
  const featured = listing.featured ? `<span class="badge">✦ Featured</span>` : "";
  const features = [
    ...(Array.isArray(listing.amenities) ? listing.amenities.map(amenityName) : []),
    ...(Array.isArray(listing.specialFeatures) ? listing.specialFeatures : []),
  ];
  return `<article class="listing-card" data-action="open-detail" data-listing="${escapeHtml(listing.id)}" tabindex="0" aria-label="View ${escapeHtml(listing.title)}">
    <div class="listing-photo" ${listing.photos.length > 1 ? `data-carousel-listing="${escapeHtml(listing.id)}"` : ""}>
      ${image(photo, listing.title)}
      <div class="photo-top"><div class="badges">${listing.isVerifiedLandlord ? `<span class="badge">✓ Verified Landlord</span>` : ""}<span class="badge">${escapeHtml(genderLabel(listing.genderRule))}</span>${featured}</div><button class="favorite-button ${favorite ? "active" : ""}" data-action="toggle-favorite" data-listing="${escapeHtml(listing.id)}" aria-label="${favorite ? "Remove from" : "Save to"} favorites">${favorite ? "♥" : "♡"}</button></div>
      ${listing.photos.length > 1 ? `<button class="photo-nav photo-prev" type="button" data-action="photo-prev" data-listing="${escapeHtml(listing.id)}" aria-label="Previous photo">‹</button><button class="photo-nav photo-next" type="button" data-action="photo-next" data-listing="${escapeHtml(listing.id)}" aria-label="Next photo">›</button>` : ""}
      <div class="photo-cover"><span class="price">From ${money(listing.price)} <small>/ month</small></span><span class="distance">⌖ ${escapeHtml(listing.distanceToCampus)}</span></div>
    </div>
    <div class="listing-copy">
      <div><div class="listing-meta"><span class="truncate">${escapeHtml(listing.campus)}</span><span class="review-stars">★ ${listing.rating > 0 ? listing.rating.toFixed(1) : "New"} <span class="muted">(${listing.reviewCount})</span></span></div><h2 class="listing-title">${escapeHtml(listing.title)}</h2><p class="listing-area">● ${escapeHtml(listing.generalArea)}</p></div>
      <p class="listing-street">Street: ${escapeHtml(listing.streetName || "Not provided")}</p>
      <div class="amenity-tags"><span class="amenity-tag">${escapeHtml(roomTypeLabel(listing.roomType))}</span>${features.length ? features.map((feature) => `<span class="amenity-tag">${escapeHtml(feature)}</span>`).join("") : `<span class="fine-print">No special features listed</span>`}</div>
      <div class="contact-bar"><div class="contact-summary"><strong>${unlocked ? "Contact Unlocked" : "Contact & Plot Hidden"}</strong><span>${unlocked ? "Tap to call or view directions" : `${listing.unlockCount ? `${listing.unlockCount} students unlocked` : "Agent verified room"}`}</span></div>${unlocked ? button("open-detail", "View Details →", { className: "button button-small", extra: `data-listing="${escapeHtml(listing.id)}"` }) : button("open-unlock", `Unlock (${money(state.agentFee)})`, { className: "button button-primary button-small", extra: `data-listing="${escapeHtml(listing.id)}"` })}</div>
    </div>
  </article>`;
}

// --- Listing detail and contact actions ------------------------------------
// Public listing fields stay separate from the guarded address and phone panel.
function renderDetailModal(listing) {
  const user = getUser();
  const details = getPrivateDetails(listing.id, user);
  const reviews = state.reviews.filter((review) => review.listingId === listing.id);
  const favorite = favoritesForCurrentUser().includes(listing.id);
  const currentPhoto = state.photoIndex[`detail-${listing.id}`] || 0;
  return `<div class="modal-backdrop" data-action="backdrop-close"><section class="modal modal-wide" role="dialog" aria-modal="true" aria-labelledby="detail-title">
    <div class="modal-header"><div class="row wrap"><span class="badge">Ref: ${escapeHtml(listing.id.toUpperCase())}</span>${listing.isVerifiedLandlord ? `<span class="badge">✓ Verified Landlord</span>` : ""}</div><div class="row">${button("share-listing", "↗ Share", { className: "button button-small", extra: `data-listing="${escapeHtml(listing.id)}"` })}${button("toggle-favorite", favorite ? "♥ Saved" : "♡ Save", { className: `button button-small ${favorite ? "button-primary" : ""}`, extra: `data-listing="${escapeHtml(listing.id)}"` })}${button("close-modal", "×", { className: "button button-icon", extra: 'aria-label="Close dialog"' })}</div></div>
    <div class="detail-layout">
      <div class="detail-column">
        <div class="detail-photo">${image(listing.photos[currentPhoto] || listing.photos[0], listing.title)}${listing.photos.length > 1 ? `<button class="photo-nav photo-prev" type="button" data-action="detail-photo-prev" data-listing="${escapeHtml(listing.id)}" aria-label="Previous photo">‹</button><button class="photo-nav photo-next" type="button" data-action="detail-photo-next" data-listing="${escapeHtml(listing.id)}" aria-label="Next photo">›</button>` : ""}<span class="detail-photo-count">${currentPhoto + 1} / ${listing.photos.length}</span></div>
        ${listing.photos.length > 1 ? `<div class="thumbnail-row">${listing.photos.map((photo, index) => `<button class="thumbnail ${index === currentPhoto ? "active" : ""}" type="button" data-action="detail-photo-set" data-listing="${escapeHtml(listing.id)}" data-index="${index}" aria-label="Show photo ${index + 1}">${image(photo, `Photo ${index + 1}`)}</button>`).join("")}</div>` : ""}
        <section class="info-box"><h3>Room Overview</h3><p>${escapeHtml(listing.description)}</p></section>
        ${renderRoomCards(listing)}
        <section class="info-box"><h3>House Features & Utilities</h3><div class="amenity-grid">${AMENITIES.map((amenity) => `<span class="amenity-item ${listing.amenities.includes(amenity.id) ? "" : "missing"}">${listing.amenities.includes(amenity.id) ? "✓ " : "× "}${escapeHtml(amenity.name)}</span>`).join("")}</div>${Array.isArray(listing.specialFeatures) && listing.specialFeatures.length ? `<div class="room-features" style="margin-top:.7rem">${listing.specialFeatures.map((feature) => `<span class="amenity-tag">${escapeHtml(feature)}</span>`).join("")}</div>` : ""}</section>
        <section class="info-box"><h3>Boarding House Rules & Guidelines</h3><ul class="fine-print">${listing.houseRules.map((rule) => `<li>${escapeHtml(rule)}</li>`).join("")}</ul></section>
        <section class="info-box"><div class="between"><div><h3>Student Reviews & Verification</h3><p class="fine-print">From students who unlocked and viewed this boarding house.</p></div>${button("open-review", "Write Review", { className: "button button-small", extra: `data-listing="${escapeHtml(listing.id)}"` })}</div>
          ${reviews.length ? reviews.map((review) => `<article class="review-card"><div class="between"><strong>${escapeHtml(review.studentName)} <span class="muted">(${escapeHtml(review.studentProgram)})</span></strong><span class="review-stars">${"★".repeat(Math.max(0, Math.min(5, review.rating)))}${"☆".repeat(5 - Math.max(0, Math.min(5, review.rating)))}</span></div><p class="fine-print">${escapeHtml(review.comment)}</p></article>`).join("") : `<p class="fine-print">No written reviews yet. Be the first student to review this boarding house!</p>`}
        </section>
      </div>
      <div class="detail-column">
        <section class="info-box"><div class="between"><span class="eyebrow">${escapeHtml(listing.campus)}</span><span class="review-stars">★ ${listing.rating > 0 ? listing.rating.toFixed(1) : "New"} (${listing.reviewCount})</span></div><h2 id="detail-title" style="margin:.65rem 0;color:#fff;font-size:1.2rem">${escapeHtml(listing.title)}</h2><p class="price">From ${money(listing.price)} <small>/ month</small></p><div class="data-row"><span>Area</span><strong>${escapeHtml(listing.generalArea)}</strong></div><div class="data-row"><span>Street</span><strong>${escapeHtml(listing.streetName || "Not provided")}</strong></div><div class="data-row"><span>Gender</span><strong>${escapeHtml(genderLabel(listing.genderRule))}</strong></div><div class="data-row"><span>Distance</span><strong>${escapeHtml(listing.distanceToCampus)}</strong></div><div class="data-row"><span>Landlord</span><strong>${escapeHtml(listing.landlordNameDisplay)}</strong></div></section>
        ${details ? renderPrivateDetails(listing, details) : `<section class="info-box locked-panel"><p style="font-size:2rem;margin-bottom:.6rem" aria-hidden="true">🔒</p><h3>Landlord Contact & Exact Plot are Hidden</h3><p>Exact addresses and direct phone numbers are released via official UniNest agent unlock.</p><div class="blur-preview" aria-hidden="true"><p>Plot 48XX, Chitimukulu Rd, Riverside</p><p>Phone: +260 97 XXX XXXX</p><p>WhatsApp: Direct 1-Click Available</p></div>${button("open-unlock", `Unlock Contact for ${money(state.agentFee)}`, { className: "button button-gradient", extra: `data-listing="${escapeHtml(listing.id)}"` })}<p class="fine-print">Instant demo unlock via MTN MoMo, Airtel Money, or debit card.</p></section>`}
        <section class="info-box"><h3>UniNest Agent Protection</h3><p>Inspect the room physically before paying rent. Request a written tenancy agreement and receipt. Report occupied rooms, mismatched prices, or safety concerns.</p><div class="row wrap" style="margin-top:.7rem">${button("open-report", "⚑ Report Listing", { className: "button button-small", extra: `data-listing="${escapeHtml(listing.id)}"` })}</div></section>
      </div>
    </div>
  </section></div>`;
}

function roomOccupants(listing, room) {
  return state.tenants.filter((tenant) => {
    if (tenant.listingId !== listing.id) return false;
    return tenant.roomId === room.id
      || (!tenant.roomId && normalizeRoomName(tenant.roomNumber) === normalizeRoomName(room.name));
  }).length;
}

function renderRoomCards(listing) {
  const rooms = Array.isArray(listing.rooms) ? listing.rooms : [];
  return `<section class="room-inventory-section"><div class="between wrap"><div><h3>Available Rooms & Bed Spaces</h3><p class="fine-print">Room pricing, advance payment, features, and live occupancy.</p></div><span class="status-pill">${rooms.length} room${rooms.length === 1 ? "" : "s"}</span></div>${rooms.length ? `<div class="room-card-grid">${rooms.map((room) => {
    const taken = roomOccupants(listing, room);
    const total = Number(room.totalSpaces) || 0;
    const remaining = Math.max(0, total - taken);
    const features = Array.isArray(room.features) ? room.features : [];
    return `<article class="room-detail-card"><div class="between wrap"><h4>${escapeHtml(room.name)}</h4><span class="status-pill ${remaining === 0 ? "rejected" : "approved"}">${remaining === 0 ? "Full" : `${remaining} spaces left`}</span></div><div class="room-price-row"><div><span class="stat-label">Monthly amount</span><strong>${money(room.price)} <small>/ month</small></strong></div><div><span class="stat-label">Advance payment</span><strong>${Number(room.advancePayment) > 0 ? money(room.advancePayment) : "Not set"}</strong></div><div><span class="stat-label">People per room</span><strong>${total}</strong></div><div><span class="stat-label">Remaining spaces</span><strong>${remaining}</strong></div></div><p class="room-space-count"><strong>${taken}</strong> / ${total} spaces occupied</p><div class="room-features">${features.length ? features.map((feature) => `<span class="amenity-tag">${escapeHtml(amenityName(feature))}</span>`).join("") : `<span class="fine-print">No room features listed</span>`}</div></article>`;
  }).join("")}</div>` : `<div class="empty-state"><h2>Room details coming soon</h2><p>The landlord has not added room pricing and bed-space availability yet.</p></div>`}</section>`;
}

function renderPrivateDetails(listing, details) {
  const phoneDigits = String(details.landlordWhatsApp || details.landlordPhone).replace(/\D/g, "");
  const whatsappText = encodeURIComponent(`Hello ${details.landlordFullName}, I unlocked your boarding room on UniNest (${listing.title}). When is the best time for a viewing?`);
  const mapQuery = encodeURIComponent(`${details.exactAddress}, Zambia`);
  return `<section class="info-box private-panel"><div class="between"><div><span class="eyebrow">Official Agent Unlock</span><h3 style="margin:.35rem 0;color:#fff">${escapeHtml(details.landlordFullName)}</h3></div><span class="status-pill approved">Unlocked</span></div>
    <div class="contact-actions"><a class="button button-success" href="https://wa.me/${phoneDigits}?text=${whatsappText}" target="_blank" rel="noopener noreferrer">◉ WhatsApp Landlord</a><a class="button button-primary" href="tel:${escapeHtml(details.landlordPhone)}">☎ Call Landlord</a><button class="button button-small" type="button" data-action="copy" data-copy="${escapeHtml(details.landlordPhone)}">Copy Phone</button></div>
    <div class="private-details"><p><strong>Landlord Direct Phone:</strong> ${escapeHtml(details.landlordPhone)}</p><p><strong>Exact Physical Plot Address:</strong> ${escapeHtml(details.exactAddress)}</p><p><strong>Directions:</strong> ${escapeHtml(details.landmarkDirections)}</p><p><strong>Viewing Schedule:</strong> ${escapeHtml(details.viewingHours)}</p>${details.caretakerContact ? `<p><strong>Caretaker:</strong> ${escapeHtml(details.caretakerContact)}</p>` : ""}${details.specialInstructions ? `<p><strong>Instructions:</strong> ${escapeHtml(details.specialInstructions)}</p>` : ""}<a class="button button-small" href="https://www.google.com/maps/search/?api=1&query=${mapQuery}" target="_blank" rel="noopener noreferrer">Open in Maps ↗</a></div>
  </section>`;
}

function renderUnlockModal(listing) {
  const modal = state.modal;
  if (modal.step === "success") {
    const details = state.privateDetails[listing.id];
    const record = state.unlocks.find((unlock) => unlock.studentId === getUser().id && unlock.listingId === listing.id);
    return `<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="unlock-success-title">
      <div class="modal-content text-center"><div class="step-number" style="width:4rem;height:4rem;font-size:1.5rem">✓</div><h2 id="unlock-success-title" style="margin:0;color:#fff;font-size:1.5rem">Contact Unlocked!</h2><p class="fine-print">Receipt: <strong>${escapeHtml(record?.receiptNumber || "REC-UN-00000")}</strong> · Paid ${money(record?.amountPaid || state.agentFee)}</p>${renderPrivateDetails(listing, details)}${button("close-modal", "Close & View Full Room Details", { className: "button button-primary" })}</div>
    </section></div>`;
  }
  const method = modal.method || "mtn_momo";
  return `<div class="modal-backdrop" data-action="backdrop-close"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="unlock-title">
    <div class="modal-header"><div><h2 id="unlock-title">Unlock Landlord Contact <span class="status-pill">Agent Verified</span></h2><p>Reveals exact plot number, landlord direct phone, and WhatsApp.</p></div>${button("close-modal", "×", { className: "button button-icon", extra: 'aria-label="Close dialog"' })}</div>
    <div class="modal-content">
      <div class="row">${image(listing.photos[0], listing.title, "image-small")}<div><strong>${escapeHtml(listing.title)}</strong><p class="fine-print">${escapeHtml(listing.generalArea)} · ${money(listing.price)} / mo</p></div></div>
      <section class="info-box"><h3>What You Get Instantly Upon Unlocking</h3><ul class="fine-print"><li>Direct landlord mobile number for voice call and SMS</li><li>One-tap WhatsApp link with a room inquiry</li><li>Exact plot number and street address with directions</li><li>Official viewing instructions and caretaker contact</li></ul></section>
      <div class="filter-group"><span class="field-label">Select mobile money or payment provider:</span><div class="chip-list">${[["mtn_momo", "MTN MoMo"], ["airtel_money", "Airtel Money"], ["card", "Debit Card"], ["manual", "Manual Slip"]].map(([value, label]) => `<button type="button" class="chip ${method === value ? "active" : ""}" data-action="payment-method" data-method="${value}">${label}</button>`).join("")}</div></div>
      ${modal.error ? `<p class="status-pill rejected">${escapeHtml(modal.error)}</p>` : ""}
      ${method === "manual" ? `<form data-form="manual-payment" class="stack"><section class="info-box"><h3>Manual Agent Transfer Details</h3><p>Send ${money(state.agentFee)} to UniNest Agent MTN: <strong>096 999 0000</strong><br>Or Airtel Money: <strong>097 999 0000</strong> (Name: UniNest Agent Services)</p></section>${field("reference", "Transaction ID / Reference Number", "", { required: true, placeholder: "e.g. MTN-992104 or Airtel Ref" })}<button class="button button-primary" type="submit">Submit Reference for Approval (${money(state.agentFee)})</button></form>` : `<form data-form="instant-payment" class="stack">${field("phone", "Mobile Money / Registered Phone", getUser().phone, { required: true, placeholder: "+260 9X XXX XXXX" })}<p class="fine-print">A simulated USSD authorization will complete the demo payment of ${money(state.agentFee)}.</p><button class="button button-gradient" type="submit" ${modal.busy ? "disabled" : ""}>${modal.busy ? "Verifying Mobile Money Pin…" : `Pay ${money(state.agentFee)} & Unlock Contact Instantly →`}</button><p class="fine-print text-center">Demo payment only. No real payment is processed.</p></form>`}
    </div>
  </section></div>`;
}

function renderFavoritesModal() {
  const favorites = state.listings.filter((listing) => favoritesForCurrentUser().includes(listing.id));
  return `<div class="modal-backdrop" data-action="backdrop-close"><section class="modal modal-narrow" role="dialog" aria-modal="true" aria-labelledby="favorites-title"><div class="modal-header"><div><h2 id="favorites-title">Saved Boarding Houses</h2><p>You have bookmarked ${favorites.length} rooms.</p></div>${button("close-modal", "×", { className: "button button-icon", extra: 'aria-label="Close dialog"' })}</div><div class="modal-content">${favorites.length ? favorites.map((listing) => `<article class="queue-card"><div class="row">${image(listing.photos[0], listing.title, "image-small")}<div class="truncate"><span class="eyebrow">${escapeHtml(listing.campus)}</span><h3 class="truncate" style="margin:.3rem 0;color:#fff;font-size:.85rem">${escapeHtml(listing.title)}</h3><p class="fine-print">${escapeHtml(listing.generalArea)}<br>${money(listing.price)} / mo</p></div></div><div class="between">${button("open-detail", "View Details →", { className: "button button-primary button-small", extra: `data-listing="${escapeHtml(listing.id)}"` })}${button("toggle-favorite", "Remove Saved", { className: "button button-small", extra: `data-listing="${escapeHtml(listing.id)}"` })}</div></article>`).join("") : `<div class="empty-state"><h2>No Saved Rooms Yet</h2><p>Tap the heart icon on any boarding room card to save it here for quick viewing.</p></div>`}</div></section></div>`;
}

function renderUnlockedModal() {
  const unlocks = state.unlocks.filter((unlock) => unlock.studentId === getUser().id);
  return `<div class="modal-backdrop" data-action="backdrop-close"><section class="modal modal-wide" role="dialog" aria-modal="true" aria-labelledby="unlocked-title"><div class="modal-header"><div><h2 id="unlocked-title">My Unlocked Contacts</h2><p>You have unlocked ${unlocks.length} landlord contacts. All data is saved to your account.</p></div>${button("close-modal", "×", { className: "button button-icon", extra: 'aria-label="Close dialog"' })}</div><div class="modal-content">${unlocks.length ? unlocks.map((record) => {
    const listing = getListing(record.listingId);
    const details = state.privateDetails[record.listingId];
    if (!listing) return "";
    return `<article class="queue-card"><div class="between wrap"><div class="row">${image(listing.photos[0], listing.title, "image-small")}<div><span class="eyebrow">${escapeHtml(listing.campus)}</span><h3 style="margin:.3rem 0;color:#fff;font-size:.87rem">${escapeHtml(listing.title)}</h3><p class="fine-print">${money(listing.price)} / mo · ${escapeHtml(listing.generalArea)}</p></div></div><span class="status-pill">Receipt ${escapeHtml(record.receiptNumber)}</span></div>${details ? renderPrivateDetails(listing, details) : `<p class="fine-print">Contact details verification in progress.</p>`}${button("open-detail", "View Room Details", { className: "button button-small", extra: `data-listing="${escapeHtml(listing.id)}"` })}</article>`;
  }).join("") : `<div class="empty-state"><h2>No Unlocked Contacts Yet</h2><p>Browse student boarding houses and unlock landlord details for quick WhatsApp and viewing appointments.</p></div>`}</div></section></div>`;
}

// --- Landlord dashboard -----------------------------------------------------
// Landlords manage their own room listings and a practical rent/occupancy roster.
function renderLandlord() {
  const user = getUser();
  return renderLandlordDashboard(user, false);
}

function renderLandlordDashboard(user, adminMode = false) {
  const listings = state.listings.filter((listing) => listing.landlordId === user.id);
  const tenants = state.tenants.filter((tenant) => tenant.landlordId === user.id);
  const unlockTotal = listings.reduce((sum, listing) => sum + (listing.unlockCount || 0), 0);
  const activeYield = listings.filter((listing) => listing.status === "approved")
    .reduce((sum, listing) => sum + listing.rooms.reduce((roomSum, room) => roomSum + Number(room.price || 0), 0), 0);
  return `<div class="section dashboard">
    ${adminMode ? `<section class="panel between wrap"><div><span class="eyebrow">Admin oversight</span><h2 style="margin:.3rem 0;color:#fff">Landlord dashboard: ${escapeHtml(user.name)}</h2><p class="fine-print">Viewing the landlord's properties, rooms, roster, occupancy, rent and inquiries.</p></div>${button("back-to-admin", "← Back to Admin", { className: "button button-small" })}</section>` : ""}
    <section class="hero-panel"><div class="between wrap"><div class="row">${image(user.avatarUrl, user.name, "image-small")}<div><h1>${escapeHtml(user.name)}</h1><p class="hero-description">${user.isVerified ? `<span class="status-pill approved">✓ Verified Partner</span>` : adminMode ? `<span class="status-pill">Not verified</span>` : button("open-verification", "Request ID Verification", { className: "button button-small" })}<br>${adminMode ? "Landlord Portal · Admin oversight mode." : "Landlord Portal · Manage your student rooms and monitor interested student unlocks."}</p></div></div>${button("open-listing-form", "＋ Add New Boarding Room", { className: "button button-primary" })}</div>
      <div class="stats-grid"><div class="stat-card"><span class="stat-label">My Total Listings</span><strong class="stat-value">${listings.length}</strong><span class="stat-hint">${listings.filter((listing) => listing.status === "approved").length} Active & Live</span></div><div class="stat-card"><span class="stat-label">Student Inquiries / Unlocks</span><strong class="stat-value">${unlockTotal}</strong><span class="stat-hint">Students who unlocked your phone & address</span></div><div class="stat-card"><span class="stat-label">Potential Monthly Yield</span><strong class="stat-value">${money(activeYield)}</strong><span class="stat-hint">Combined rent for active rooms</span></div></div>
    </section>
    <nav class="tab-list" aria-label="${adminMode ? "Landlord dashboard sections" : "Landlord sections"}"><button class="tab-button ${state.landlordTab === "roster" ? "active" : ""}" data-action="landlord-tab" data-tab="roster">▦ Tenant & Room Roster (${tenants.length})</button><button class="tab-button ${state.landlordTab === "listings" ? "active" : ""}" data-action="landlord-tab" data-tab="listings">⌂ Boarding House Listings (${listings.length})</button></nav>
    ${state.landlordTab === "listings" ? renderLandlordListings(listings) : renderTenantRoster(tenants, listings)}
  </div>`;
}

function renderLandlordListings(listings) {
  return `<section class="stack"><div class="between"><h2 style="margin:0;color:#fff">My Registered Boarding Houses <span class="status-pill">${listings.length}</span></h2>${button("open-listing-form", "＋ Add Boarding House", { className: "button button-primary button-small" })}</div>${listings.length ? `<div class="listing-grid">${listings.map((listing) => `<article class="listing-card"><div class="listing-photo" ${listing.photos.length > 1 ? `data-carousel-listing="${escapeHtml(listing.id)}"` : ""}>${image(listing.photos[state.photoIndex[listing.id] || 0] || listing.photos[0], listing.title)}<span class="badge" style="position:absolute;top:.7rem;left:.7rem">${escapeHtml(statusLabel(listing.status))}</span><span class="badge" style="position:absolute;right:.7rem;bottom:.7rem">${listing.unlockCount || 0} Unlocks</span>${listing.photos.length > 1 ? `<button class="photo-nav photo-prev" type="button" data-action="photo-prev" data-listing="${escapeHtml(listing.id)}" aria-label="Previous photo">‹</button><button class="photo-nav photo-next" type="button" data-action="photo-next" data-listing="${escapeHtml(listing.id)}" aria-label="Next photo">›</button>` : ""}</div><div class="listing-copy"><div><div class="listing-meta"><span>${escapeHtml(listing.campus)}</span><strong>${money(listing.price)} / mo</strong></div><h3 class="listing-title">${escapeHtml(listing.title)}</h3><p class="listing-area">${escapeHtml(listing.generalArea)}</p></div>${photoUploadControls(listing, "landlord")}<div class="between wrap">${button("manage-rooms", `Manage Rooms (${listing.rooms.length})`, { className: "button button-small", extra: `data-listing="${escapeHtml(listing.id)}"` })}${button("toggle-listing-status", listing.status === "approved" ? "Mark Taken" : "Set Available", { className: "button button-small", extra: `data-listing="${escapeHtml(listing.id)}"` })}${button("delete-listing", "Delete", { className: "button button-danger button-small", extra: `data-listing="${escapeHtml(listing.id)}"` })}</div></div></article>`).join("")}</div>` : `<div class="empty-state"><h2>No Boarding Rooms Listed Yet</h2><p>Add your available boarding rooms to connect directly with university students verified by the UniNest agent.</p>${button("open-listing-form", "Submit First Listing", { className: "button button-primary" })}</div>`}</section>`;
}

function daysRemaining(dateString) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${dateString}T00:00:00`);
  const days = Math.ceil((due.getTime() - today.getTime()) / 86400000);
  return { days, overdue: days < 0, dueSoon: days >= 0 && days <= 30 };
}

function renderTenantRoster(tenants, listings) {
  const filtered = tenants.filter((tenant) => {
    if (state.tenantListing !== "all" && tenant.listingId !== state.tenantListing) return false;
    const remaining = daysRemaining(tenant.paidUntilDate);
    if (state.tenantStatus === "overdue" && !remaining.overdue) return false;
    if (state.tenantStatus === "due_soon" && (!remaining.dueSoon || remaining.overdue)) return false;
    if (state.tenantStatus === "paid" && (remaining.overdue || remaining.dueSoon)) return false;
    const query = state.tenantSearch.trim().toLowerCase();
    return !query || [tenant.studentName, tenant.roomNumber, tenant.studentPhone, tenant.studentProgram || ""].some((value) => value.toLowerCase().includes(query));
  });
  const totalRent = tenants.reduce((sum, tenant) => sum + Number(tenant.monthlyRent || 0), 0);
  const overdue = tenants.filter((tenant) => daysRemaining(tenant.paidUntilDate).overdue).length;
  const dueSoon = tenants.filter((tenant) => daysRemaining(tenant.paidUntilDate).dueSoon).length;
  const paid = tenants.length - overdue - dueSoon;
  return `<section class="stack">
    <div class="panel"><div class="between wrap"><div><h2 style="margin:0;color:#fff">Boarding House Occupancy & Tenants <span class="status-pill">Live Roster</span></h2><p class="fine-print">Track room assignments, payment records, and remaining prepaid lease months.</p></div>${button("open-tenant-form", "＋ Add Tenant", { className: "button button-primary" })}</div><div class="stats-grid"><div class="stat-card"><span class="stat-label">Monthly Rent Roll</span><strong class="stat-value">${money(totalRent)}</strong><span class="stat-hint">From occupied rooms</span></div><div class="stat-card"><span class="stat-label">Paid & Good Standing</span><strong class="stat-value">${paid}</strong><span class="stat-hint">More than 1 month remaining</span></div><div class="stat-card"><span class="stat-label">Action Needed</span><strong class="stat-value">${overdue + dueSoon}</strong><span class="stat-hint">${overdue} overdue · ${dueSoon} due soon</span></div></div></div>
    <div class="panel filter-row"><input class="field" id="tenant-search" type="search" value="${escapeHtml(state.tenantSearch)}" placeholder="Search tenant name, room number, or program..."><select class="select" id="tenant-listing-filter"><option value="all">All Boarding Houses</option>${listings.map((listing) => `<option value="${escapeHtml(listing.id)}" ${state.tenantListing === listing.id ? "selected" : ""}>${escapeHtml(listing.title.slice(0, 30))}</option>`).join("")}</select><select class="select" id="tenant-status-filter"><option value="all">All payment statuses</option><option value="paid" ${state.tenantStatus === "paid" ? "selected" : ""}>Paid</option><option value="due_soon" ${state.tenantStatus === "due_soon" ? "selected" : ""}>Due Soon</option><option value="overdue" ${state.tenantStatus === "overdue" ? "selected" : ""}>Overdue</option></select></div>
    ${filtered.length ? `<div class="tenant-grid">${filtered.map((tenant) => {
      const listing = listings.find((item) => item.id === tenant.listingId);
      const remaining = daysRemaining(tenant.paidUntilDate);
      const text = remaining.overdue ? `${Math.abs(remaining.days)} days overdue` : remaining.days === 0 ? "Due Today" : `${(remaining.days / 30.4).toFixed(1)} months left (${remaining.days} days)`;
      const status = remaining.overdue ? "overdue" : remaining.dueSoon ? "due_soon" : "paid";
      const phoneDigits = tenant.studentPhone.replace(/\D/g, "");
      const message = encodeURIComponent(`Hello ${tenant.studentName}, regarding your room (${tenant.roomNumber}) at ${listing?.title || "the boarding house"}.`);
      return `<article class="tenant-card stack"><div class="between"><div><span class="eyebrow">⌂ ${escapeHtml(tenant.roomNumber)}</span><h3 style="margin:.3rem 0;color:#fff">${escapeHtml(tenant.studentName)}</h3></div><span class="status-pill ${status}">${escapeHtml(text)}</span></div><p class="fine-print">${escapeHtml(listing?.title || "Boarding House")}</p><div class="info-box"><p><strong>Program:</strong> ${escapeHtml(tenant.studentProgram || "Not provided")}</p><p style="margin-top:.4rem"><strong>Monthly Rent:</strong> ${money(tenant.monthlyRent)}</p><p style="margin-top:.4rem"><strong>Lease:</strong> ${escapeHtml(tenant.leaseStartDate)} · <strong>Paid Until:</strong> ${escapeHtml(tenant.paidUntilDate)}</p>${tenant.notes ? `<p style="margin-top:.4rem"><strong>Note:</strong> ${escapeHtml(tenant.notes)}</p>` : ""}</div><div class="between wrap"><div class="contact-actions"><a class="button button-success button-small" href="https://wa.me/${phoneDigits}?text=${message}" target="_blank" rel="noopener noreferrer">◉ WhatsApp</a><a class="button button-small" href="tel:${escapeHtml(tenant.studentPhone)}">☎ Call</a></div><div class="contact-actions">${button("record-rent", "Record Rent", { className: "button button-primary button-small", extra: `data-tenant="${escapeHtml(tenant.id)}"` })}${button("remove-tenant", "Remove", { className: "button button-danger button-small", extra: `data-tenant="${escapeHtml(tenant.id)}"` })}</div></div></article>`;
    }).join("")}</div>` : `<div class="empty-state"><h2>No Tenants Found in Roster</h2><p>${tenants.length ? "Try clearing your search query or status filter to see other occupants." : "Add your current students to keep track of their room assignments, rent payments, and remaining months."}</p>${tenants.length ? "" : button("open-tenant-form", "Add First Tenant", { className: "button button-primary" })}</div>`}
  </section>`;
}

// --- Administrator operations ----------------------------------------------
// The admin view exposes the original queues and moderation actions as tabs.
function renderAdmin() {
  const selectedLandlord = state.users.find((user) => user.id === state.adminLandlordId && user.role === "landlord");
  if (state.adminTab === "landlord_dashboard" && selectedLandlord) {
    return renderLandlordDashboard(selectedLandlord, true);
  }
  const pendingListings = state.listings.filter((listing) => listing.status === "pending");
  const pendingPayments = state.payments.filter((payment) => payment.status === "pending");
  const pendingReports = state.reports.filter((report) => report.status === "pending");
  const revenue = state.unlocks.reduce((sum, unlock) => sum + Number(unlock.amountPaid || state.agentFee), 0);
  const tabs = [
    ["listings", `⌂ Pending Listings (${pendingListings.length})`],
    ["payments", `▣ Manual Payments (${pendingPayments.length})`],
    ["reports", `⚑ Disputes & Reports (${pendingReports.length})`],
    ["all_listings", `☷ All Listings (${state.listings.length})`],
    ["landlords", `♙ Landlords (${state.users.filter((user) => user.role === "landlord").length})`],
    ["users", `♙ Users & Landlords (${state.users.length})`],
  ];
  return `<div class="section dashboard">
    <section class="hero-panel"><div class="between wrap"><div><h1>Agent Operations Dashboard <span class="status-pill">Admin Panel</span></h1><p class="hero-description">Oversee boarding house approvals, manual payment receipts, agent fee pricing, and student reports.</p></div><form data-form="agent-fee" class="row"><label class="field-label" for="agent-fee">Agent Unlock Fee (ZMW)</label><input id="agent-fee" class="field" type="number" name="fee" min="5" max="500" value="${escapeHtml(state.agentFee)}" style="width:7rem"><button class="button button-primary" type="submit">Update Fee</button></form></div>
      <div class="stats-grid four"><div class="stat-card"><span class="stat-label">Agent Total Revenue</span><strong class="stat-value">${money(revenue)}</strong><span class="stat-hint">From ${state.unlocks.length} student unlocks</span></div><div class="stat-card"><span class="stat-label">Pending Listings</span><strong class="stat-value">${pendingListings.length}</strong><span class="stat-hint">Awaiting agent verification</span></div><div class="stat-card"><span class="stat-label">Pending Payments</span><strong class="stat-value">${pendingPayments.length}</strong><span class="stat-hint">Manual mobile money slips</span></div><div class="stat-card"><span class="stat-label">Student Reports</span><strong class="stat-value">${pendingReports.length}</strong><span class="stat-hint">Room taken / wrong phone</span></div></div>
    </section>
    <nav class="tab-list" aria-label="Administration sections">${tabs.map(([id, label]) => `<button class="tab-button ${state.adminTab === id ? "active" : ""}" data-action="admin-tab" data-tab="${id}">${label}</button>`).join("")}</nav>
    ${renderAdminTab(pendingListings, pendingPayments, pendingReports)}
  </div>`;
}

function renderAdminTab(pendingListings, pendingPayments, pendingReports) {
  if (state.adminTab === "payments") {
    return `<section class="stack"><h2 style="margin:0;color:#fff">Manual Mobile Money Slips & Approvals</h2>${pendingPayments.length ? `<div class="admin-list">${pendingPayments.map((payment) => `<article class="queue-card"><div class="between wrap"><div><span class="status-pill">${escapeHtml(payment.reference)}</span> <span class="fine-print">Method: ${escapeHtml(payment.method)}</span><p style="color:#fff;font-weight:800">${escapeHtml(payment.studentName)} (${escapeHtml(payment.studentPhone)})</p><p class="fine-print">Unlocking: <strong>${escapeHtml(payment.listingTitle)}</strong> · Amount: <strong>${money(payment.amount)}</strong></p></div><div class="contact-actions">${button("approve-payment", "✓ Approve", { className: "button button-success", extra: `data-payment="${escapeHtml(payment.id)}"` })}${button("reject-payment", "Decline", { className: "button button-danger", extra: `data-payment="${escapeHtml(payment.id)}"` })}</div></div></article>`).join("")}</div>` : emptyAdmin("No Pending Payments", "All student payment reference slips have been processed.")}</section>`;
  }
  if (state.adminTab === "reports") {
    return `<section class="stack"><h2 style="margin:0;color:#fff">Student Reports & Quality Complaints</h2>${pendingReports.length ? `<div class="admin-list">${pendingReports.map((report) => `<article class="queue-card"><div class="between wrap"><div><span class="status-pill rejected">${escapeHtml(statusLabel(report.reason))}</span> <span class="fine-print">Reported by ${escapeHtml(report.reporterName)}</span><h3 style="color:#fff;font-size:.9rem">Listing: ${escapeHtml(report.listingTitle)}</h3><p class="fine-print">“${escapeHtml(report.comment)}”</p></div><div class="contact-actions">${button("resolve-report", "Mark Resolved", { className: "button button-primary button-small", extra: `data-report="${escapeHtml(report.id)}" data-status="resolved"` })}${button("resolve-report", "Dismiss", { className: "button button-small", extra: `data-report="${escapeHtml(report.id)}" data-status="dismissed"` })}</div></div></article>`).join("")}</div>` : emptyAdmin("Zero Active Reports", "No unresolved student complaints found.")}</section>`;
  }
  if (state.adminTab === "all_listings") {
    return `<section class="stack"><h2 style="margin:0;color:#fff">All Platform Listings</h2><div class="management-grid">${state.listings.map((listing) => `<article class="management-card"><div class="between"><span class="fine-print">${escapeHtml(listing.campus)}</span><span class="status-pill ${escapeHtml(listing.status)}">${escapeHtml(statusLabel(listing.status))}</span></div><h3 style="color:#fff;font-size:.85rem">${escapeHtml(listing.title)}</h3><p class="fine-print">${escapeHtml(listing.generalArea)}</p><p class="fine-print"><strong>${money(listing.price)} / mo</strong> · ${listing.unlockCount || 0} Unlocks</p>${photoUploadControls(listing, "admin")}<div class="between"><span class="fine-print">${escapeHtml(listing.landlordNameDisplay)}</span>${button(listing.status === "approved" ? "reject-listing" : "approve-listing", listing.status === "approved" ? "Delist" : "Approve", { className: `button button-small ${listing.status === "approved" ? "button-danger" : "button-success"}`, extra: `data-listing="${escapeHtml(listing.id)}"` })}</div></article>`).join("")}</div></section>`;
  }
  if (state.adminTab === "landlords") {
    const landlords = state.users.filter((user) => user.role === "landlord");
    return `<section class="stack"><h2 style="margin:0;color:#fff">Landlord Oversight</h2><p class="fine-print">Open a landlord profile to review the same listings, room inventory, tenant roster, occupancy, rent and inquiries they see.</p><div class="admin-list">${landlords.length ? landlords.map((landlord) => {
      const listings = state.listings.filter((listing) => listing.landlordId === landlord.id);
      const tenants = state.tenants.filter((tenant) => tenant.landlordId === landlord.id);
      const roomCount = listings.reduce((sum, listing) => sum + listing.rooms.length, 0);
      const inquiries = listings.reduce((sum, listing) => sum + Number(listing.unlockCount || 0), 0);
      const rentRoll = tenants.reduce((sum, tenant) => sum + Number(tenant.monthlyRent || 0), 0);
      return `<article class="queue-card"><div class="between wrap"><div class="row">${image(landlord.avatarUrl, landlord.name, "avatar")}<div><h3 style="margin:0;color:#fff">${escapeHtml(landlord.name)}</h3><p class="fine-print">${escapeHtml(landlord.email)} · ${escapeHtml(landlord.phone)}</p><div class="landlord-overview-stats"><span>${listings.length} listings</span><span>${roomCount} rooms</span><span>${tenants.length} tenants</span><span>${inquiries} inquiries</span><span>${money(rentRoll)} rent roll</span></div></div></div><div class="contact-actions">${button("open-landlord-dashboard", "Open Dashboard", { className: "button button-primary button-small", extra: `data-user="${escapeHtml(landlord.id)}"` })}${button("toggle-verify", landlord.isVerified ? "Revoke Verified" : "Grant Verified", { className: "button button-small", extra: `data-user="${escapeHtml(landlord.id)}"` })}</div></div></article>`;
    }).join("") : emptyAdmin("No Landlords Yet", "Landlord profiles will appear here after they register.")}</div></section>`;
  }
  if (state.adminTab === "users") {
    return `<section class="stack"><h2 style="margin:0;color:#fff">Platform Users & Verification</h2><div class="admin-list">${state.users.map((user) => `<article class="queue-card"><div class="between wrap"><div class="row">${image(user.avatarUrl, user.name, "avatar")}<div><strong>${escapeHtml(user.name)}</strong> <span class="status-pill">${escapeHtml(user.role)}</span>${user.isVerified ? `<span class="status-pill approved">Verified</span>` : ""}<p class="fine-print">${escapeHtml(user.phone)} · ${escapeHtml(user.email)}</p></div></div><div class="contact-actions">${user.role === "landlord" ? `${button("open-landlord-dashboard", "View Dashboard", { className: "button button-small", extra: `data-user="${escapeHtml(user.id)}"` })}${button("toggle-verify", user.isVerified ? "Revoke Verified" : "Grant Verified", { className: "button button-small", extra: `data-user="${escapeHtml(user.id)}"` })}` : ""}</div></div></article>`).join("")}</div></section>`;
  }
  return `<section class="stack"><h2 style="margin:0;color:#fff">Landlord Listings Awaiting Agent Review</h2>${pendingListings.length ? `<div class="admin-list">${pendingListings.map((listing) => {
    const details = state.privateDetails[listing.id];
    return `<article class="queue-card"><div class="between wrap"><div class="row" style="align-items:flex-start">${image(listing.photos[0], listing.title, "image-small")}<div><span class="eyebrow">${escapeHtml(listing.campus)} · ${escapeHtml(listing.id)}</span><h3 style="margin:.35rem 0;color:#fff">${escapeHtml(listing.title)}</h3><p class="fine-print"><strong>Safe Public Area:</strong> ${escapeHtml(listing.generalArea)} · <strong>Price:</strong> ${money(listing.price)} / mo<br>Submitted by: ${escapeHtml(listing.landlordNameDisplay)}</p></div></div><div class="contact-actions">${button("approve-listing", "✓ Approve & Publish", { className: "button button-success", extra: `data-listing="${escapeHtml(listing.id)}"` })}${button("reject-listing", "Reject", { className: "button button-danger", extra: `data-listing="${escapeHtml(listing.id)}"` })}</div></div>${details ? `<div class="private-details"><p><strong>Guarded Exact Address:</strong> ${escapeHtml(details.exactAddress)}<br>${escapeHtml(details.landmarkDirections)}</p><p><strong>Guarded Landlord Phone:</strong> ${escapeHtml(details.landlordPhone)}<br>Viewing: ${escapeHtml(details.viewingHours)}</p></div>` : ""}</article>`;
  }).join("")}</div>` : emptyAdmin("Queue is Clear!", "All submitted boarding houses have been inspected and approved.")}</section>`;
}

function emptyAdmin(title, message) {
  return `<div class="empty-state"><h2>${escapeHtml(title)}</h2><p>${escapeHtml(message)}</p></div>`;
}

// --- Dialog templates -------------------------------------------------------
// Dialogs are inserted into a dedicated semantic region and dismissed by button, backdrop, or Escape.
function renderModal() {
  const modal = state.modal;
  if (!modal) return "";
  const listing = modal.listingId ? getListing(modal.listingId) : null;
  if (modal.type === "detail" && listing) return renderDetailModal(listing);
  if (modal.type === "unlock" && listing) return renderUnlockModal(listing);
  if (modal.type === "favorites") return renderFavoritesModal();
  if (modal.type === "unlocked") return renderUnlockedModal();
  if (modal.type === "report" && listing) return renderReportModal(listing);
  if (modal.type === "review" && listing) return renderReviewModal(listing);
  if (modal.type === "listing-form") return renderListingForm();
  if (modal.type === "room-inventory" && listing) return renderRoomInventoryModal(listing);
  if (modal.type === "room-form" && listing) return renderRoomFormModal(listing);
  if (modal.type === "tenant-form") return renderTenantForm();
  if (modal.type === "rent-form") return renderRentForm();
  if (modal.type === "verification") return renderVerificationModal();
  return "";
}

function renderRoomInventoryModal(listing) {
  return `<div class="modal-backdrop" data-action="backdrop-close"><section class="modal modal-wide" role="dialog" aria-modal="true" aria-labelledby="room-inventory-title"><div class="modal-header"><div><h2 id="room-inventory-title">Manage Rooms</h2><p>${escapeHtml(listing.title)} · occupied spaces update from the tenant roster.</p></div>${button("close-modal", "×", { className: "button button-icon", extra: 'aria-label="Close dialog"' })}</div><div class="modal-content"><div class="between"><span class="eyebrow">${listing.rooms.length} rooms</span>${button("add-room", "＋ Add Room", { className: "button button-primary button-small", extra: `data-listing="${escapeHtml(listing.id)}"` })}</div>${listing.rooms.length ? `<div class="room-card-grid">${listing.rooms.map((room) => {
    const taken = roomOccupants(listing, room);
    return `<article class="room-detail-card"><div class="between wrap"><h4>${escapeHtml(room.name)}</h4><span class="status-pill">${taken} / ${room.totalSpaces} taken</span></div><p class="fine-print">${money(room.price)} monthly · Advance ${Number(room.advancePayment) > 0 ? money(room.advancePayment) : "not set"}</p><div class="between wrap">${button("edit-room", "Edit", { className: "button button-small", extra: `data-listing="${escapeHtml(listing.id)}" data-room="${escapeHtml(room.id)}"` })}${button("delete-room", "Delete", { className: "button button-danger button-small", extra: `data-listing="${escapeHtml(listing.id)}" data-room="${escapeHtml(room.id)}"` })}</div></article>`;
  }).join("")}</div>` : `<div class="empty-state"><h2>No rooms added</h2><p>Add individual rooms to show students their pricing, advance payment, features, and bed-space availability.</p></div>`}</div></section></div>`;
}

function renderRoomFormModal(listing) {
  const room = listing.rooms.find((item) => item.id === state.modal.roomId);
  const title = room ? "Edit Room" : "Add Room";
  const features = room?.features?.join(", ") || listing.amenities.map(amenityName).join(", ");
  return `<div class="modal-backdrop" data-action="backdrop-close"><section class="modal modal-narrow" role="dialog" aria-modal="true" aria-labelledby="room-form-title"><div class="modal-header"><div><h2 id="room-form-title">${title}</h2><p>${escapeHtml(listing.title)}</p></div>${button("close-modal", "×", { className: "button button-icon", extra: 'aria-label="Close dialog"' })}</div><form data-form="room" class="modal-content"><input type="hidden" name="roomId" value="${escapeHtml(room?.id || "")}">${field("name", "Room name or number", room?.name || "", { required: true, placeholder: "e.g. Room 104 or Wing B · Bed 2" })}<div class="form-grid">${field("price", "Monthly price (ZMW)", room?.price ?? listing.price, { type: "number", min: 1, required: true })}${field("advancePayment", "Advance payment (ZMW)", room?.advancePayment ?? "", { type: "number", min: 0, required: true, placeholder: "0 if not specified" })}${field("totalSpaces", "Total bed spaces", room?.totalSpaces ?? roomCapacityForListing(listing), { type: "number", min: 1, max: 50, required: true })}${field("features", "Features (comma separated)", features, { wide: true, placeholder: "Private bathroom, desk, solar backup" })}</div><p class="fine-print">Occupied bed spaces are counted from tenants assigned to this room in your roster.</p><div class="between"><span></span><button class="button button-primary" type="submit">Save Room Details</button></div></form></section></div>`;
}

function renderReportModal(listing) {
  return `<div class="modal-backdrop" data-action="backdrop-close"><section class="modal modal-narrow" role="dialog" aria-modal="true" aria-labelledby="report-title"><div class="modal-header"><div><h2 id="report-title">Report Listing</h2><p>Help the UniNest agent keep listings clean and verified.</p></div>${button("close-modal", "×", { className: "button button-icon", extra: 'aria-label="Close dialog"' })}</div><div class="modal-content">${state.modal.submitted ? `<div class="empty-state"><h2>Report Received</h2><p>The UniNest agent will review this report and take appropriate action. Thank you for protecting fellow students!</p></div>` : `<div class="info-box"><strong>${escapeHtml(listing.title)}</strong><p>${escapeHtml(listing.generalArea)}</p></div><form data-form="report" class="stack">${selectField("reason", "Reason for Reporting", [["already_taken", "Room is already taken / fully booked"], ["fake_listing", "Fake / Scam / Suspicious listing"], ["wrong_phone", "Landlord phone is wrong or unreachable"], ["price_mismatch", "Landlord demanded higher rent than listed"], ["safety_hazard", "Property has security or health hazard"], ["other", "Other issue"]], "already_taken")}${field("comment", "Additional Details", "", { required: true, multiline: true, placeholder: "Provide context for the agent…" })}<button class="button button-danger" type="submit">Submit Report to Agent</button></form>`}</div></section></div>`;
}

function renderReviewModal(listing) {
  const rating = state.modal.rating || 5;
  return `<div class="modal-backdrop" data-action="backdrop-close"><section class="modal modal-narrow" role="dialog" aria-modal="true" aria-labelledby="review-title"><div class="modal-header"><div><h2 id="review-title">Rate & Review Room</h2><p>Share your viewing experience with fellow students.</p></div>${button("close-modal", "×", { className: "button button-icon", extra: 'aria-label="Close dialog"' })}</div><div class="modal-content">${state.modal.submitted ? `<div class="empty-state"><h2>Review Published!</h2><p>Thank you for contributing to the UniNest verified student community.</p></div>` : `<div class="info-box"><strong>${escapeHtml(listing.title)}</strong><p>${escapeHtml(listing.generalArea)}</p></div><form data-form="review" class="stack"><div><span class="field-label">Overall Rating</span><div class="row">${[1, 2, 3, 4, 5].map((star) => `<button type="button" class="star-button" data-action="set-rating" data-rating="${star}" aria-label="${star} stars">${star <= rating ? "★" : "☆"}</button>`).join("")}<strong>${rating} / 5 Stars</strong></div><input type="hidden" name="rating" value="${rating}"></div>${field("program", "Your University / Program", "3rd Year Student", { required: true, placeholder: "e.g. 2nd Year Engineering, CBU" })}${field("comment", "Review & Feedback", "", { required: true, multiline: true, placeholder: "How was the study environment, water, power, and landlord response?" })}<button class="button button-primary" type="submit">Submit Review</button></form>`}</div></section></div>`;
}

function renderListingRoomEntry(index, room = {}) {
  const roomNumber = index + 1;
  return `<fieldset class="listing-room-entry" data-room-entry="${index}"><legend>Room ${roomNumber} details</legend><div class="form-grid">${field(`roomName-${index}`, "Room name or number", room.name || `Room ${roomNumber}`, { required: true })}${field(`roomSpaces-${index}`, "Number of people / spaces", room.totalSpaces ?? 1, { required: true, type: "number", min: 1, max: 50 })}${field(`roomPrice-${index}`, "Monthly amount (ZMW)", room.price ?? 1200, { required: true, type: "number", min: 1 })}${field(`roomAdvance-${index}`, "Advance payment (ZMW)", room.advancePayment ?? 0, { required: true, type: "number", min: 0 })}${field(`roomFeatures-${index}`, "Room features / specifications (comma separated)", (room.features || []).map(amenityName).join(", "), { wide: true, placeholder: "Private bathroom, desk, wardrobe" })}</div></fieldset>`;
}

function updateListingRoomEntries(input) {
  const container = document.getElementById("listing-room-entries");
  const roomCount = Number(input.value);
  if (!container || !Number.isInteger(roomCount) || roomCount < 1 || roomCount > 50) return;

  const currentRooms = [...container.querySelectorAll("[data-room-entry]")].map((entry, index) => ({
    name: entry.querySelector(`[name="roomName-${index}"]`)?.value,
    totalSpaces: entry.querySelector(`[name="roomSpaces-${index}"]`)?.value,
    price: entry.querySelector(`[name="roomPrice-${index}"]`)?.value,
    advancePayment: entry.querySelector(`[name="roomAdvance-${index}"]`)?.value,
    features: (entry.querySelector(`[name="roomFeatures-${index}"]`)?.value || "").split(",").map((feature) => feature.trim()).filter(Boolean),
  }));
  container.innerHTML = Array.from({ length: roomCount }, (_, index) =>
    renderListingRoomEntry(index, currentRooms[index] || {})
  ).join("");
}

function renderListingForm() {
  const user = getUser();
  const landlord = user.role === "admin"
    ? state.users.find((account) => account.id === state.adminLandlordId && account.role === "landlord")
    : user;
  if (!landlord || landlord.role !== "landlord") {
    return `<div class="modal-backdrop"><section class="modal modal-narrow" role="dialog" aria-modal="true" aria-labelledby="listing-owner-error"><div class="modal-header"><h2 id="listing-owner-error">Choose a landlord first</h2>${button("close-modal", "×", { className: "button button-icon", extra: 'aria-label="Close dialog"' })}</div><div class="modal-content"><p>Select a landlord profile before adding a property on their behalf.</p></div></section></div>`;
  }
  return `<div class="modal-backdrop" data-action="backdrop-close"><section class="modal modal-wide" role="dialog" aria-modal="true" aria-labelledby="listing-form-title"><div class="modal-header"><div><h2 id="listing-form-title">Submit New Boarding House</h2><p>Enter the house, public location, shared features, and details for each room.</p></div>${button("close-modal", "×", { className: "button button-icon", extra: 'aria-label="Close dialog"' })}</div><form data-form="listing" class="modal-content">
    <section class="stack"><h3 class="eyebrow">1 · House information (visible to students)</h3><div class="form-grid">${field("title", "House / Listing Name", "", { required: true, wide: true, placeholder: "e.g. Riverside Student Lodge" })}${field("campus", "Campus", "Copperbelt University (CBU)", { required: true })}${field("generalArea", "Area", "", { required: true, placeholder: "e.g. Riverside" })}${field("streetName", "Street name (shown to students)", "", { required: true, placeholder: "e.g. Munkoyo Street" })}${selectField("roomType", "Main Room Type", [["single", "Single Room"], ["shared_2", "2-in-1 Shared"], ["shared_4", "4-Bed Sharing"], ["self_contained", "Self-Contained Studio"], ["bedspace", "Bedspace"]], "single")}${selectField("genderRule", "Gender Policy", [["mixed", "Mixed Gender"], ["female_only", "Female Students Only"], ["male_only", "Male Students Only"]], "mixed")}${field("distanceToCampus", "Distance to Campus", "400m / 5 min walk", { required: true })}<div class="form-field full"><label class="field-label" for="listing-photo-files">Upload house and room photos</label><input id="listing-photo-files" class="field photo-file-input" type="file" name="photos" accept="image/*" multiple data-preview-target="listing-photo-preview" aria-describedby="listing-photo-help"><small id="listing-photo-help" class="fine-print">Choose up to ${MAX_PHOTOS_PER_UPLOAD} images, each no larger than 12 MB. Uploaded photos are saved only in this browser.</small><div id="listing-photo-preview" class="photo-preview-grid" aria-live="polite"></div></div>${field("description", "House Description", "", { multiline: true, wide: true, placeholder: "Describe the boarding house and shared facilities…" })}<div class="form-field full"><span class="field-label">Other House Features</span><div class="chip-list">${AMENITIES.map((amenity) => `<label class="chip"><input type="checkbox" name="amenities" value="${amenity.id}" ${["wifi", "water", "security"].includes(amenity.id) ? "checked" : ""}> ${escapeHtml(amenity.name)}</label>`).join("")}</div></div>${field("specialFeatures", "Additional special features (comma separated)", "", { wide: true, placeholder: "Fenced yard, private garden, study room" })}${field("houseRules", "House Rules (separate with commas)", "No loud noise after 22:00, Keep kitchen clean", { wide: true })}</div></section>
    <section class="stack info-box"><h3>2 · Number of rooms and room specifications</h3><div class="form-grid">${field("numberOfRooms", "Number of rooms", 1, { required: true, type: "number", min: 1, max: 50 })}</div><p class="fine-print">For each room, enter its capacity, monthly amount, advance payment, and any room-specific features.</p><div id="listing-room-entries" class="listing-room-entry-list">${renderListingRoomEntry(0)}</div></section>
    <section class="stack info-box"><h3>3 · Guarded private details (revealed only after agent unlock)</h3><div class="form-grid">${field("landlordFullName", "Landlord Full Name", landlord?.name || user.name, { required: true })}${field("landlordPhone", "Direct Landlord Phone", landlord?.phone || user.phone, { required: true })}${field("landlordWhatsApp", "WhatsApp Number", landlord?.phone || user.phone, { required: true })}${field("exactAddress", "Exact Plot / House Number (private)", "", { required: true })}${field("landmarkDirections", "Landmark Directions", "", { multiline: true, wide: true })}${field("viewingHours", "Viewing Hours", "Monday - Saturday: 09:00 - 17:00")}${field("caretakerContact", "Caretaker Contact", "")}${field("specialInstructions", "Special Instructions", "Call 30 minutes before arrival.", { wide: true })}</div></section>
    <p class="fine-print">Submissions begin in pending status and must be approved by a UniNest agent before students can view them.</p><div class="between"><span></span><button class="button button-primary" type="submit">Submit Listing for Verification</button></div>
  </form></section></div>`;
}

function renderTenantForm() {
  const user = getUser();
  const landlordId = user.role === "admin" ? state.adminLandlordId : user.id;
  const listings = state.listings.filter((listing) => listing.landlordId === landlordId);
  const selectedListing = listings[0];
  const availableRooms = selectedListing?.rooms.filter((room) => roomOccupants(selectedListing, room) < Number(room.totalSpaces)) || [];
  const landlord = state.users.find((account) => account.id === landlordId);
  return `<div class="modal-backdrop" data-action="backdrop-close"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="tenant-form-title"><div class="modal-header"><div><h2 id="tenant-form-title">Add Tenant to Boarding House</h2><p>Assign a room and log rent payment and prepaid months.${user.role === "admin" && landlord ? ` Admin entry for ${escapeHtml(landlord.name)}.` : ""}</p></div>${button("close-modal", "×", { className: "button button-icon", extra: 'aria-label="Close dialog"' })}</div><form data-form="tenant" class="modal-content"><div class="form-grid">
    ${selectField("listingId", "Select Boarding House Property", listings.map((listing) => [listing.id, `${listing.title} — ${money(listing.price)}/mo`]), listings[0]?.id || "")}
    ${selectField("roomId", "Available Room / Bed Space", availableRooms.map((room) => [room.id, `${room.name} · ${money(room.price)}/mo (${room.totalSpaces - roomOccupants(selectedListing, room)} spaces left)`]), availableRooms[0]?.id || "")}
    ${field("monthlyRent", "Monthly Rent (ZMW)", availableRooms[0]?.price || selectedListing?.price || 1200, { required: true, type: "number", min: 1 })}
    ${field("studentName", "Student Full Name", "", { required: true })}
    ${field("studentPhone", "Student Mobile / WhatsApp", "+260 97 ", { required: true })}
    ${field("studentEmail", "Student Email", "", { type: "email" })}
    ${field("studentProgram", "University / Program", "", { placeholder: "e.g. 2nd Year Architecture, CBU" })}
    ${field("nrcOrStudentId", "Student ID / NRC", "")}
    ${field("leaseStartDate", "Lease Start Date", new Date().toISOString().slice(0, 10), { type: "date", required: true })}
    ${field("monthsPaid", "Months Paid in Advance", 3, { type: "number", min: 1, max: 12, required: true })}
    ${field("notes", "Notes", "Room key and gate tag handed over.", { wide: true })}
  </div><button class="button button-primary" type="submit" ${availableRooms.length ? "" : "disabled"}>Add Tenant to Roster</button>${availableRooms.length ? "" : `<p class="fine-print">No available rooms have capacity. Add a room or increase its bed-space count first.</p>`}</form></section></div>`;
}

function updateTenantRoomOptions(listingId) {
  const form = document.querySelector('form[data-form="tenant"]');
  if (!form) return;
  const listing = getListing(listingId);
  const roomSelect = form.elements.roomId;
  const rentInput = form.elements.monthlyRent;
  if (!listing || !roomSelect || !rentInput) return;
  const availableRoom = listing.rooms.find((room) => roomOccupants(listing, room) < Number(room.totalSpaces));
  roomSelect.innerHTML = listing.rooms.length
    ? listing.rooms.map((room) => {
      const available = roomOccupants(listing, room) < Number(room.totalSpaces);
      return `<option value="${escapeHtml(room.id)}" ${available ? "" : "disabled"} ${room.id === availableRoom?.id ? "selected" : ""}>${escapeHtml(room.name)} · ${money(room.price)}/mo (${Math.max(0, room.totalSpaces - roomOccupants(listing, room))} spaces left)</option>`;
    }).join("")
    : `<option value="">No rooms added</option>`;
  roomSelect.value = availableRoom?.id || "";
  rentInput.value = availableRoom?.price || listing.price;
  const submit = form.querySelector('button[type="submit"]');
  if (submit) submit.disabled = !availableRoom;
}

function renderRentForm() {
  const tenant = state.tenants.find((item) => item.id === state.modal.tenantId);
  if (!tenant) return "";
  return `<div class="modal-backdrop" data-action="backdrop-close"><section class="modal modal-narrow" role="dialog" aria-modal="true" aria-labelledby="rent-title"><div class="modal-header"><div><h2 id="rent-title">Record Rent Payment</h2><p>${escapeHtml(tenant.studentName)} · ${escapeHtml(tenant.roomNumber)}</p></div>${button("close-modal", "×", { className: "button button-icon", extra: 'aria-label="Close dialog"' })}</div><form data-form="rent" class="modal-content"><div class="info-box"><p>Monthly rent: <strong>${money(tenant.monthlyRent)}</strong></p><p style="margin-top:.35rem">Paid until: <strong>${escapeHtml(tenant.paidUntilDate)}</strong></p></div>${field("months", "Additional Months Paid", 1, { type: "number", min: 1, max: 12, required: true })}<button class="button button-primary" type="submit">Confirm Payment</button></form></section></div>`;
}

function renderVerificationModal() {
  return `<div class="modal-backdrop" data-action="backdrop-close"><section class="modal modal-narrow" role="dialog" aria-modal="true" aria-labelledby="verification-title"><div class="modal-header"><div><h2 id="verification-title">Landlord Identity Verification</h2><p>Submit National Registration Card (NRC) or title deed / council lease proof to earn the verified badge.</p></div>${button("close-modal", "×", { className: "button button-icon", extra: 'aria-label="Close dialog"' })}</div><div class="modal-content">${state.modal.submitted ? `<div class="info-box"><p>Verification proof submitted! The UniNest verification agent will review within 24 hours.</p></div>` : `<div class="empty-state"><p aria-hidden="true" style="font-size:2rem;color:#60a5fa">⇧</p><h2>Upload NRC / Property Deed Document</h2><p>PNG, JPG, or PDF up to 10 MB. This demo does not upload documents.</p></div>${button("submit-verification", "Submit Proof to Agent", { className: "button button-primary" })}`}</div></section></div>`;
}

// --- Delegated browser events ----------------------------------------------
// One listener per event type keeps rerendered templates interactive without a framework.
document.addEventListener("click", handleClick);
document.addEventListener("input", handleInput);
document.addEventListener("change", handleChange);
document.addEventListener("submit", handleSubmit);
document.addEventListener("keydown", handleKeydown);

function handleClick(event) {
  const target = event.target.closest("[data-action], [data-user], [data-filter]");
  if (!target) return;

  if (target.dataset.user && !target.dataset.action) {
    state.currentUserId = target.dataset.user;
    state.menuOpen = false;
    state.modal = null;
    render();
    return;
  }
  if (target.dataset.filter) {
    applyFilter(target.dataset.filter, target.dataset.value);
    render();
    return;
  }

  const action = target.dataset.action;
  const listingId = target.dataset.listing;
  const listing = listingId ? getListing(listingId) : null;

  if (action === "backdrop-close" && event.target === target) {
    state.modal = null;
    render();
    return;
  }
  if (action === "home") {
    event.preventDefault();
    state.menuOpen = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
    render();
  } else if (action === "toggle-menu") {
    state.menuOpen = !state.menuOpen;
    render();
  } else if (action === "reset-data") {
    resetDemoData();
  } else if (action === "toggle-filters") {
    state.filtersOpen = !state.filtersOpen;
    render();
  } else if (action === "reset-filters") {
    state.search = "";
    state.roomType = "all";
    state.gender = "all";
    state.maxPrice = 3000;
    state.amenities = [];
    state.sortBy = "featured";
    render();
  } else if (action === "open-detail" && listing) {
    event.stopPropagation();
    state.modal = { type: "detail", listingId };
    render();
  } else if (action === "open-unlock" && listing) {
    event.stopPropagation();
    if (getPrivateDetails(listingId)) {
      state.modal = { type: "detail", listingId };
    } else {
      state.modal = { type: "unlock", listingId, method: "mtn_momo" };
    }
    render();
  } else if (action === "photo-prev" || action === "photo-next") {
    event.stopPropagation();
    if (listing) {
      const length = listing.photos.length;
      const index = state.photoIndex[listingId] || 0;
      state.photoIndex[listingId] = (index + (action === "photo-next" ? 1 : length - 1)) % length;
      if (target.closest("#listing-results")) renderStudentResults();
      else render();
    }
  } else if (action === "choose-photos") {
    document.getElementById(target.dataset.input)?.click();
  } else if (action === "detail-photo-prev" || action === "detail-photo-next" || action === "detail-photo-set") {
    if (!listing) return;
    const key = `detail-${listingId}`;
    const length = listing.photos.length;
    const index = state.photoIndex[key] || 0;
    state.photoIndex[key] = action === "detail-photo-set"
      ? Number(target.dataset.index)
      : (index + (action === "detail-photo-next" ? 1 : length - 1)) % length;
    render();
  } else if (action === "show-favorites") {
    state.modal = { type: "favorites" };
    render();
  } else if (action === "show-unlocked") {
    state.modal = { type: "unlocked" };
    render();
  } else if (action === "toggle-favorite" && listing) {
    event.stopPropagation();
    const current = favoritesForCurrentUser();
    state.favoritesByUser[getUser().id] = current.includes(listingId)
      ? current.filter((id) => id !== listingId)
      : [...current, listingId];
    writeStorage(STORAGE_KEYS.favorites, state.favoritesByUser);
    render();
  } else if (action === "close-modal") {
    state.modal = null;
    render();
  } else if (action === "payment-method") {
    if (state.modal?.type === "unlock") {
      state.modal.method = target.dataset.method;
      state.modal.error = "";
      render();
    }
  } else if (action === "share-listing" && listing) {
    shareListing(listing);
  } else if (action === "copy") {
    copyText(target.dataset.copy || "");
  } else if (action === "open-report" && listing) {
    state.modal = { type: "report", listingId };
    render();
  } else if (action === "open-review" && listing) {
    state.modal = { type: "review", listingId, rating: 5 };
    render();
  } else if (action === "set-rating") {
    if (state.modal?.type === "review") {
      state.modal.rating = Number(target.dataset.rating);
      render();
    }
  } else if (action === "landlord-tab") {
    state.landlordTab = target.dataset.tab;
    render();
  } else if (action === "admin-tab") {
    state.adminTab = target.dataset.tab;
    if (target.dataset.tab !== "landlord_dashboard") state.adminLandlordId = "";
    render();
  } else if (action === "open-landlord-dashboard") {
    const landlord = state.users.find((user) => user.id === target.dataset.user && user.role === "landlord");
    if (!landlord) {
      toast("That landlord profile could not be found.");
      return;
    }
    state.adminLandlordId = landlord.id;
    state.adminTab = "landlord_dashboard";
    state.landlordTab = "roster";
    state.tenantListing = "all";
    state.tenantStatus = "all";
    state.tenantSearch = "";
    render();
  } else if (action === "back-to-admin") {
    state.adminLandlordId = "";
    state.adminTab = "landlords";
    render();
  } else if (action === "open-listing-form") {
    if (getUser().role === "admin" && !state.adminLandlordId) {
      toast("Open a landlord dashboard before creating a listing for them.");
      return;
    }
    state.modal = { type: "listing-form" };
    render();
  } else if (action === "manage-rooms" && listing) {
    state.modal = { type: "room-inventory", listingId };
    render();
  } else if (action === "add-room" && listing) {
    state.modal = { type: "room-form", listingId };
    render();
  } else if (action === "edit-room" && listing) {
    state.modal = { type: "room-form", listingId, roomId: target.dataset.room };
    render();
  } else if (action === "delete-room" && listing) {
    const room = listing.rooms.find((item) => item.id === target.dataset.room);
    if (!room) return;
    if (roomOccupants(listing, room)) {
      toast("Move or remove the tenants assigned to this room before deleting it.");
      return;
    }
    if (window.confirm(`Delete ${room.name}?`)) {
      listing.rooms = listing.rooms.filter((item) => item.id !== room.id);
      saveListings();
      render();
      toast("Room deleted.");
    }
  } else if (action === "open-verification") {
    state.modal = { type: "verification", submitted: false };
    render();
  } else if (action === "submit-verification") {
    if (state.modal?.type === "verification") {
      state.modal.submitted = true;
      render();
      window.setTimeout(() => {
        if (state.modal?.type === "verification") {
          state.modal = null;
          render();
        }
      }, 2000);
    }
  } else if (action === "toggle-listing-status" && listing) {
    listing.status = listing.status === "approved" ? "taken" : "approved";
    saveListings();
    render();
  } else if (action === "delete-listing" && listing) {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      state.listings = state.listings.filter((item) => item.id !== listingId);
      delete state.privateDetails[listingId];
      delete state.photoIndex[listingId];
      saveListings();
      writeStorage(STORAGE_KEYS.privateDetails, state.privateDetails);
      removeUploadedPhotos(listing.photos).catch((error) => {
        console.error("UniNest could not remove photos for the deleted listing.", error);
        toast("The listing was deleted, but some stored photos could not be removed.");
      });
      render();
    }
  } else if (action === "open-tenant-form") {
    state.modal = { type: "tenant-form" };
    render();
  } else if (action === "record-rent") {
    state.modal = { type: "rent-form", tenantId: target.dataset.tenant };
    render();
  } else if (action === "remove-tenant") {
    const tenant = state.tenants.find((item) => item.id === target.dataset.tenant);
    if (tenant && getUser().role !== "admin" && tenant.landlordId !== getUser().id) {
      toast("You can only manage tenants on your own roster.");
      return;
    }
    if (tenant && window.confirm(`Are you sure you want to remove/checkout ${tenant.studentName} from ${tenant.roomNumber}?`)) {
      state.tenants = state.tenants.filter((item) => item.id !== tenant.id);
      persistCollection("tenants", STORAGE_KEYS.tenants);
      render();
    }
  } else if (action === "approve-listing" || action === "reject-listing") {
    updateListingStatus(listingId, action === "approve-listing" ? "approved" : "rejected");
  } else if (action === "approve-payment" || action === "reject-payment") {
    updatePayment(target.dataset.payment, action === "approve-payment");
  } else if (action === "resolve-report") {
    updateReport(target.dataset.report, target.dataset.status);
  } else if (action === "toggle-verify") {
    const user = state.users.find((account) => account.id === target.dataset.user);
    if (user) {
      user.isVerified = !user.isVerified;
      persistCollection("users", STORAGE_KEYS.users);
      render();
    }
  }
}

function handleInput(event) {
  if (event.target.id === "listing-search") {
    state.search = event.target.value;
    renderStudentResults();
  } else if (event.target.id === "max-price") {
    state.maxPrice = Number(event.target.value);
    const value = document.querySelector("#price-value");
    if (value) value.textContent = `${money(state.maxPrice)} / mo`;
    renderStudentResults();
  } else if (event.target.id === "tenant-search") {
    state.tenantSearch = event.target.value;
    render();
    const input = document.querySelector("#tenant-search");
    if (input) {
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
  } else if (event.target.id === "field-numberOfRooms") {
    updateListingRoomEntries(event.target);
  }
}

function handleChange(event) {
  const input = event.target;
  if (input.matches('input[type="file"][data-upload-listing]')) {
    const listing = getListing(input.dataset.uploadListing);
    const files = Array.from(input.files || []);
    input.value = "";
    uploadPhotosToListing(listing, files);
  } else if (input.matches('input[type="file"][data-preview-target]')) {
    previewSelectedPhotos(input);
  } else if (input.name === "listingId" && input.form?.dataset.form === "tenant") {
    updateTenantRoomOptions(input.value);
  } else if (input.name === "roomId" && input.form?.dataset.form === "tenant") {
    const listing = getListing(input.form.elements.listingId.value);
    const room = listing?.rooms.find((item) => item.id === input.value);
    if (room) input.form.elements.monthlyRent.value = room.price;
  } else if (input.id === "listing-sort") {
    state.sortBy = input.value;
    renderStudentResults();
  } else if (input.id === "tenant-listing-filter") {
    state.tenantListing = input.value;
    render();
  } else if (input.id === "tenant-status-filter") {
    state.tenantStatus = input.value;
    render();
  }
}

async function handleSubmit(event) {
  const form = event.target.closest("form[data-form]");
  if (!form) return;
  event.preventDefault();
  const data = new FormData(form);
  const values = Object.fromEntries(data.entries());

  if (form.dataset.form === "instant-payment") {
    startInstantUnlock(values.phone);
  } else if (form.dataset.form === "manual-payment") {
    submitManualPayment(values.reference);
  } else if (form.dataset.form === "report") {
    submitReport(values);
  } else if (form.dataset.form === "review") {
    submitReview(values);
  } else if (form.dataset.form === "agent-fee") {
    const fee = Number(values.fee);
    if (!Number.isFinite(fee) || fee < 5 || fee > 500) {
      toast("Enter an agent fee from K5 to K500.");
      return;
    }
    state.agentFee = fee;
    writeStorage(STORAGE_KEYS.fee, fee);
    render();
    toast("Agent fee updated.");
  } else if (form.dataset.form === "listing") {
    await createListing(data);
  } else if (form.dataset.form === "room") {
    saveRoom(data);
  } else if (form.dataset.form === "tenant") {
    createTenant(values);
  } else if (form.dataset.form === "rent") {
    recordRent(Number(values.months));
  }
}

function handleKeydown(event) {
  if (event.key === "Escape" && state.modal) {
    state.modal = null;
    render();
  } else if (event.key === "Enter" && event.target.matches(".listing-card")) {
    state.modal = { type: "detail", listingId: event.target.dataset.listing };
    render();
  }
}

function applyFilter(type, value) {
  if (type === "roomType") state.roomType = value;
  if (type === "gender") state.gender = value;
  if (type === "amenity") {
    state.amenities = state.amenities.includes(value)
      ? state.amenities.filter((item) => item !== value)
      : [...state.amenities, value];
  }
}

function renderStudentResults() {
  const results = document.querySelector("#listing-results");
  const count = document.querySelector("#listing-count");
  if (results) results.innerHTML = renderListingResults();
  if (count) count.textContent = `Showing ${matchingListings().length} verified rooms near Copperbelt University (Riverside, Kwacha East, Eastlea, West Gate)`;
  refreshUploadedImages(results || document);
  startCardSlideshow();
}

// --- Persistent actions -----------------------------------------------------
// Each mutation updates state first, then writes the compatible demo key.
function saveListings() {
  persistCollection("listings", STORAGE_KEYS.listings);
}

function updateListingStatus(id, status) {
  const listing = getListing(id);
  if (!listing) return;
  listing.status = status;
  saveListings();
  render();
  toast(status === "approved" ? "Listing approved and published." : "Listing status updated.");
}

function updatePayment(id, approve) {
  const payment = state.payments.find((item) => item.id === id);
  if (!payment) return;
  payment.status = approve ? "approved" : "rejected";
  if (approve && !state.unlocks.some((unlock) => unlock.studentId === payment.studentId && unlock.listingId === payment.listingId)) {
    addUnlock(payment.studentId, payment.listingId, payment.amount, payment.method, payment.reference || `APPROVED-${payment.id}`);
  }
  writeStorage(STORAGE_KEYS.payments, state.payments);
  render();
  toast(approve ? "Payment approved; landlord contact unlocked." : "Payment request declined.");
}

function updateReport(id, status) {
  const report = state.reports.find((item) => item.id === id);
  if (!report) return;
  report.status = status;
  persistCollection("reports", STORAGE_KEYS.reports);
  render();
}

function addUnlock(studentId, listingId, amount, method, reference) {
  const previous = state.unlocks.find((unlock) => unlock.studentId === studentId && unlock.listingId === listingId);
  if (previous) return previous;
  const record = {
    id: `unl-${Date.now()}`,
    studentId,
    listingId,
    amountPaid: Number(amount),
    paymentMethod: method,
    paymentReference: reference,
    unlockedAt: new Date().toISOString(),
    receiptNumber: `REC-UN-${Math.floor(10000 + Math.random() * 90000)}`,
  };
  state.unlocks.push(record);
  const listing = getListing(listingId);
  if (listing) listing.unlockCount = (listing.unlockCount || 0) + 1;
  writeStorage(STORAGE_KEYS.unlocks, state.unlocks);
  saveListings();
  return record;
}

function startInstantUnlock(phone) {
  const modal = state.modal;
  if (!modal || modal.type !== "unlock") return;
  modal.busy = true;
  modal.error = "";
  render();
  window.setTimeout(() => {
    const listing = getListing(modal.listingId);
    const details = state.privateDetails[modal.listingId];
    if (!listing || !details) {
      state.modal = { ...modal, busy: false, error: "Could not retrieve contact details. Please try again." };
      render();
      return;
    }
    const method = modal.method || "mtn_momo";
    const record = addUnlock(getUser().id, listing.id, state.agentFee, method, `${method.toUpperCase()}-TX-${Math.floor(100000 + Math.random() * 900000)}`);
    state.modal = { type: "unlock", listingId: listing.id, step: "success", recordId: record.id };
    render();
    toast(`Payment authorized for ${phone || getUser().phone}.`);
  }, 900);
}

function submitManualPayment(reference) {
  const value = String(reference || "").trim();
  if (!value) {
    state.modal.error = "Please enter your mobile money transaction ID or reference code.";
    render();
    return;
  }
  const listing = getListing(state.modal.listingId);
  const method = state.modal.method || "manual";
  state.payments.unshift({
    id: `pay-${Date.now()}`,
    studentId: getUser().id,
    studentName: getUser().name,
    studentPhone: getUser().phone,
    listingId: listing.id,
    listingTitle: listing.title,
    amount: state.agentFee,
    method,
    reference: value,
    screenshotUrl: "",
    status: "pending",
    submittedAt: new Date().toISOString(),
  });
  writeStorage(STORAGE_KEYS.payments, state.payments);
  state.modal = null;
  render();
  toast("Manual payment submitted for agent verification.");
}

function submitReport(values) {
  const listing = getListing(state.modal.listingId);
  state.reports.unshift({
    id: `rep-${Date.now()}`,
    listingId: listing.id,
    listingTitle: listing.title,
    reporterId: getUser().id,
    reporterName: getUser().name,
    reason: values.reason,
    comment: String(values.comment || "").trim(),
    status: "pending",
    createdAt: new Date().toISOString(),
  });
  writeStorage(STORAGE_KEYS.reports, state.reports);
  state.modal.submitted = true;
  render();
  window.setTimeout(() => {
    if (state.modal?.type === "report") {
      state.modal = null;
      render();
    }
  }, 1800);
}

function submitReview(values) {
  const listing = getListing(state.modal.listingId);
  const review = {
    id: `rev-${Date.now()}`,
    listingId: listing.id,
    studentName: getUser().name,
    studentProgram: String(values.program || "").trim(),
    rating: state.modal.rating || Number(values.rating) || 5,
    comment: String(values.comment || "").trim(),
    createdAt: new Date().toISOString(),
    hasViewed: true,
  };
  state.reviews.unshift(review);
  const listingReviews = state.reviews.filter((item) => item.listingId === listing.id);
  listing.rating = Number((listingReviews.reduce((sum, item) => sum + item.rating, 0) / listingReviews.length).toFixed(1));
  listing.reviewCount = listingReviews.length;
  writeStorage(STORAGE_KEYS.reviews, state.reviews);
  saveListings();
  state.modal.submitted = true;
  render();
  window.setTimeout(() => {
    if (state.modal?.type === "review") {
      state.modal = null;
      render();
    }
  }, 1500);
}

async function createListing(formData) {
  const values = Object.fromEntries(formData.entries());
  const user = getUser();
  const landlord = user.role === "admin"
    ? state.users.find((account) => account.id === state.adminLandlordId && account.role === "landlord")
    : user;
  if (!landlord || landlord.role !== "landlord") {
    toast("Choose a landlord dashboard before creating a listing.");
    return;
  }
  const id = `listing-${Date.now()}`;
  const numberOfRooms = Number(values.numberOfRooms);
  if (!Number.isInteger(numberOfRooms) || numberOfRooms < 1 || numberOfRooms > 50) {
    toast("Enter a valid number of rooms from 1 to 50.");
    return;
  }
  const rooms = Array.from({ length: numberOfRooms }, (_, index) => ({
    id: `room-${id}-${index + 1}`,
    name: String(values[`roomName-${index}`] || "").trim(),
    totalSpaces: Number(values[`roomSpaces-${index}`]),
    price: Number(values[`roomPrice-${index}`]),
    advancePayment: Number(values[`roomAdvance-${index}`]),
    features: String(values[`roomFeatures-${index}`] || "").split(",").map((feature) => feature.trim()).filter(Boolean),
  }));
  if (rooms.some((room) => !room.name
    || !Number.isInteger(room.totalSpaces) || room.totalSpaces < 1 || room.totalSpaces > 50
    || !Number.isFinite(room.price) || room.price <= 0
    || !Number.isFinite(room.advancePayment) || room.advancePayment < 0)) {
    toast("Enter a room name, capacity from 1 to 50, positive monthly amount, and valid advance payment for every room.");
    return;
  }
  if (new Set(rooms.map((room) => normalizeRoomName(room.name))).size !== rooms.length) {
    toast("Each room must have a unique name or number.");
    return;
  }
  const selectedPhotos = formData.getAll("photos").filter((file) => file instanceof File && file.size > 0);
  if (selectedPhotos.length > MAX_PHOTOS_PER_UPLOAD) {
    toast(`Select no more than ${MAX_PHOTOS_PER_UPLOAD} photos.`);
    return;
  }
  let uploadedPhotos = [];
  try {
    uploadedPhotos = await storeUploadedPhotos(selectedPhotos);
  } catch (error) {
    console.error("UniNest could not upload photos for the listing.", error);
    toast(error.message || "Could not save the selected photos. Please try again.");
    return;
  }
  const amenities = formData.getAll("amenities");
  const specialFeatures = String(values.specialFeatures || "").split(",").map((feature) => feature.trim()).filter(Boolean);
  const listing = {
    id,
    title: String(values.title).trim(),
    campus: String(values.campus).trim(),
    generalArea: String(values.generalArea).trim(),
    streetName: String(values.streetName).trim(),
    price: Math.min(...rooms.map((room) => room.price)),
    pricePeriod: "per_month",
    roomType: values.roomType || "single",
    genderRule: values.genderRule || "mixed",
    distanceToCampus: String(values.distanceToCampus || "400m / 5 min walk").trim(),
    photos: uploadedPhotos.length ? uploadedPhotos : [SAMPLE_PHOTOS[0], SAMPLE_PHOTOS[1]],
    description: String(values.description || "").trim(),
    amenities,
    specialFeatures,
    houseRules: String(values.houseRules || "").split(",").map((rule) => rule.trim()).filter(Boolean),
    isVerifiedLandlord: Boolean(landlord.isVerified),
    status: "pending",
    createdAt: new Date().toISOString(),
    landlordId: landlord.id,
    landlordNameDisplay: `${landlord.name} (Direct Landlord)`,
    rating: 0,
    reviewCount: 0,
    unlockCount: 0,
    rooms,
  };
  const details = {
    listingId: id,
    landlordFullName: String(values.landlordFullName).trim(),
    landlordPhone: String(values.landlordPhone).trim(),
    landlordWhatsApp: String(values.landlordWhatsApp).trim(),
    exactAddress: String(values.exactAddress).trim(),
    mapCoordinates: { lat: -12.8024, lng: 28.2198 },
    landmarkDirections: String(values.landmarkDirections || "").trim(),
    viewingHours: String(values.viewingHours || "").trim(),
    caretakerContact: String(values.caretakerContact || "").trim(),
    specialInstructions: String(values.specialInstructions || "").trim(),
  };
  state.listings.unshift(listing);
  state.privateDetails[id] = details;
  saveListings();
  writeStorage(STORAGE_KEYS.privateDetails, state.privateDetails);
  state.modal = null;
  state.landlordTab = "listings";
  render();
  toast("Listing submitted. It is pending UniNest agent verification.");
}

function saveRoom(formData) {
  const values = Object.fromEntries(formData.entries());
  const listing = getListing(state.modal?.listingId);
  const existingRoom = listing?.rooms.find((room) => room.id === values.roomId);
  const name = String(values.name || "").trim();
  const price = Number(values.price);
  const advancePayment = Number(values.advancePayment);
  const totalSpaces = Number(values.totalSpaces);
  if (!listing || (getUser().role !== "admin" && listing.landlordId !== getUser().id)) {
    toast("You can only manage rooms for listings you manage.");
    return;
  }
  if (!name || !Number.isFinite(price) || price <= 0
    || !Number.isFinite(advancePayment) || advancePayment < 0
    || !Number.isInteger(totalSpaces) || totalSpaces < 1 || totalSpaces > 50) {
    toast("Enter a room name, positive monthly price, valid advance payment, and 1–50 bed spaces.");
    return;
  }
  if (listing.rooms.some((room) => room.id !== existingRoom?.id && normalizeRoomName(room.name) === normalizeRoomName(name))) {
    toast("A room with that name already exists for this listing.");
    return;
  }
  const taken = existingRoom ? roomOccupants(listing, existingRoom) : 0;
  if (totalSpaces < taken) {
    toast(`This room already has ${taken} tenant${taken === 1 ? "" : "s"} assigned. Total spaces cannot be lower than occupancy.`);
    return;
  }
  const room = {
    id: existingRoom?.id || `room-${Date.now()}`,
    name,
    price,
    advancePayment,
    totalSpaces,
    features: String(values.features || "").split(",").map((feature) => feature.trim()).filter(Boolean),
  };
  if (existingRoom) {
    Object.assign(existingRoom, room);
    state.tenants.filter((tenant) => tenant.roomId === room.id).forEach((tenant) => {
      tenant.roomNumber = room.name;
    });
  } else {
    listing.rooms.push(room);
  }
  saveListings();
  persistCollection("tenants", STORAGE_KEYS.tenants);
  state.modal = { type: "room-inventory", listingId: listing.id };
  render();
  toast(existingRoom ? "Room details updated." : "Room added to the listing.");
}

function createTenant(values) {
  const user = getUser();
  const start = new Date(`${values.leaseStartDate}T00:00:00`);
  const months = Number(values.monthsPaid);
  const listing = getListing(values.listingId);
  const room = listing?.rooms.find((item) => item.id === values.roomId);
  if (!listing || (user.role === "admin"
    ? listing.landlordId !== state.adminLandlordId
    : listing.landlordId !== user.id) || !room) {
    toast("Select a room from a landlord dashboard you manage.");
    return;
  }
  if (roomOccupants(listing, room) >= Number(room.totalSpaces)) {
    toast("This room has no bed spaces available.");
    render();
    return;
  }
  if (!Number.isFinite(start.getTime()) || !Number.isInteger(months) || months < 1 || months > 12) {
    toast("Enter a valid lease start date and 1–12 prepaid months.");
    return;
  }
  const end = new Date(start);
  end.setMonth(end.getMonth() + months);
  state.tenants.unshift({
    id: `ten-${Date.now()}`,
    landlordId: listing.landlordId,
    listingId: listing.id,
    roomId: room.id,
    roomNumber: room.name,
    studentName: String(values.studentName).trim(),
    studentPhone: String(values.studentPhone).trim(),
    studentEmail: String(values.studentEmail || "").trim(),
    studentProgram: String(values.studentProgram || "").trim(),
    nrcOrStudentId: String(values.nrcOrStudentId || "").trim(),
    monthlyRent: room.price,
    monthsPaid: months,
    leaseStartDate: values.leaseStartDate,
    paidUntilDate: end.toISOString().slice(0, 10),
    paymentStatus: "paid",
    lastPaymentDate: values.leaseStartDate,
    notes: String(values.notes || "").trim(),
  });
  persistCollection("tenants", STORAGE_KEYS.tenants);
  state.modal = null;
  render();
  toast("Tenant added to the room roster.");
}

function recordRent(months) {
  const tenant = state.tenants.find((item) => item.id === state.modal.tenantId);
  if (!tenant || (getUser().role !== "admin" && tenant.landlordId !== getUser().id)
    || !Number.isInteger(months) || months < 1 || months > 12) {
    toast("Enter a valid number of prepaid months.");
    return;
  }
  const current = new Date(`${tenant.paidUntilDate}T00:00:00`);
  const base = current > new Date() ? current : new Date();
  base.setMonth(base.getMonth() + months);
  tenant.paidUntilDate = base.toISOString().slice(0, 10);
  tenant.monthsPaid = Number(tenant.monthsPaid || 0) + months;
  tenant.paymentStatus = "paid";
  tenant.lastPaymentDate = new Date().toISOString().slice(0, 10);
  persistCollection("tenants", STORAGE_KEYS.tenants);
  state.modal = null;
  render();
  toast(`Recorded ${months} month${months === 1 ? "" : "s"} of rent.`);
}

function resetDemoData() {
  if (!window.confirm("Reset UniNest to sample demonstration data?")) return;
  clearUploadedPhotos().catch((error) => {
    console.error("UniNest could not clear uploaded photos during reset.", error);
    toast("Demo data was reset, but some uploaded photos could not be cleared.");
  });
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  state.users = clone(INITIAL_USERS);
  state.currentUserId = "user-student-1";
  state.listings = clone(INITIAL_LISTINGS);
  state.privateDetails = clone(INITIAL_PRIVATE_DETAILS);
  state.unlocks = clone(DEFAULT_UNLOCKS);
  state.payments = clone(DEFAULT_PAYMENTS);
  state.reports = clone(DEFAULT_REPORTS);
  state.reviews = clone(INITIAL_REVIEWS);
  state.favoritesByUser = {};
  state.tenants = clone(INITIAL_TENANTS);
  state.agentFee = 25;
  state.modal = null;
  state.menuOpen = false;
  state.search = "";
  state.roomType = "all";
  state.gender = "all";
  state.maxPrice = 3000;
  state.amenities = [];
  state.sortBy = "featured";
  render();
  toast("Sample demonstration data restored.");
}

// --- Native browser capabilities -------------------------------------------
// Clipboard and Web Share are optional browser features; failures are reported to the user.
async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
    toast("Copied to clipboard.");
  } catch (error) {
    console.warn("Clipboard access was unavailable.", error);
    toast("Clipboard access is unavailable in this browser context.");
  }
}

async function shareListing(listing) {
  const shareData = {
    title: listing.title,
    text: `Check out this boarding room near ${listing.campus} on UniNest!`,
    url: window.location.href,
  };
  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.warn("The share action could not be completed.", error);
        toast("Unable to share this listing.");
      }
    }
    return;
  }
  await copyText(window.location.href);
}

// The initial render is the only bootstrap step; no framework or external script is needed.
render();
