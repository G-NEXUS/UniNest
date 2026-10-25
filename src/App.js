/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { h, Fragment, useState, useEffect } from "./runtime.js";
import { Header } from "./components/Header.js";
import { StudentView } from "./components/StudentView.js";
import { LandlordPortal } from "./components/LandlordPortal.js";
import { AdminPortal } from "./components/AdminPortal.js";
import { ListingDetailModal } from "./components/ListingDetailModal.js";
import { UnlockModal } from "./components/UnlockModal.js";
import { MyUnlockedModal } from "./components/MyUnlockedModal.js";
import { FavoritesModal } from "./components/FavoritesModal.js";
import { ReportModal } from "./components/ReportModal.js";
import { ReviewModal } from "./components/ReviewModal.js";
import { StorageService } from "./services/storage.js";
import { ShieldCheck, Key, Phone, MessageSquare } from "./icons.js";
function App() {
  const [allUsers, setAllUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [privateDetailsMap, setPrivateDetailsMap] = useState({});
  const [unlocks, setUnlocks] = useState([]);
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [reports, setReports] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [agentFee, setAgentFee] = useState(25);
  const [activeDetailListing, setActiveDetailListing] = useState(null);
  const [activeUnlockListing, setActiveUnlockListing] = useState(null);
  const [showUnlockedModal, setShowUnlockedModal] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [reportListingTarget, setReportListingTarget] = useState(null);
  const [reviewListingTarget, setReviewListingTarget] = useState(null);
  const loadData = () => {
    const users = StorageService.getUsers();
    setAllUsers(users);
    if (!currentUser) {
      setCurrentUser(users[0]);
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
  useEffect(() => {
    if (currentUser) {
      setFavorites(StorageService.getFavorites(currentUser.id));
    }
  }, [currentUser]);
  const handleToggleFavorite = (listingId) => {
    if (!currentUser)
      return;
    const isNowFav = StorageService.toggleFavorite(currentUser.id, listingId);
    setFavorites(StorageService.getFavorites(currentUser.id));
  };
  const handleUnlockSuccess = (revealedDetails, record) => {
    setUnlocks((prev) => [...prev, record]);
    setListings(StorageService.getListings());
  };
  const handleAddListing = (newListing, newPrivateDetails) => {
    StorageService.saveListing(newListing, newPrivateDetails);
    loadData();
  };
  const handleUpdateStatus = (listingId, status) => {
    const target = listings.find((l) => l.id === listingId);
    if (target) {
      target.status = status;
      StorageService.saveListing(target);
      loadData();
    }
  };
  const handleDeleteListing = (listingId) => {
    StorageService.deleteListing(listingId);
    loadData();
  };
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
  const handleUpdateAgentFee = (newFee) => {
    StorageService.setAgentFee(newFee);
    setAgentFee(newFee);
  };
  const handleApproveListing = (id) => {
    const item = listings.find((l) => l.id === id);
    if (item) {
      item.status = "approved";
      StorageService.saveListing(item);
      loadData();
    }
  };
  const handleRejectListing = (id) => {
    const item = listings.find((l) => l.id === id);
    if (item) {
      item.status = "rejected";
      StorageService.saveListing(item);
      loadData();
    }
  };
  const handleApprovePayment = (requestId) => {
    StorageService.approvePaymentRequest(requestId);
    loadData();
  };
  const handleRejectPayment = (requestId) => {
    StorageService.rejectPaymentRequest(requestId);
    loadData();
  };
  const handleResolveReport = (reportId, status) => {
    StorageService.updateReportStatus(reportId, status);
    loadData();
  };
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
  const handleSubmitReport = (rep) => {
    StorageService.submitReport(rep);
    setReports(StorageService.getReports());
  };
  const handleSubmitReview = (rev) => {
    StorageService.addReview(rev);
    loadData();
  };
  const handleResetData = () => {
    if (confirm("Reset UniNest to sample demonstration data?")) {
      StorageService.resetToDefaults();
      loadData();
    }
  };
  if (!currentUser) {
    return /* @__PURE__ */ h("div", { className: "min-h-screen bg-black text-white flex items-center justify-center" }, /* @__PURE__ */ h("div", { className: "w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" }));
  }
  const studentUnlockedIds = unlocks.filter((u) => u.studentId === currentUser.id).map((u) => u.listingId);
  const activeListingPrivateDetails = activeDetailListing ? StorageService.getPrivateDetailsForUser(activeDetailListing.id, currentUser.id, currentUser.role) : null;
  const activeListingReviews = activeDetailListing ? reviews.filter((r) => r.listingId === activeDetailListing.id) : [];
  return /* @__PURE__ */ h("div", { className: "min-h-screen bg-black text-blue-50 flex flex-col font-sans selection:bg-blue-600 selection:text-white" }, /* @__PURE__ */ h(Header, { currentUser, allUsers, onSelectUser: (u) => setCurrentUser(u), agentFee, onResetData: handleResetData }), /* @__PURE__ */ h("main", { className: "flex-1" }, currentUser.role === "student" && /* @__PURE__ */ h(StudentView, { listings, unlockedListingIds: studentUnlockedIds, favoriteListingIds: favorites, agentFee, onToggleFavorite: handleToggleFavorite, onViewDetails: (listing) => setActiveDetailListing(listing), onUnlockClick: (listing) => setActiveUnlockListing(listing) }), currentUser.role === "landlord" && /* @__PURE__ */ h(LandlordPortal, { currentUser, listings, tenants: tenants.filter((t) => t.landlordId === currentUser.id), onAddListing: handleAddListing, onUpdateStatus: handleUpdateStatus, onDeleteListing: handleDeleteListing, onAddTenant: handleAddTenant, onUpdateTenant: handleUpdateTenant, onRemoveTenant: handleRemoveTenant, onRecordPayment: handleRecordPayment }), currentUser.role === "admin" && /* @__PURE__ */ h(AdminPortal, { listings, privateDetailsMap, paymentRequests, reports, users: allUsers, unlocks, agentFee, onUpdateAgentFee: handleUpdateAgentFee, onApproveListing: handleApproveListing, onRejectListing: handleRejectListing, onApprovePayment: handleApprovePayment, onRejectPayment: handleRejectPayment, onResolveReport: handleResolveReport, onToggleUserBan: () => {
  }, onToggleLandlordVerify: handleToggleLandlordVerify })), activeDetailListing && /* @__PURE__ */ h(ListingDetailModal, { listing: activeDetailListing, isUnlocked: currentUser.role === "admin" || activeDetailListing.landlordId === currentUser.id || studentUnlockedIds.includes(activeDetailListing.id), unlockedDetails: activeListingPrivateDetails, reviews: activeListingReviews, isFavorite: favorites.includes(activeDetailListing.id), agentFee, onClose: () => setActiveDetailListing(null), onUnlockClick: (listing) => {
    setActiveUnlockListing(listing);
  }, onToggleFavorite: handleToggleFavorite, onOpenReport: (listing) => setReportListingTarget(listing), onOpenReview: (listing) => setReviewListingTarget(listing) }), activeUnlockListing && /* @__PURE__ */ h(UnlockModal, { listing: activeUnlockListing, studentId: currentUser.id, studentPhone: currentUser.phone, agentFee, onClose: () => setActiveUnlockListing(null), onSuccess: handleUnlockSuccess }), showUnlockedModal && /* @__PURE__ */ h(MyUnlockedModal, { unlocks: unlocks.filter((u) => u.studentId === currentUser.id), allListings: listings, privateDetailsMap, onClose: () => setShowUnlockedModal(false), onSelectListing: (listing) => setActiveDetailListing(listing) }), showFavoritesModal && /* @__PURE__ */ h(FavoritesModal, { favoriteIds: favorites, listings, onClose: () => setShowFavoritesModal(false), onSelectListing: (listing) => setActiveDetailListing(listing), onRemoveFavorite: handleToggleFavorite }), reportListingTarget && /* @__PURE__ */ h(ReportModal, { listing: reportListingTarget, studentName: currentUser.name, studentId: currentUser.id, onClose: () => setReportListingTarget(null), onSubmitReport: handleSubmitReport }), reviewListingTarget && /* @__PURE__ */ h(ReviewModal, { listing: reviewListingTarget, studentName: currentUser.name, onClose: () => setReviewListingTarget(null), onSubmitReview: handleSubmitReview }), /* @__PURE__ */ h("footer", { className: "bg-black border-t border-blue-900/40 py-12 text-blue-300" }, /* @__PURE__ */ h("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" }, /* @__PURE__ */ h("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-8 mb-8" }, /* @__PURE__ */ h("div", { className: "space-y-3" }, /* @__PURE__ */ h("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ h("div", { className: "w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold" }, /* @__PURE__ */ h(Key, { className: "w-4 h-4" })), /* @__PURE__ */ h("span", { className: "text-xl font-black text-white" }, "Uni", /* @__PURE__ */ h("span", { className: "text-blue-500" }, "Nest"))), /* @__PURE__ */ h("p", { className: "text-xs text-blue-300/80 leading-relaxed" }, "Zambia's verified university boarding house discovery platform. Protecting students through transparent room specs and scam-free landlord contact unlocking."), /* @__PURE__ */ h("div", { className: "flex items-center gap-2 text-xs text-blue-400" }, /* @__PURE__ */ h(ShieldCheck, { className: "w-4 h-4 text-blue-400" }), /* @__PURE__ */ h("span", null, "Verified Agent License #ZM-BH-2026"))), /* @__PURE__ */ h("div", { className: "space-y-2 text-xs" }, /* @__PURE__ */ h("h4", { className: "font-bold text-white uppercase tracking-wider text-[11px] text-blue-400" }, "CBU Boarding Zones"), /* @__PURE__ */ h("ul", { className: "space-y-1.5 text-blue-200/80" }, /* @__PURE__ */ h("li", null, "\u2022 Riverside (CBU West & East Gates)"), /* @__PURE__ */ h("li", null, "\u2022 Kwacha East & St. Kizito area"), /* @__PURE__ */ h("li", null, "\u2022 Eastlea & Riverside Extension"), /* @__PURE__ */ h("li", null, "\u2022 Parklands & Nkana East (CBU Medical)"))), /* @__PURE__ */ h("div", { className: "space-y-2 text-xs" }, /* @__PURE__ */ h("h4", { className: "font-bold text-white uppercase tracking-wider text-[11px] text-blue-400" }, "Student Safety Rules"), /* @__PURE__ */ h("ul", { className: "space-y-1.5 text-blue-200/80" }, /* @__PURE__ */ h("li", null, "\u2713 Inspect the room physically before paying any rent"), /* @__PURE__ */ h("li", null, "\u2713 Demand a written tenancy agreement and receipt"), /* @__PURE__ */ h("li", null, "\u2713 Verify solar backup & borehole water on site"), /* @__PURE__ */ h("li", null, "\u2713 Report fraudulent or occupied rooms for a fee refund"))), /* @__PURE__ */ h("div", { className: "space-y-3 text-xs" }, /* @__PURE__ */ h("h4", { className: "font-bold text-white uppercase tracking-wider text-[11px] text-blue-400" }, "Agent Support Line"), /* @__PURE__ */ h("p", { className: "text-blue-200/80" }, "Have questions or need manual verification of a boarding house?"), /* @__PURE__ */ h("div", { className: "flex flex-col gap-2" }, /* @__PURE__ */ h("a", { href: "https://wa.me/260979990000?text=Hello%20UniNest%20Agent,%20I%20need%20assistance", target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-2 px-3 py-2 bg-blue-950 hover:bg-blue-900 border border-blue-700/60 text-blue-200 rounded-xl transition-colors font-medium" }, /* @__PURE__ */ h(MessageSquare, { className: "w-3.5 h-3.5 text-emerald-400" }), /* @__PURE__ */ h("span", null, "Agent WhatsApp: +260 97 999 0000")), /* @__PURE__ */ h("a", { href: "tel:+260979990000", className: "inline-flex items-center gap-2 px-3 py-2 bg-blue-950 hover:bg-blue-900 border border-blue-700/60 text-blue-200 rounded-xl transition-colors font-medium" }, /* @__PURE__ */ h(Phone, { className: "w-3.5 h-3.5 text-blue-400" }), /* @__PURE__ */ h("span", null, "Direct Hotline: +260 97 999 0000"))))), /* @__PURE__ */ h("div", { className: "pt-8 border-t border-blue-950 flex flex-col sm:flex-row items-center justify-between text-xs text-blue-400/70 gap-3" }, /* @__PURE__ */ h("p", null, "\xA9 2026 UniNest Boarding House Services. All rights reserved."), /* @__PURE__ */ h("p", { className: "flex items-center gap-1" }, /* @__PURE__ */ h("span", null, "Theme: Deep Black & Electric Blue"), /* @__PURE__ */ h("span", null, "\u2022 Powered by UniNest Agent Engine"))))));
}
export {
  App as default
};
