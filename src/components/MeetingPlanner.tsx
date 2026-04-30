'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { DateTime } from 'luxon';
import { useSession, signIn, signOut } from 'next-auth/react';
import { 
  Plus, Trash2, Copy, Calendar, LogOut, Globe, Check,
  ExternalLink, LogIn, Loader2, Search, X
} from 'lucide-react';

const COMMON_ZONES = [
    { nameJa: '東京', nameEn: 'Tokyo', tz: 'Asia/Tokyo', country: 'JP' },
    { nameJa: 'ソウル', nameEn: 'Seoul', tz: 'Asia/Seoul', country: 'KR' },
    { nameJa: 'シンガポール', nameEn: 'Singapore', tz: 'Asia/Singapore', country: 'SG' },
    { nameJa: '上海', nameEn: 'Shanghai', tz: 'Asia/Shanghai', country: 'CN' },
    { nameJa: '香港', nameEn: 'Hong Kong', tz: 'Asia/Hong_Kong', country: 'HK' },
    { nameJa: 'バンコク', nameEn: 'Bangkok', tz: 'Asia/Bangkok', country: 'TH' },
    { nameJa: '台北', nameEn: 'Taipei', tz: 'Asia/Taipei', country: 'TW' },
    { nameJa: 'ドバイ', nameEn: 'Dubai', tz: 'Asia/Dubai', country: 'AE' },
    { nameJa: 'ムンバイ', nameEn: 'Mumbai', tz: 'Asia/Kolkata', country: 'IN' },
    { nameJa: 'ジャカルタ', nameEn: 'Jakarta', tz: 'Asia/Jakarta', country: 'ID' },
    { nameJa: 'ロンドン', nameEn: 'London', tz: 'Europe/London', country: 'GB' },
    { nameJa: 'パリ', nameEn: 'Paris', tz: 'Europe/Paris', country: 'FR' },
    { nameJa: 'ベルリン', nameEn: 'Berlin', tz: 'Europe/Berlin', country: 'DE' },
    { nameJa: 'フランクフルト', nameEn: 'Frankfurt', tz: 'Europe/Berlin', country: 'DE' },
    { nameJa: 'ミラノ', nameEn: 'Milan', tz: 'Europe/Rome', country: 'IT' },
    { nameJa: 'マドリード', nameEn: 'Madrid', tz: 'Europe/Madrid', country: 'ES' },
    { nameJa: 'アムステルダム', nameEn: 'Amsterdam', tz: 'Europe/Amsterdam', country: 'NL' },
    { nameJa: 'ニューヨーク', nameEn: 'New York', tz: 'America/New_York', country: 'US' },
    { nameJa: 'ワシントンDC', nameEn: 'Washington DC', tz: 'America/New_York', country: 'US' },
    { nameJa: 'ロサンゼルス', nameEn: 'Los Angeles', tz: 'America/Los_Angeles', country: 'US' },
    { nameJa: 'シカゴ', nameEn: 'Chicago', tz: 'America/Chicago', country: 'US' },
    { nameJa: 'トロント', nameEn: 'Toronto', tz: 'America/Toronto', country: 'CA' },
    { nameJa: 'バンクーバー', nameEn: 'Vancouver', tz: 'America/Vancouver', country: 'CA' },
    { nameJa: 'シドニー', nameEn: 'Sydney', tz: 'Australia/Sydney', country: 'AU' },
    { nameJa: 'メルボルン', nameEn: 'Melbourne', tz: 'Australia/Melbourne', country: 'AU' },
    { nameJa: 'パース', nameEn: 'Perth', tz: 'Australia/Perth', country: 'AU' },
    { nameJa: 'オークランド', nameEn: 'Auckland', tz: 'Pacific/Auckland', country: 'NZ' },
];

