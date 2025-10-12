import { useState } from 'react';
import { GRADE_TYPE } from '../types';
import Button from './Button';
import { Search, Filter, X } from 'lucide-react';

interface GradeFiltersProps {
  onFilterChange: (filters: {
    search?: string;
    gradeType?: GRADE_TYPE;
  }) => void;
  onReset: () => void;
  loading?: boolean;
}

const GradeFilters = ({ onFilterChange, onReset, loading = false }: GradeFiltersProps) => {
  const [search, setSearch] = useState('');
  const [gradeType, setGradeType] = useState<GRADE_TYPE | ''>('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = () => {
    onFilterChange({
      search: search.trim() || undefined,
      gradeType: gradeType || undefined
    });
  };

  const handleReset = () => {
    setSearch('');
    setGradeType('');
    onReset();
  };

  const getGradeTypeLabel = (type: GRADE_TYPE) => {
    const labels = {
      [GRADE_TYPE.ATTENDANCE]: 'Chuyên cần',
      [GRADE_TYPE.HOMEWORK]: 'Bài tập',
      [GRADE_TYPE.MIDTERM]: 'Giữa kỳ',
      [GRADE_TYPE.FINAL]: 'Cuối kỳ',
    };
    return labels[type];
  };

  const hasActiveFilters = search.trim() || gradeType;

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Bộ lọc</h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} className="mr-1" />
            {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
          </Button>
          {hasActiveFilters && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleReset}
            >
              <X size={16} className="mr-1" />
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tìm kiếm
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm theo tên điểm, học sinh..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại điểm
              </label>
              <select
                value={gradeType}
                onChange={(e) => setGradeType(e.target.value as GRADE_TYPE | '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tất cả loại điểm</option>
                {Object.values(GRADE_TYPE).map(type => (
                  <option key={type} value={type}>
                    {getGradeTypeLabel(type)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={handleReset}
              disabled={loading}
            >
              Đặt lại
            </Button>
            <Button
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? 'Đang tìm...' : 'Tìm kiếm'}
            </Button>
          </div>
        </div>
      )}

      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Bộ lọc đang áp dụng:</span>
            {search && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Tìm kiếm: "{search}"
              </span>
            )}
            {gradeType && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Loại: {getGradeTypeLabel(gradeType)}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GradeFilters;
