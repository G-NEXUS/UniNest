import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  ShieldCheck, 
  Star, 
  Heart, 
  Lock, 
  LockOpen, 
  Phone, 
  MessageSquare, 
  Clock, 
  ShieldAlert, 
  Share2, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Copy, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  ExternalLink,
  Flag,
  UserCheck
} from 'lucide-react';
import { Listing, PrivateDetails, Review } from '../types';
import { AMENITIES_LIST } from '../data/initialData';

interface ListingDetailModalProps {
  listing: Listing;
  isUnlocked: boolean;
  unlockedDetails: PrivateDetails | null;
  reviews: Review[];
  isFavorite: boolean;
  agentFee: number;
  onClose: () => void;
  onUnlockClick: (listing: Listing) => void;
  onToggleFavorite: (id: string) => void;
  onOpenReport: (listing: Listing) => void;
  onOpenReview: (listing: Listing) => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  isUnlocked,
  unlockedDetails,
  reviews,
  isFavorite,
  agentFee,
  onClose,
  onUnlockClick,
  onToggleFavorite,
  onOpenReport,
  onOpenReview,
}) => {
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  const copyToClipboard = (text: string, type: 'phone' | 'address') => {
    navigator.clipboard.writeText(text);
    if (type === 'phone') {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    } else {
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: `Check out this boarding room near ${listing.campus} on UniNest!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-black border border-blue-500/40 rounded-3xl shadow-2xl shadow-blue-950 p-4 sm:p-6 my-6 text-blue-50 glow-blue overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-blue-900/40">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-950 text-blue-300 border border-blue-800">
              Ref: {listing.id.toUpperCase()}
            </span>
            {listing.isVerifiedLandlord && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-600/20 text-blue-300 border border-blue-500/50">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                Verified Landlord
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-zinc-950 border border-blue-900/60 text-blue-300 hover:text-white hover:bg-blue-950 transition-colors"
              title="Share listing"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => onToggleFavorite(listing.id)}
              className={`p-2 rounded-xl border transition-colors ${
                isFavorite
                  ? 'bg-blue-600 text-white border-blue-400'
                  : 'bg-zinc-950 text-blue-300 hover:text-white border-blue-900/60'
              }`}
              title="Save to favorites"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-950 border border-blue-900/60 text-blue-300 hover:text-white hover:bg-blue-950 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {showShareToast && (
          <div className="absolute top-16 right-6 bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg">
            Link copied to clipboard!
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-6 max-h-[75vh] overflow-y-auto pr-1">
          
          {/* Left Column: Photos & Details */}
          <div className="lg:col-span-7 space-y-5">
            {/* Main Featured Photo */}
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-zinc-950 border border-blue-900/60">
              <img
                src={listing.photos[selectedPhotoIdx] || listing.photos[0]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />

              {listing.photos.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setSelectedPhotoIdx((prev) =>
                        prev === 0 ? listing.photos.length - 1 : prev - 1
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/70 border border-blue-500/40 text-white flex items-center justify-center hover:bg-blue-600"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      setSelectedPhotoIdx((prev) =>
                        prev === listing.photos.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/70 border border-blue-500/40 text-white flex items-center justify-center hover:bg-blue-600"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              <div className="absolute bottom-3 right-3 bg-black/80 px-2.5 py-1 rounded-lg text-xs font-mono text-blue-200 border border-blue-900">
                {selectedPhotoIdx + 1} / {listing.photos.length}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {listing.photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {listing.photos.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPhotoIdx(idx)}
                    className={`relative w-20 h-14 rounded-xl overflow-hidden border shrink-0 transition-all ${
                      selectedPhotoIdx === idx
                        ? 'border-blue-400 ring-2 ring-blue-500'
                        : 'border-blue-900/40 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="bg-zinc-950/80 border border-blue-900/40 rounded-2xl p-4 space-y-2">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider text-blue-400">
                Room Overview
              </h4>
              <p className="text-sm text-blue-100/90 leading-relaxed">
                {listing.description}
              </p>
            </div>

            {/* Amenities Grid */}
            <div className="bg-zinc-950/80 border border-blue-900/40 rounded-2xl p-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider text-blue-400 mb-3">
                Included Amenities & Utilities
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {AMENITIES_LIST.map((amenity) => {
                  const hasAmenity = listing.amenities.includes(amenity.id);
                  return (
                    <div
                      key={amenity.id}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs transition-colors ${
                        hasAmenity
                          ? 'bg-blue-950/40 border-blue-700/60 text-white font-medium'
                          : 'bg-zinc-950/40 border-zinc-900 text-blue-400/40 line-through'
                      }`}
                    >
                      <CheckCircle2
                        className={`w-3.5 h-3.5 shrink-0 ${
                          hasAmenity ? 'text-blue-400' : 'text-zinc-700'
                        }`}
                      />
                      <span className="truncate">{amenity.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* House Rules */}
            <div className="bg-zinc-950/80 border border-blue-900/40 rounded-2xl p-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider text-blue-400 mb-2">
                Boarding House Rules & Guidelines
              </h4>
              <ul className="space-y-1.5 text-xs text-blue-200">
                {listing.houseRules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Student Reviews & Ratings */}
            <div className="bg-zinc-950/80 border border-blue-900/40 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider text-blue-400">
                    Student Reviews & Verification
                  </h4>
                  <p className="text-xs text-blue-300">
                    From students who unlocked & viewed this boarding house
                  </p>
                </div>
                <button
                  onClick={() => onOpenReview(listing)}
                  className="px-3 py-1.5 text-xs font-semibold bg-blue-950 hover:bg-blue-900 border border-blue-700/60 text-blue-200 rounded-lg transition-colors"
                >
                  Write Review
                </button>
              </div>

              {reviews.length > 0 ? (
                <div className="space-y-3">
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-3 bg-black/60 rounded-xl border border-blue-900/40 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white">{rev.studentName}</span>
                          <span className="text-blue-400/80 text-[11px]">({rev.studentProgram})</span>
                        </div>
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < rev.rating ? 'fill-current' : 'text-zinc-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-blue-200/90">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-blue-300/60 italic py-2">
                  No written reviews yet. Be the first student to review this boarding house!
                </p>
              )}
            </div>

          </div>

          {/* Right Column: Pricing, Location & Contact Unlock */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Title & Price Card */}
            <div className="bg-zinc-950 border border-blue-900/60 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between text-xs text-blue-400">
                <span className="font-bold uppercase tracking-wider">{listing.campus}</span>
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-4 h-4 fill-current" />
                  {listing.rating > 0 ? listing.rating.toFixed(1) : 'New'} ({listing.reviewCount})
                </span>
              </div>

              <h2 className="text-xl font-extrabold text-white leading-snug">
                {listing.title}
              </h2>

              <div className="flex items-baseline gap-1 py-1">
                <span className="text-3xl font-black text-white">
                  K{listing.price.toLocaleString()}
                </span>
                <span className="text-sm text-blue-300 font-medium">
                  / {listing.pricePeriod === 'per_month' ? 'month' : 'term'}
                </span>
              </div>

              {/* Public Safe Area */}
              <div className="pt-2 border-t border-blue-900/40 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-blue-200">
                  <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                  <span><strong>General Area:</strong> {listing.generalArea}</span>
                </div>
                <div className="flex items-center gap-1.5 text-blue-200">
                  <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                  <span><strong>Distance:</strong> {listing.distanceToCampus}</span>
                </div>
                <div className="flex items-center gap-1.5 text-blue-200">
                  <UserCheck className="w-4 h-4 text-blue-400 shrink-0" />
                  <span><strong>Landlord:</strong> {listing.landlordNameDisplay}</span>
                </div>
              </div>
            </div>

            {/* LOCKED VS UNLOCKED CONTACT CARD */}
            {!isUnlocked ? (
              /* LOCKED CARD */
              <div className="relative bg-gradient-to-b from-blue-950/40 via-zinc-950 to-black border-2 border-dashed border-blue-500/50 rounded-2xl p-5 text-center space-y-4 shadow-xl">
                
                {/* Floating lock badge */}
                <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-400/60 text-blue-400 flex items-center justify-center mx-auto shadow-lg shadow-blue-900/30">
                  <Lock className="w-7 h-7" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">
                    Landlord Contact & Exact Plot are Hidden
                  </h3>
                  <p className="text-xs text-blue-300/80 mt-1">
                    To protect both landlords and students from brokers and scams, exact addresses and direct phone numbers are released via official UniNest agent unlock.
                  </p>
                </div>

                {/* Simulated blurred mock info */}
                <div className="bg-black/60 p-3 rounded-xl border border-blue-900/50 filter blur-[2px] select-none text-xs text-blue-300 space-y-1 opacity-70">
                  <p>Plot 48XX, Chitimukulu Rd, Riverside</p>
                  <p>Phone: +260 97 XXX XXXX (Mr. Banda)</p>
                  <p>WhatsApp: Direct 1-Click Available</p>
                </div>

                {/* Unlock CTA Button */}
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => onUnlockClick(listing)}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 hover:from-blue-600 hover:to-cyan-400 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-600/40 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] cursor-pointer"
                  >
                    <LockOpen className="w-5 h-5" />
                    <span>Unlock Contact for K{agentFee}</span>
                  </button>
                  <p className="text-[11px] text-blue-400/80">
                    ⚡ Instant unlock via MTN MoMo, Airtel Money, or Debit Card
                  </p>
                </div>

              </div>
            ) : (
              /* UNLOCKED CARD: REVEALED CONTACT & EXACT PLOT */
              <div className="bg-zinc-950 border-2 border-blue-500 rounded-2xl p-5 space-y-4 shadow-2xl shadow-blue-950 glow-blue animate-in fade-in">
                
                <div className="flex items-center justify-between pb-3 border-b border-blue-900/60">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                      <LockOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                        Official Agent Unlock
                      </span>
                      <h4 className="text-sm font-bold text-white">
                        {unlockedDetails?.landlordFullName || listing.landlordNameDisplay}
                      </h4>
                    </div>
                  </div>

                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 border border-blue-600">
                    Unlocked
                  </span>
                </div>

                {/* Direct Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`https://wa.me/${unlockedDetails?.landlordWhatsApp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Hello ${unlockedDetails?.landlordFullName}, I unlocked your boarding room on UniNest (${listing.title}). When is the best time for a viewing?`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp Landlord</span>
                  </a>

                  <a
                    href={`tel:${unlockedDetails?.landlordPhone}`}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Landlord</span>
                  </a>
                </div>

                {/* Landlord Phone Number */}
                <div className="flex items-center justify-between bg-black/80 p-3 rounded-xl border border-blue-900/50">
                  <div>
                    <span className="text-[11px] text-blue-400 block font-medium">Landlord Direct Phone</span>
                    <span className="font-mono text-base font-bold text-white tracking-wide">
                      {unlockedDetails?.landlordPhone}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(unlockedDetails?.landlordPhone || '', 'phone')}
                    className="p-2 text-blue-400 hover:text-white bg-blue-950/60 rounded-lg border border-blue-800/40"
                    title="Copy Phone Number"
                  >
                    {copiedPhone ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Exact Street Address & Plot Number */}
                <div className="bg-black/80 p-3.5 rounded-xl border border-blue-900/50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-blue-400 font-semibold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-400" />
                      Exact Physical Plot Address:
                    </span>
                    <button
                      onClick={() => copyToClipboard(unlockedDetails?.exactAddress || '', 'address')}
                      className="text-xs text-blue-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedAddress ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <p className="text-sm font-bold text-white">
                    {unlockedDetails?.exactAddress}
                  </p>
                  <p className="text-xs text-blue-300">
                    <strong>Directions:</strong> {unlockedDetails?.landmarkDirections}
                  </p>

                  {/* Google Maps link button */}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${unlockedDetails?.exactAddress}, Zambia`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium mt-1"
                  >
                    <span>Open in Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Caretaker & Viewing hours */}
                <div className="bg-blue-950/30 p-3 rounded-xl border border-blue-800/30 text-xs text-blue-200 space-y-1">
                  <p className="flex items-center gap-1.5 font-semibold text-white">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    Viewing Schedule: {unlockedDetails?.viewingHours}
                  </p>
                  {unlockedDetails?.caretakerContact && (
                    <p><strong>Caretaker:</strong> {unlockedDetails.caretakerContact}</p>
                  )}
                  {unlockedDetails?.specialInstructions && (
                    <p className="text-blue-300 italic pt-1">
                      ⚠️ {unlockedDetails.specialInstructions}
                    </p>
                  )}
                </div>

              </div>
            )}

            {/* Trust and Safety Warning Card (Section 10 of spec) */}
            <div className="bg-blue-950/20 border border-blue-800/40 rounded-2xl p-4 space-y-2">
              <h5 className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-blue-400" />
                UniNest Agent Protection Policy:
              </h5>
              <p className="text-xs text-blue-200/90 leading-relaxed">
                • <strong>Never pay full rent or security deposits in advance</strong> before conducting an in-person physical inspection of the room with the landlord.
              </p>
              <p className="text-xs text-blue-200/90 leading-relaxed">
                • If the room is already occupied or the landlord contacts are invalid, use the Report button below for an agent investigation and refund credit.
              </p>

              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => onOpenReport(listing)}
                  className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Report this listing</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
