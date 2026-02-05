import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ElectionCenter } from './types';
import CenterCard from './components/CenterCard';
import DetailModal from './components/DetailModal';

// Initial default ID
const DEFAULT_SPREADSHEET_ID = '1Qy8XewQZHiByRdAe1Zq0m0AxuOtRy1mwt7kN7eME7p8';
const APP_PASSWORD = '123@123'; 

const Toast = ({ message, visible }: { message: string; visible: boolean }) => (
  <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] transition-all duration-500 transform ${visible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-90'}`}>
    <div className="bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-3 border border-white/10 text-sm">
      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
      {message}
    </div>
  </div>
);

const Logo = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 drop-shadow-sm">
    <path d="M15 35C15 35 30 10 55 10" stroke="#007A3D" strokeWidth="6" strokeLinecap="round"/>
    <path d="M25 40C25 40 35 22 55 22" stroke="#007A3D" strokeWidth="6" strokeLinecap="round"/>
    <path d="M35 45C35 45 42 34 55 34" stroke="#007A3D" strokeWidth="6" strokeLinecap="round"/>
    <circle cx="60" cy="40" r="12" fill="#FF0000" stroke="#007A3D" strokeWidth="2"/>
    <rect x="15" y="65" width="12" height="20" rx="6" fill="#007A3D"/>
    <rect x="30" y="58" width="12" height="27" rx="6" fill="#007A3D"/>
    <rect x="45" y="54" width="12" height="31" rx="6" fill="#007A3D"/>
    <rect x="60" y="42" width="12" height="43" rx="6" fill="#007A3D"/>
    <path d="M75 70L95 55L100 60L80 75L75 70" fill="#007A3D"/>
  </svg>
);

