/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.jsx';
import { StudentView } from './components/StudentView.jsx';
import { LandlordPortal } from './components/LandlordPortal.jsx';
import { AdminPortal } from './components/AdminPortal.jsx';
import { ListingDetailModal } from './components/ListingDetailModal.jsx';
import { UnlockModal } from './components/UnlockModal.jsx';
import { MyUnlockedModal } from './components/MyUnlockedModal.jsx';
import { FavoritesModal } from './components/FavoritesModal.jsx';
import { ReportModal } from './components/ReportModal.jsx';
import { ReviewModal } from './components/ReviewModal.jsx';
import { StorageService } from './services/storage.js';
import { 
  ShieldCheck, 
  Key, 
  Phone, 
  MessageSquare, 
  CheckCircle2, 
  Sparkles,
  Lock,
  Heart
} from 'lucide-react';

export default function App() {
  // Master users
  const [allUsers, setAllUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // App data state
  const [listings, setListings] = useState([]);
  const [privateDetailsMap, setPrivateDetailsMap] = useState({});
  const [unlocks, setUnlocks] = useState([]);
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [reports, setReports] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [agentFee, setAgentFee] = useState(25);

  // Modals state
  const [activeDetailListing, setActiveDetailListing] = useState(null);
  const [activeUnlockListing, setActiveUnlockListing] = useState(null);
  const [showUnlockedModal, setShowUnlockedModal] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [reportListingTarget, setReportListingTarget] = useState(null);
  const [reviewListingTarget, setReviewListingTarget] = useState(null);

  // Load initial data
  const loadData = () => {
    const users = StorageService.getUsers();
    setAllUsers(users);
    if (!currentUser) {
      setCurrentUser(users[0]); // default to student
    }

    const currentFee = StorageService.getAgentFee();
    setAgentFee(currentFee);

    const loadedListings = StorageService.getListings();
    setListings(loadedListings);

    const privMap = StorageService.getAllPrivateDetailsMap();
    setPrivateDetailsMap(privMap);

    const loadedUnlocks = StorageService.getUnlocks();
    setUnlocks(loadedUnlocks);

    const loadedPayments = StorageService.getPaymentRequests();
    setPaymentRequests(loadedPayments);

    const loadedReports = StorageService.getReports();
    setReports(loadedReports);

    const loadedReviews = StorageService.getReviews();
    setReviews(loadedReviews);

    const loadedTenants = StorageService.getTenants();
    setTenants(loadedTenants);

    const studentId = currentUser ? currentUser.id : users[0].id;
    const favs = StorageService.getFavorites(studentId);
    setFavorites(favs);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update favorites when current user switches
  useEffect(() => {
    if (currentUser) {
      setFavorites(StorageService.getFavorites(currentUser.id));
    }
  }, [currentUser]);

  // Handler: toggle favorite
  const handleToggleFavorite = (listingId) => {
    if (!currentUser) return;
    const isNowFav = StorageService.toggleFavorite(currentUser.id, listingId);
    setFavorites(StorageService.getFavorites(currentUser.id));
  };

  // Handler: unlock success
  const handleUnlockSuccess = (revealedDetails, record) => {
    setUnlocks((prev) => [...prev, record]);
    // refresh listings to reflect increased unlock count
    setListings(StorageService.getListings());
  };

  // Handler: landlord adds new listing
  const handleAddListing = (newListing, newPrivateDetails) => {
    StorageService.saveListing(newListing, newPrivateDetails);
    loadData();
  };

  // Handler: landlord updates availability status
  const handleUpdateStatus = (listingId, status) => {
    const target = listings.find((l) => l.id === listingId);
    if (target) {
      target.status = status;
      StorageService.saveListing(target);
      loadData();
    }
  };

  // Handler: delete listing
  const handleDeleteListing = (listingId) => {
    StorageService.deleteListing(listingId);
    loadData();
  };

  // Handler: tenant management
  const handleAddTenant = (tenantData) => {
    StorageService.addTenant(tenantData);
    loadData();
  };

  const handleUpdateTenant = (tenant) => {
    StorageService.updateTenant(tenant);
    loadData();
  };

  const handleRemoveTenant = (id) => {
    StorageService.removeTenant(id);
    loadData();
  };

  const handleRecordPayment = (tenantId, additionalMonths) => {
    StorageService.recordTenantPayment(tenantId, additionalMonths);
    loadData();
  };

  // Handler: admin updates fee
  const handleUpdateAgentFee = (newFee) => {
    StorageService.setAgentFee(newFee);
    setAgentFee(newFee);
  };

  // Handler: admin approves listing
  const handleApproveListing = (id) => {
    const item = listings.find((l) => l.id === id);
    if (item) {
      item.status = 'approved';
      StorageService.saveListing(item);
      loadData();
    }
  };

  // Handler: admin rejects listing
  const handleRejectListing = (id) => {
    const item = listings.find((l) => l.id === id);
    if (item) {
      item.status = 'rejected';
      StorageService.saveListing(item);
      loadData();
    }
  };

  // Handler: admin approves manual payment
  const handleApprovePayment = (requestId) => {
    StorageService.approvePaymentRequest(requestId);
    loadData();
  };

  // Handler: admin rejects payment
  const handleRejectPayment = (requestId) => {
    StorageService.rejectPaymentRequest(requestId);
    loadData();
  };

  // Handler: admin resolves report
  const handleResolveReport = (reportId, status) => {
    StorageService.updateReportStatus(reportId, status);
    loadData();
  };

  // Handler: toggle landlord verified badge
  const handleToggleLandlordVerify = (userId) => {
    const users = StorageService.getUsers();
    const u = users.find((usr) => usr.id === userId);
    if (u) {
      u.isVerified = !u.isVerified;
      setAllUsers([...users]);
      if (currentUser?.id === userId) {
        setCurrentUser({ ...u });
      }
    }
  };

  // Handler: submit report
  const handleSubmitReport = (rep) => {
    StorageService.submitReport(rep);
    setReports(StorageService.getReports());
  };

  // Handler: submit review
  const handleSubmitReview = (rev) => {
    StorageService.addReview(rev);
    loadData();
  };

  // Handler: reset demo data
  const handleResetData = () => {
    if (confirm('Reset UniNest to sample demonstration data?')) {
      StorageService.resetToDefaults();
      loadData();
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Get current student's unlocked IDs
  const studentUnlockedIds = unlocks
    .filter((u) => u.studentId === currentUser.id)
    .map((u) => u.listingId);

  // Check if active detail listing has unlocked private details
  const activeListingPrivateDetails = activeDetailListing
    ? StorageService.getPrivateDetailsForUser(
        activeDetailListing.id,
        currentUser.id,
        currentUser.role
      )
    : null;

  const activeListingReviews = activeDetailListing
    ? reviews.filter((r) => r.listingId === activeDetailListing.id)
    : [];

  return (
    <div className="min-h-screen bg-black text-blue-50 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <Header
        currentUser={currentUser}
        allUsers={allUsers}
        onSelectUser={(u) => setCurrentUser(u)}
        agentFee={agentFee}
        onResetData={handleResetData}
      />

      {/* Main View switching based on Active User Role */}
      <main className="flex-1">
        {currentUser.role === 'student' && (
          <StudentView
            listings={listings}
            unlockedListingIds={studentUnlockedIds}
            favoriteListingIds={favorites}
            agentFee={agentFee}
            onToggleFavorite={handleToggleFavorite}
            onViewDetails={(listing) => setActiveDetailListing(listing)}
            onUnlockClick={(listing) => setActiveUnlockListing(listing)}
          />
        )}

        {currentUser.role === 'landlord' && (
          <LandlordPortal
            currentUser={currentUser}
            listings={listings}
            tenants={tenants.filter((t) => t.landlordId === currentUser.id)}
            onAddListing={handleAddListing}
            onUpdateStatus={handleUpdateStatus}
            onDeleteListing={handleDeleteListing}
            onAddTenant={handleAddTenant}
            onUpdateTenant={handleUpdateTenant}
            onRemoveTenant={handleRemoveTenant}
            onRecordPayment={handleRecordPayment}
          />
        )}

        {currentUser.role === 'admin' && (
          <AdminPortal
            listings={listings}
            privateDetailsMap={privateDetailsMap}
            paymentRequests={paymentRequests}
            reports={reports}
            users={allUsers}
            unlocks={unlocks}
            agentFee={agentFee}
            onUpdateAgentFee={handleUpdateAgentFee}
            onApproveListing={handleApproveListing}
            onRejectListing={handleRejectListing}
            onApprovePayment={handleApprovePayment}
            onRejectPayment={handleRejectPayment}
            onResolveReport={handleResolveReport}
            onToggleUserBan={() => {}}
            onToggleLandlordVerify={handleToggleLandlordVerify}
          />
        )}
      </main>

      {/* MODALS */}

      {/* 1. Room Detail Modal */}
      {activeDetailListing && (
        <ListingDetailModal
          listing={activeDetailListing}
          isUnlocked={
            currentUser.role === 'admin' ||
            activeDetailListing.landlordId === currentUser.id ||
            studentUnlockedIds.includes(activeDetailListing.id)
          }
          unlockedDetails={activeListingPrivateDetails}
          reviews={activeListingReviews}
          isFavorite={favorites.includes(activeDetailListing.id)}
          agentFee={agentFee}
          onClose={() => setActiveDetailListing(null)}
          onUnlockClick={(listing) => {
            setActiveUnlockListing(listing);
          }}
          onToggleFavorite={handleToggleFavorite}
          onOpenReport={(listing) => setReportListingTarget(listing)}
          onOpenReview={(listing) => setReviewListingTarget(listing)}
        />
      )}

      {/* 2. Unlock & Payment Modal */}
      {activeUnlockListing && (
        <UnlockModal
          listing={activeUnlockListing}
          studentId={currentUser.id}
          studentPhone={currentUser.phone}
          agentFee={agentFee}
          onClose={() => setActiveUnlockListing(null)}
          onSuccess={handleUnlockSuccess}
        />
      )}

      {/* 3. My Unlocked Contacts Drawer */}
      {showUnlockedModal && (
        <MyUnlockedModal
          unlocks={unlocks.filter((u) => u.studentId === currentUser.id)}
          allListings={listings}
          privateDetailsMap={privateDetailsMap}
          onClose={() => setShowUnlockedModal(false)}
          onSelectListing={(listing) => setActiveDetailListing(listing)}
        />
      )}

      {/* 4. Favorites Modal */}
      {showFavoritesModal && (
        <FavoritesModal
          favoriteIds={favorites}
          listings={listings}
          onClose={() => setShowFavoritesModal(false)}
          onSelectListing={(listing) => setActiveDetailListing(listing)}
          onRemoveFavorite={handleToggleFavorite}
        />
      )}

      {/* 5. Report Listing Modal */}
      {reportListingTarget && (
        <ReportModal
          listing={reportListingTarget}
          studentName={currentUser.name}
          studentId={currentUser.id}
          onClose={() => setReportListingTarget(null)}
          onSubmitReport={handleSubmitReport}
        />
      )}

      {/* 6. Review Modal */}
      {reviewListingTarget && (
        <ReviewModal
          listing={reviewListingTarget}
          studentName={currentUser.name}
          onClose={() => setReviewListingTarget(null)}
          onSubmitReview={handleSubmitReview}
        />
      )}

      {/* FOOTER */}
      <footer className="bg-black border-t border-blue-900/40 py-12 text-blue-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            
            {/* Column 1: Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                  <Key className="w-4 h-4" />
                </div>
                <span className="text-xl font-black text-white">
                  Uni<span className="text-blue-500">Nest</span>
                </span>
              </div>
              <p className="text-xs text-blue-300/80 leading-relaxed">
                Zambia's verified university boarding house discovery platform. Protecting students through transparent room specs and scam-free landlord contact unlocking.
              </p>
              <div className="flex items-center gap-2 text-xs text-blue-400">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Verified Agent License #ZM-BH-2026</span>
              </div>
            </div>

            {/* Column 2: CBU Zones Covered */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] text-blue-400">
                CBU Boarding Zones
              </h4>
              <ul className="space-y-1.5 text-blue-200/80">
                <li>• Riverside (CBU West & East Gates)</li>
                <li>• Kwacha East & St. Kizito area</li>
                <li>• Eastlea & Riverside Extension</li>
                <li>• Parklands & Nkana East (CBU Medical)</li>
              </ul>
            </div>

            {/* Column 3: Trust & Safety */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] text-blue-400">
                Student Safety Rules
              </h4>
              <ul className="space-y-1.5 text-blue-200/80">
                <li>✓ Inspect the room physically before paying any rent</li>
                <li>✓ Demand a written tenancy agreement and receipt</li>
                <li>✓ Verify solar backup & borehole water on site</li>
                <li>✓ Report fraudulent or occupied rooms for a fee refund</li>
              </ul>
            </div>

            {/* Column 4: Agent Contact */}
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] text-blue-400">
                Agent Support Line
              </h4>
              <p className="text-blue-200/80">
                Have questions or need manual verification of a boarding house?
              </p>
              <div className="flex flex-col gap-2">
                <a
                  href="https://wa.me/260979990000?text=Hello%20UniNest%20Agent,%20I%20need%20assistance"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-blue-950 hover:bg-blue-900 border border-blue-700/60 text-blue-200 rounded-xl transition-colors font-medium"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Agent WhatsApp: +260 97 999 0000</span>
                </a>
                <a
                  href="tel:+260979990000"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-blue-950 hover:bg-blue-900 border border-blue-700/60 text-blue-200 rounded-xl transition-colors font-medium"
                >
                  <Phone className="w-3.5 h-3.5 text-blue-400" />
                  <span>Direct Hotline: +260 97 999 0000</span>
                </a>
              </div>
            </div>

          </div>

          <div className="pt-8 border-t border-blue-950 flex flex-col sm:flex-row items-center justify-between text-xs text-blue-400/70 gap-3">
            <p>© 2026 UniNest Boarding House Services. All rights reserved.</p>
            <p className="flex items-center gap-1">
              <span>Theme: Deep Black & Electric Blue</span>
              <span>• Powered by UniNest Agent Engine</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
