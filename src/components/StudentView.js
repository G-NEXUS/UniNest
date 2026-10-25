import { h, Fragment, useState, useMemo } from "../runtime.js";
import { Search, SlidersHorizontal, Check, Building, RotateCcw } from "../icons.js";
import { AMENITIES_LIST } from "../data/initialData.js";
import { ListingCard } from "./ListingCard.js";
const StudentView = ({ listings, unlockedListingIds, favoriteListingIds, agentFee, onToggleFavorite, onViewDetails, onUnlockClick }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoomType, setSelectedRoomType] = useState("all");
  const [selectedGender, setSelectedGender] = useState("all");
  const [maxPrice, setMaxPrice] = useState(3e3);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);
  const toggleAmenity = (id) => {
    setSelectedAmenities((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]);
  };
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedRoomType("all");
    setSelectedGender("all");
    setMaxPrice(3e3);
    setSelectedAmenities([]);
    setSortBy("featured");
  };
  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      if (listing.status !== "approved")
        return false;
      if (selectedRoomType !== "all" && listing.roomType !== selectedRoomType) {
        return false;
      }
      if (selectedGender !== "all" && listing.genderRule !== selectedGender) {
        return false;
      }
      if (listing.price > maxPrice) {
        return false;
      }
      if (selectedAmenities.length > 0) {
        const hasAllSelected = selectedAmenities.every((am) => listing.amenities.includes(am));
        if (!hasAllSelected)
          return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = listing.title.toLowerCase().includes(q);
        const matchesArea = listing.generalArea.toLowerCase().includes(q);
        const matchesDesc = listing.description.toLowerCase().includes(q);
        if (!matchesTitle && !matchesArea && !matchesDesc) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === "price_asc")
        return a.price - b.price;
      if (sortBy === "price_desc")
        return b.price - a.price;
      if (sortBy === "rating")
        return b.rating - a.rating;
      if (sortBy === "unlocks")
        return (b.unlockCount || 0) - (a.unlockCount || 0);
      if (a.featured && !b.featured)
        return -1;
      if (!a.featured && b.featured)
        return 1;
      return 0;
    });
  }, [
    listings,
    selectedRoomType,
    selectedGender,
    maxPrice,
    selectedAmenities,
    searchQuery,
    sortBy
  ]);
  return /* @__PURE__ */ h("div", { className: "space-y-8 pt-6 pb-16" }, /* @__PURE__ */ h("section", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" }, /* @__PURE__ */ h("div", { className: "bg-zinc-950 border border-blue-900/50 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4" }, /* @__PURE__ */ h("div", { className: "flex flex-col sm:flex-row items-stretch gap-3" }, /* @__PURE__ */ h("div", { className: "relative flex-1" }, /* @__PURE__ */ h(Search, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" }), /* @__PURE__ */ h("input", { type: "text", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: "Search CBU area (e.g. Riverside, Kwacha East, Eastlea, West Gate), room type...", className: "w-full pl-10 pr-4 py-2.5 bg-black border border-blue-800/60 rounded-xl text-white text-sm placeholder:text-blue-400/50 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all" })), /* @__PURE__ */ h("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ h("button", { onClick: () => setShowFilters(!showFilters), className: `flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border cursor-pointer ${showFilters ? "bg-blue-600 text-white border-blue-400" : "bg-black text-blue-300 border-blue-800/60 hover:border-blue-500"}` }, /* @__PURE__ */ h(SlidersHorizontal, { className: "w-4 h-4" }), /* @__PURE__ */ h("span", null, "Filters"), (selectedRoomType !== "all" || selectedGender !== "all" || selectedAmenities.length > 0 || maxPrice < 3e3) && /* @__PURE__ */ h("span", { className: "w-2 h-2 rounded-full bg-cyan-400" })), /* @__PURE__ */ h("select", { value: sortBy, onChange: (e) => setSortBy(e.target.value), className: "px-3.5 py-2.5 bg-black border border-blue-800/60 rounded-xl text-white text-xs sm:text-sm font-medium focus:outline-none focus:border-blue-400" }, /* @__PURE__ */ h("option", { value: "featured" }, "Featured First"), /* @__PURE__ */ h("option", { value: "price_asc" }, "Price: Low to High"), /* @__PURE__ */ h("option", { value: "price_desc" }, "Price: High to Low"), /* @__PURE__ */ h("option", { value: "rating" }, "Highest Rated"), /* @__PURE__ */ h("option", { value: "unlocks" }, "Most Unlocked")))), showFilters && /* @__PURE__ */ h("div", { className: "pt-4 border-t border-blue-900/40 space-y-4 animate-in fade-in duration-200" }, /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("label", { className: "block text-xs font-semibold text-blue-300 mb-2" }, "Room Configuration:"), /* @__PURE__ */ h("div", { className: "flex flex-wrap gap-2" }, [
    { id: "all", label: "All Configurations" },
    { id: "single", label: "Single Room" },
    { id: "shared_2", label: "2-in-1 Shared" },
    { id: "shared_4", label: "4-Bed Sharing" },
    { id: "self_contained", label: "Self-Contained Studio" },
    { id: "bedspace", label: "Bedspace" }
  ].map((item) => /* @__PURE__ */ h("button", { key: item.id, onClick: () => setSelectedRoomType(item.id), className: `px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${selectedRoomType === item.id ? "bg-blue-600 text-white" : "bg-black text-blue-300 border border-blue-900 hover:border-blue-700"}` }, item.label)))), /* @__PURE__ */ h("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" }, /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("label", { className: "block text-xs font-semibold text-blue-300 mb-2" }, "Gender Preference:"), /* @__PURE__ */ h("div", { className: "flex gap-2" }, [
    { id: "all", label: "Any" },
    { id: "female_only", label: "Female Only" },
    { id: "male_only", label: "Male Only" },
    { id: "mixed", label: "Mixed" }
  ].map((g) => /* @__PURE__ */ h("button", { key: g.id, onClick: () => setSelectedGender(g.id), className: `flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${selectedGender === g.id ? "bg-blue-600 text-white" : "bg-black text-blue-300 border border-blue-900"}` }, g.label)))), /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("div", { className: "flex items-center justify-between text-xs font-semibold text-blue-300 mb-2" }, /* @__PURE__ */ h("span", null, "Maximum Rent:"), /* @__PURE__ */ h("span", { className: "text-white font-bold" }, "K", maxPrice.toLocaleString(), " / mo")), /* @__PURE__ */ h("input", { type: "range", min: "500", max: "3500", step: "50", value: maxPrice, onChange: (e) => setMaxPrice(Number(e.target.value)), className: "w-full accent-blue-500 cursor-pointer" }), /* @__PURE__ */ h("div", { className: "flex justify-between text-[10px] text-blue-400 mt-1" }, /* @__PURE__ */ h("span", null, "K500"), /* @__PURE__ */ h("span", null, "K2,000"), /* @__PURE__ */ h("span", null, "K3,500")))), /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("label", { className: "block text-xs font-semibold text-blue-300 mb-2" }, "Must Have Amenities:"), /* @__PURE__ */ h("div", { className: "flex flex-wrap gap-2" }, AMENITIES_LIST.map((am) => {
    const isSelected = selectedAmenities.includes(am.id);
    return /* @__PURE__ */ h("button", { key: am.id, onClick: () => toggleAmenity(am.id), className: `px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${isSelected ? "bg-blue-600 text-white shadow-sm" : "bg-black text-blue-300 border border-blue-900/60 hover:border-blue-700"}` }, isSelected && /* @__PURE__ */ h(Check, { className: "w-3 h-3" }), /* @__PURE__ */ h("span", null, am.name));
  }))), /* @__PURE__ */ h("div", { className: "flex justify-end pt-2" }, /* @__PURE__ */ h("button", { onClick: resetFilters, className: "flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer" }, /* @__PURE__ */ h(RotateCcw, { className: "w-3 h-3" }), /* @__PURE__ */ h("span", null, "Reset All Filters")))))), /* @__PURE__ */ h("section", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" }, /* @__PURE__ */ h("div", { className: "flex items-center justify-between mb-6" }, /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("h2", { className: "text-xl sm:text-2xl font-black text-white flex items-center gap-2" }, "Available CBU Boarding Houses", /* @__PURE__ */ h("span", { className: "text-xs px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800" }, "Kitwe")), /* @__PURE__ */ h("p", { className: "text-xs sm:text-sm text-blue-300/80" }, "Showing ", filteredListings.length, " verified rooms near Copperbelt University (Riverside, Kwacha East, Eastlea, West Gate)"))), filteredListings.length === 0 ? /* @__PURE__ */ h("div", { className: "bg-zinc-950 border border-blue-900/40 rounded-3xl p-12 text-center space-y-4" }, /* @__PURE__ */ h(Building, { className: "w-12 h-12 text-blue-500 mx-auto opacity-70" }), /* @__PURE__ */ h("h3", { className: "text-lg font-bold text-white" }, "No CBU Boarding Rooms Match Your Search"), /* @__PURE__ */ h("p", { className: "text-xs text-blue-300 max-w-md mx-auto" }, "Try adjusting your price range or clearing amenity filters to find available rooms."), /* @__PURE__ */ h("button", { onClick: resetFilters, className: "px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer" }, "Reset Filters")) : /* @__PURE__ */ h("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" }, filteredListings.map((listing) => /* @__PURE__ */ h(ListingCard, { key: listing.id, listing, isUnlocked: unlockedListingIds.includes(listing.id), isFavorite: favoriteListingIds.includes(listing.id), agentFee, onToggleFavorite, onViewDetails, onUnlockClick })))), /* @__PURE__ */ h("section", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4" }, /* @__PURE__ */ h("div", { className: "bg-gradient-to-b from-blue-950/40 via-zinc-950 to-black border border-blue-800/40 rounded-3xl p-6 sm:p-8" }, /* @__PURE__ */ h("div", { className: "text-center max-w-xl mx-auto mb-8" }, /* @__PURE__ */ h("span", { className: "text-xs font-bold uppercase tracking-wider text-blue-400" }, "Safe & Scam-Free Process"), /* @__PURE__ */ h("h3", { className: "text-2xl font-black text-white mt-1" }, "How UniNest CBU Agent Works"), /* @__PURE__ */ h("p", { className: "text-xs text-blue-300 mt-1" }, "Built to protect CBU students from fake middlemen and avoid wasted trips.")), /* @__PURE__ */ h("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6" }, /* @__PURE__ */ h("div", { className: "bg-black/60 p-5 rounded-2xl border border-blue-900/40 text-center space-y-2" }, /* @__PURE__ */ h("div", { className: "w-10 h-10 rounded-xl bg-blue-950 border border-blue-500/40 text-blue-400 font-black text-sm flex items-center justify-center mx-auto" }, "1"), /* @__PURE__ */ h("h4", { className: "text-sm font-bold text-white" }, "Browse Safe Info"), /* @__PURE__ */ h("p", { className: "text-xs text-blue-300/80" }, "View photos, amenities, backup solar, distance to campus, and safe general area without fake broker spam.")), /* @__PURE__ */ h("div", { className: "bg-black/60 p-5 rounded-2xl border border-blue-900/40 text-center space-y-2" }, /* @__PURE__ */ h("div", { className: "w-10 h-10 rounded-xl bg-blue-950 border border-blue-500/40 text-blue-400 font-black text-sm flex items-center justify-center mx-auto" }, "2"), /* @__PURE__ */ h("h4", { className: "text-sm font-bold text-white" }, "Unlock Contact"), /* @__PURE__ */ h("p", { className: "text-xs text-blue-300/80" }, "Pay the small K", agentFee, " agent verification fee via MTN MoMo or Airtel Money for the exact listing.")), /* @__PURE__ */ h("div", { className: "bg-black/60 p-5 rounded-2xl border border-blue-900/40 text-center space-y-2" }, /* @__PURE__ */ h("div", { className: "w-10 h-10 rounded-xl bg-blue-950 border border-blue-500/40 text-blue-400 font-black text-sm flex items-center justify-center mx-auto" }, "3"), /* @__PURE__ */ h("h4", { className: "text-sm font-bold text-white" }, "Direct WhatsApp"), /* @__PURE__ */ h("p", { className: "text-xs text-blue-300/80" }, "Receive the landlord's verified phone, exact plot number, caretaker instructions, and map directions.")), /* @__PURE__ */ h("div", { className: "bg-black/60 p-5 rounded-2xl border border-blue-900/40 text-center space-y-2" }, /* @__PURE__ */ h("div", { className: "w-10 h-10 rounded-xl bg-blue-950 border border-blue-500/40 text-blue-400 font-black text-sm flex items-center justify-center mx-auto" }, "4"), /* @__PURE__ */ h("h4", { className: "text-sm font-bold text-white" }, "Inspect Before Paying"), /* @__PURE__ */ h("p", { className: "text-xs text-blue-300/80" }, "Visit the boarding house physically and inspect the room before paying any rent to the landlord."))))));
};
export {
  StudentView
};
