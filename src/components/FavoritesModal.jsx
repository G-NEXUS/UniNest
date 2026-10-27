import React from 'react';
import { X, Heart, MapPin, ArrowRight, Trash2 } from 'lucide-react';

export const FavoritesModal = ({
  favoriteIds,
  listings,
  onClose,
  onSelectListing,
  onRemoveFavorite,
}) => {
  const favoriteListings = listings.filter((l) => favoriteIds.includes(l.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-xl bg-black border border-blue-500/40 rounded-3xl p-6 text-blue-50 shadow-2xl glow-blue animate-in fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-blue-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-400/50 flex items-center justify-center text-blue-400">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Saved Boarding Houses</h3>
              <p className="text-xs text-blue-300">
                You have bookmarked {favoriteListings.length} rooms
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-blue-400 hover:text-white rounded-xl hover:bg-blue-950/60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {favoriteListings.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-2">
              <Heart className="w-12 h-12 text-blue-500/50 mx-auto" />
              <h4 className="text-base font-semibold text-white">No Saved Rooms Yet</h4>
              <p className="text-xs text-blue-300/80">
                Tap the heart icon on any boarding room card to save it here for quick viewing.
              </p>
            </div>
          ) : (
            favoriteListings.map((listing) => (
              <div
                key={listing.id}
                className="bg-zinc-950 border border-blue-900/50 hover:border-blue-500/60 rounded-2xl p-3.5 flex items-center justify-between gap-3 transition-all"
              >
                <div 
                  onClick={() => {
                    onClose();
                    onSelectListing(listing);
                  }}
                  className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                >
                  <img
                    src={listing.photos[0]}
                    alt={listing.title}
                    className="w-14 h-14 rounded-xl object-cover border border-blue-900 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                      {listing.campus}
                    </span>
                    <h4 className="text-sm font-bold text-white hover:text-blue-300 truncate">
                      {listing.title}
                    </h4>
                    <p className="text-xs text-blue-300/80 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-400" />
                      <span className="truncate">{listing.generalArea}</span>
                    </p>
                    <p className="text-xs font-bold text-blue-400">
                      K{listing.price.toLocaleString()} / mo
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      onClose();
                      onSelectListing(listing);
                    }}
                    className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer"
                    title="View details"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onRemoveFavorite(listing.id)}
                    className="p-2 rounded-lg bg-zinc-900 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-300 transition-colors cursor-pointer"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
