import React, { useState } from 'react';
import { X, Flag, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const ReportModal = ({
  listing,
  studentName,
  studentId,
  onClose,
  onSubmitReport,
}) => {
  const [reason, setReason] = useState('already_taken');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitReport({
      listingId: listing.id,
      listingTitle: listing.title,
      reporterId: studentId,
      reporterName: studentName,
      reason,
      comment: comment.trim(),
    });
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div 
        className="relative w-full max-w-md bg-black border border-blue-500/40 rounded-2xl p-6 text-blue-50 shadow-2xl glow-blue"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-blue-400 hover:text-white rounded-lg hover:bg-blue-950/50 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-500/50 flex items-center justify-center text-rose-400">
                <Flag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Report Listing</h3>
                <p className="text-xs text-blue-300">
                  Help the UniNest agent keep listings clean and verified
                </p>
              </div>
            </div>

            <div className="bg-zinc-950 p-3 rounded-xl border border-blue-900/40 mb-4 text-xs">
              <p className="font-semibold text-white">{listing.title}</p>
              <p className="text-blue-400">{listing.generalArea}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-blue-200 mb-1">
                  Reason for Reporting:
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-blue-800 rounded-xl text-white text-xs focus:border-blue-400"
                >
                  <option value="already_taken">Room is already taken / fully booked</option>
                  <option value="fake_listing">Fake / Scam / Suspicious listing</option>
                  <option value="wrong_phone">Landlord phone is wrong or unreachable</option>
                  <option value="price_mismatch">Landlord demanded higher rent than listed</option>
                  <option value="safety_hazard">Property has security or health hazard</option>
                  <option value="other">Other issue</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-blue-200 mb-1">
                  Additional Details:
                </label>
                <textarea
                  required
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Provide context (e.g. called landlord today and he confirmed rooms are full)..."
                  className="w-full px-3 py-2 bg-zinc-950 border border-blue-800 rounded-xl text-white text-xs focus:border-blue-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Submit Report to Agent
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-blue-400 mx-auto" />
            <h4 className="text-lg font-bold text-white">Report Received</h4>
            <p className="text-xs text-blue-200">
              The UniNest agent will review this report and take appropriate action. Thank you for protecting fellow students!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
