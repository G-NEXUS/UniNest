import React, { useState } from 'react';
import { X, Star, CheckCircle2 } from 'lucide-react';

export const ReviewModal = ({
  listing,
  studentName,
  onClose,
  onSubmitReview,
}) => {
  const [rating, setRating] = useState(5);
  const [studentProgram, setStudentProgram] = useState('3rd Year Student');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    onSubmitReview({
      listingId: listing.id,
      studentName,
      studentProgram,
      rating,
      comment: comment.trim(),
      hasViewed: true,
    });

    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1500);
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
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-400/50 flex items-center justify-center text-blue-400">
                <Star className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Rate & Review Room</h3>
                <p className="text-xs text-blue-300">
                  Share your viewing experience with fellow students
                </p>
              </div>
            </div>

            <div className="bg-zinc-950 p-3 rounded-xl border border-blue-900/40 mb-4 text-xs">
              <p className="font-semibold text-white">{listing.title}</p>
              <p className="text-blue-400">{listing.generalArea}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-blue-200 mb-2">
                  Overall Rating:
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 text-2xl transition-transform hover:scale-110 cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= rating
                            ? 'text-amber-400 fill-current'
                            : 'text-zinc-700'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-sm font-bold text-amber-400 ml-2">
                    {rating} / 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-blue-200 mb-1">
                  Your University / Program:
                </label>
                <input
                  type="text"
                  required
                  value={studentProgram}
                  onChange={(e) => setStudentProgram(e.target.value)}
                  placeholder="e.g. 2nd Year Engineering, CBU"
                  className="w-full px-3 py-2 bg-zinc-950 border border-blue-800 rounded-xl text-white text-xs focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-blue-200 mb-1">
                  Review & Feedback:
                </label>
                <textarea
                  required
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="How was the study environment, water, power, and landlord response?..."
                  className="w-full px-3 py-2 bg-zinc-950 border border-blue-800 rounded-xl text-white text-xs focus:border-blue-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Submit Review
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-blue-400 mx-auto" />
            <h4 className="text-lg font-bold text-white">Review Published!</h4>
            <p className="text-xs text-blue-200">
              Thank you for contributing to the UniNest verified student community.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