const App: React.FC = () => {
  const [spreadsheetId, setSpreadsheetId] = useState<string>(() => {
    return localStorage.getItem('election_sheet_id') || DEFAULT_SPREADSHEET_ID;
  });
  const [tempSheetUrl, setTempSheetUrl] = useState('');
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  const [centers, setCenters] = useState<ElectionCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [activeUpazila, setActiveUpazila] = useState<string>('সব');
  const [activeUnion, setActiveUnion] = useState<string>('সব');
  const [activeRisk, setActiveRisk] = useState<string>('সব');
  const [activeVoterRange, setActiveVoterRange] = useState<string>('সব');
  const [activeType, setActiveType] = useState<string>('সব');
  
  const [activePolice, setActivePolice] = useState<string>('সব');
  const [activeBgb, setActiveBgb] = useState<string>('সব');
  const [activeArmy, setActiveArmy] = useState<string>('সব');
  const [activeRab, setActiveRab] = useState<string>('সব');

  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  
  const [selectedCenter, setSelectedCenter] = useState<ElectionCenter | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`;

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleCenterClick = (center: ElectionCenter) => {
    setSelectedCenter(center);
    setIsModalOpen(true);
  };

  // Robust CSV Parser
  const parseCSV = (text: string): string[][] => {
    const lines = text.split(/\r?\n/);
    return lines
      .filter(line => line.trim() !== "")
      .map(line => {
        const row: string[] = [];
        let cur = "";
        let inQuote = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuote = !inQuote;
          } else if (char === ',' && !inQuote) {
            row.push(cur.trim());
            cur = "";
          } else {
            cur += char;
          }
        }
        row.push(cur.trim());
        return row;
      });
  };

  const fetchData = useCallback(async (isSync = false) => {
    try {
      if (isSync) setSyncing(true);
      else setLoading(true);

      const response = await fetch(`${csvUrl}&cache_bust=${Date.now()}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const csvText = await response.text();
      const rows = parseCSV(csvText);

      if (rows.length < 1) return;

      const rawHeader = rows[0].map(h => (h || "").trim().toLowerCase());
      
      const getIdx = (names: string[], exclude: string[] = []) => {
        const lowerNames = names.map(n => n.toLowerCase());
        const lowerExclude = exclude.map(e => e.toLowerCase());
        let found = rawHeader.findIndex(h => lowerNames.includes(h));
        if (found !== -1) return found;
        found = rawHeader.findIndex(h => {
          const isMatch = lowerNames.some(name => h.includes(name));
          const isExcluded = lowerExclude.some(ex => h.includes(ex));
          return isMatch && !isExcluded;
        });
        return found;
      };

      const phoneExclude = ['magistrate', 'ম্যাজিস্ট্রেট'];

      const idx = {
        sl: getIdx(['sl', 'serial', 'ক্রমিক', 'id', 'id no']),
        name: getIdx(['center name', 'center', 'কেন্দ্রের নাম', 'কেন্দ্র', 'নাম']),
        upazila: getIdx(['upazila', 'উপজেলা', 'thana', 'থানা']),
        union: getIdx(['union', 'ইউনিয়ন', 'ইউনিয়ন/পৌরসভা']),
        type: getIdx(['type', 'ধরণ', 'ধরন']),
        risk: getIdx(['risk status', 'risk', 'ঝুঁকি', 'ঝুঁকিপূর্ণ']),
        vct: getIdx(['vote centre type', 'centre type', 'কেন্দ্রের ধরন', 'কেন্দ্রের ধরণ', 'পুরুষ/মহিলা']),
        total: getIdx(['total voter', 'মোট ভোটার', 'মোট']),
        male: getIdx(['male voter', 'পুরুষ ভোটার', 'পুরুষ']),
        female: getIdx(['female voter', 'মহিলা ভোটার', 'মহিলা']),
        hijra: getIdx(['hijra voter', 'হিজড়া', 'হিজরা', 'তৃতীয় লিঙ্গ']),
        officer: getIdx(['officer name', 'অফিসার', 'প্রিসাইডিং অফিসার']),
        rank: getIdx(['rank', 'পদবি', 'পদবী', 'Designation']),
        phone: getIdx(['phone', 'mobile', 'ফোন', 'মোবাইল'], phoneExclude),
        police: getIdx(['police team', 'পুলিশের নাম', 'পুলিশ ফোর্স', 'পুলিশ'], ['phone', 'mobile', 'মোবাইল', 'ফোন']),
        bgb: getIdx(['bgb team', 'বিজিবির নাম', 'বিজিবি ফোর্স', 'বিজিবি'], ['phone', 'mobile', 'মোবাইল', 'ফোন']),
        army: getIdx(['army team', 'সেনাবাহিনীর নাম', 'সেনা ফোর্স', 'সেনাবাহিনী', 'সেনা'], ['phone', 'mobile', 'মোবাইল', 'ফোন']),
        rab: getIdx(['rab team', 'র‌্যাবের নাম', 'র্যাব ফোর্স', 'র‌্যাব', 'র্যাব'], ['phone', 'mobile', 'মোবাইল', 'ফোন']),
        magistrate: getIdx(['magistrate phone', 'ম্যাজিস্ট্রেট ফোন', 'ম্যাজিস্ট্রেট মোবাইল']),
        lat: getIdx(['latitude', 'lat', 'অক্ষাংশ']),
        lng: getIdx(['longitude', 'long', 'lng', 'দ্রাঘিমাংশ'])
      };

      const parsed = rows.slice(1)
        .filter(row => {
          const nameField = idx.name !== -1 ? row[idx.name] : null;
          return nameField && nameField.trim() !== "";
        })
        .map((row, index) => {
          const getValue = (pos: number, fallback: string = "তথ্য নেই") => {
            if (pos === -1 || pos >= row.length || !row[pos]) return fallback;
            return row[pos].trim();
          };
          const centerName = getValue(idx.name, "নামহীন কেন্দ্র");
          const upazila = getValue(idx.upazila, "অজানা");
          const lat = getValue(idx.lat, "");
          const lng = getValue(idx.lng, "");
          const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat && lng ? lat+','+lng : encodeURIComponent(centerName + ', ' + upazila)}&travelmode=driving`;

          return {
            id: `center-${index}-${Date.now()}`,
            serialNo: getValue(idx.sl, (index + 1).toString()),
            centerName: centerName,
            upazila: upazila,
            union: getValue(idx.union, "তথ্য নেই"),
            type: getValue(idx.type, "N/A"),
            riskStatus: getValue(idx.risk, "সাধারণ"),
            voteCentreType: getValue(idx.vct, "তথ্য নেই"),
            totalVoters: getValue(idx.total, "0"),
            maleVoters: getValue(idx.male, "0"),
            femaleVoters: getValue(idx.female, "0"),
            hijraVoters: getValue(idx.hijra, "0"),
            officerName: getValue(idx.officer, "তথ্য নেই"),
            rank: getValue(idx.rank, "তথ্য নেই"),
            phone: getValue(idx.phone, "N/A"),
            policeTeam: getValue(idx.police, "তথ্য নেই"),
            bgbTeam: getValue(idx.bgb, "তথ্য নেই"),
            armyTeam: getValue(idx.army, "তথ্য নেই"),
            rabTeam: getValue(idx.rab, "তথ্য নেই"),
            magistratePhone: getValue(idx.magistrate, "N/A"),
            latitude: lat,
            longitude: lng,
            mapsUrl: mapsUrl,
            viewUrl: mapsUrl
          };
        });

      setCenters(parsed);
      if (isSync) triggerToast('তথ্য সফলভাবে আপডেট হয়েছে!');
    } catch (err) {
      console.error(err);
      triggerToast('তথ্য লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, [csvUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Dynamic search bar placeholder
  const searchPlaceholder = useMemo(() => {
    if (activeUnion !== 'সব') return `${activeUnion} ইউনিয়ন-এর মধ্যে খুঁজুন...`;
    if (activeUpazila !== 'সব') return `${activeUpazila} উপজেলা-এর মধ্যে খুঁজুন...`;
    return "কেন্দ্র, ইউনিয়ন বা অফিসারের নাম...";
  }, [activeUpazila, activeUnion]);

  // Global Upazilas (Always available)
  const upazilas = useMemo(() => {
    const list = Array.from(new Set(centers.map(c => c.upazila)))
      .filter(u => u && String(u).trim() !== "")
      .sort();
    return ['সব', ...list];
  }, [centers]);

  // Filtering Logic
  const filteredCenters = useMemo(() => {
    return centers.filter(center => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = 
        center.centerName.toLowerCase().includes(search) ||
        center.officerName.toLowerCase().includes(search) ||
        center.serialNo.toLowerCase().includes(search) ||
        center.union.toLowerCase().includes(search);
      
      const matchesUpazila = activeUpazila === 'সব' || center.upazila === activeUpazila;
      const matchesUnion = activeUnion === 'সব' || center.union === activeUnion;
      const matchesRisk = activeRisk === 'সব' || center.riskStatus === activeRisk;
      const matchesType = activeType === 'সব' || center.voteCentreType === activeType;
      const matchesPolice = activePolice === 'সব' || center.policeTeam === activePolice;
      const matchesBgb = activeBgb === 'সব' || center.bgbTeam === activeBgb;
      const matchesArmy = activeArmy === 'সব' || center.armyTeam === activeArmy;
      const matchesRab = activeRab === 'সব' || center.rabTeam === activeRab;
      
      let matchesVoterRange = true;
      const total = parseInt(center.totalVoters.replace(/,/g, '')) || 0;
      if (activeVoterRange === '<১৫০০') matchesVoterRange = total < 1500;
      else if (activeVoterRange === '১৫০০-২৫০০') matchesVoterRange = total >= 1500 && total <= 2500;
      else if (activeVoterRange === '>২৫০০') matchesVoterRange = total > 2500;

      return matchesSearch && matchesUpazila && matchesUnion && matchesRisk && matchesType && matchesVoterRange && matchesPolice && matchesBgb && matchesArmy && matchesRab;
    });
  }, [centers, searchTerm, activeUpazila, activeUnion, activeRisk, activeVoterRange, activeType, activePolice, activeBgb, activeArmy, activeRab]);

  // Cascading Filter Helper: Returns unique values present in the current filtered result
  // Note: We "relax" the criteria for the column being calculated so users can change it
  const getDynamicOptions = (columnKey: keyof ElectionCenter, currentFilters: any) => {
    const currentResults = centers.filter(center => {
      // Apply all matches EXCEPT the one we are generating options for
      const matchesUpazila = (columnKey === 'upazila') || (activeUpazila === 'সব' || center.upazila === activeUpazila);
      const matchesUnion = (columnKey === 'union') || (activeUnion === 'সব' || center.union === activeUnion);
      const matchesRisk = (columnKey === 'riskStatus') || (activeRisk === 'সব' || center.riskStatus === activeRisk);
      const matchesType = (columnKey === 'voteCentreType') || (activeType === 'সব' || center.voteCentreType === activeType);
      const matchesPolice = (columnKey === 'policeTeam') || (activePolice === 'সব' || center.policeTeam === activePolice);
      const matchesBgb = (columnKey === 'bgbTeam') || (activeBgb === 'সব' || center.bgbTeam === activeBgb);
      const matchesArmy = (columnKey === 'armyTeam') || (activeArmy === 'সব' || center.armyTeam === activeArmy);
      const matchesRab = (columnKey === 'rabTeam') || (activeRab === 'সব' || center.rabTeam === activeRab);
      
      let matchesVoterRange = true;
      if (columnKey !== 'totalVoters') {
        const total = parseInt(center.totalVoters.replace(/,/g, '')) || 0;
        if (activeVoterRange === '<১৫০০') matchesVoterRange = total < 1500;
        else if (activeVoterRange === '১৫০০-২৫০০') matchesVoterRange = total >= 1500 && total <= 2500;
        else if (activeVoterRange === '>২৫০০') matchesVoterRange = total > 2500;
      }

      return matchesUpazila && matchesUnion && matchesRisk && matchesType && matchesVoterRange && matchesPolice && matchesBgb && matchesArmy && matchesRab;
    });

    const uniqueList = Array.from(new Set(
      currentResults
        .map(c => String(c[columnKey]))
        .filter(v => v && v !== "তথ্য নেই" && v !== "N/A" && v !== "0" && v !== "-" && v !== "সব")
    )).sort();
    return ['সব', ...uniqueList];
  };

  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = { 'সব': centers.length };
    upazilas.forEach(u => {
      if (u === 'সব') return;
      counts[u] = centers.filter(c => c.upazila === u).length;
    });
    return counts;
  }, [centers, upazilas]);

  const handleUpdateSheetSource = () => {
    const match = tempSheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    const newId = match ? match[1] : tempSheetUrl.trim();
    if (newId) {
      setSpreadsheetId(newId);
      localStorage.setItem('election_sheet_id', newId);
      setIsConfigModalOpen(false);
      setIsAuthorized(false);
      setPasswordInput('');
      setTempSheetUrl('');
      triggerToast('শীট সোর্স আপডেট করা হয়েছে!');
    } else {
      triggerToast('সঠিক শীট লিংক বা আইডি প্রদান করুন');
    }
  };

  const handlePasswordSubmit = () => {
    if (passwordInput === APP_PASSWORD) {
      setIsAuthorized(true);
      setTempSheetUrl(`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit?usp=sharing`);
    } else {
      triggerToast('ভুল পাসওয়ার্ড!');
    }
  };

  const openConfigModal = () => {
    setIsAuthorized(false);
    setPasswordInput('');
    setIsConfigModalOpen(true);
  };

  const clearFilters = () => {
    setActiveUpazila('সব');
    setActiveUnion('সব');
    setActiveRisk('সব');
    setActiveVoterRange('সব');
    setActiveType('সব');
    setActivePolice('সব');
    setActiveBgb('সব');
    setActiveArmy('সব');
    setActiveRab('সব');
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 font-['Hind_Siliguri']">
        <div className="w-12 h-12 border-[3px] border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-400 font-bold text-sm">তথ্য লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-['Hind_Siliguri'] text-slate-900 pb-10 flex flex-col">
      <header className="bg-emerald-900 text-white shadow-xl relative overflow-hidden shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-5 relative flex flex-row justify-between items-center">
          <div className="min-w-0">
            <h1 className="text-lg md:text-2xl font-black truncate">ভোট কেন্দ্র হাব</h1>
            <p className="text-emerald-300/80 font-bold text-[10px] md:text-sm truncate uppercase tracking-wide">কসবা ও আখাউড়া (লাইভ ডাটা)</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={openConfigModal} className="flex items-center gap-2 bg-emerald-700/50 hover:bg-emerald-700 text-white p-2 md:px-4 md:py-2 rounded-lg md:rounded-xl font-bold text-xs transition-all border border-emerald-600/30">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="hidden sm:inline">সেটিংস</span>
            </button>
            <button onClick={() => fetchData(true)} disabled={syncing} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 md:px-5 py-2 rounded-lg md:rounded-xl font-bold text-xs transition-all disabled:opacity-50 border border-white/10">
              <svg className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline">{syncing ? 'সিঙ্ক...' : 'সিঙ্ক'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 -mt-6 relative z-10 flex-1 w-full">
        <div className="bg-white rounded-[28px] p-4 md:p-6 shadow-lg border border-slate-100 space-y-6 mb-8">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="block w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 text-sm font-bold shadow-inner placeholder-slate-400 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 overflow-x-auto no-scrollbar scroll-smooth">
            {upazilas.map((u) => (
              <button
                key={u}
                onClick={() => { setActiveUpazila(u); setActiveUnion('সব'); }}
                className={`flex-1 min-w-[100px] py-2.5 px-4 rounded-xl text-xs md:text-sm font-black transition-all whitespace-nowrap ${
                  activeUpazila === u 
                  ? 'bg-white text-emerald-700 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {u} ({filterCounts[u]}টি)
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
            {[
              { label: 'ইউনিয়ন', val: activeUnion, set: setActiveUnion, optKey: 'union' },
              { label: 'ঝুঁকির ধরণ', val: activeRisk, set: setActiveRisk, optKey: 'riskStatus' },
              { label: 'মোট ভোটার', val: activeVoterRange, set: setActiveVoterRange, options: ['সব', '<১৫০০', '১৫০০-২৫০০', '>২৫০০'] },
              { label: 'কেন্দ্রের ধরন', val: activeType, set: setActiveType, optKey: 'voteCentreType' },
              { label: 'পুলিশ', val: activePolice, set: setActivePolice, optKey: 'policeTeam', color: 'text-blue-500 bg-blue-50' },
              { label: 'বিজিবি', val: activeBgb, set: setActiveBgb, optKey: 'bgbTeam', color: 'text-orange-600 bg-orange-50' },
              { label: 'সেনাবাহিনী', val: activeArmy, set: setActiveArmy, optKey: 'armyTeam', color: 'text-emerald-600 bg-emerald-50' },
              { label: 'র‌্যাব', val: activeRab, set: setActiveRab, optKey: 'rabTeam', color: 'text-purple-600 bg-purple-50' }
            ].map((f, i) => {
              const options = f.options || getDynamicOptions(f.optKey as keyof ElectionCenter, {});
              return (
                <div key={i} className="space-y-1">
                  <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${f.color?.split(' ')[0] || 'text-slate-400'}`}>{f.label}</label>
                  <select 
                    value={f.val} 
                    onChange={(e) => f.set(e.target.value)} 
                    className={`w-full border-none rounded-xl py-2 px-3 text-[13px] font-bold focus:ring-2 focus:ring-emerald-500 cursor-pointer ${f.color?.split(' ')[1] || 'bg-slate-50'}`}
                  >
                    {options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              );
            })}
          </div>

          {(activeUpazila !== 'সব' || activeUnion !== 'সব' || activeRisk !== 'সব' || activeVoterRange !== 'সব' || activeType !== 'সব' || activePolice !== 'সব' || activeBgb !== 'সব' || activeArmy !== 'সব' || activeRab !== 'সব' || searchTerm !== '') && (
            <div className="flex justify-center">
              <button onClick={clearFilters} className="flex items-center gap-1.5 text-xs font-black text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-4 py-2 rounded-full active:scale-95">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
                ফিল্টার মুছুন
              </button>
            </div>
          )}
        </div>

        <div className="mb-6 px-2 flex justify-between items-center">
          <p className="text-sm font-bold text-slate-500">
            {searchTerm ? `সার্চ রেজাল্ট: ` : `ফিল্টার রেজাল্ট: `} 
            <span className="text-emerald-700 font-black">{filteredCenters.length}</span> টি কেন্দ্র
          </p>
        </div>

        {filteredCenters.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredCenters.map(center => (
              <CenterCard key={center.id} center={center} onClick={handleCenterClick} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[32px] py-20 text-center border-2 border-dashed border-slate-200">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
             </div>
             <h3 className="text-xl font-black text-slate-800">কোনো তথ্য পাওয়া যায়নি!</h3>
             <p className="text-slate-400 font-bold mt-2">অন্য কোনো ফিল্টার বা সার্চ ট্রাই করুন</p>
             <button onClick={clearFilters} className="mt-8 px-8 py-3 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-emerald-100 hover:bg-emerald-700 active:scale-95 transition-all">সব ফিল্টার মুছুন</button>
          </div>
        )}
      </main>

      <footer className="mt-12 py-8 border-t border-slate-200 flex flex-col items-center justify-center gap-2">
        <div className="flex items-center gap-3">
          <div className="bg-white p-1 rounded-lg border border-slate-100 shadow-sm">
            <Logo size={24} />
          </div>
          <p className="text-slate-400 font-bold text-sm tracking-wide">
            Md. Shamim Alam, ICT Officer, Akhaura, Brahmanbaria @ 2026
          </p>
        </div>
      </footer>

      {isConfigModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden border border-white">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-900">{isAuthorized ? 'শীট সোর্স পরিবর্তন' : 'নিরাপত্তা যাচাই'}</h3>
              <button onClick={() => setIsConfigModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              {!isAuthorized ? (
                <div className="space-y-4">
                  <input type="password" placeholder="পাসওয়ার্ড লিখুন..." className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()} autoFocus />
                  <button onClick={handlePasswordSubmit} className="w-full py-3 rounded-xl text-sm font-black bg-emerald-600 text-white">নিশ্চিত করুন</button>
                </div>
              ) : (
                <div className="space-y-4">
                  <input type="text" placeholder="সম্পূর্ণ লিংক বা স্প্রেডশিট আইডি দিন..." className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500" value={tempSheetUrl} onChange={(e) => setTempSheetUrl(e.target.value)} />
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => { setIsAuthorized(false); setIsConfigModalOpen(false); }} className="flex-1 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50">বাতিল</button>
                    <button onClick={handleUpdateSheetSource} className="flex-1 py-3 rounded-xl text-sm font-black bg-emerald-600 text-white">আপডেট করুন</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <DetailModal center={selectedCenter} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <Toast message={toastMsg} visible={showToast} />
    </div>
  );
};

export default App;