const TRANSLATIONS = {
  ja: {
    title: 'Global Meeting Coordinator',
    tagline: 'CONNECT',
    subtitle: 'アカウント連携で、世界中の会議をスマートに同期',
    dateLabel: '日付',
    timeLabel: '開始時間',
    baseTzLabel: '基準タイムゾーン',
    durationLabel: '設定時間 (分)',
    participants: '参加地域',
    addRegion: '地域を追加',
    chatExport: 'Chat用テキスト出力',
    copy: 'コピーする',
    copied: 'コピー完了！',
    syncToCalendar: 'カレンダーに同期',
    syncing: '同期中...',
    synced: '同期完了！',
    loginPrompt: 'ログインしてカレンダー連携を有効にする',
    logout: 'ログアウト',
    searchPlaceholder: '都市名や国名で検索...',
    meetingTitle: '【会議時間設定】',
    baseTimeText: '基準時間',
    dayDiffPlus: '+{n}日',
    dayDiffMinus: '-{n}日',
    eventTitle: 'Global Meeting',
    holidayLabel: '祝日',
    fetchingHolidays: '祝日取得中...',
    publicHoliday: '公的祝日: ',
    todayBtn: '今日',
    nowBtn: '今'
  },
  en: {
    title: 'Global Meeting Coordinator',
    tagline: 'CONNECT',
    subtitle: 'Smartly sync global meetings with direct calendar integration.',
    dateLabel: 'Date',
    timeLabel: 'Start Time',
    baseTzLabel: 'Base Timezone',
    durationLabel: 'Duration (min)',
    participants: 'Participants',
    addRegion: 'Add Region',
    chatExport: 'Chat Export',
    copy: 'Copy Text',
    copied: 'Copied!',
    syncToCalendar: 'Sync to Calendar',
    syncing: 'Syncing...',
    synced: 'Synced!',
    loginPrompt: 'Sign in to enable sync',
    logout: 'Logout',
    searchPlaceholder: 'Search city or country...',
    meetingTitle: '[Meeting Schedule]',
    baseTimeText: 'Base Time',
    dayDiffPlus: '+{n}d',
    dayDiffMinus: '-{n}d',
    eventTitle: 'Global Meeting',
    holidayLabel: 'Holiday',
    fetchingHolidays: 'Updating holidays...',
    publicHoliday: 'Public Holiday: ',
    todayBtn: 'Today',
    nowBtn: 'Now'
  }
};

