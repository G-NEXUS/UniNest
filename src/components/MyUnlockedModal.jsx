import React, { useState } from 'react';
import { X, LockOpen, Phone, MessageSquare, MapPin, Copy, Check, Receipt } from 'lucide-react';
export const MyUnlockedModal = ({ unlocks, allListings, privateDetailsMap, onClose, onSelectListing, }) => {
    const [copiedId, setCopiedId] = useState(null);
    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };
    return (<div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-black border border-blue-500/40 rounded-3xl shadow-2xl p-6 text-blue-50 glow-blue animate-in fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-blue-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/50 flex items-center justify-center text-blue-400">
              <LockOpen className="w-5 h-5"/>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                My Unlocked Contacts
              </h3>
              <p className="text-xs text-blue-300">
                You have unlocked {unlocks.length} landlord contacts. All data is saved to your account.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-blue-400 hover:text-white rounded-xl hover:bg-blue-950/60">
            <X className="w-5 h-5"/>
          </button>
        </div>

        {/* Content list */}
        <div className="mt-5 space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          {unlocks.length === 0 ? (<div className="text-center py-12 px-4 space-y-3">
              <div className="w-14 h-14 rounded-full bg-blue-950/50 border border-blue-800/40 flex items-center justify-center mx-auto text-blue-400">
                <LockOpen className="w-6 h-6 opacity-60"/>
              </div>
              <h4 className="text-base font-semibold text-white">No Unlocked Contacts Yet</h4>
              <p className="text-xs text-blue-300/80 max-w-sm mx-auto">
                Browse student boarding houses and unlock landlord details for quick WhatsApp and viewing appointments.
              </p>
            </div>) : (unlocks.map((record) => {
            const listing = allListings.find((l) => l.id === record.listingId);
            const priv = privateDetailsMap[record.listingId];
            if (!listing)
                return null;
            return (<div key={record.id} className="bg-zinc-950 border border-blue-900/50 hover:border-blue-500/60 rounded-2xl p-4 transition-all space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={listing.photos[0]} alt={listing.title} className="w-14 h-14 rounded-xl object-cover border border-blue-900 shrink-0"/>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                          {listing.campus}
                        </span>
                        <h4 onClick={() => {
                    onClose();
                    onSelectListing(listing);
                }} className="text-sm font-bold text-white hover:text-blue-300 cursor-pointer truncate">
                          {listing.title}
                        </h4>
                        <p className="text-xs text-blue-300/80">
                          K{listing.price.toLocaleString()} / mo • {listing.generalArea}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                        <Receipt className="w-3 h-3"/>
                        {record.receiptNumber}
                      </span>
                    </div>
                  </div>

                  {/* Unlocked Details Strip */}
                  {priv ? (<div className="bg-black/80 rounded-xl p-3 border border-blue-900/40 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <p className="text-[11px] text-blue-400 font-semibold">Landlord Contact</p>
                          <p className="text-sm font-bold text-white">
                            {priv.landlordFullName} ({priv.landlordPhone})
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <a href={`https://wa.me/${priv.landlordWhatsApp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${priv.landlordFullName}, I unlocked your boarding room on UniNest. When can I view the room?`)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors">
                            <MessageSquare className="w-3.5 h-3.5"/>
                            <span>WhatsApp</span>
                          </a>

                          <a href={`tel:${priv.landlordPhone}`} className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors">
                            <Phone className="w-3.5 h-3.5"/>
                            <span>Call</span>
                          </a>

                          <button onClick={() => copyToClipboard(priv.landlordPhone, record.id)} className="p-1.5 bg-blue-950 text-blue-300 hover:text-white rounded-lg border border-blue-800/60" title="Copy number">
                            {copiedId === record.id ? <Check className="w-3.5 h-3.5 text-emerald-400"/> : <Copy className="w-3.5 h-3.5"/>}
                          </button>
                        </div>
                      </div>

                      {/* Exact Address */}
                      <div className="text-xs text-blue-200 pt-1 border-t border-blue-900/30 flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5"/>
                        <div>
                          <p className="font-semibold text-white">{priv.exactAddress}</p>
                          <p className="text-[11px] text-blue-300/80">{priv.landmarkDirections}</p>
                        </div>
                      </div>
                    </div>) : (<div className="text-xs text-blue-400/60 italic">
                      Contact details verification in progress.
                    </div>)}

                </div>);
        }))}
        </div>
      </div>
    </div>);
};
