import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { 
  Users, Search, GraduationCap, FileText, ArrowLeft, 
  Award, Clock, CheckCircle2 
} from 'lucide-react';

export default function AllStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    try {
      const data = await api.getAdminStudents();
      setStudents(data.students || []);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = students.filter(s => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      s.full_name?.toLowerCase().includes(term) ||
      s.register_no?.toLowerCase().includes(term) ||
      s.department?.toLowerCase().includes(term) ||
      s.email?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        to="/admin/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Placement Dashboard</span>
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Student Placement Audit Directory
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Module 3: Track student participation, academic CGPA standing, online tests taken, and selection outcomes
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name, register no, or branch..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs">Loading student records...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No students found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100">
                <tr>
                  <th className="py-3 px-6 font-semibold">Student & Register No</th>
                  <th className="py-3 px-4 font-semibold">Branch & Degree</th>
                  <th className="py-3 px-4 font-semibold text-center">CGPA</th>
                  <th className="py-3 px-4 font-semibold text-center">Applications</th>
                  <th className="py-3 px-4 font-semibold text-center">Tests Taken</th>
                  <th className="py-3 px-4 font-semibold text-center">Offers Received</th>
                  <th className="py-3 px-6 font-semibold text-right">Resume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 text-sm">{s.full_name}</div>
                      <div className="text-brand-700 font-mono font-bold text-xs">{s.register_no || 'Pending'}</div>
                      <div className="text-slate-400 text-[10px]">{s.email}</div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-medium text-slate-800">{s.department}</div>
                      <div className="text-slate-400 text-[10px]">{s.degree} &bull; Class of {s.batch_year}</div>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 text-xs">
                        {s.cgpa}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center font-bold text-slate-900">
                      {s.applications_count || 0}
                    </td>

                    <td className="py-4 px-4 text-center font-bold text-indigo-600">
                      {s.tests_taken || 0}
                    </td>

                    <td className="py-4 px-4 text-center">
                      {s.selections_count > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <Award className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{s.selections_count} Offers</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">0</span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right">
                      {s.resume_url ? (
                        <a
                          href={s.resume_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 text-[11px]">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
