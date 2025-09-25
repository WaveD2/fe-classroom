import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { User } from "../types";
import { getTeacherById } from "../api/user";

export default function TeacherDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [summary, setSummary] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await getTeacherById(id as string);
        if (mounted && res?.data) {
          setUser(res.data as unknown as User);
          setClasses((res.data as any).classes || []);
          setSummary((res.data as any).summary || null);
        }
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchUser();
    return () => { mounted = false; };
  }, [id]);

  return (
    <div className="flex flex-col h-full p-4 sm:p-6 lg:p-8">
     <button
      onClick={() => navigate(-1)}
      className="inline-flex items-center mb-2 w-min gap-1 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100 hover:text-blue-800 transition"
    >
      <span className="whitespace-nowrap">← Quay lại</span>
    </button>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : user ? (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <img
                src={`https://ui-avatars.com/api/?name=${user.name?.replace(" ", "+")}&background=random&size=128`}
                alt="avatar"
                className="w-24 h-24 rounded-full border"
              />
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold mb-1 break-words">{user.name}</h1>
                <p className="text-gray-600 break-all">{user.email}</p>
                <div className="mt-3 text-sm text-gray-700">ID: {user.id || (user as any)._id}</div>
              </div>
            </div>
          </div>

          {summary && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border p-4 text-center">
                <div className="text-2xl font-bold">{summary.totalClasses}</div>
                <div className="text-sm text-gray-600">Tổng số lớp</div>
              </div>
              <div className="bg-white rounded-xl border p-4 text-center">
                <div className="text-2xl font-bold">{summary.totalStudents}</div>
                <div className="text-sm text-gray-600">Tổng số học sinh</div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border p-4">
            <h2 className="text-lg font-semibold mb-3">Lớp phụ trách</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="p-2">Lớp</th>
                    <th className="p-2">Số học sinh</th>
                    <th className="p-2">Số buổi</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map((c) => (
                    <tr key={c.classId} className="border-t">
                      <td className="p-2">{c.className}</td>
                      <td className="p-2">{c.studentCount}</td>
                      <td className="p-2">{c.sessions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500">Không tìm thấy người dùng</div>
      )}
    </div>
  );
}



