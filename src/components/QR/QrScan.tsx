import { useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { Scanner } from '@yudiel/react-qr-scanner';
import { diemDanh } from "../../api/qr";
import { showError, showInfo } from "../Toast";
import { ClassI } from "../../types";

const QRScanner = ({
  isOpen,
  onClose,
  setClasses
}: {
  isOpen: boolean;
  onClose: () => void;
  setClasses: React.Dispatch<React.SetStateAction<ClassI[]>>
}) => {
  const [scanned, setScanned] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async (result: string) => {
    if (!result || scanned) return; 
    setScanned(result);
    setLoading(true);

    try {
      const url = new URL(result);
      const sessionId = url.searchParams.get("sessionId");
      const type = url.searchParams.get("type");
      const classId = url.searchParams.get("classId");
      const qrId = url.searchParams.get("qrId");

     const res = await diemDanh({
        sessionId,
        type,
        classId,
        qrId
      });
      console.log("res: ddiemer danh:", res);
      if(res?.message) {
          showInfo(res.message);
      }
      if(res.dta){
        setClasses((prev: ClassI[])=>
          [...prev, res.data]
      );
      }
     
    } catch (err: any) {
      showError(err.message || "Có lỗi xảy ra khi điểm danh");
    } finally {
      setLoading(false);
      onClose();
      setScanned(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quét mã QR">
      <div className="text-center">
        {scanned ? (
          <p className="text-green-600 font-medium">Đã quét mã: {scanned}</p>
        ) : (
          <div className="w-64 h-64 mx-auto mb-4">
            <Scanner
              onScan={(result) => {
                handleScan(result[0].rawValue)
                console.log("result::", result);
              }}
              onError={(err) => {
                console.error(err)
                setScanned(null);
              }}
              constraints={{ facingMode: "environment" }}
              // style={{ width: "100%", height: "100%" }}
            />
          </div>
        )}

        <p className="text-gray-600 mb-4">
          Hướng camera đến mã QR để điểm danh
        </p>
        <Button onClick={()=> {
          setScanned(null);
          onClose()
        }} disabled={loading}>
          Đóng
        </Button>
      </div>
    </Modal>
  );
};

export default QRScanner;
