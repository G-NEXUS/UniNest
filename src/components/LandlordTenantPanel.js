import { h, Fragment, useState, useMemo } from "../runtime.js";
import { Users, Plus, Search, Home, Phone, MessageSquare, Clock, AlertTriangle, CheckCircle2, DollarSign, Trash2, X, CreditCard } from "../icons.js";
const LandlordTenantPanel = ({ currentUser, landlordListings, tenants, onAddTenant, onUpdateTenant, onRemoveTenant, onRecordPayment }) => {
  const [selectedListingFilter, setSelectedListingFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [paymentModalTenant, setPaymentModalTenant] = useState(null);
  const [paymentMonths, setPaymentMonths] = useState(1);
  const [editingTenant, setEditingTenant] = useState(null);
  const [formListingId, setFormListingId] = useState(landlordListings[0]?.id || "");
  const [formRoomNumber, setFormRoomNumber] = useState("");
  const [formStudentName, setFormStudentName] = useState("");
  const [formStudentPhone, setFormStudentPhone] = useState("+260 97 ");
  const [formStudentEmail, setFormStudentEmail] = useState("");
  const [formStudentProgram, setFormStudentProgram] = useState("");
  const [formNrc, setFormNrc] = useState("");
  const [formMonthlyRent, setFormMonthlyRent] = useState(landlordListings[0]?.price || 1200);
  const [formMonthsPaid, setFormMonthsPaid] = useState(3);
  const [formLeaseStartDate, setFormLeaseStartDate] = useState((/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
  const [formNotes, setFormNotes] = useState("Room key and gate tag handed over.");
  const handleListingSelectChange = (id) => {
    setFormListingId(id);
    const chosen = landlordListings.find((l) => l.id === id);
    if (chosen) {
      setFormMonthlyRent(chosen.price);
    }
  };
  const calculateRemainingTime = (paidUntilDateStr) => {
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const paidUntil = new Date(paidUntilDateStr);
    paidUntil.setHours(0, 0, 0, 0);
    const diffMs = paidUntil.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / (1e3 * 60 * 60 * 24));
    if (diffDays <= 0) {
      const overdueDays = Math.abs(diffDays);
      return {
        months: 0,
        days: overdueDays,
        isOverdue: true,
        text: overdueDays === 0 ? "Due Today" : `${overdueDays} days overdue`,
        badgeColor: "bg-rose-950/80 text-rose-300 border-rose-800"
      };
    }
    const approxMonths = (diffDays / 30.4).toFixed(1);
    const isDueSoon = diffDays <= 25;
    return {
      months: parseFloat(approxMonths),
      days: diffDays,
      isOverdue: false,
      text: `${approxMonths} months left (${diffDays} days)`,
      badgeColor: isDueSoon ? "bg-amber-950/80 text-amber-300 border-amber-800" : "bg-emerald-950/80 text-emerald-300 border-emerald-800"
    };
  };
  const filteredTenants = useMemo(() => {
    return tenants.filter((tenant) => {
      if (selectedListingFilter !== "all" && tenant.listingId !== selectedListingFilter) {
        return false;
      }
      if (statusFilter !== "all") {
        const time = calculateRemainingTime(tenant.paidUntilDate);
        if (statusFilter === "overdue" && !time.isOverdue)
          return false;
        if (statusFilter === "due_soon" && (time.isOverdue || time.months > 1))
          return false;
        if (statusFilter === "paid" && (time.isOverdue || time.months <= 1))
          return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = tenant.studentName.toLowerCase().includes(q);
        const matchesRoom = tenant.roomNumber.toLowerCase().includes(q);
        const matchesPhone = tenant.studentPhone.toLowerCase().includes(q);
        const matchesProgram = (tenant.studentProgram || "").toLowerCase().includes(q);
        if (!matchesName && !matchesRoom && !matchesPhone && !matchesProgram) {
          return false;
        }
      }
      return true;
    });
  }, [tenants, selectedListingFilter, statusFilter, searchQuery]);
  const totalMonthlyRoll = tenants.reduce((acc, t) => acc + t.monthlyRent, 0);
  const overdueTenantsCount = tenants.filter((t) => calculateRemainingTime(t.paidUntilDate).isOverdue).length;
  const dueSoonCount = tenants.filter((t) => {
    const time = calculateRemainingTime(t.paidUntilDate);
    return !time.isOverdue && time.months <= 1;
  }).length;
  const paidUpCount = tenants.length - overdueTenantsCount - dueSoonCount;
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formStudentName.trim() || !formRoomNumber.trim()) {
      alert("Please fill in student name and room number.");
      return;
    }
    const start = new Date(formLeaseStartDate);
    const until = new Date(start);
    until.setMonth(until.getMonth() + Number(formMonthsPaid));
    onAddTenant({
      landlordId: currentUser.id,
      listingId: formListingId || landlordListings[0]?.id || "listing-1",
      roomNumber: formRoomNumber.trim(),
      studentName: formStudentName.trim(),
      studentPhone: formStudentPhone.trim(),
      studentEmail: formStudentEmail.trim() || void 0,
      studentProgram: formStudentProgram.trim() || void 0,
      nrcOrStudentId: formNrc.trim() || void 0,
      monthlyRent: Number(formMonthlyRent),
      monthsPaid: Number(formMonthsPaid),
      leaseStartDate: formLeaseStartDate,
      paidUntilDate: until.toISOString().split("T")[0],
      paymentStatus: "paid",
      lastPaymentDate: formLeaseStartDate,
      notes: formNotes.trim()
    });
    setShowAddModal(false);
    setFormRoomNumber("");
    setFormStudentName("");
    setFormStudentProgram("");
  };
  const handleConfirmPayment = () => {
    if (!paymentModalTenant)
      return;
    onRecordPayment(paymentModalTenant.id, paymentMonths);
    setPaymentModalTenant(null);
  };
  return /* @__PURE__ */ h("div", { className: "space-y-6" }, /* @__PURE__ */ h("div", { className: "bg-zinc-950 border border-blue-900/60 rounded-3xl p-5 sm:p-7 shadow-xl" }, /* @__PURE__ */ h("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-blue-900/40" }, /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ h("h2", { className: "text-xl sm:text-2xl font-black text-white" }, "Boarding House Occupancy & Tenants"), /* @__PURE__ */ h("span", { className: "px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white" }, "Live Roster")), /* @__PURE__ */ h("p", { className: "text-xs sm:text-sm text-blue-300/80 mt-1" }, "Track who is currently in which room, payment records, and remaining prepaid lease months.")), /* @__PURE__ */ h("button", { onClick: () => setShowAddModal(true), className: "flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all cursor-pointer shrink-0" }, /* @__PURE__ */ h(Plus, { className: "w-4 h-4" }), /* @__PURE__ */ h("span", null, "Add Tenant to Room"))), /* @__PURE__ */ h("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-6" }, /* @__PURE__ */ h("div", { className: "bg-black/80 rounded-2xl p-4 border border-blue-900/40" }, /* @__PURE__ */ h("div", { className: "flex items-center justify-between text-blue-400 text-xs font-semibold mb-1" }, /* @__PURE__ */ h("span", null, "Total Current Tenants"), /* @__PURE__ */ h(Users, { className: "w-4 h-4" })), /* @__PURE__ */ h("p", { className: "text-2xl sm:text-3xl font-black text-white" }, tenants.length), /* @__PURE__ */ h("p", { className: "text-[11px] text-blue-300/70 mt-1" }, "Active boarding students")), /* @__PURE__ */ h("div", { className: "bg-black/80 rounded-2xl p-4 border border-blue-900/40" }, /* @__PURE__ */ h("div", { className: "flex items-center justify-between text-blue-400 text-xs font-semibold mb-1" }, /* @__PURE__ */ h("span", null, "Monthly Rent Roll"), /* @__PURE__ */ h(DollarSign, { className: "w-4 h-4 text-emerald-400" })), /* @__PURE__ */ h("p", { className: "text-2xl sm:text-3xl font-black text-white" }, "K", totalMonthlyRoll.toLocaleString()), /* @__PURE__ */ h("p", { className: "text-[11px] text-blue-300/70 mt-1" }, "From occupied rooms")), /* @__PURE__ */ h("div", { className: "bg-black/80 rounded-2xl p-4 border border-blue-900/40" }, /* @__PURE__ */ h("div", { className: "flex items-center justify-between text-emerald-400 text-xs font-semibold mb-1" }, /* @__PURE__ */ h("span", null, "Paid & Good Standing"), /* @__PURE__ */ h(CheckCircle2, { className: "w-4 h-4" })), /* @__PURE__ */ h("p", { className: "text-2xl sm:text-3xl font-black text-emerald-300" }, paidUpCount), /* @__PURE__ */ h("p", { className: "text-[11px] text-blue-300/70 mt-1" }, "> 1 month remaining")), /* @__PURE__ */ h("div", { className: "bg-black/80 rounded-2xl p-4 border border-blue-900/40" }, /* @__PURE__ */ h("div", { className: "flex items-center justify-between text-rose-400 text-xs font-semibold mb-1" }, /* @__PURE__ */ h("span", null, "Action Needed"), /* @__PURE__ */ h(AlertTriangle, { className: "w-4 h-4" })), /* @__PURE__ */ h("p", { className: "text-2xl sm:text-3xl font-black text-rose-300" }, overdueTenantsCount + dueSoonCount), /* @__PURE__ */ h("p", { className: "text-[11px] text-blue-300/70 mt-1" }, overdueTenantsCount, " overdue \u2022 ", dueSoonCount, " due soon")))), /* @__PURE__ */ h("div", { className: "bg-zinc-950 border border-blue-900/50 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3" }, /* @__PURE__ */ h("div", { className: "relative flex-1" }, /* @__PURE__ */ h(Search, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" }), /* @__PURE__ */ h("input", { type: "text", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: "Search tenant name, room number, or program...", className: "w-full pl-10 pr-4 py-2 bg-black border border-blue-800/60 rounded-xl text-white text-xs sm:text-sm placeholder:text-blue-400/50 focus:outline-none focus:border-blue-400" })), /* @__PURE__ */ h("div", { className: "flex items-center gap-2 overflow-x-auto pb-1 md:pb-0" }, /* @__PURE__ */ h("select", { value: selectedListingFilter, onChange: (e) => setSelectedListingFilter(e.target.value), className: "px-3 py-2 bg-black border border-blue-800/60 rounded-xl text-white text-xs font-medium focus:border-blue-400 shrink-0" }, /* @__PURE__ */ h("option", { value: "all" }, "All Boarding Houses"), landlordListings.map((l) => /* @__PURE__ */ h("option", { key: l.id, value: l.id }, l.title.length > 28 ? l.title.substring(0, 28) + "..." : l.title))), /* @__PURE__ */ h("div", { className: "flex items-center bg-black p-1 rounded-xl border border-blue-900/60 shrink-0" }, /* @__PURE__ */ h("button", { onClick: () => setStatusFilter("all"), className: `px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${statusFilter === "all" ? "bg-blue-600 text-white" : "text-blue-300 hover:text-white"}` }, "All"), /* @__PURE__ */ h("button", { onClick: () => setStatusFilter("paid"), className: `px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${statusFilter === "paid" ? "bg-emerald-600 text-white" : "text-blue-300 hover:text-white"}` }, "Paid"), /* @__PURE__ */ h("button", { onClick: () => setStatusFilter("due_soon"), className: `px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${statusFilter === "due_soon" ? "bg-amber-600 text-white" : "text-blue-300 hover:text-white"}` }, "Due Soon"), /* @__PURE__ */ h("button", { onClick: () => setStatusFilter("overdue"), className: `px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${statusFilter === "overdue" ? "bg-rose-600 text-white" : "text-blue-300 hover:text-white"}` }, "Overdue")))), filteredTenants.length === 0 ? /* @__PURE__ */ h("div", { className: "bg-zinc-950 border border-blue-900/40 rounded-3xl p-12 text-center space-y-4" }, /* @__PURE__ */ h(Users, { className: "w-12 h-12 text-blue-500 mx-auto opacity-70" }), /* @__PURE__ */ h("h3", { className: "text-lg font-bold text-white" }, "No Tenants Found in Roster"), /* @__PURE__ */ h("p", { className: "text-xs text-blue-300 max-w-md mx-auto" }, tenants.length === 0 ? "Add your current students to keep track of their room assignments, rent payments, and remaining months." : "Try clearing your search query or status filter to see other occupants."), tenants.length === 0 && /* @__PURE__ */ h("button", { onClick: () => setShowAddModal(true), className: "px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs" }, "Add First Tenant")) : /* @__PURE__ */ h("div", { className: "space-y-4" }, /* @__PURE__ */ h("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" }, filteredTenants.map((tenant) => {
    const listing = landlordListings.find((l) => l.id === tenant.listingId);
    const remaining = calculateRemainingTime(tenant.paidUntilDate);
    return /* @__PURE__ */ h("div", { key: tenant.id, className: "bg-zinc-950 border border-blue-900/50 hover:border-blue-500/60 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col justify-between space-y-4 transition-all" }, /* @__PURE__ */ h("div", { className: "space-y-3" }, /* @__PURE__ */ h("div", { className: "flex items-start justify-between gap-2" }, /* @__PURE__ */ h("div", { className: "min-w-0" }, /* @__PURE__ */ h("span", { className: "inline-flex items-center gap-1 text-[11px] font-bold text-blue-400 uppercase tracking-wider" }, /* @__PURE__ */ h(Home, { className: "w-3.5 h-3.5" }), tenant.roomNumber), /* @__PURE__ */ h("h4", { className: "text-base font-bold text-white truncate" }, tenant.studentName)), /* @__PURE__ */ h("span", { className: `inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border shrink-0 ${remaining.badgeColor}` }, /* @__PURE__ */ h(Clock, { className: "w-3.5 h-3.5" }), remaining.text)), /* @__PURE__ */ h("p", { className: "text-xs text-blue-300/80 line-clamp-1" }, listing ? listing.title : "Boarding House"), /* @__PURE__ */ h("div", { className: "bg-black/60 rounded-xl p-3 border border-blue-900/40 text-xs space-y-1.5" }, tenant.studentProgram && /* @__PURE__ */ h("p", { className: "text-blue-200" }, /* @__PURE__ */ h("strong", null, "Program:"), " ", tenant.studentProgram), /* @__PURE__ */ h("p", { className: "text-blue-200" }, /* @__PURE__ */ h("strong", null, "Monthly Rent:"), " ", /* @__PURE__ */ h("span", { className: "font-bold text-white" }, "K", tenant.monthlyRent.toLocaleString())), /* @__PURE__ */ h("div", { className: "flex items-center justify-between text-blue-300/80 pt-1 border-t border-blue-900/30" }, /* @__PURE__ */ h("span", null, "Lease: ", tenant.leaseStartDate), /* @__PURE__ */ h("span", { className: "font-semibold text-white" }, "Paid Until: ", tenant.paidUntilDate)), tenant.notes && /* @__PURE__ */ h("p", { className: "text-[11px] text-blue-400/80 italic pt-0.5" }, "Note: ", tenant.notes))), /* @__PURE__ */ h("div", { className: "pt-3 border-t border-blue-900/40 flex items-center justify-between gap-2 flex-wrap" }, /* @__PURE__ */ h("div", { className: "flex items-center gap-1.5" }, /* @__PURE__ */ h("a", { href: `https://wa.me/${tenant.studentPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hello ${tenant.studentName}, regarding your room (${tenant.roomNumber}) at ${listing?.title || "the boarding house"}...`)}`, target: "_blank", rel: "noopener noreferrer", className: "p-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 transition-colors", title: "WhatsApp student" }, /* @__PURE__ */ h(MessageSquare, { className: "w-4 h-4" })), /* @__PURE__ */ h("a", { href: `tel:${tenant.studentPhone}`, className: "p-2 rounded-lg bg-blue-950 hover:bg-blue-900 text-blue-300 border border-blue-800 transition-colors", title: "Call student" }, /* @__PURE__ */ h(Phone, { className: "w-4 h-4" }))), /* @__PURE__ */ h("div", { className: "flex items-center gap-1.5" }, /* @__PURE__ */ h("button", { onClick: () => {
      setPaymentModalTenant(tenant);
      setPaymentMonths(1);
    }, className: "px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1 cursor-pointer", title: "Record payment" }, /* @__PURE__ */ h(CreditCard, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ h("span", null, "Record Rent")), /* @__PURE__ */ h("button", { onClick: () => {
      if (confirm(`Are you sure you want to remove/checkout ${tenant.studentName} from ${tenant.roomNumber}?`)) {
        onRemoveTenant(tenant.id);
      }
    }, className: "p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-300 border border-zinc-800 transition-colors", title: "Remove/Checkout tenant" }, /* @__PURE__ */ h(Trash2, { className: "w-4 h-4" })))));
  }))), showAddModal && /* @__PURE__ */ h("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto" }, /* @__PURE__ */ h("div", { className: "relative w-full max-w-xl bg-black border border-blue-500/50 rounded-3xl p-5 sm:p-7 text-blue-50 shadow-2xl glow-blue my-6", onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ h("button", { onClick: () => setShowAddModal(false), className: "absolute top-5 right-5 p-2 text-blue-400 hover:text-white rounded-lg hover:bg-blue-950/50" }, /* @__PURE__ */ h(X, { className: "w-5 h-5" })), /* @__PURE__ */ h("div", { className: "flex items-center gap-3 pb-4 border-b border-blue-900/40" }, /* @__PURE__ */ h("div", { className: "w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center" }, /* @__PURE__ */ h(Users, { className: "w-5 h-5" })), /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("h3", { className: "text-xl font-bold text-white" }, "Add Tenant to Boarding House"), /* @__PURE__ */ h("p", { className: "text-xs text-blue-300" }, "Assign a room and log their rent payment & months prepaid."))), /* @__PURE__ */ h("form", { onSubmit: handleAddSubmit, className: "mt-5 space-y-4 max-h-[70vh] overflow-y-auto pr-1" }, /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("label", { className: "block text-xs font-semibold text-blue-200 mb-1" }, "Select Boarding House Property:"), /* @__PURE__ */ h("select", { value: formListingId, onChange: (e) => handleListingSelectChange(e.target.value), className: "w-full px-3.5 py-2.5 bg-zinc-950 border border-blue-800/60 rounded-xl text-white text-xs sm:text-sm focus:border-blue-400" }, landlordListings.map((l) => /* @__PURE__ */ h("option", { key: l.id, value: l.id }, l.title, " (", l.campus, ") - K", l.price, "/mo")))), /* @__PURE__ */ h("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" }, /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("label", { className: "block text-xs font-semibold text-blue-200 mb-1" }, "Room Number / Bed Code:"), /* @__PURE__ */ h("input", { type: "text", required: true, value: formRoomNumber, onChange: (e) => setFormRoomNumber(e.target.value), placeholder: "e.g. Room 104, Wing B Bed 2", className: "w-full px-3.5 py-2.5 bg-zinc-950 border border-blue-800/60 rounded-xl text-white text-xs sm:text-sm focus:border-blue-400" })), /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("label", { className: "block text-xs font-semibold text-blue-200 mb-1" }, "Monthly Rent (ZMW):"), /* @__PURE__ */ h("input", { type: "number", required: true, value: formMonthlyRent, onChange: (e) => setFormMonthlyRent(Number(e.target.value)), className: "w-full px-3.5 py-2.5 bg-zinc-950 border border-blue-800/60 rounded-xl text-white text-xs sm:text-sm focus:border-blue-400" }))), /* @__PURE__ */ h("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" }, /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("label", { className: "block text-xs font-semibold text-blue-200 mb-1" }, "Student Full Name:"), /* @__PURE__ */ h("input", { type: "text", required: true, value: formStudentName, onChange: (e) => setFormStudentName(e.target.value), placeholder: "e.g. Chileshe Mwape", className: "w-full px-3.5 py-2.5 bg-zinc-950 border border-blue-800/60 rounded-xl text-white text-xs sm:text-sm focus:border-blue-400" })), /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("label", { className: "block text-xs font-semibold text-blue-200 mb-1" }, "Student Mobile / WhatsApp:"), /* @__PURE__ */ h("input", { type: "text", required: true, value: formStudentPhone, onChange: (e) => setFormStudentPhone(e.target.value), placeholder: "+260 97 XXX XXXX", className: "w-full px-3.5 py-2.5 bg-zinc-950 border border-blue-800/60 rounded-xl text-white text-xs sm:text-sm focus:border-blue-400" }))), /* @__PURE__ */ h("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" }, /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("label", { className: "block text-xs font-semibold text-blue-200 mb-1" }, "University / Program (Optional):"), /* @__PURE__ */ h("input", { type: "text", value: formStudentProgram, onChange: (e) => setFormStudentProgram(e.target.value), placeholder: "e.g. 2nd Year Architecture, CBU", className: "w-full px-3.5 py-2.5 bg-zinc-950 border border-blue-800/60 rounded-xl text-white text-xs sm:text-sm focus:border-blue-400" })), /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("label", { className: "block text-xs font-semibold text-blue-200 mb-1" }, "Student ID / NRC (Optional):"), /* @__PURE__ */ h("input", { type: "text", value: formNrc, onChange: (e) => setFormNrc(e.target.value), placeholder: "e.g. 341829/10/1 or CBU-2024", className: "w-full px-3.5 py-2.5 bg-zinc-950 border border-blue-800/60 rounded-xl text-white text-xs sm:text-sm focus:border-blue-400" }))), /* @__PURE__ */ h("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-950/20 p-3.5 rounded-2xl border border-blue-800/40" }, /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("label", { className: "block text-xs font-semibold text-blue-200 mb-1" }, "Lease Start Date:"), /* @__PURE__ */ h("input", { type: "date", required: true, value: formLeaseStartDate, onChange: (e) => setFormLeaseStartDate(e.target.value), className: "w-full px-3.5 py-2 bg-black border border-blue-800 rounded-xl text-white text-xs sm:text-sm focus:border-blue-400" })), /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("label", { className: "block text-xs font-semibold text-blue-200 mb-1" }, "Months Paid in Advance:"), /* @__PURE__ */ h("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ h("input", { type: "number", min: "1", max: "12", required: true, value: formMonthsPaid, onChange: (e) => setFormMonthsPaid(Number(e.target.value)), className: "w-full px-3.5 py-2 bg-black border border-blue-800 rounded-xl text-white text-xs sm:text-sm focus:border-blue-400 font-bold" }), /* @__PURE__ */ h("span", { className: "text-xs text-blue-300 font-semibold whitespace-nowrap" }, "= K", (formMonthlyRent * formMonthsPaid).toLocaleString())))), /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("label", { className: "block text-xs font-semibold text-blue-200 mb-1" }, "Tenancy Notes:"), /* @__PURE__ */ h("input", { type: "text", value: formNotes, onChange: (e) => setFormNotes(e.target.value), placeholder: "e.g. Room key and gate tag handed over, deposit cleared", className: "w-full px-3.5 py-2 bg-zinc-950 border border-blue-800/60 rounded-xl text-white text-xs focus:border-blue-400" })), /* @__PURE__ */ h("div", { className: "pt-2" }, /* @__PURE__ */ h("button", { type: "submit", className: "w-full py-3 px-4 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 hover:from-blue-600 hover:to-cyan-400 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 text-xs sm:text-sm transition-all cursor-pointer" }, "Confirm & Add Tenant to Roster"))))), paymentModalTenant && /* @__PURE__ */ h("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md" }, /* @__PURE__ */ h("div", { className: "relative w-full max-w-md bg-black border border-blue-500/50 rounded-3xl p-6 text-blue-50 shadow-2xl glow-blue", onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ h("button", { onClick: () => setPaymentModalTenant(null), className: "absolute top-4 right-4 text-blue-400 hover:text-white" }, /* @__PURE__ */ h(X, { className: "w-5 h-5" })), /* @__PURE__ */ h("div", { className: "text-center space-y-2 mb-4" }, /* @__PURE__ */ h("div", { className: "w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/50 flex items-center justify-center mx-auto text-blue-400" }, /* @__PURE__ */ h(CreditCard, { className: "w-6 h-6" })), /* @__PURE__ */ h("h3", { className: "text-lg font-bold text-white" }, "Record Rent Payment"), /* @__PURE__ */ h("p", { className: "text-xs text-blue-300" }, paymentModalTenant.studentName, " \u2022 ", paymentModalTenant.roomNumber)), /* @__PURE__ */ h("div", { className: "bg-zinc-950 p-3.5 rounded-xl border border-blue-900/40 text-xs space-y-1.5 mb-4" }, /* @__PURE__ */ h("p", { className: "text-blue-200" }, "Current Expiry: ", /* @__PURE__ */ h("strong", null, paymentModalTenant.paidUntilDate)), /* @__PURE__ */ h("p", { className: "text-blue-200" }, "Monthly Rent: ", /* @__PURE__ */ h("strong", null, "K", paymentModalTenant.monthlyRent.toLocaleString()))), /* @__PURE__ */ h("div", { className: "space-y-4" }, /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("label", { className: "block text-xs font-semibold text-blue-200 mb-2" }, "Select Additional Months Paid:"), /* @__PURE__ */ h("div", { className: "grid grid-cols-4 gap-2" }, [1, 2, 3, 6].map((m) => /* @__PURE__ */ h("button", { key: m, type: "button", onClick: () => setPaymentMonths(m), className: `py-2 rounded-xl border text-xs font-bold transition-colors ${paymentMonths === m ? "bg-blue-600 text-white border-blue-400" : "bg-zinc-950 text-blue-300 border-blue-900 hover:border-blue-700"}` }, "+", m, " ", m === 1 ? "Month" : "Months")))), /* @__PURE__ */ h("div", { className: "p-3 bg-blue-950/40 rounded-xl border border-blue-800 text-xs flex items-center justify-between" }, /* @__PURE__ */ h("span", null, "Total Amount Collected:"), /* @__PURE__ */ h("span", { className: "text-base font-black text-white" }, "K", (paymentModalTenant.monthlyRent * paymentMonths).toLocaleString())), /* @__PURE__ */ h("button", { type: "button", onClick: handleConfirmPayment, className: "w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer" }, "Save Payment & Extend Lease")))));
};
export {
  LandlordTenantPanel
};
