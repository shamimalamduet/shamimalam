
import React from 'react';
import { ElectionCenter } from '../types';

interface DetailModalProps {
  center: ElectionCenter | null;
  isOpen: boolean;
  onClose: () => void;
}

const DetailModal: React.FC<DetailModalProps> = ({ center, isOpen, onClose }) => {
  if (!isOpen || !center) return null;

  const riskLower = center.riskStatus.toLowerCase();
  const isHighRisk = 
    riskLower.includes('high') || 
    riskLower.includes('গুরুত্বপূর্ণ') || 
    riskLower.includes('অধিক') || 
    (riskLower.includes('ঝুঁকি') && !riskLower.includes('সাধারণ'));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300 font-['Hind_Siliguri']">
      <div className="bg-white rounded-[40px] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-start sticky top-0 z-10 shrink-0">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="bg-slate-900 text-white text-xs font-black px-3 py-1.5 rounded-xl uppercase inline-block whitespace-nowrap">
                নং: {center.serialNo}
              </span>
              <span className={`text-xs font-black px-3 py-1.5 rounded-xl uppercase inline-block ${
                isHighRisk ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
              }`}>
                {center.riskStatus}
              </span>
              {center.voteCentreType && center.voteCentreType !== 'N/A' && center.voteCentreType !== 'তথ্য নেই' && (
                <span className="bg-indigo-100 text-indigo-600 text-xs font-black px-3 py-1.5 rounded-xl uppercase inline-block">
                  {center.voteCentreType}
                </span>
              )}
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight truncate">{center.centerName}</h2>
          </div>
          <button onClick={onClose} className="p-3 bg-white shadow-sm hover:bg-slate-100 rounded-2xl transition-all group shrink-0 ml-4">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-8 md:p-10 overflow-y-auto">
          {/* Voter Statistics Grid - Updated to 4 boxes */}
          <div className="mb-8">
            <p className="text-[10px] text-slate-400 font-black uppercase mb-4 tracking-widest text-center">ভোটার পরিসংখ্যান</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-3xl text-center">
                <p className="text-[10px] font-bold text-emerald-600 mb-1">মোট</p>
                <p className="text-xl font-black text-emerald-900">{center.totalVoters || '0'}</p>
              </div>
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-3xl text-center">
                <p className="text-[10px] font-bold text-blue-600 mb-1">পুরুষ</p>
                <p className="text-xl font-black text-blue-900">{center.maleVoters || '0'}</p>
              </div>
              <div className="bg-pink-50 border border-pink-100 p-4 rounded-3xl text-center">
                <p className="text-[10px] font-bold text-pink-600 mb-1">মহিলা</p>
                <p className="text-xl font-black text-pink-900">{center.femaleVoters || '0'}</p>
              </div>
              <div className="bg-purple-50 border border-purple-100 p-4 rounded-3xl text-center">
                <p className="text-[10px] font-bold text-purple-600 mb-1">হিজড়া</p>
                <p className="text-xl font-black text-purple-900">{center.hijraVoters || '0'}</p>
              </div>
            </div>
          </div>

          {/* Area Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-indigo-50/50 p-5 rounded-3xl border border-indigo-100">
              <p className="text-[10px] text-indigo-600 font-black uppercase mb-1 tracking-widest">ইউনিয়ন / এলাকা</p>
              <p className="text-xl font-black text-indigo-900">{center.union}</p>
            </div>
            <div className="bg-emerald-50/50 p-5 rounded-3xl border border-emerald-100">
              <p className="text-[10px] text-emerald-600 font-black uppercase mb-1 tracking-widest">উপজেলা</p>
              <p className="text-xl font-black text-emerald-900">{center.upazila}</p>
            </div>
          </div>

          {/* Presiding Officer */}
          <div className="bg-white border border-slate-100 rounded-[30px] p-6 mb-8 shadow-sm">
             <div className="flex items-center gap-4 mb-6">
                <div className="bg-slate-900 text-white p-3 rounded-2xl">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                   </svg>
                </div>
                <div className="min-w-0">
                   <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">প্রিসাইডিং অফিসার</p>
                   <p className="text-xl font-black text-slate-900 truncate">{center.officerName}</p>
                   <p className="text-sm font-bold text-slate-500 truncate">{center.rank}</p>
                </div>
             </div>
             
             {center.phone && center.phone !== 'N/A' && (
               <button 
                 onClick={() => window.location.href = `tel:${center.phone}`}
                 className="w-full flex items-center justify-center gap-3 p-4 bg-emerald-50 text-emerald-700 rounded-2xl font-black hover:bg-emerald-100 transition-all active:scale-95"
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                 </svg>
                 ফোন: {center.phone}
               </button>
             )}
          </div>

          {/* Security & Oversight Section with Icons */}
          <div className="mb-8">
            <p className="text-[10px] text-slate-400 font-black uppercase mb-4 tracking-widest text-center">নিরাপত্তা ও তদারকি</p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-blue-50/30 p-4 rounded-2xl border border-blue-100/50 flex flex-col items-center text-center">
                  <svg className="w-5 h-5 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <p className="text-[9px] text-blue-600 font-black uppercase mb-1">পুলিশ টিম</p>
                  <p className="text-sm font-bold text-slate-800">{center.policeTeam}</p>
                </div>
                <div className="bg-orange-50/30 p-4 rounded-2xl border border-orange-100/50 flex flex-col items-center text-center">
                  <svg className="w-5 h-5 text-orange-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p className="text-[9px] text-orange-600 font-black uppercase mb-1">বিজিবি টিম</p>
                  <p className="text-sm font-bold text-slate-800">{center.bgbTeam}</p>
                </div>
                <div className="bg-emerald-50/30 p-4 rounded-2xl border border-emerald-100/50 flex flex-col items-center text-center">
                  <svg className="w-5 h-5 text-emerald-600 mb-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <p className="text-[9px] text-emerald-600 font-black uppercase mb-1">সেনাবাহিনী</p>
                  <p className="text-sm font-bold text-slate-800">{center.armyTeam}</p>
                </div>
                <div className="bg-purple-50/30 p-4 rounded-2xl border border-purple-100/50 flex flex-col items-center text-center">
                  <svg className="w-5 h-5 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.286z" />
                  </svg>
                  <p className="text-[9px] text-purple-600 font-black uppercase mb-1">র‌্যাব টিম</p>
                  <p className="text-sm font-bold text-slate-800">{center.rabTeam}</p>
                </div>
              </div>

              {center.magistratePhone && center.magistratePhone !== 'N/A' && (
                <button 
                  onClick={() => window.location.href = `tel:${center.magistratePhone}`}
                  className="w-full flex items-center justify-between p-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all active:scale-95"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    ম্যাজিস্ট্রেট ফোন
                  </span>
                  <span className="bg-white/10 px-3 py-1 rounded-lg text-emerald-400">{center.magistratePhone}</span>
                </button>
              )}
            </div>
          </div>

          {/* Map Direction */}
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => window.open(center.mapsUrl, '_blank')}
              className="flex-1 bg-emerald-600 text-white py-5 rounded-[25px] font-black text-lg flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-95"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              ম্যাপে ডিরেকশন নিন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
