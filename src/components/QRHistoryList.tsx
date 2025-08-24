import { Clock } from "lucide-react";
import { QrHistoryI } from "../types";

export default function QRHistoryList({ qrHistory, onSelect }: { qrHistory: QrHistoryI[], onSelect: (qr:any)=>void }) {
  if (!qrHistory.length) {
    return <p className="text-gray-500 text-sm">Chưa có mã QR nào được tạo.</p>;
  }

  return (
    <div className="divide-y rounded-lg shadow bg-white">
      {qrHistory.map((qr) => (
        <div 
          key={qr._id || qr.id} 
          className="flex items-center justify-between p-4 hover:bg-gray-50 transition cursor-pointer"
          onClick={() => onSelect(qr)}
        >
          <div>
            <p className="font-medium">
              {qr.type === "attendance" ? "QR Điểm danh" : "QR Vào lớp"}
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {new Date(String(qr?.createdAt)).toLocaleString("vi-VN")}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            new Date(qr.expiresAt) > new Date() 
              ? "bg-green-100 text-green-700" 
              : "bg-red-100 text-red-700"
          }`}>
            {new Date(qr.expiresAt) > new Date() ? "Còn hiệu lực" : "Hết hạn"}
          </span>
        </div>
      ))}
    </div>
  );
}
