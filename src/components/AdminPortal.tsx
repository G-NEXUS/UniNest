import React, { useState } from 'react';
import { 
  ShieldCheck, 
  DollarSign, 
  LockOpen, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Home, 
  Users, 
  SlidersHorizontal, 
  Eye, 
  Check, 
  Receipt, 
  MapPin, 
  Phone,
  RefreshCw,
  Ban,
  BadgeCheck
} from 'lucide-react';
import { 
  Listing, 
  PrivateDetails, 
  PaymentRequest, 
  ListingReport, 
  UserProfile, 
  UnlockRecord 
} from '../types';

interface AdminPortalProps {
  listings: Listing[];
  privateDetailsMap: Record<string, PrivateDetails>;
  paymentRequests: PaymentRequest[];
  reports: ListingReport[];
  users: UserProfile[];
  unlocks: UnlockRecord[];
  agentFee: number;
  onUpdateAgentFee: (fee: number) => void;
  onApproveListing: (id: string) => void;
  onRejectListing: (id: string) => void;
  onApprovePayment: (requestId: string) => void;
  onRejectPayment: (requestId: string) => void;
  onResolveReport: (reportId: string, status: ListingReport['status']) => void;
  onToggleUserBan: (userId: string) => void;
  onToggleLandlordVerify: (userId: string) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  listings,
  privateDetailsMap,
  paymentRequests,
  reports,
  users,
  unlocks,
  agentFee,
  onUpdateAgentFee,
  onApproveListing,
  onRejectListing,
  onApprovePayment,
  onRejectPayment,
  onResolveReport,
  onToggleUserBan,
  onToggleLandlordVerify,
}) => {
  const [activeTab, setActiveTab] = useState<'listings' | 'payments' | 'reports' | 'all_listings' | 'users'>('listings');
  const [feeInput, setFeeInput] = useState(agentFee);
  const [feeSavedToast, setFeeSavedToast] = useState(false);
  const [previewListing, setPreviewListing] = useState<Listing | null>(null);

  const pendingListings = listings.filter((l) => l.status === 'pending');
  const pendingPayments = paymentRequests.filter((p) => p.status === 'pending');
  const pendingReports = reports.filter((r) => r.status === 'pending');

  const totalAgentRevenue = unlocks.reduce((sum, u) => sum + (u.amountPaid || agentFee), 0);

  const handleSaveFee = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAgentFee(Number(feeInput));
    setFeeSavedToast(true);
    setTimeout(() => setFeeSavedToast(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Agent Top Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-zinc-950 to-black border border-blue-700/60 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/30 border border-blue-400 flex items-center justify-center text-blue-300 shadow-lg shadow-blue-900/50">
              <ShieldCheck className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">Agent Operations Dashboard</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white">
                  Admin Panel
                </span>
              </div>
              <p className="text-xs sm:text-sm text-blue-300 mt-1">
                Oversee boarding house approvals, manual payment receipts, agent fee pricing, and student reports.
              </p>
            </div>
          </div>

          {/* Fee Manager Card */}
          <form onSubmit={handleSaveFee} className="bg-black/80 border border-blue-900/60 rounded-2xl p-3.5 flex items-center gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-blue-300">
                Agent Unlock Fee (ZMW):
              </label>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-sm font-bold text-white">K</span>
                <input
                  type="number"
                  min="5"
                  max="500"
                  value={feeInput}
                  onChange={(e) => setFeeInput(Number(e.target.value))}
                  className="w-20 px-2 py-1 bg-zinc-950 border border-blue-700 rounded-lg text-white font-bold text-sm focus:border-blue-400"
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all self-end"
            >
              Update Fee
            </button>
            {feeSavedToast && (
              <span className="text-xs text-emerald-400 font-bold">Saved!</span>
            )}
          </form>
        </div>

        {/* Financial & Operational KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-blue-900/50">
          <div className="bg-black/60 rounded-2xl p-4 border border-blue-900/40">
            <div className="flex items-center justify-between text-blue-400 text-xs font-semibold mb-1">
              <span>Agent Total Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-white">K{totalAgentRevenue.toLocaleString()}</p>
            <p className="text-[11px] text-blue-300/70 mt-1">
              From {unlocks.length} student unlocks
            </p>
          </div>

          <div className="bg-black/60 rounded-2xl p-4 border border-blue-900/40">
            <div className="flex items-center justify-between text-blue-400 text-xs font-semibold mb-1">
              <span>Pending Listings</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-black text-amber-300">{pendingListings.length}</p>
            <p className="text-[11px] text-blue-300/70 mt-1">
              Awaiting agent verification
            </p>
          </div>

          <div className="bg-black/60 rounded-2xl p-4 border border-blue-900/40">
            <div className="flex items-center justify-between text-blue-400 text-xs font-semibold mb-1">
              <span>Pending Payments</span>
              <Receipt className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-black text-cyan-300">{pendingPayments.length}</p>
            <p className="text-[11px] text-blue-300/70 mt-1">
              Manual mobile money slips
            </p>
          </div>

          <div className="bg-black/60 rounded-2xl p-4 border border-blue-900/40">
            <div className="flex items-center justify-between text-blue-400 text-xs font-semibold mb-1">
              <span>Student Reports</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-2xl font-black text-rose-300">{pendingReports.length}</p>
            <p className="text-[11px] text-blue-300/70 mt-1">
              Room taken / wrong phone
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-blue-900/40">
        <button
          onClick={() => setActiveTab('listings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'listings'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-blue-300 hover:text-white hover:bg-blue-950/40'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Pending Listings ({pendingListings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'payments'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-blue-300 hover:text-white hover:bg-blue-950/40'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Manual Payments ({pendingPayments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'reports'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-blue-300 hover:text-white hover:bg-blue-950/40'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Disputes & Reports ({pendingReports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('all_listings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'all_listings'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-blue-300 hover:text-white hover:bg-blue-950/40'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>All Listings ({listings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-blue-300 hover:text-white hover:bg-blue-950/40'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Users & Landlords ({users.length})</span>
        </button>
      </div>

      {/* TAB 1: PENDING LISTINGS APPROVAL QUEUE */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">
              Landlord Listings Awaiting Agent Review
            </h3>
          </div>

          {pendingListings.length === 0 ? (
            <div className="bg-zinc-950 border border-blue-900/40 rounded-3xl p-10 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-blue-400 mx-auto" />
              <p className="text-base font-bold text-white">Queue is Clear!</p>
              <p className="text-xs text-blue-300">All submitted boarding houses have been inspected and approved.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingListings.map((item) => {
                const priv = privateDetailsMap[item.id];
                return (
                  <div
                    key={item.id}
                    className="bg-zinc-950 border border-blue-900/60 rounded-2xl p-5 space-y-4 shadow-xl"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <img
                          src={item.photos[0]}
                          alt={item.title}
                          className="w-24 h-24 rounded-xl object-cover border border-blue-900 shrink-0"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                              {item.campus}
                            </span>
                            <span className="text-xs text-blue-400 font-mono">ID: {item.id}</span>
                          </div>
                          <h4 className="text-base font-bold text-white">{item.title}</h4>
                          <p className="text-xs text-blue-200">
                            <strong>Safe Public Area:</strong> {item.generalArea} • <strong>Price:</strong> K{item.price}/mo
                          </p>
                          <p className="text-xs text-blue-300/80">
                            Submitted by: {item.landlordNameDisplay}
                          </p>
                        </div>
                      </div>

                      {/* Approval Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => onApproveListing(item.id)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve & Publish</span>
                        </button>

                        <button
                          onClick={() => onRejectListing(item.id)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-bold rounded-xl transition-all"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>

                    {/* Agent Inspection: Guarded Details preview */}
                    {priv && (
                      <div className="bg-black/80 rounded-xl p-3.5 border border-blue-900/40 text-xs text-blue-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <p className="font-semibold text-blue-300 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-blue-400" />
                            Guarded Exact Address:
                          </p>
                          <p className="text-white font-medium">{priv.exactAddress}</p>
                          <p className="text-[11px] text-blue-300/80">{priv.landmarkDirections}</p>
                        </div>

                        <div>
                          <p className="font-semibold text-blue-300 flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-blue-400" />
                            Guarded Landlord Phone:
                          </p>
                          <p className="text-white font-mono font-bold">{priv.landlordPhone}</p>
                          <p className="text-[11px] text-blue-300/80">Viewing: {priv.viewingHours}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MANUAL PAYMENT APPROVALS QUEUE */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">
            Manual Mobile Money Slips & Approvals
          </h3>

          {pendingPayments.length === 0 ? (
            <div className="bg-zinc-950 border border-blue-900/40 rounded-3xl p-10 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-blue-400 mx-auto" />
              <p className="text-base font-bold text-white">No Pending Payments</p>
              <p className="text-xs text-blue-300">All student payment reference slips have been processed.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingPayments.map((req) => (
                <div
                  key={req.id}
                  className="bg-zinc-950 border border-blue-900/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                        {req.reference}
                      </span>
                      <span className="text-xs text-blue-400 capitalize">Method: {req.method}</span>
                    </div>
                    <p className="text-sm font-bold text-white">
                      {req.studentName} ({req.studentPhone})
                    </p>
                    <p className="text-xs text-blue-200">
                      Unlocking: <strong>{req.listingTitle}</strong> • Amount: <strong className="text-emerald-400">K{req.amount}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onApprovePayment(req.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md"
                    >
                      Approve & Grant Unlock
                    </button>
                    <button
                      onClick={() => onRejectPayment(req.id)}
                      className="px-3 py-2 bg-zinc-900 hover:bg-rose-950 text-zinc-300 hover:text-rose-300 border border-zinc-800 text-xs font-bold rounded-xl transition-all"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: STUDENT DISPUTES & REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">
            Student Reports & Quality Complaints
          </h3>

          {pendingReports.length === 0 ? (
            <div className="bg-zinc-950 border border-blue-900/40 rounded-3xl p-10 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-blue-400 mx-auto" />
              <p className="text-base font-bold text-white">Zero Active Reports</p>
              <p className="text-xs text-blue-300">No unresolved student complaints found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingReports.map((rep) => (
                <div
                  key={rep.id}
                  className="bg-zinc-950 border border-rose-900/40 rounded-2xl p-4 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                          {rep.reason.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-blue-400 font-medium">
                          Reported by {rep.reporterName}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1">
                        Listing: {rep.listingTitle}
                      </h4>
                      <p className="text-xs text-blue-100 bg-black/60 p-2.5 rounded-xl border border-blue-900/40 mt-2">
                        "{rep.comment}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onResolveReport(rep.id, 'resolved')}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        Mark Resolved
                      </button>
                      <button
                        onClick={() => onResolveReport(rep.id, 'dismissed')}
                        className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-blue-300 text-xs font-bold rounded-lg transition-colors border border-blue-900"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ALL LISTINGS MANAGEMENT */}
      {activeTab === 'all_listings' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">All Platform Listings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((l) => (
              <div
                key={l.id}
                className="bg-zinc-950 border border-blue-900/40 rounded-2xl p-4 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-blue-400 mb-1">
                    <span className="font-semibold">{l.campus}</span>
                    <span className="capitalize font-bold text-white">{l.status}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white line-clamp-1">{l.title}</h4>
                  <p className="text-xs text-blue-300/80">{l.generalArea}</p>
                  <p className="text-xs font-bold text-blue-400 mt-1">
                    K{l.price}/mo • {l.unlockCount || 0} Unlocks
                  </p>
                </div>

                <div className="pt-2 border-t border-blue-900/30 flex items-center justify-between text-xs">
                  <span className="text-blue-400/80">{l.landlordNameDisplay}</span>
                  {l.status === 'approved' ? (
                    <button
                      onClick={() => onRejectListing(l.id)}
                      className="text-rose-400 hover:text-rose-300 font-semibold"
                    >
                      Delist
                    </button>
                  ) : (
                    <button
                      onClick={() => onApproveListing(l.id)}
                      className="text-emerald-400 hover:text-emerald-300 font-semibold"
                    >
                      Approve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: USERS & LANDLORDS DIRECTORY */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Platform Users & Verification</h3>
          <div className="bg-zinc-950 border border-blue-900/50 rounded-2xl overflow-hidden">
            <div className="divide-y divide-blue-900/40">
              {users.map((u) => (
                <div key={u.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={u.avatarUrl}
                      alt={u.name}
                      className="w-10 h-10 rounded-xl object-cover border border-blue-500/40"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white">{u.name}</p>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                          {u.role}
                        </span>
                        {u.isVerified && (
                          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                            <BadgeCheck className="w-3.5 h-3.5" /> Verified
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-blue-300/80">{u.phone} • {u.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {u.role === 'landlord' && (
                      <button
                        onClick={() => onToggleLandlordVerify(u.id)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-950 hover:bg-blue-900 text-blue-200 border border-blue-800"
                      >
                        {u.isVerified ? 'Revoke Verified' : 'Grant Verified'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
