import React from 'react';
import { Modal } from '../../../components/Modal';
import { Button } from '../../../components/Button';
import { Receipt, Printer, CheckCircle2, Building2 } from 'lucide-react';
import type { FeeAssignment } from '../../../types/fee';

export interface FeeReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  fee: FeeAssignment | null;
}

export const FeeReceiptModal: React.FC<FeeReceiptModalProps> = ({
  isOpen,
  onClose,
  fee,
}) => {
  if (!fee) return null;

  const handlePrint = () => {
    window.print();
  };

  const receiptNumber = `REC-${(fee.id || 'FE000000').slice(-8).toUpperCase()}`;
  const formattedDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(fee.amount);

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-fee-receipt, #printable-fee-receipt * {
            visibility: visible;
          }
          #printable-fee-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 24px;
            margin: 0;
            border: none;
            box-shadow: none;
          }
        }
      `}</style>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Fee Payment Receipt"
        size="lg"
        icon={<Receipt className="h-5 w-5 text-brand-600" />}
        footer={
          <div className="flex items-center justify-between w-full">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={handlePrint}
              leftIcon={<Printer className="h-4 w-4 mr-1.5" />}
            >
              Print / Save as PDF
            </Button>
          </div>
        }
      >
        <div
          id="printable-fee-receipt"
          className="bg-white p-6 rounded-xl border border-neutral-200/80 shadow-xs space-y-6 text-neutral-800"
        >
          {/* Header */}
          <div className="border-b-2 border-neutral-900 pb-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Building2 className="h-7 w-7 text-brand-600" />
              <h1 className="text-2xl font-black tracking-tight text-neutral-900 uppercase">
                EduCore Academy
              </h1>
            </div>
            <p className="text-xs text-neutral-500 font-medium">
              Official Student Fee Payment Receipt
            </p>
          </div>

          {/* Receipt Meta */}
          <div className="flex justify-between items-center text-xs text-neutral-600 border-b border-neutral-100 pb-3">
            <div>
              <span className="font-semibold text-neutral-800">Receipt No: </span>
              <span className="font-mono text-brand-600">{receiptNumber}</span>
            </div>
            <div>
              <span className="font-semibold text-neutral-800">Date: </span>
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Student & Course Details */}
          <div className="grid grid-cols-2 gap-4 bg-neutral-50 p-4 rounded-lg border border-neutral-200 text-xs">
            <div>
              <span className="text-neutral-500 block mb-0.5">Student Name</span>
              <span className="font-bold text-neutral-900 text-sm">
                {fee.studentName || 'Student'}
              </span>
            </div>
            <div>
              <span className="text-neutral-500 block mb-0.5">Admission Number</span>
              <span className="font-bold text-neutral-900 text-sm">
                {fee.admissionNumber || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-neutral-500 block mb-0.5">Batch / Class</span>
              <span className="font-medium text-neutral-800">
                {fee.batchName || 'General Batch'}
              </span>
            </div>
            <div>
              <span className="text-neutral-500 block mb-0.5">Payment Status</span>
              <span className="inline-flex items-center gap-1 font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" /> PAID
              </span>
            </div>
          </div>

          {/* Fee Item Table */}
          <table className="w-full text-left text-xs border border-neutral-200 rounded-lg overflow-hidden">
            <thead className="bg-neutral-100 text-neutral-700 uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">Payment Method</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              <tr>
                <td className="py-3 px-3">
                  <span className="font-semibold text-neutral-900 block">{fee.title}</span>
                  {fee.remarks && (
                    <span className="text-neutral-500 text-[11px] block mt-0.5">
                      {fee.remarks}
                    </span>
                  )}
                </td>
                <td className="py-3 px-3 text-neutral-600">Online (Razorpay Gateway)</td>
                <td className="py-3 px-3 text-right font-medium text-neutral-900">
                  {formattedAmount}
                </td>
              </tr>
              <tr className="bg-neutral-50 font-bold text-neutral-900">
                <td colSpan={2} className="py-3 px-3 text-right">
                  Total Paid:
                </td>
                <td className="py-3 px-3 text-right text-sm text-brand-700">
                  {formattedAmount}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Receipt Footer */}
          <div className="pt-4 border-t border-neutral-100 flex justify-between items-end text-[11px] text-neutral-400">
            <div>
              <p>Computer-generated receipt, valid without physical signature.</p>
              <p>For any billing queries, contact accounts@educore.com</p>
            </div>
            <div className="text-center">
              <div className="w-28 border-b border-neutral-300 pb-1 mb-1" />
              <span className="font-medium text-neutral-500">Authorized Signatory</span>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default FeeReceiptModal;
