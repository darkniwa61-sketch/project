'use client';

import { X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
}

export function DeleteConfirmModal({ isOpen, onClose, onConfirm, itemName }: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div 
        className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden border border-[#e7e5e4] animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
      >
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          
          <h3 className="text-xl font-bold text-center text-[#2d2621]">Delete Item</h3>
          
          <div className="mt-2 text-center text-[#78716c]">
            <p>Are you sure you want to delete <span className="font-semibold text-[#2d2621]">"{itemName}"</span>?</p>
            <p className="mt-1 text-sm">This action cannot be undone.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-[#fafafa] border-t border-[#e7e5e4] justify-end">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1 sm:flex-none border-[#e7e5e4] text-[#78716c] hover:bg-[#f5f5f4]"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white"
          >
            Delete Item
          </Button>
        </div>
      </div>
    </div>
  );
}
