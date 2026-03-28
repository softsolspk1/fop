'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User } from 'lucide-react';

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  imageSrc: string;
}

const MessageModal: React.FC<MessageModalProps> = ({ isOpen, onClose, title, imageSrc }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[90vh] bg-white rounded-[2.5rem] shadow-2xl z-[101] overflow-hidden border border-slate-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50 bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">{title}</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">Faculty of Pharmacy UOK</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all shadow-sm group"
              >
                <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-100px)] flex justify-center bg-slate-50">
                <img 
                    src={imageSrc} 
                    alt={title} 
                    className="max-w-full h-auto rounded-xl shadow-xl border border-white"
                />
            </div>

            {/* Footer */}
            <div className="px-8 py-4 bg-white border-t border-slate-50 text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Official Academic Message • 2026</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MessageModal;
