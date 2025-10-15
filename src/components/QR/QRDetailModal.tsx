import { X } from "lucide-react";

type QRDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  qr: {
    _id: string;
    type: "attendance" | "join_class";
    qrImage?: string;
    createdAt: string;
    expiresAt?: string;
    sessionId?: string;
    content?: string;
  } | null;
};

export default function QRDetailModal({ isOpen, onClose, qr }: QRDetailModalProps) {
  if (!isOpen || !qr) return null;

  const expired = qr.expiresAt && new Date(qr.expiresAt).getTime() < Date.now();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-2 p-6 animate-fadeInScale">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <h2 className="text-xl font-semibold mb-4">Chi tiết mã QR</h2>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Loại:</span>
            <span className="font-medium">
              {qr.type === "attendance" ? "Điểm danh" : "Vào lớp"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Ngày tạo:</span>
            <span>{new Date(qr.createdAt).toLocaleString("vi-VN")}</span>
          </div>

          {qr.expiresAt && (
            <div className="flex justify-between">
              <span className="text-gray-600">Hết hạn:</span>
              <span
                className={`font-medium ${
                  expired ? "text-red-600" : "text-green-600"
                }`}
              >
                {new Date(qr.expiresAt).toLocaleString("vi-VN")}
              </span>
            </div>
          )}

          {qr.sessionId && (
            <div className="flex justify-between">
              <span className="text-gray-600">Session:</span>
              <span className="font-mono">{qr.sessionId}</span>
            </div>
          )}

          {qr.content && (
            <div>
              <span className="text-gray-600">Nội dung:</span>
              <p className="mt-1 p-2 rounded-md bg-gray-50">{qr.content}</p>
            </div>
          )}
        </div>

        {qr.qrImage && (
          <div className="mt-6 flex justify-center">
            <img
              src={qr.qrImage}
              alt="QR Code"
              className="w-48 h-48 object-contain"
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* Tailwind animation (thêm vào globals.css hoặc index.css)
@keyframes fadeInScale {
  0% { opacity: 0; transform: scale(0.95); }
  100% { opacity: 1; transform: scale(1); }
}
.animate-fadeInScale {
  animation: fadeInScale 0.2s ease-out;
}
*/
