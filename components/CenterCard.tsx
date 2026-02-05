
import React from 'react';
import { ElectionCenter } from '../types';

interface CenterCardProps {
  center: ElectionCenter;
  onClick: (center: ElectionCenter) => void;
}

const CenterCard: React.FC<CenterCardProps> = ({ center, onClick }) => {
  const riskLower = center.riskStatus.toLowerCase();
  const isHighRisk = 
    riskLower.includes('high') || 
    riskLower.includes('গুরুত্বপূর্ণ') || 
    riskLower.includes('অধিক') || 
    (riskLower.includes('ঝুঁকি') && !riskLower.includes('সাধারণ'));

  const handleCall = (e: React.MouseEvent, phone?: string) => {
    e.stopPropagation();
    if (phone && phone !== 'N/A' && phone !== 'তথ্য নেই') {
      window.location.href = `tel:${phone}`;
    }
  };

  const handleDirection = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(center.mapsUrl, '_blank');
  };

  return (
    <div 
      onClick={() => onClick(center)}
      className="group bg-white rounded-[24px] border border-slate-200/80 p-5 hover:shadow-2xl hover:shadow-emerald-900/10 hover:-translate-y-1.5 hover:border-emerald-300/40 transition-all duration-300 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] relative flex flex-col h-full font-['Hind_Siliguri'] cursor-pointer border-b-[6px] border-b-slate-200/60"
    >
      {/* Top Meta Row */}
      <div className="flex justify-between items-center gap-2 mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md uppercase tracking-tight">
            {center.upazila}
          </span>
          <span className="text-xs font-bold text-slate-500 truncate">
            {center.union}
          </span>
        </div>
        <div className="flex gap-1 shrink-0">
          <div className={`text-[11px] font-black px-2 py-1 rounded uppercase border ${
            isHighRisk ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-500 border-slate-100'
          }`}>
            {center.riskStatus}
          </div>
          {center.voteCentreType && center.voteCentreType !== 'N/A' && center.voteCentreType !== 'তথ্য নেই' && (
            <div className="text-[11px] font-black px-2 py-1 rounded uppercase border bg-indigo-50 text-indigo-600 border-indigo-100">
              {center.voteCentreType}
            </div>
          )}
        </div>
      </div>

      {/* Center Name */}
      <h3 className="text-[17px] font-black text-slate-900 leading-tight mb-4 group-hover:text-emerald-700 transition-colors line-clamp-2 min-h-[2.8rem]">
        <span className="text-slate-300 mr-2 font-bold">#{center.serialNo}</span>
        {center.centerName}
      </h3>

      {/* Security Teams Section with Icons */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-blue-50/50 border border-blue-100/50 p-2 rounded-xl text-center">
          <div className="flex justify-center mb-1">
            <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <p className="text-[9px] font-black text-blue-600 uppercase mb-0.5">পুলিশ</p>
          <p className="text-[10px] font-bold text-slate-700 truncate">{center.policeTeam || 'N/A'}</p>
        </div>
        <div className="bg-orange-50/50 border border-orange-100/50 p-2 rounded-xl text-center">
          <div className="flex justify-center mb-1">
            <svg className="w-3 h-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-[9px] font-black text-orange-600 uppercase mb-0.5">বিজিবি</p>
          <p className="text-[10px] font-bold text-slate-700 truncate">{center.bgbTeam || 'N/A'}</p>
        </div>
        <div className="bg-emerald-50/50 border border-emerald-100/50 p-2 rounded-xl text-center">
          <div className="flex justify-center mb-1">
            <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <p className="text-[9px] font-black text-emerald-600 uppercase mb-0.5">সেনা</p>
          <p className="text-[10px] font-bold text-slate-700 truncate">{center.armyTeam || 'N/A'}</p>
        </div>
        <div className="bg-purple-50/50 border border-purple-100/50 p-2 rounded-xl text-center">
          <div className="flex justify-center mb-1">
            <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.286z" />
            </svg>
          </div>
          <p className="text-[9px] font-black text-purple-600 uppercase mb-0.5">র‌্যাব</p>
          <p className="text-[10px] font-bold text-slate-700 truncate">{center.rabTeam || 'N/A'}</p>
        </div>
      </div>

      {/* Voter Stats Bar - Updated to include Hijra */}
      <div className="flex items-center gap-1 mb-4 bg-slate-50 p-2 rounded-2xl border border-slate-100/80">
        <div className="flex-1 flex flex-col items-center border-r border-slate-200">
          <span className="text-[9px] text-slate-500 font-bold uppercase leading-none mb-1">মোট</span>
          <span className="text-[12px] font-black text-slate-900">{center.totalVoters || '0'}</span>
        </div>
        <div className="flex-1 flex flex-col items-center border-r border-slate-200">
          <span className="text-[9px] text-blue-500 font-bold uppercase leading-none mb-1">পুরুষ</span>
          <span className="text-[12px] font-black text-blue-900">{center.maleVoters || '0'}</span>
        </div>
        <div className="flex-1 flex flex-col items-center border-r border-slate-200">
          <span className="text-[9px] text-pink-500 font-bold uppercase leading-none mb-1">মহিলা</span>
          <span className="text-[12px] font-black text-pink-900">{center.femaleVoters || '0'}</span>
        </div>
        <div className="flex-1 flex flex-col items-center">
          <span className="text-[9px] text-purple-500 font-bold uppercase leading-none mb-1">হিজড়া</span>
          <span className="text-[12px] font-black text-purple-900">{center.hijraVoters || '0'}</span>
        </div>
      </div>

      {/* Magistrate Contact */}
      {center.magistratePhone && center.magistratePhone !== 'N/A' && center.magistratePhone !== 'তথ্য নেই' && (
        <button 
          onClick={(e) => handleCall(e, center.magistratePhone)}
          className="mb-4 flex items-center justify-between w-full p-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all active:scale-[0.98] shadow-sm group/mag"
        >
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-[11px] font-black uppercase tracking-wider">ম্যাজিস্ট্রেট কল</span>
          </div>
          <span className="text-[12px] font-bold bg-white/10 px-2 py-0.5 rounded-md text-emerald-300">{center.magistratePhone}</span>
        </button>
      )}

      {/* Officer Section */}
      <div className="flex items-center gap-3 mb-5 bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
        <div className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-slate-400 shrink-0 border border-slate-100">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-[15px] font-black text-slate-900 leading-tight truncate">{center.officerName}</p>
          <p className="text-xs font-bold text-slate-500 truncate mt-1">{center.rank}</p>
        </div>
      </div>

      {/* Side-by-Side Compact Buttons */}
      <div className="mt-auto pt-2 grid grid-cols-2 gap-3">
        <button 
          onClick={(e) => handleCall(e, center.phone)}
          className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl transition-all border text-[15px] font-black shadow-sm ${
            center.phone && center.phone !== 'N/A' && center.phone !== 'তথ্য নেই'
            ? 'bg-white text-emerald-700 border-emerald-100 hover:bg-emerald-50 active:scale-95' 
            : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed opacity-60'
          }`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 005.47 5.47l.773-1.548a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
          কল
        </button>
        <button 
          onClick={handleDirection}
          className="bg-white text-emerald-700 border-emerald-100 py-3.5 rounded-2xl text-[15px] font-black flex items-center justify-center gap-2 border hover:bg-emerald-50 transition-all shadow-sm active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          ম্যাপ
        </button>
      </div>
    </div>
  );
};

export default CenterCard;
