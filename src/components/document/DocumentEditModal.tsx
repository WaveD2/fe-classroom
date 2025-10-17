import { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Loader } from 'lucide-react';
import { updateDocument } from '../../api/document';
import type { Document, DOCUMENT_STATUS } from '../../types';

interface DocumentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
  onSuccess?: () => void;
}

const DocumentEditModal: React.FC<DocumentEditModalProps> = ({
  isOpen,
  onClose,
  document,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<DOCUMENT_STATUS>('public' as DOCUMENT_STATUS);

  useEffect(() => {
    if (document) {
      setName(document.name);
      setDescription(document.description || '');
      setStatus(document.status);
    }
  }, [document]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!document) return;

    if (!name.trim()) {
      setError('Vui lòng nhập tên tài liệu');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await updateDocument(document._id, {
        name: name.trim(),
        description: description.trim() || undefined,
        status,
      });

      onSuccess?.();
      handleClose();
    } catch (err: any) {
      console.error('Update error:', err);
      setError(err.message || 'Có lỗi xảy ra khi cập nhật tài liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setError(null);
    onClose();
  };

  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={handleClose} />
      
      <div className="relative bg-white rounded-2xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h3 className="text-xl font-semibold text-gray-900">Chỉnh sửa tài liệu</h3>
          <button 
            onClick={handleClose} 
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Document Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên tài liệu <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              placeholder="Nhập tên tài liệu"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              placeholder="Nhập mô tả về tài liệu (không bắt buộc)"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-100"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="public"
                  checked={status === 'public'}
                  onChange={(e) => setStatus(e.target.value as DOCUMENT_STATUS)}
                  disabled={loading}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Công khai (Tất cả học sinh)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="private"
                  checked={status === 'private'}
                  onChange={(e) => setStatus(e.target.value as DOCUMENT_STATUS)}
                  disabled={loading}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Riêng tư (Chỉ giáo viên)</span>
              </label>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Lưu thay đổi</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentEditModal;

