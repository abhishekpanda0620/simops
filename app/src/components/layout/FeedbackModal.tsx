import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, MessageSquare, Send } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui';
import { useNotificationStore } from '@/store';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature' | 'other'>('feature');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addNotification } = useNotificationStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate submission (in production, this would send to an API)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    addNotification('Thank you for your feedback! 🎉', 'success');
    setMessage('');
    setIsSubmitting(false);
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-md bg-surface-900 border border-surface-700 rounded-xl shadow-2xl z-[9999] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary-400" />
                <h3 className="font-semibold text-surface-100">Send Feedback</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded hover:bg-surface-800 text-surface-400 hover:text-surface-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Feedback Type */}
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-2">
                  Feedback Type
                </label>
                <div className="flex gap-2">
                  {(['bug', 'feature', 'other'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFeedbackType(type)}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                        feedbackType === type
                          ? 'bg-primary-500/20 border-primary-500 text-primary-300'
                          : 'bg-surface-800 border-surface-700 text-surface-400 hover:border-surface-600'
                      }`}
                    >
                      {type === 'bug' ? '🐛 Bug' : type === 'feature' ? '✨ Feature' : '💬 Other'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-2">
                  Your Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what you think..."
                  className="w-full h-32 px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-surface-100 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 resize-none"
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={onClose} type="button">
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={!message.trim() || isSubmitting}
                  className="gap-2"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Sending...' : 'Send Feedback'}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
