"use client";
import RegisterButton from "./RegisterButton";

export default function Modal({
  isOpen,
  onClose,
  workshopData,
  title = "Checkout Summary",
}) {
  if (!isOpen) return null;

console.log(workshopData.price)
const basePrice = Number(workshopData.price) || 0;

  const platformFeePercent = 2.0; 
  const gstPercent = 18; 

  const platformFee = (platformFeePercent / 100) * basePrice;
  const gst = (gstPercent / 100) * (platformFee);
  const total = basePrice + platformFee + gst;

  console.log(basePrice ,platformFee )

  // 💰 Proper INR formatter
  const formatINR = (num) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(num);

  return (
    <div className="fixed inset-0 rounded-3xl bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black text-lg"
        >
          ✕
        </button>

        {/* Title */}
        <h2 className="text-xl font-semibold mb-4">{title}</h2>

        {/* Billing Breakdown */}
        <div className="space-y-4">

            <div className="flex justify-between">
              <span>Workshop </span>
              <span>{workshopData.name}</span>
            </div>

          <div className="border-b pb-2 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>Workshop Price</span>
              <span>{formatINR(basePrice)}</span>
            </div>
            <div className="flex justify-between">
              <span>Platform Fee ({platformFeePercent}%)</span>
              <span>{formatINR(platformFee)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST on PlatForm Fee ({gstPercent}%)</span>
              <span>{formatINR(gst)}</span>
            </div>
          </div>

          <div className="flex justify-between text-lg font-semibold text-gray-900">
            <span>Total</span>
            <span>{formatINR(total)}</span>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <RegisterButton id={workshopData.id} ticketId={workshopData.ticketId} />
          </div>
        </div>
      </div>
    </div>
  );
}
