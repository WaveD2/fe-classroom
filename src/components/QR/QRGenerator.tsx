import { useEffect, useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { createQR } from "../../api/qr";
import { showInfo } from "../Toast";

const QRGenerator = ({
  isOpen,
  onClose,
  classId,
}: {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
}) => {
  const [qrType, setQrType] = useState<"attendance" | "join_class">("attendance");
  const [expireMinutes, setExpireMinutes] = useState(10);
  const [note, setNote] = useState("");
  const [qrData, setQrData] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Reset lại khi mở modal
  useEffect(() => {
    if (isOpen) {
      setQrData(null);
      setTimeLeft(0);
    }
  }, [isOpen]);

  // Countdown khi có qrData
  useEffect(() => {
    if (!qrData?.expiresAt) return;

    const interval = setInterval(() => {
      const diff = new Date(qrData.expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        clearInterval(interval);
        setTimeLeft(0);
      } else {
        setTimeLeft(Math.floor(diff / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [qrData]);

  const generateNewQR = async () => {
    try {
      if(!note) {
        showInfo("Vui lặng nhập ghi chú");
        return;
      }
      const expiresAt = new Date(Date.now() + expireMinutes * 60 * 1000).toISOString();

      const payload = {
        classId,
        type: qrType,
        content: note,
        expiresAt,
        sessionId: Math.random().toString(36).substr(2, 20),
      };

      const res = await createQR(payload);
      console.log("API trả về:", res);

      setQrData(res.data);
      setNote("");
      setExpireMinutes(10);
      setQrType("attendance");
    } catch (err) {
      console.error("Lỗi tạo QR:", err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mã QR">
      <div className="space-y-4">
        {!qrData ? (
          <>
            {/* Loại QR */}
            <div>
              <label className="block text-sm font-medium mb-1">Loại mã QR</label>
              <select
                value={qrType}
                onChange={(e) => setQrType(e.target.value as "attendance" | "join_class")}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="attendance">QR điểm danh</option>
                <option value="join_class">QR vào lớp</option>
              </select>
            </div>

            {/* Thời gian hết hạn */}
            <div>
              <label className="block text-sm font-medium mb-1">Thời gian hết hạn</label>
              <div className="flex gap-2 mb-2">
                {[5, 10, 30, 60].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setExpireMinutes(m)}
                    className={`px-3 py-1 rounded-lg border text-sm ${
                      expireMinutes === m
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {m} phút
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={expireMinutes}
                min={1}
                className="w-full border rounded-lg px-3 py-2"
                onChange={(e) => setExpireMinutes(Number(e.target.value))}
                placeholder="Tùy chỉnh (phút)"
              />
            </div>

            {/* Ghi chú */}
            <div>
              <label className="block text-sm font-medium mb-1">Ghi chú</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="VD: Điểm danh buổi 1"
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <Button onClick={generateNewQR} className="w-full">
              Tạo mã mới
            </Button>
          </>
        ) : (
          <div className="text-center space-y-3">
            {/* Hiển thị ảnh QR từ backend */}
            <div className="w-52 h-52 bg-gray-100 rounded-lg mx-auto flex items-center justify-center overflow-hidden">
              <img src={qrData.qrImage} alt="QR Code" className="w-full h-full object-contain" />
            </div>

            <div className="space-y-1 text-gray-600">
              <p>Loại: {qrData.type === "attendance" ? "Điểm danh" : "Vào lớp"}</p>
              <p>Hết hạn sau: {timeLeft}s</p>
              {qrData?.content && <p>Ghi chú: {qrData?.content}</p>}
            </div>

            <Button variant="secondary" onClick={onClose} className="w-full">
              Đóng
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default QRGenerator;