export default function MeetingPlanner() {
  const { data: session } = useSession();
  const [lang, setLang] = useState<'ja' | 'en'>('ja');
  
  // Initialize with rounded time
  const [baseDate, setBaseDate] = useState(() => DateTime.now().toISODate());
  const [baseHour, setBaseHour] = useState(() => {
    const now = DateTime.now();
    const roundedMinutes = Math.round(now.minute / 15) * 15;
    return now.set({ minute: 0 }).plus({ minutes: roundedMinutes }).toFormat('HH');
  });
  const [baseMinute, setBaseMinute] = useState(() => {
    const now = DateTime.now();
    const roundedMinutes = Math.round(now.minute / 15) * 15;
    return (roundedMinutes === 60 ? 0 : roundedMinutes).toString().padStart(2, '0');
  });

  const [baseTz, setBaseTz] = useState('Asia/Tokyo');
  const [duration, setDuration] = useState(60);
  const [regions, setRegions] = useState([
    { id: '1', name: 'ロンドン', nameEn: 'London', tz: 'Europe/London', country: 'GB' },
    { id: '2', name: 'ニューヨーク', nameEn: 'New York', tz: 'America/New_York', country: 'US' },
    { id: '3', name: 'ロサンゼルス', nameEn: 'Los Angeles', tz: 'America/Los_Angeles', country: 'US' }
  ]);
  
  const [holidays, setHolidays] = useState<Record<string, any[]>>({});
  const [isFetchingHolidays, setIsFetchingHolidays] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const t = TRANSLATIONS[lang];
  const baseTime = `${baseHour}:${baseMinute}`;

  // Fetch holidays from internal API
  const fetchHolidays = useCallback(async () => {
    const years = new Set<number>();
    const baseDT = DateTime.fromISO(`${baseDate}T${baseTime}`, { zone: baseTz });
    if (!baseDT.isValid) return;
    const endDT = baseDT.plus({ minutes: duration });

    regions.forEach(r => {
      const regTime = baseDT.setZone(r.tz);
      const regEndTime = endDT.setZone(r.tz);
      if (regTime.isValid) years.add(regTime.year);
      if (regEndTime.isValid) years.add(regEndTime.year);
    });

    const toFetch: { country: string, year: number }[] = [];
    regions.forEach(r => {
      if (!r.country) return;
      years.forEach(year => {
        const key = `${r.country}-${year}`;
        if (!holidays[key]) {
          toFetch.push({ country: r.country, year });
        }
      });
    });

    if (toFetch.length === 0) return;

    setIsFetchingHolidays(true);
    try {
      const results = await Promise.all(
        toFetch.map(async ({ country, year }) => {
          const res = await fetch(`/api/holidays?country=${country}&year=${year}`);
          if (!res.ok) return null;
          const data = await res.json();
          return { key: `${country}-${year}`, data };
        })
      );

      const newHolidays = { ...holidays };
      results.forEach(res => {
        if (res) {
          newHolidays[res.key] = res.data.map((h: any) => ({
            date: h.date.iso.split('T')[0],
            name: h.name,
            localName: h.name
          }));
        }
      });
      setHolidays(newHolidays);
    } catch (err) {
      console.error('Holiday fetch failed', err);
    } finally {
      setIsFetchingHolidays(false);
    }
  }, [baseDate, baseTime, baseTz, duration, regions, holidays]);

  useEffect(() => {
    fetchHolidays();
  }, [baseDate, regions.length]);

  const calculatedRegions = useMemo(() => {
    const baseDateTime = DateTime.fromISO(`${baseDate}T${baseTime}`, { zone: baseTz });
    const baseEndDateTime = baseDateTime.plus({ minutes: duration });

    return regions.map(region => {
      const regionalTime = baseDateTime.setZone(region.tz);
      const regionalEndTime = baseEndDateTime.setZone(region.tz);
      const diff = Math.round(regionalTime.startOf('day').diff(baseDateTime.setZone(baseTz).setZone(region.tz).startOf('day'), 'days').days);
      
      const dateStr = regionalTime.toISODate();
      const holiday = holidays[`${region.country}-${regionalTime.year}`]?.find(h => h.date === dateStr);

      const isSpanning = regionalTime.toISODate() !== regionalEndTime.toISODate();

      return {
        ...region,
        time: regionalTime.toFormat('HH:mm'),
        endTime: regionalEndTime.toFormat('HH:mm'),
        endDate: isSpanning ? regionalEndTime.toFormat('MM/dd') : null,
        date: regionalTime.toFormat('yyyy/MM/dd'),
        offsetName: regionalTime.offsetNameShort,
        dayDiff: diff,
        holiday
      };
    });
  }, [baseDate, baseTime, baseTz, duration, regions, holidays]);

  const chatText = useMemo(() => {
    const baseDateTime = DateTime.fromISO(`${baseDate}T${baseTime}`, { zone: baseTz });
    const baseEndDateTime = baseDateTime.plus({ minutes: duration });
    const baseSpanning = baseDateTime.toISODate() !== baseEndDateTime.toISODate();
    const baseEndStr = baseSpanning ? `${baseEndDateTime.toFormat('HH:mm')} (${baseEndDateTime.toFormat('MM/dd')})` : baseEndDateTime.toFormat('HH:mm');

    let text = `${t.meetingTitle}\n`;
    text += `${t.baseTimeText}: ${baseDate} ${baseTime} - ${baseEndStr} (${baseTz})\n`;
    if (isFetchingHolidays) text += `(${t.fetchingHolidays})\n`;
    text += `--------------------------------\n`;

    calculatedRegions.forEach(r => {
      const displayName = lang === 'ja' ? r.name : (r.nameEn || r.name);
      const endStr = r.endDate ? `${r.endTime} (${r.endDate})` : r.endTime;
      const diffText = r.dayDiff !== 0 ? ` (${r.dayDiff > 0 ? t.dayDiffPlus.replace('{n}', r.dayDiff.toString()) : t.dayDiffMinus.replace('{n}', Math.abs(r.dayDiff).toString())})` : '';
      const holidayText = r.holiday ? ` [${r.holiday.name}]` : '';
      
      text += `${displayName.padEnd(12)} : ${r.date} ${r.time} - ${endStr}${diffText}${holidayText}\n`;
    });
    return text;
  }, [calculatedRegions, lang, baseDate, baseTime, baseTz, t, isFetchingHolidays, duration]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(chatText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSync = async () => {
    if (!session) return signIn();
    setIsSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSyncing(false);
    alert('カレンダーへの直接同期は、現在ベータ版です。API設定後に有効になります。');
  };

  const filteredZones = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return COMMON_ZONES.filter(z => 
      z.nameJa.includes(query) || 
      z.nameEn.toLowerCase().includes(query) ||
      z.tz.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 font-sans relative z-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20 rotate-3">
            <Globe className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black font-outfit tracking-tighter leading-none">
              GMC <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">CONNECT</span>
            </h1>
            <p className="text-[10px] font-bold text-text-dim uppercase tracking-[0.2em] mt-1 ml-0.5">Global Meeting Coordinator</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-white/5 p-1 rounded-xl glass border border-white/5">
            <button 
              onClick={() => setLang('ja')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${lang === 'ja' ? 'bg-indigo-600 text-white shadow-lg' : 'text-text-dim hover:text-white'}`}
            >JP</button>
            <button 
              onClick={() => setLang('en')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${lang === 'en' ? 'bg-indigo-600 text-white shadow-lg' : 'text-text-dim hover:text-white'}`}
            >EN</button>
          </div>

          {session ? (
            <div className="flex items-center gap-3 bg-white/5 pl-3 pr-1 py-1 rounded-full glass border border-white/10">
              <span className="text-xs font-bold text-text-dim">{session.user?.name}</span>
              <button onClick={() => signOut()} className="p-2 hover:bg-danger/20 rounded-full transition-colors text-danger">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => signIn()}
              className="bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 text-white"
            >
              <LogIn className="w-4 h-4" /> Sign In
            </button>
          )}
        </div>
      </div>

      <div className="text-center mb-16">
        <h2 className="text-6xl font-black mb-6 font-outfit bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent leading-tight tracking-tight">
          {t.title}
        </h2>
        <p className="text-text-dim text-lg max-w-2xl mx-auto font-medium">
          {t.subtitle}
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Config Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card glass p-8 rounded-[32px] space-y-6 border border-white/10">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">{t.dateLabel}</label>
                <button
                  onClick={() => setBaseDate(DateTime.now().toISODate())}
                  className="text-[10px] font-black px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/25 text-indigo-400 rounded-lg transition-all border border-indigo-500/20 uppercase tracking-widest"
                >
                  {t.todayBtn}
                </button>
              </div>
              <input 
                type="date" 
                value={baseDate ?? ''} 
                onChange={(e) => setBaseDate(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">{t.timeLabel}</label>
                <button
                  onClick={() => {
                    const now = DateTime.now();
                    const roundedMinutes = Math.floor(now.minute / 15) * 15;
                    setBaseHour(now.hour.toString().padStart(2, '0'));
                    setBaseMinute(roundedMinutes.toString().padStart(2, '0'));
                  }}
                  className="text-[10px] font-black px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/25 text-indigo-400 rounded-lg transition-all border border-indigo-500/20 uppercase tracking-widest"
                >
                  {t.nowBtn}
                </button>
              </div>
              <div className="flex items-center gap-3">
                <select 
                  value={baseHour}
                  onChange={(e) => setBaseHour(e.target.value)}
                  className="flex-1 bg-black/20 border border-white/10 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none text-center font-bold"
                >
                  {Array.from({ length: 24 }).map((_, i) => {
                    const h = i.toString().padStart(2, '0');
                    return <option key={h} value={h} className="bg-slate-900">{h}</option>;
                  })}
                </select>
                <span className="text-2xl font-bold text-text-dim">:</span>
                <select 
                  value={baseMinute}
                  onChange={(e) => setBaseMinute(e.target.value)}
                  className="flex-1 bg-black/20 border border-white/10 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none text-center font-bold"
                >
                  {['00', '15', '30', '45'].map(m => (
                    <option key={m} value={m} className="bg-slate-900">{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">{t.baseTzLabel}</label>
              <div className="relative">
                <select 
                  value={baseTz}
                  onChange={(e) => setBaseTz(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none font-medium"
                >
                  {COMMON_ZONES.map(z => (
                    <option key={z.tz} value={z.tz} className="bg-slate-900">
                      {lang === 'ja' ? z.nameJa : z.nameEn} ({z.tz})
                    </option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                  <Globe className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">{t.durationLabel}</label>
              <input 
                type="number" 
                step="15"
                value={duration} 
                onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold"
              />
            </div>
          </div>

          <div className="card glass p-8 rounded-[32px] border border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-xl tracking-tight">{t.chatExport}</h3>
              <button 
                onClick={handleCopy}
                className={`p-2.5 rounded-xl transition-all ${isCopied ? 'bg-success/20 text-success' : 'hover:bg-white/10 text-indigo-400'}`}
              >
                {isCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <div className="bg-black/40 rounded-2xl p-5 font-mono text-[11px] text-indigo-100/70 leading-relaxed whitespace-pre-wrap overflow-x-auto min-h-[220px] border border-white/5 shadow-inner">
              {chatText}
            </div>
            
            <button 
              onClick={handleSync}
              disabled={isSyncing}
              className="w-full mt-8 bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-indigo-600/30"
            >
              {isSyncing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Calendar className="w-6 h-6" />}
              <span className="uppercase tracking-widest text-xs">
                {isSyncing ? t.syncing : (session ? t.syncToCalendar : t.loginPrompt)}
              </span>
            </button>
          </div>
        </div>

        {/* Regions Grid */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-2xl font-black font-outfit tracking-tight">{t.participants}</h3>
            <div className="relative">
              <button 
                onClick={() => setShowSearch(!showSearch)}
                className="bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all glass border border-white/10 flex items-center gap-2 text-indigo-400"
              >
                <Plus className="w-4 h-4" /> {t.addRegion}
              </button>
              
              {showSearch && (
                <div className="absolute right-0 top-full mt-4 w-80 bg-slate-900/95 border border-white/10 rounded-[32px] shadow-2xl p-4 z-50 glass backdrop-blur-3xl animate-in fade-in zoom-in duration-200">
                  <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                    <input 
                      autoFocus
                      placeholder={t.searchPlaceholder}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/5 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                    {filteredZones.map(z => (
                      <button 
                        key={`${z.tz}-${z.nameJa}`}
                        onClick={() => {
                          const name = lang === 'ja' ? z.nameJa : z.nameEn;
                          setRegions([...regions, { id: Date.now().toString(), name, nameEn: z.nameEn, tz: z.tz, country: z.country }]);
                          setShowSearch(false);
                          setSearchQuery('');
                        }}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-indigo-600/20 hover:text-indigo-300 rounded-xl transition-all flex items-center justify-between group"
                      >
                        <span className="font-bold">{lang === 'ja' ? z.nameJa : z.nameEn}</span>
                        <span className="text-[10px] text-text-dim group-hover:text-indigo-400/70 font-mono">{z.tz}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {calculatedRegions.map((region) => (
              <div key={region.id} className="card glass p-8 rounded-[40px] group relative overflow-hidden transition-all hover:border-indigo-500/50 border border-white/5 shadow-2xl">
                <button 
                  onClick={() => setRegions(regions.filter(r => r.id !== region.id))}
                  className="absolute top-6 right-6 p-2.5 opacity-0 group-hover:opacity-100 transition-all hover:bg-danger/20 rounded-2xl text-danger border border-danger/10 glass"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                
                <div className="space-y-6">
                  <div className="flex flex-col">
                    <span className="text-2xl font-black text-white leading-tight tracking-tight">
                      {lang === 'ja' ? region.name : (region.nameEn || region.name)}
                    </span>
                    <span className="text-[10px] text-indigo-400/60 font-black tracking-[0.2em] uppercase mt-1">{region.tz}</span>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black font-outfit text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60">
                        {region.time}
                      </span>
                      <span className="text-2xl font-light text-text-dim">ー</span>
                      <span className="text-4xl font-black font-outfit text-indigo-400">
                        {region.endTime}
                      </span>
                    </div>
                    {region.endDate && (
                      <span className="text-xs font-black text-indigo-400 uppercase tracking-widest mt-1 ml-1">
                        Ends: {region.endDate}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-white/5 px-3 py-1.5 rounded-full glass border border-white/5 flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-text-dim" />
                      <span className="text-[11px] font-bold text-text-dim">{region.date}</span>
                    </div>
                    
                    {region.dayDiff !== 0 && (
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${region.dayDiff > 0 ? 'bg-success/10 text-success border-success/20' : 'bg-danger/10 text-danger border-danger/20'}`}>
                        {region.dayDiff > 0 ? `+${region.dayDiff}d` : `${region.dayDiff}d`}
                      </span>
                    )}
                  </div>

                  {region.holiday && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-400">
                        {lang === 'ja' ? '㊗️' : '🗓️'}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-amber-500/70 uppercase tracking-widest">{t.holidayLabel}</span>
                        <span className="text-sm font-bold text-amber-200">
                          {lang === 'en' && t.publicHoliday}{region.holiday.name}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Decorative blob */}
                <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl group-hover:bg-indigo-600/20 transition-all duration-700"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="mt-32 text-center border-t border-white/5 pt-16 text-text-dim text-sm pb-12">
        <div className="flex items-center justify-center gap-8 mb-6">
          <a href="#" className="hover:text-indigo-400 transition-colors font-bold uppercase tracking-widest text-[10px]">Privacy</a>
          <a href="#" className="hover:text-indigo-400 transition-colors font-bold uppercase tracking-widest text-[10px]">Terms</a>
          <a href="#" className="hover:text-indigo-400 transition-colors font-bold uppercase tracking-widest text-[10px] flex items-center gap-1">
            Docs <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <p className="font-mono text-[10px] opacity-40">© 2026 GMC CONNECT • ENGINE: NEXT.JS • HOLIDAYS: CALENDARIFIC</p>
      </footer>
    </div>
  );
}
