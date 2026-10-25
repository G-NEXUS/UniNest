import React, { useState } from 'react';
import { Home, Plus, CheckCircle2, Clock, XCircle, LockOpen, Trash2, ShieldCheck, DollarSign, Users, UploadCloud, X } from 'lucide-react';
import { AMENITIES_LIST } from '../data/initialData';
import { LandlordTenantPanel } from './LandlordTenantPanel';
export const LandlordPortal = ({ currentUser, listings, tenants, onAddListing, onUpdateStatus, onDeleteListing, onAddTenant, onUpdateTenant, onRemoveTenant, onRecordPayment, }) => {
    const [activeSubTab, setActiveSubTab] = useState('roster');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [verificationSubmitted, setVerificationSubmitted] = useState(false);
    // Form State for new listing
    const [title, setTitle] = useState('');
    const [campus, setCampus] = useState('Copperbelt University (CBU)');
    const [generalArea, setGeneralArea] = useState('');
    const [price, setPrice] = useState(1200);
    const [pricePeriod, setPricePeriod] = useState('per_month');
    const [roomType, setRoomType] = useState('single');
    const [genderRule, setGenderRule] = useState('mixed');
    const [distanceToCampus, setDistanceToCampus] = useState('400m / 5 min walk');
    const [description, setDescription] = useState('');
    const [selectedAmenities, setSelectedAmenities] = useState(['wifi', 'water', 'security']);
    const [houseRulesInput, setHouseRulesInput] = useState('No loud noise after 22:00, Keep kitchen clean');
    const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&auto=format&fit=crop&q=80');
    // Protected fields
    const [landlordFullName, setLandlordFullName] = useState(currentUser.name);
    const [landlordPhone, setLandlordPhone] = useState(currentUser.phone);
    const [landlordWhatsApp, setLandlordWhatsApp] = useState(currentUser.phone);
    const [exactAddress, setExactAddress] = useState('');
    const [landmarkDirections, setLandmarkDirections] = useState('');
    const [viewingHours, setViewingHours] = useState('Monday - Saturday: 09:00 - 17:00');
    const [caretakerContact, setCaretakerContact] = useState('');
    const [specialInstructions, setSpecialInstructions] = useState('Call 30 minutes before arrival.');
    const myListings = listings.filter((l) => l.landlordId === currentUser.id);
    const totalUnlocks = myListings.reduce((acc, curr) => acc + (curr.unlockCount || 0), 0);
    const potentialYield = myListings
        .filter((l) => l.status === 'approved')
        .reduce((acc, curr) => acc + curr.price, 0);
    const toggleAmenity = (id) => {
        setSelectedAmenities((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]);
    };
    const handleCreateSubmit = (e) => {
        e.preventDefault();
        if (!title || !generalArea || !exactAddress || !landlordPhone) {
            alert('Please fill out all required fields including exact address and phone.');
            return;
        }
        const newId = `listing-${Date.now()}`;
        const newListing = {
            id: newId,
            title,
            campus,
            generalArea,
            price: Number(price),
            pricePeriod,
            roomType,
            genderRule,
            distanceToCampus,
            photos: [
                photoUrl,
                'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80',
            ],
            description,
            amenities: selectedAmenities,
            houseRules: houseRulesInput.split(',').map((s) => s.trim()).filter(Boolean),
            isVerifiedLandlord: currentUser.isVerified || false,
            status: 'pending', // Goes to Agent review queue
            createdAt: new Date().toISOString(),
            landlordId: currentUser.id,
            landlordNameDisplay: `${currentUser.name} (Direct Landlord)`,
            rating: 0,
            reviewCount: 0,
            unlockCount: 0,
        };
        const newPrivateDetails = {
            listingId: newId,
            landlordFullName,
            landlordPhone,
            landlordWhatsApp,
            exactAddress,
            mapCoordinates: { lat: -12.8024, lng: 28.2198 },
            landmarkDirections,
            viewingHours,
            caretakerContact,
            specialInstructions,
        };
        onAddListing(newListing, newPrivateDetails);
        setShowAddModal(false);
        alert('Listing successfully submitted! It is now pending verification by the UniNest Agent.');
    };
    return (<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Landlord Header & Stats */}
      <div className="bg-gradient-to-r from-blue-950/60 via-zinc-950 to-black border border-blue-800/50 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-400 shadow-lg shadow-blue-900/40"/>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">{currentUser.name}</h1>
                {currentUser.isVerified ? (<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-600/30 text-blue-300 border border-blue-400/50">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400"/>
                    Verified Partner
                  </span>) : (<button onClick={() => setShowVerifyModal(true)} className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-colors">
                    Request ID Verification
                  </button>)}
              </div>
              <p className="text-xs sm:text-sm text-blue-300/80 mt-1">
                Landlord Portal • Manage your student rooms and monitor interested student unlocks.
              </p>
            </div>
          </div>

          <button onClick={() => setShowAddModal(true)} className="flex items-center justify-center gap-2 px-5 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer">
            <Plus className="w-5 h-5"/>
            <span>Add New Boarding Room</span>
          </button>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-blue-900/50">
          <div className="bg-black/60 rounded-2xl p-4 border border-blue-900/40">
            <div className="flex items-center justify-between text-blue-400 text-xs font-semibold mb-1">
              <span>My Total Listings</span>
              <Home className="w-4 h-4"/>
            </div>
            <p className="text-2xl font-black text-white">{myListings.length}</p>
            <p className="text-[11px] text-blue-300/70 mt-1">
              {myListings.filter((l) => l.status === 'approved').length} Active & Live
            </p>
          </div>

          <div className="bg-black/60 rounded-2xl p-4 border border-blue-900/40">
            <div className="flex items-center justify-between text-blue-400 text-xs font-semibold mb-1">
              <span>Student Inquiries / Unlocks</span>
              <LockOpen className="w-4 h-4 text-cyan-400"/>
            </div>
            <p className="text-2xl font-black text-white">{totalUnlocks}</p>
            <p className="text-[11px] text-blue-300/70 mt-1">
              Students who unlocked your phone & address
            </p>
          </div>

          <div className="bg-black/60 rounded-2xl p-4 border border-blue-900/40">
            <div className="flex items-center justify-between text-blue-400 text-xs font-semibold mb-1">
              <span>Potential Monthly Yield</span>
              <DollarSign className="w-4 h-4 text-emerald-400"/>
            </div>
            <p className="text-2xl font-black text-white">K{potentialYield.toLocaleString()}</p>
            <p className="text-[11px] text-blue-300/70 mt-1">
              Combined rent for active rooms
            </p>
          </div>
        </div>
      </div>

      {/* SUB-TABS: TENANT ROSTER vs LISTINGS */}
      <div className="flex items-center gap-2 border-b border-blue-900/40 pb-1 overflow-x-auto">
        <button onClick={() => setActiveSubTab('roster')} className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${activeSubTab === 'roster'
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-blue-400'
            : 'text-blue-300 hover:text-white hover:bg-blue-950/50'}`}>
          <Users className="w-4 h-4"/>
          <span>Tenant & Room Roster</span>
          <span className="px-2 py-0.5 rounded-full text-[11px] bg-black/60 text-blue-200 border border-blue-400/40">
            {tenants.length} Occupants
          </span>
        </button>

        <button onClick={() => setActiveSubTab('listings')} className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${activeSubTab === 'listings'
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-blue-400'
            : 'text-blue-300 hover:text-white hover:bg-blue-950/50'}`}>
          <Home className="w-4 h-4"/>
          <span>Boarding House Listings</span>
          <span className="px-2 py-0.5 rounded-full text-[11px] bg-black/60 text-blue-200 border border-blue-400/40">
            {myListings.length}
          </span>
        </button>
      </div>

      {/* TAB 1: TENANT & ROOM OCCUPANCY ROSTER */}
      {activeSubTab === 'roster' && (<LandlordTenantPanel currentUser={currentUser} landlordListings={myListings} tenants={tenants} onAddTenant={onAddTenant} onUpdateTenant={onUpdateTenant} onRemoveTenant={onRemoveTenant} onRecordPayment={onRecordPayment}/>)}

      {/* TAB 2: LISTINGS SECTION */}
      {activeSubTab === 'listings' && (<div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              My Registered Boarding Houses
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                {myListings.length}
              </span>
            </h2>

            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs">
              <Plus className="w-3.5 h-3.5"/>
              <span>Add Room</span>
            </button>
          </div>

          {myListings.length === 0 ? (<div className="bg-zinc-950 border border-blue-900/40 rounded-3xl p-12 text-center space-y-4">
              <Home className="w-12 h-12 text-blue-500 mx-auto opacity-70"/>
              <h3 className="text-lg font-bold text-white">No Boarding Rooms Listed Yet</h3>
              <p className="text-xs text-blue-300 max-w-md mx-auto">
                Add your available boarding rooms to connect directly with university students verified by the UniNest agent.
              </p>
              <button onClick={() => setShowAddModal(true)} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-colors">
                Submit First Listing
              </button>
            </div>) : (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myListings.map((listing) => (<div key={listing.id} className="bg-zinc-950 border border-blue-900/40 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between">
                  <div>
                    <div className="relative aspect-[16/10] bg-black">
                      <img src={listing.photos[0]} alt={listing.title} className="w-full h-full object-cover"/>
                      <div className="absolute top-3 left-3">
                        {listing.status === 'approved' && (<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-500/50">
                            <CheckCircle2 className="w-3.5 h-3.5"/>
                            Live & Approved
                          </span>)}
                        {listing.status === 'pending' && (<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-950/90 text-amber-300 border border-amber-500/50">
                            <Clock className="w-3.5 h-3.5"/>
                            Pending Agent Verification
                          </span>)}
                        {listing.status === 'taken' && (<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-zinc-900/90 text-zinc-300 border border-zinc-700">
                            <XCircle className="w-3.5 h-3.5"/>
                            Marked as Taken
                          </span>)}
                      </div>

                      <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-xs font-semibold text-blue-300 border border-blue-900">
                        {listing.unlockCount || 0} Unlocks
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs text-blue-400">
                        <span className="font-semibold">{listing.campus}</span>
                        <span className="font-bold text-white">K{listing.price} / mo</span>
                      </div>

                      <h4 className="text-sm font-bold text-white line-clamp-1">
                        {listing.title}
                      </h4>
                      <p className="text-xs text-blue-300/80">{listing.generalArea}</p>
                    </div>
                  </div>

                  <div className="p-4 pt-0 border-t border-blue-900/30 flex items-center justify-between gap-2 mt-2">
                    <div className="flex items-center gap-2">
                      {listing.status === 'approved' ? (<button onClick={() => onUpdateStatus(listing.id, 'taken')} className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-zinc-900 hover:bg-zinc-800 text-blue-200 border border-blue-900" title="Mark room as fully booked">
                          Mark Taken
                        </button>) : (<button onClick={() => onUpdateStatus(listing.id, 'approved')} className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-blue-950 hover:bg-blue-900 text-blue-200 border border-blue-800" title="Make available for students">
                          Set Available
                        </button>)}
                    </div>

                    <button onClick={() => {
                        if (confirm('Are you sure you want to delete this listing?')) {
                            onDeleteListing(listing.id);
                        }
                    }} className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition-colors" title="Delete listing">
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  </div>
                </div>))}
            </div>)}
        </div>)}

      {/* ADD LISTING MODAL */}
      {showAddModal && (<div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-black border border-blue-500/50 rounded-3xl p-6 text-blue-50 my-6 shadow-2xl glow-blue" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowAddModal(false)} className="absolute top-5 right-5 p-2 text-blue-400 hover:text-white rounded-lg hover:bg-blue-950/50">
              <X className="w-5 h-5"/>
            </button>

            <div className="flex items-center gap-3 pb-4 border-b border-blue-900/40">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                <Plus className="w-6 h-6"/>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Submit New Boarding House</h3>
                <p className="text-xs text-blue-300">
                  Fill in safe public details and your strictly guarded private contact information.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-5 space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              
              {/* SECTION A: SAFE PUBLIC DETAILS */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center">1</span>
                  Safe Public Information (Visible to Students)
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-blue-200 mb-1">
                    Listing Title:
                  </label>
                  <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Modern Executive Single Room with Backup Solar" className="w-full px-3.5 py-2.5 bg-zinc-950 border border-blue-800/60 rounded-xl text-white text-sm focus:border-blue-400"/>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-blue-200 mb-1">
                      Campus:
                    </label>
                    <input type="text" disabled value="Copperbelt University (CBU)" className="w-full px-3.5 py-2.5 bg-zinc-950/70 border border-blue-900/60 rounded-xl text-blue-300 text-xs sm:text-sm cursor-not-allowed"/>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-blue-200 mb-1">
                      Public General Area (NO plot or street number):
                    </label>
                    <input type="text" required value={generalArea} onChange={(e) => setGeneralArea(e.target.value)} placeholder="e.g. Riverside, near CBU West Gate" className="w-full px-3.5 py-2.5 bg-zinc-950 border border-blue-800/60 rounded-xl text-white text-sm focus:border-blue-400"/>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-blue-200 mb-1">
                      Rent Amount (ZMW):
                    </label>
                    <input type="number" required value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full px-3.5 py-2.5 bg-zinc-950 border border-blue-800/60 rounded-xl text-white text-sm focus:border-blue-400"/>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-blue-200 mb-1">
                      Room Configuration:
                    </label>
                    <select value={roomType} onChange={(e) => setRoomType(e.target.value)} className="w-full px-3.5 py-2.5 bg-zinc-950 border border-blue-800/60 rounded-xl text-white text-sm focus:border-blue-400">
                      <option value="single">Single Room</option>
                      <option value="shared_2">2-in-1 Shared</option>
                      <option value="shared_4">4-Bed Sharing</option>
                      <option value="self_contained">Self-Contained Studio</option>
                      <option value="bedspace">Bedspace</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-blue-200 mb-1">
                      Gender Policy:
                    </label>
                    <select value={genderRule} onChange={(e) => setGenderRule(e.target.value)} className="w-full px-3.5 py-2.5 bg-zinc-950 border border-blue-800/60 rounded-xl text-white text-sm focus:border-blue-400">
                      <option value="mixed">Mixed Gender</option>
                      <option value="female_only">Female Students Only</option>
                      <option value="male_only">Male Students Only</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-blue-200 mb-1">
                    Room Photo URL:
                  </label>
                  <input type="url" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} className="w-full px-3.5 py-2.5 bg-zinc-950 border border-blue-800/60 rounded-xl text-white text-sm focus:border-blue-400"/>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-blue-200 mb-1">
                    Description & Highlights:
                  </label>
                  <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe cleanliness, security, study desks, water reliability..." className="w-full px-3.5 py-2.5 bg-zinc-950 border border-blue-800/60 rounded-xl text-white text-sm focus:border-blue-400"/>
                </div>

                {/* Amenities checklist */}
                <div>
                  <label className="block text-xs font-semibold text-blue-200 mb-2">
                    Select Available Amenities:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {AMENITIES_LIST.map((am) => (<button type="button" key={am.id} onClick={() => toggleAmenity(am.id)} className={`p-2 rounded-xl border text-xs text-left flex items-center gap-2 transition-colors ${selectedAmenities.includes(am.id)
                    ? 'bg-blue-600/30 border-blue-400 text-white font-medium'
                    : 'bg-zinc-950 border-blue-900/60 text-blue-300'}`}>
                        <CheckCircle2 className={`w-3.5 h-3.5 ${selectedAmenities.includes(am.id) ? 'text-blue-400' : 'text-zinc-600'}`}/>
                        <span className="truncate">{am.name}</span>
                      </button>))}
                  </div>
                </div>
              </div>

              {/* SECTION B: PROTECTED PRIVATE DETAILS (HIDDEN FROM STUDENTS UNTIL PAYMENT) */}
              <div className="pt-4 border-t border-blue-900/60 space-y-4 bg-blue-950/20 p-4 rounded-2xl border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-600 text-white text-[11px] flex items-center justify-center">2</span>
                  Guarded Private Details (Revealed ONLY After Agent Payment)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-blue-200 mb-1">
                      Direct Landlord Phone:
                    </label>
                    <input type="text" required value={landlordPhone} onChange={(e) => setLandlordPhone(e.target.value)} placeholder="+260 97 XXX XXXX" className="w-full px-3.5 py-2.5 bg-black border border-blue-800 rounded-xl text-white text-sm focus:border-blue-400"/>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-blue-200 mb-1">
                      Landlord WhatsApp Number:
                    </label>
                    <input type="text" required value={landlordWhatsApp} onChange={(e) => setLandlordWhatsApp(e.target.value)} placeholder="+260 97 XXX XXXX" className="w-full px-3.5 py-2.5 bg-black border border-blue-800 rounded-xl text-white text-sm focus:border-blue-400"/>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-blue-200 mb-1">
                    Exact Physical Address & Plot Number:
                  </label>
                  <input type="text" required value={exactAddress} onChange={(e) => setExactAddress(e.target.value)} placeholder="e.g. Plot 4182, Chitimukulu Road, Riverside, Kitwe" className="w-full px-3.5 py-2.5 bg-black border border-blue-800 rounded-xl text-white text-sm focus:border-blue-400"/>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-blue-200 mb-1">
                    Landmark Directions (How to find gate):
                  </label>
                  <input type="text" value={landmarkDirections} onChange={(e) => setLandmarkDirections(e.target.value)} placeholder="e.g. 3rd gate on left after Blue Kiosk, navy sliding gate" className="w-full px-3.5 py-2.5 bg-black border border-blue-800 rounded-xl text-white text-sm focus:border-blue-400"/>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-blue-200 mb-1">
                      Viewing Hours:
                    </label>
                    <input type="text" value={viewingHours} onChange={(e) => setViewingHours(e.target.value)} className="w-full px-3.5 py-2.5 bg-black border border-blue-800 rounded-xl text-white text-sm focus:border-blue-400"/>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-blue-200 mb-1">
                      Caretaker Contact (Optional):
                    </label>
                    <input type="text" value={caretakerContact} onChange={(e) => setCaretakerContact(e.target.value)} placeholder="e.g. +260 97 441 9022 (Mr. Mwila)" className="w-full px-3.5 py-2.5 bg-black border border-blue-800 rounded-xl text-white text-sm focus:border-blue-400"/>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 hover:from-blue-600 hover:to-cyan-400 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer">
                  Submit Listing for Agent Approval
                </button>
              </div>

            </form>
          </div>
        </div>)}

      {/* ID VERIFICATION MODAL */}
      {showVerifyModal && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-black border border-blue-500/40 rounded-3xl p-6 text-blue-50 shadow-2xl">
            <button onClick={() => setShowVerifyModal(false)} className="absolute top-4 right-4 text-blue-400 hover:text-white">
              <X className="w-5 h-5"/>
            </button>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-400/50 flex items-center justify-center mx-auto text-blue-400">
                <ShieldCheck className="w-6 h-6"/>
              </div>
              <h3 className="text-lg font-bold text-white">Landlord Identity Verification</h3>
              <p className="text-xs text-blue-300">
                Submit National Registration Card (NRC) or Title Deed / Council Lease proof to earn the verified badge.
              </p>

              {!verificationSubmitted ? (<div className="pt-3 space-y-3 text-left">
                  <div className="p-4 border-2 border-dashed border-blue-800 rounded-2xl text-center space-y-2 bg-zinc-950">
                    <UploadCloud className="w-8 h-8 text-blue-400 mx-auto"/>
                    <p className="text-xs text-blue-200">Upload NRC / Property Deed Document</p>
                    <p className="text-[10px] text-blue-400/70">PNG, JPG, PDF up to 10MB</p>
                  </div>

                  <button onClick={() => {
                    setVerificationSubmitted(true);
                    setTimeout(() => setShowVerifyModal(false), 2000);
                }} className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors">
                    Submit Proof to Agent
                  </button>
                </div>) : (<div className="p-4 bg-emerald-950/40 border border-emerald-600/40 rounded-xl text-emerald-200 text-xs">
                  Verification proof submitted! The UniNest verification agent will review within 24 hours.
                </div>)}
            </div>
          </div>
        </div>)}
    </div>);
};
