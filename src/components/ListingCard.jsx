import React, { useState } from 'react';
import { 
  Lock, 
  LockOpen, 
  MapPin, 
  Star, 
  ShieldCheck, 
  Heart, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Zap, 
  Wifi, 
  Droplets, 
  Shield, 
  Users, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const ListingCard = ({
  listing,
  isUnlocked,
  isFavorite,
  agentFee,
  onToggleFavorite,
  onViewDetails,
  onUnlockClick,
}) => {
  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);

  const prevPhoto = (e) => {
    e.stopPropagation();
    setCurrentPhotoIdx((prev) => (prev === 0 ? listing.photos.length - 1 : prev - 1));
  };

  const nextPhoto = (e) => {
    e.stopPropagation();
    setCurrentPhotoIdx((prev) => (prev === listing.photos.length - 1 ? 0 : prev + 1));
  };

  const formatRoomType = (type) => {
    switch (type) {
      case 'single':
        return 'Single Room';
      case 'shared_2':
        return '2-in-1 Shared';
      case 'shared_4':
        return '4-Bed Sharing';
      case 'self_contained':
        return 'Self-Contained Studio';
      case 'bedspace':
        return 'Bedspace';
      default:
        return 'Room';
    }
  };

  const formatGenderRule = (rule) => {
    switch (rule) {
      case 'female_only':
        return 'Ladies Only';
      case 'male_only':
        return 'Men Only';
      default:
        return 'Mixed Gender';
    }
  };

  return (
    <div 
      onClick={() => onViewDetails(listing)}
      className="group relative bg-zinc-950 border border-blue-900/40 hover:border-blue-500/70 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-blue-950/60 flex flex-col cursor-pointer"
    >
      {/* Top Media Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
        <img
          src={listing.photos[currentPhotoIdx] || listing.photos[0]}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Carousel buttons if multiple photos */}
        {listing.photos.length > 1 && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={prevPhoto}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/70 border border-blue-400/50 text-white flex items-center justify-center hover:bg-blue-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextPhoto}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/70 border border-blue-400/50 text-white flex items-center justify-center hover:bg-blue-600 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 flex-wrap">
            {listing.isVerifiedLandlord && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-black/80 backdrop-blur-md text-blue-300 border border-blue-500/60 shadow-md">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                Verified Landlord
              </span>
            )}
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-950/90 text-blue-200 border border-blue-800/60 backdrop-blur-md">
              {formatGenderRule(listing.genderRule)}
            </span>
          </div>

          {/* Favorite button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(listing.id);
            }}
            className={`pointer-events-auto p-2 rounded-xl backdrop-blur-md transition-all ${
              isFavorite
                ? 'bg-blue-600 text-white ring-1 ring-blue-400 shadow-md'
                : 'bg-black/60 text-blue-300 hover:text-white hover:bg-black/80 border border-blue-900/60'
            }`}
            title="Save to favorites"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Bottom image overlay: Price & Distance */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/70 to-transparent p-3 flex items-end justify-between">
          <div>
            <span className="text-xl font-black text-white drop-shadow">
              K{listing.price.toLocaleString()}
            </span>
            <span className="text-xs text-blue-300/90 font-medium ml-1">
              /{listing.pricePeriod === 'per_month' ? 'month' : 'term'}
            </span>
          </div>

          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-300 bg-black/70 px-2 py-0.5 rounded-md border border-blue-900/50">
            <MapPin className="w-3 h-3 text-blue-400" />
            {listing.distanceToCampus}
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Boarding House Name & Bed Availability Header */}
          <div className="flex items-center justify-between text-xs mb-1.5 gap-2">
            <span className="font-bold text-blue-300 text-xs sm:text-sm truncate flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
              {listing.boardingHouseName || 'Student Boarding House'}
            </span>
            
            {listing.totalBeds ? (
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold shrink-0 ${
                listing.availableBeds && listing.availableBeds > 0
                  ? 'bg-blue-900/60 text-blue-200 border border-blue-500/50'
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
              }`}>
                {listing.availableBeds ?? 0} / {listing.totalBeds} Beds Free
              </span>
            ) : null}
          </div>

          {/* Title / Description snippet */}
          <h4 className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors line-clamp-1 mb-1">
            {listing.title}
          </h4>

          {/* Street & Area & Distance */}
          <div className="flex items-center justify-between text-xs text-blue-400/90 gap-1">
            <p className="text-xs text-blue-200/90 flex items-center gap-1 truncate">
              <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="truncate">
                {listing.street ? `${listing.street}` : listing.generalArea}
              </span>
            </p>
            <div className="flex items-center gap-1 text-amber-400 font-semibold shrink-0">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{listing.rating > 0 ? listing.rating.toFixed(1) : 'New'}</span>
              <span className="text-[10px] text-blue-400/80">({listing.reviewCount})</span>
            </div>
          </div>
        </div>

        {/* Room Type & Key Amenity Badges */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-blue-950 text-blue-300 border border-blue-900">
            {formatRoomType(listing.roomType)}
          </span>
          {listing.amenities.includes('solar') && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] rounded-md bg-blue-950/70 text-blue-300 border border-blue-900">
              <Zap className="w-3 h-3 text-yellow-400" />
              Solar Backup
            </span>
          )}
          {listing.amenities.includes('water') && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] rounded-md bg-blue-950/70 text-blue-300 border border-blue-900">
              <Droplets className="w-3 h-3 text-cyan-400" />
              Borehole
            </span>
          )}
          {listing.amenities.includes('wifi') && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] rounded-md bg-blue-950/70 text-blue-300 border border-blue-900">
              <Wifi className="w-3 h-3 text-blue-400" />
              Wi-Fi
            </span>
          )}
        </div>

        {/* LOCKED VS UNLOCKED CONTACT ACTION BAR */}
        <div className="pt-2 border-t border-blue-900/40">
          {!isUnlocked ? (
            <div className="bg-black/90 p-2.5 rounded-xl border border-blue-500/30 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-950 border border-blue-600/40 flex items-center justify-center text-blue-400 shrink-0">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-bold text-white">Contact & Plot Hidden</p>
                  <p className="text-[10px] text-blue-300/80">
                    {listing.unlockCount > 0 ? `${listing.unlockCount} students unlocked` : 'Agent verified room'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onUnlockClick(listing);
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-md shadow-blue-600/30 transition-all flex items-center gap-1 shrink-0"
              >
                <span>Unlock (K{agentFee})</span>
              </button>
            </div>
          ) : (
            <div className="bg-blue-950/50 p-2.5 rounded-xl border border-blue-400/50 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <LockOpen className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-bold text-white">Contact Unlocked</p>
                  <p className="text-[10px] text-blue-300">Tap to call or view directions</p>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(listing);
                }}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-blue-300 hover:text-white border border-blue-600/50 text-xs font-bold rounded-lg transition-all flex items-center gap-1"
              >
                <span>View Details</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
