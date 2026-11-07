import React from 'react';
import { Briefcase, Code, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <Briefcase className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-white">
                Internship Management Platform
              </span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-md">
              A comprehensive university placement and recruitment ecosystem streamlining internship listings, candidate applications, automated online testing, proctoring safeguards, and final selection.
            </p>
            <div className="pt-2 text-xs text-slate-500 space-y-1">
              <div><strong>Project:</strong> Software Engineering Project (SEP)</div>
              <div><strong>Author:</strong> SREEHARI NIKATHIL &bull; <strong>Reg No:</strong> CCE25CS231</div>
              <div><strong>Branch:</strong> Computer Science and Engineering</div>
            </div>
          </div>

          {/* Core Modules */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">Core Modules</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>1. User Registration & Auth</li>
              <li>2. Company & Posting Management</li>
              <li>3. Student Profile & Applications</li>
              <li>4. Online Test Engine (Proctored)</li>
              <li>5. Question Bank & Test Assembler</li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">System Features</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>&bull; Strict Tab Switch & Blur Tracking</li>
              <li>&bull; Auto-Evaluation for Objective MCQs</li>
              <li>&bull; Eligibility & CGPA Gatekeeper</li>
              <li>&bull; Real-time Kanban Status Pipeline</li>
              <li>&bull; Placement Cell Audit & Analytics</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; 2026 Sreehari Nikathil (CCE25CS231). All rights reserved.
          </div>
          <div className="flex items-center gap-1">
            Built with React, Node.js, SQLite & Tailwind CSS
          </div>
        </div>
      </div>
    </footer>
  );
}
