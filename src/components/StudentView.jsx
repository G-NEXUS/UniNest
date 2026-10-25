import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Check, Building, RotateCcw } from 'lucide-react';
import { AMENITIES_LIST } from '../data/initialData';
import { ListingCard } from './ListingCard';
export const StudentView = ({ listings, unlockedListingIds, favoriteListingIds, agentFee, onToggleFavorite, onViewDetails, onUnlockClick, }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRoomType, setSelectedRoomType] = useState('all');
    const [selectedGender, setSelectedGender] = useState('all');
    const [maxPrice, setMaxPrice] = useState(3000);
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [sortBy, setSortBy] = useState('featured');
    const [showFilters, setShowFilters] = useState(false);
    // Toggle amenity filter
    const toggleAmenity = (id) => {
        setSelectedAmenities((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]);
    };
    // Reset all filters
    const resetFilters = () => {
        setSearchQuery('');
        setSelectedRoomType('all');
        setSelectedGender('all');
        setMaxPrice(3000);
        setSelectedAmenities([]);
        setSortBy('featured');
    };
    // Filter only approved live listings for students (CBU focused)
    const filteredListings = useMemo(() => {
        return listings
            .filter((listing) => {
            // Only live listings visible to students
            if (listing.status !== 'approved')
                return false;
            // Room Type filter
            if (selectedRoomType !== 'all' && listing.roomType !== selectedRoomType) {
                return false;
            }
            // Gender filter
            if (selectedGender !== 'all' && listing.genderRule !== selectedGender) {
                return false;
            }
            // Price filter
            if (listing.price > maxPrice) {
                return false;
            }
            // Amenities filter
            if (selectedAmenities.length > 0) {
                const hasAllSelected = selectedAmenities.every((am) => listing.amenities.includes(am));
                if (!hasAllSelected)
                    return false;
            }
            // Keyword search (Riverside, Kwacha, Eastlea, West Gate, etc.)
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
        })
            .sort((a, b) => {
            if (sortBy === 'price_asc')
                return a.price - b.price;
            if (sortBy === 'price_desc')
                return b.price - a.price;
            if (sortBy === 'rating')
                return b.rating - a.rating;
            if (sortBy === 'unlocks')
                return (b.unlockCount || 0) - (a.unlockCount || 0);
            // Default featured
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
        sortBy,
    ]);
    return (<div className="space-y-8 pt-6 pb-16">
      
      {/* SEARCH AND FILTERS BAR (Directly at top, hero banner removed as requested) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-zinc-950 border border-blue-900/50 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
          
          {/* Main search input row */}
          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400"/>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search CBU area (e.g. Riverside, Kwacha East, Eastlea, West Gate), room type..." className="w-full pl-10 pr-4 py-2.5 bg-black border border-blue-800/60 rounded-xl text-white text-sm placeholder:text-blue-400/50 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"/>
            </div>

            <div className="flex items-center gap-2">
              {/* Filter toggle button */}
              <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border cursor-pointer ${showFilters
            ? 'bg-blue-600 text-white border-blue-400'
            : 'bg-black text-blue-300 border-blue-800/60 hover:border-blue-500'}`}>
                <SlidersHorizontal className="w-4 h-4"/>
                <span>Filters</span>
                {(selectedRoomType !== 'all' ||
            selectedGender !== 'all' ||
            selectedAmenities.length > 0 ||
            maxPrice < 3000) && (<span className="w-2 h-2 rounded-full bg-cyan-400"/>)}
              </button>

              {/* Sort Dropdown */}
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3.5 py-2.5 bg-black border border-blue-800/60 rounded-xl text-white text-xs sm:text-sm font-medium focus:outline-none focus:border-blue-400">
                <option value="featured">Featured First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="unlocks">Most Unlocked</option>
              </select>
            </div>
          </div>

          {/* Expandable detailed filters panel */}
          {showFilters && (<div className="pt-4 border-t border-blue-900/40 space-y-4 animate-in fade-in duration-200">
              
              {/* Room Types */}
              <div>
                <label className="block text-xs font-semibold text-blue-300 mb-2">
                  Room Configuration:
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                { id: 'all', label: 'All Configurations' },
                { id: 'single', label: 'Single Room' },
                { id: 'shared_2', label: '2-in-1 Shared' },
                { id: 'shared_4', label: '4-Bed Sharing' },
                { id: 'self_contained', label: 'Self-Contained Studio' },
                { id: 'bedspace', label: 'Bedspace' },
            ].map((item) => (<button key={item.id} onClick={() => setSelectedRoomType(item.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${selectedRoomType === item.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-black text-blue-300 border border-blue-900 hover:border-blue-700'}`}>
                      {item.label}
                    </button>))}
                </div>
              </div>

              {/* Gender and Price Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Gender Rule */}
                <div>
                  <label className="block text-xs font-semibold text-blue-300 mb-2">
                    Gender Preference:
                  </label>
                  <div className="flex gap-2">
                    {[
                { id: 'all', label: 'Any' },
                { id: 'female_only', label: 'Female Only' },
                { id: 'male_only', label: 'Male Only' },
                { id: 'mixed', label: 'Mixed' },
            ].map((g) => (<button key={g.id} onClick={() => setSelectedGender(g.id)} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${selectedGender === g.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-black text-blue-300 border border-blue-900'}`}>
                        {g.label}
                      </button>))}
                  </div>
                </div>

                {/* Max Price Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-blue-300 mb-2">
                    <span>Maximum Rent:</span>
                    <span className="text-white font-bold">K{maxPrice.toLocaleString()} / mo</span>
                  </div>
                  <input type="range" min="500" max="3500" step="50" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-blue-500 cursor-pointer"/>
                  <div className="flex justify-between text-[10px] text-blue-400 mt-1">
                    <span>K500</span>
                    <span>K2,000</span>
                    <span>K3,500</span>
                  </div>
                </div>
              </div>

              {/* Amenities Filter Chips */}
              <div>
                <label className="block text-xs font-semibold text-blue-300 mb-2">
                  Must Have Amenities:
                </label>
                <div className="flex flex-wrap gap-2">
                  {AMENITIES_LIST.map((am) => {
                const isSelected = selectedAmenities.includes(am.id);
                return (<button key={am.id} onClick={() => toggleAmenity(am.id)} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${isSelected
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-black text-blue-300 border border-blue-900/60 hover:border-blue-700'}`}>
                        {isSelected && <Check className="w-3 h-3"/>}
                        <span>{am.name}</span>
                      </button>);
            })}
                </div>
              </div>

              {/* Reset action */}
              <div className="flex justify-end pt-2">
                <button onClick={resetFilters} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer">
                  <RotateCcw className="w-3 h-3"/>
                  <span>Reset All Filters</span>
                </button>
              </div>

            </div>)}

        </div>
      </section>

      {/* LISTINGS RESULTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              Available CBU Boarding Houses
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                Kitwe
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-blue-300/80">
              Showing {filteredListings.length} verified rooms near Copperbelt University (Riverside, Kwacha East, Eastlea, West Gate)
            </p>
          </div>
        </div>

        {filteredListings.length === 0 ? (<div className="bg-zinc-950 border border-blue-900/40 rounded-3xl p-12 text-center space-y-4">
            <Building className="w-12 h-12 text-blue-500 mx-auto opacity-70"/>
            <h3 className="text-lg font-bold text-white">No CBU Boarding Rooms Match Your Search</h3>
            <p className="text-xs text-blue-300 max-w-md mx-auto">
              Try adjusting your price range or clearing amenity filters to find available rooms.
            </p>
            <button onClick={resetFilters} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer">
              Reset Filters
            </button>
          </div>) : (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (<ListingCard key={listing.id} listing={listing} isUnlocked={unlockedListingIds.includes(listing.id)} isFavorite={favoriteListingIds.includes(listing.id)} agentFee={agentFee} onToggleFavorite={onToggleFavorite} onViewDetails={onViewDetails} onUnlockClick={onUnlockClick}/>))}
          </div>)}
      </section>

      {/* HOW IT WORKS SECTION (Section 1 of specification) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="bg-gradient-to-b from-blue-950/40 via-zinc-950 to-black border border-blue-800/40 rounded-3xl p-6 sm:p-8">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Safe & Scam-Free Process
            </span>
            <h3 className="text-2xl font-black text-white mt-1">
              How UniNest CBU Agent Works
            </h3>
            <p className="text-xs text-blue-300 mt-1">
              Built to protect CBU students from fake middlemen and avoid wasted trips.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-black/60 p-5 rounded-2xl border border-blue-900/40 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-500/40 text-blue-400 font-black text-sm flex items-center justify-center mx-auto">
                1
              </div>
              <h4 className="text-sm font-bold text-white">Browse Safe Info</h4>
              <p className="text-xs text-blue-300/80">
                View photos, amenities, backup solar, distance to campus, and safe general area without fake broker spam.
              </p>
            </div>

            <div className="bg-black/60 p-5 rounded-2xl border border-blue-900/40 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-500/40 text-blue-400 font-black text-sm flex items-center justify-center mx-auto">
                2
              </div>
              <h4 className="text-sm font-bold text-white">Unlock Contact</h4>
              <p className="text-xs text-blue-300/80">
                Pay the small K{agentFee} agent verification fee via MTN MoMo or Airtel Money for the exact listing.
              </p>
            </div>

            <div className="bg-black/60 p-5 rounded-2xl border border-blue-900/40 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-500/40 text-blue-400 font-black text-sm flex items-center justify-center mx-auto">
                3
              </div>
              <h4 className="text-sm font-bold text-white">Direct WhatsApp</h4>
              <p className="text-xs text-blue-300/80">
                Receive the landlord's verified phone, exact plot number, caretaker instructions, and map directions.
              </p>
            </div>

            <div className="bg-black/60 p-5 rounded-2xl border border-blue-900/40 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-500/40 text-blue-400 font-black text-sm flex items-center justify-center mx-auto">
                4
              </div>
              <h4 className="text-sm font-bold text-white">Inspect Before Paying</h4>
              <p className="text-xs text-blue-300/80">
                Visit the boarding house physically and inspect the room before paying any rent to the landlord.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>);
};
