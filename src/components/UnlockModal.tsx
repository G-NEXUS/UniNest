import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  LockOpen, 
  Smartphone, 
  CreditCard, 
  CheckCircle2, 
  ArrowRight, 
  Phone, 
  MessageSquare, 
  MapPin, 
  Clock, 
  Copy, 
  Check, 
  AlertCircle,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Listing, PrivateDetails, UnlockRecord } from '../types';
import { StorageService } from '../services/storage';

interface UnlockModalProps {
  listing: Listing;
  studentId: string;
  studentPhone?: string;
  agentFee: number;
  onClose: () => void;
  onSuccess: (unlockedDetails: PrivateDetails, record: UnlockRecord) => void;
}

export const UnlockModal: React.FC<UnlockModalProps> = ({
  listing,
  studentId,
  studentPhone = '+260 97 123 4567',
  agentFee,
  onClose,
  onSuccess,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'mtn_momo' | 'airtel_money' | 'card' | 'manual'>('mtn_momo');
  const [phoneInput, setPhoneInput] = useState(studentPhone);
  const [referenceInput, setReferenceInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [unlockedResult, setUnlockedResult] = useState<{
    details: PrivateDetails;
    record: UnlockRecord;
  } | null>(null);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const handleInstantUnlock = () => {
    setIsProcessing(true);
    setErrorMessage('');

    setTimeout(() => {
      try {
        const refNumber = `${paymentMethod.toUpperCase()}-TX-${Math.floor(100000 + Math.random() * 900000)}`;
        const record = StorageService.recordUnlock(
          studentId,
          listing.id,
          agentFee,
          paymentMethod,
          refNumber
        );

        // Fetch the freshly revealed private details from secure storage
        const details = StorageService.getPrivateDetailsForUser(listing.id, studentId, 'student');
        if (details) {
          setUnlockedResult({ details, record });
          onSuccess(details, record);
        } else {
          setErrorMessage('Could not retrieve contact details. Please try again.');
        }
      } catch (err) {
        setErrorMessage('Payment simulation failed. Please retry.');
      } finally {
        setIsProcessing(false);
      }
    }, 1200);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!referenceInput.trim()) {
      setErrorMessage('Please enter your mobile money transaction ID or reference code.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      StorageService.submitPaymentRequest({
        studentId,
        studentName: 'Chileshe Mwape',
        studentPhone: phoneInput,
        listingId: listing.id,
        listingTitle: listing.title,
        amount: agentFee,
        method: paymentMethod,
        reference: referenceInput.trim(),
        screenshotUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80',
      });

      setIsProcessing(false);
      alert(`Manual payment of K${agentFee} submitted for Agent Verification! Our agent will review the reference #${referenceInput} and approve within 15 minutes.`);
      onClose();
    }, 800);
  };

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-xl bg-black border border-blue-500/40 rounded-2xl shadow-2xl shadow-blue-900/50 p-6 my-8 text-blue-50 glow-blue animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-blue-400 hover:text-white rounded-lg hover:bg-blue-950/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!unlockedResult ? (
          <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-950 border border-blue-500/50 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-900/40">
                <Lock className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  Unlock Landlord Contact
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                    Agent Verified
                  </span>
                </h3>
                <p className="text-xs text-blue-300">
                  Reveals exact plot number, landlord direct phone, and WhatsApp
                </p>
              </div>
            </div>

            {/* Listing Summary Preview */}
            <div className="bg-zinc-950/90 border border-blue-900/50 rounded-xl p-3.5 mb-5 flex items-center gap-3">
              <img
                src={listing.photos[0]}
                alt={listing.title}
                className="w-16 h-16 rounded-lg object-cover border border-blue-900/40 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">{listing.title}</p>
                <p className="text-xs text-blue-300/80">{listing.generalArea}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-bold text-blue-400">
                    K{listing.price.toLocaleString()} / mo
                  </span>
                  <span className="text-xs text-blue-300/70">{listing.campus}</span>
                </div>
              </div>
            </div>

            {/* What is revealed list */}
            <div className="bg-blue-950/30 border border-blue-800/40 rounded-xl p-4 mb-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300 mb-2.5 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                What You Get Instantly Upon Unlocking:
              </h4>
              <ul className="text-xs text-blue-200/90 space-y-1.5">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <strong>Direct Landlord Mobile Number</strong> (Direct Voice Call & SMS)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <strong>1-Tap WhatsApp Link</strong> with pre-filled room reference inquiry
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <strong>Exact Plot Number & Street Address</strong> with directions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <strong>Official Agent Viewing Instructions</strong> & Caretaker Contact
                </li>
              </ul>
            </div>

            {/* Payment Method Selector */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-blue-300 mb-2">
                Select Mobile Money or Payment Provider:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('mtn_momo')}
                  className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center justify-center gap-1 transition-all ${
                    paymentMethod === 'mtn_momo'
                      ? 'bg-blue-600/30 border-blue-400 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400'
                      : 'bg-zinc-950 border-blue-900/60 text-blue-300 hover:border-blue-700'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-yellow-400" />
                  <span>MTN MoMo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('airtel_money')}
                  className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center justify-center gap-1 transition-all ${
                    paymentMethod === 'airtel_money'
                      ? 'bg-blue-600/30 border-blue-400 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400'
                      : 'bg-zinc-950 border-blue-900/60 text-blue-300 hover:border-blue-700'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-red-400" />
                  <span>Airtel Money</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center justify-center gap-1 transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-blue-600/30 border-blue-400 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400'
                      : 'bg-zinc-950 border-blue-900/60 text-blue-300 hover:border-blue-700'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-blue-400" />
                  <span>Debit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('manual')}
                  className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center justify-center gap-1 transition-all ${
                    paymentMethod === 'manual'
                      ? 'bg-blue-600/30 border-blue-400 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400'
                      : 'bg-zinc-950 border-blue-900/60 text-blue-300 hover:border-blue-700'
                  }`}
                >
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>Manual Slip</span>
                </button>
              </div>
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-950/60 border border-red-800 text-red-200 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form logic based on selection */}
            {paymentMethod !== 'manual' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-blue-300 mb-1">
                    Mobile Money / Registered Phone:
                  </label>
                  <input
                    type="text"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="+260 9X XXX XXXX"
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-blue-800/60 rounded-xl text-white text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                  />
                  <p className="text-[11px] text-blue-400/80 mt-1">
                    A USSD prompt will be sent to authorize payment of K{agentFee}.
                  </p>
                </div>

                {/* Instant Unlock Button (Student Demo Friendly) */}
                <div className="pt-2">
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleInstantUnlock}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 hover:from-blue-600 hover:to-cyan-400 text-white font-bold rounded-xl shadow-lg shadow-blue-600/40 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Verifying Mobile Money Pin...</span>
                      </>
                    ) : (
                      <>
                        <LockOpen className="w-5 h-5" />
                        <span>Pay K{agentFee} & Unlock Contact Instantly</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <p className="text-center text-[11px] text-blue-300/70 mt-2">
                    🔒 100% Encrypted & Protected by UniNest Agent Guarantee
                  </p>
                </div>
              </div>
            ) : (
              /* Manual Payment submission */
              <form onSubmit={handleManualSubmit} className="space-y-3">
                <div className="p-3 bg-blue-950/40 rounded-xl border border-blue-800/40 text-xs text-blue-200">
                  <p className="font-semibold text-white mb-1">Manual Agent Transfer Details:</p>
                  <p>Send K{agentFee} to UniNest Agent MTN: <strong>096 999 0000</strong></p>
                  <p>Or Airtel Money: <strong>097 999 0000</strong> (Name: UniNest Agent Services)</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-blue-300 mb-1">
                    Transaction ID / Reference Number:
                  </label>
                  <input
                    type="text"
                    value={referenceInput}
                    onChange={(e) => setReferenceInput(e.target.value)}
                    placeholder="e.g. MTN-992104 or Airtel Ref"
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-blue-800/60 rounded-xl text-white text-sm focus:outline-none focus:border-blue-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-60"
                >
                  {isProcessing ? 'Submitting to Agent...' : `Submit Reference for Approval (K${agentFee})`}
                </button>
              </form>
            )}
          </div>
        ) : (
          /* SUCCESS: Contact and Location Revealed! */
          <div className="text-center animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-blue-600/30 border-2 border-blue-400 text-blue-300 mx-auto flex items-center justify-center mb-4 glow-blue">
              <CheckCircle2 className="w-10 h-10 text-blue-400" />
            </div>

            <h3 className="text-2xl font-black text-white mb-1">
              Contact Unlocked!
            </h3>
            <p className="text-xs text-blue-300 mb-5">
              Receipt: <span className="font-mono text-white">{unlockedResult.record.receiptNumber}</span> • Paid K{unlockedResult.record.amountPaid}
            </p>

            {/* Revealed Landlord Details Box */}
            <div className="bg-zinc-950 border border-blue-500/50 rounded-2xl p-5 text-left mb-5 space-y-4 shadow-xl">
              
              {/* Landlord Name & Contact */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-blue-900/60 gap-3">
                <div>
                  <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">
                    Verified Landlord
                  </span>
                  <p className="text-lg font-bold text-white">
                    {unlockedResult.details.landlordFullName}
                  </p>
                </div>
                
                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/${unlockedResult.details.landlordWhatsApp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Hello ${unlockedResult.details.landlordFullName}, I unlocked your boarding room on UniNest (Ref: ${listing.title}). When can I come to view?`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href={`tel:${unlockedResult.details.landlordPhone}`}
                    className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                </div>
              </div>

              {/* Landlord Phone with copy */}
              <div className="flex items-center justify-between bg-black/60 p-3 rounded-xl border border-blue-900/40">
                <div>
                  <span className="text-[11px] text-blue-400 block font-medium">Phone Number</span>
                  <span className="font-mono text-base font-bold text-white tracking-wide">
                    {unlockedResult.details.landlordPhone}
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(unlockedResult.details.landlordPhone, 'phone')}
                  className="p-2 text-blue-400 hover:text-white bg-blue-950/60 rounded-lg border border-blue-800/40 transition-colors"
                  title="Copy Phone"
                >
                  {copiedPhone ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Exact Plot Address */}
              <div className="space-y-1.5 bg-black/60 p-3 rounded-xl border border-blue-900/40">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-blue-400 font-medium flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    Exact Physical Address:
                  </span>
                  <button
                    onClick={() => copyToClipboard(unlockedResult.details.exactAddress, 'address')}
                    className="p-1.5 text-blue-400 hover:text-white bg-blue-950/60 rounded-md border border-blue-800/40 transition-colors text-xs flex items-center gap-1"
                  >
                    {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy</span>
                  </button>
                </div>
                <p className="text-sm font-semibold text-white">
                  {unlockedResult.details.exactAddress}
                </p>
                <p className="text-xs text-blue-300/80">
                  <strong>Directions:</strong> {unlockedResult.details.landmarkDirections}
                </p>
              </div>

              {/* Viewing Instructions */}
              <div className="text-xs text-blue-300 space-y-1 bg-blue-950/20 p-3 rounded-xl border border-blue-800/30">
                <p className="flex items-center gap-1 text-blue-200 font-semibold">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  Viewing Hours: {unlockedResult.details.viewingHours}
                </p>
                {unlockedResult.details.caretakerContact && (
                  <p><strong>Caretaker on site:</strong> {unlockedResult.details.caretakerContact}</p>
                )}
                {unlockedResult.details.specialInstructions && (
                  <p className="text-blue-200/90 italic">
                    💡 {unlockedResult.details.specialInstructions}
                  </p>
                )}
              </div>

            </div>

            {/* Done Button */}
            <button
              onClick={onClose}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              Close & View Full Room Details
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
