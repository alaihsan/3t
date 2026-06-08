import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { BookOpen, Users, History, GraduationCap, ChevronRight, LayoutGrid, Search, BookOpenCheck, School, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Student {
    id: number;
    nis: string;
    name: string;
}

interface Classroom {
    id: number;
    name: string;
    type: 'Takhasus' | 'Tahsin' | 'Tahfizh';
}

interface Chapter {
    id: number;
    name_complex: string;
    name_arabic: string;
    translated_name: {
        name: string;
    };
    verses_count: number;
    revelation_place: string;
}

interface DashboardProps {
    classCount: number;
    studentCount: number;
    logCount: number;
    classrooms: Classroom[];
    students: Student[];
    chapters: Chapter[];
    weeklyActivity?: { day: string; count: number }[];
    labelDistribution?: { name: string; color: string; count: number }[];
    activeGoals?: any[];
}

const BarChart = ({ data = [] }: { data: { day: string; count: number }[] }) => {
    const maxVal = Math.max(...data.map(d => d.count), 5); // Fallback to 5
    const chartHeight = 110;
    const paddingBottom = 20;
    const width = 320;
    const barWidth = 20;
    const gap = 18;

    return (
        <div className="w-full flex flex-col items-center">
            <svg viewBox={`0 0 ${width} ${chartHeight + paddingBottom}`} className="w-full max-w-sm h-32">
                {data.map((item, idx) => {
                    const x = idx * (barWidth + gap) + 32;
                    const barHeight = (item.count / maxVal) * chartHeight;
                    const y = chartHeight - barHeight;
                    return (
                        <g key={idx} className="group cursor-pointer">
                            <title>{`${item.count} catatan`}</title>
                            <rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={barHeight}
                                rx={3}
                                className="fill-emerald-600 dark:fill-emerald-500 hover:fill-emerald-550 transition duration-200"
                            />
                            <text
                                x={x + barWidth / 2}
                                y={y - 4}
                                textAnchor="middle"
                                className="text-[9px] font-bold fill-neutral-700 dark:fill-neutral-300 opacity-0 group-hover:opacity-100 transition duration-200"
                            >
                                {item.count}
                            </text>
                            <text
                                x={x + barWidth / 2}
                                y={chartHeight + 12}
                                textAnchor="middle"
                                className="text-[9px] font-semibold fill-neutral-400 dark:fill-neutral-500"
                            >
                                {item.day}
                            </text>
                        </g>
                    );
                })}
                <line
                    x1="15"
                    y1={chartHeight}
                    x2={width - 15}
                    y2={chartHeight}
                    className="stroke-neutral-200 dark:stroke-neutral-800"
                    strokeWidth="1"
                />
            </svg>
        </div>
    );
};

const DonutChart = ({ data = [] }: { data: { name: string; color: string; count: number }[] }) => {
    const total = data.reduce((acc, d) => acc + d.count, 0);
    const radius = 30;
    const circ = 2 * Math.PI * radius; // ~188.5
    const strokeWidth = 8;
    const viewSize = 80;
    const center = viewSize / 2;

    const labelColors: Record<string, string> = {
        merah: '#ef4444',
        kuning: '#f59e0b',
        hijau: '#10b981',
        hitam: '#6b7280',
        biru: '#3b82f6',
        orange: '#f97316',
        ungu: '#8b5cf6',
    };

    let accumulatedPercentage = 0;

    return (
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center w-full">
            {total > 0 ? (
                <>
                    <div className="relative h-24 w-24 shrink-0">
                        <svg viewBox={`0 0 ${viewSize} ${viewSize}`} className="w-full h-full transform -rotate-90">
                            {data.map((item, idx) => {
                                if (item.count === 0) return null;
                                const pct = item.count / total;
                                const strokeLength = pct * circ;
                                const strokeOffset = circ - strokeLength;
                                const dashOffset = (accumulatedPercentage / 100) * circ;
                                accumulatedPercentage += pct * 100;

                                const colorHex = labelColors[item.color] || '#6b7280';

                                return (
                                    <circle
                                        key={idx}
                                        cx={center}
                                        cy={center}
                                        r={radius}
                                        fill="transparent"
                                        stroke={colorHex}
                                        strokeWidth={strokeWidth}
                                        strokeDasharray={circ}
                                        strokeDashoffset={-dashOffset}
                                        className="transition-all duration-300 hover:stroke-[10px]"
                                    >
                                        <title>{`${item.name}: ${item.count} (${Math.round(pct * 100)}%)`}</title>
                                    </circle>
                                );
                            })}
                            <circle
                                cx={center}
                                cy={center}
                                r={radius - strokeWidth / 2}
                                className="fill-white dark:fill-neutral-900"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                            <span className="text-[8px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider">Total</span>
                            <span className="text-sm font-extrabold text-neutral-800 dark:text-neutral-200 leading-none mt-0.5">{total}</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-[10px] flex-1">
                        {data.map((item, idx) => {
                            if (item.count === 0) return null;
                            const colorHex = labelColors[item.color] || '#6b7280';
                            return (
                                <div key={idx} className="flex items-center gap-1 min-w-0">
                                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: colorHex }} />
                                    <span className="truncate text-neutral-700 dark:text-neutral-300 font-medium">{item.name}</span>
                                    <span className="text-neutral-400 font-bold">({item.count})</span>
                                </div>
                            );
                        })}
                    </div>
                </>
            ) : (
                <p className="text-[10px] text-neutral-400 italic py-8 text-center w-full">Belum ada label koreksi yang digunakan dalam catatan riwayat bacaan.</p>
            )}
        </div>
    );
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

const QURAN_QUOTES = [
    "\" Sebaik-baik kalian adalah orang yang belajar Al-Qur'an dan mengajarkannya.\" (HR. Bukhari)",
    "\"Orang yang mahir membaca Al-Qur'an bersama malaikat yang mulia lagi taat.\" (HR. Bukhari & Muslim)",
    "\"Bacalah Al-Qur'an, karena ia akan datang pada hari kiamat sebagai syafaat bagi pembacanya.\" (HR. Muslim)",
    "\"Barangsiapa membaca satu huruf dari Kitabullah, maka baginya satu kebaikan dan dilipatgandakan sepuluh kali.\" (HR. Tirmidzi)",
    "\"Perumpamaan mukmin yang membaca Al-Qur'an laksana buah utrujjah, baunya harum dan rasanya manis.\" (HR. Bukhari & Muslim)",
    "\"Akan dikatakan kepada pembaca Al-Qur'an: Bacalah, naiklah, dan tartilkanlah sebagaimana di dunia.\" (HR. Abu Dawud)",
    "\"Tidaklah suatu kaum berkumpul di rumah Allah membaca Al-Qur'an melainkan turun ketenangan dan rahmat.\" (HR. Muslim)",
    "\"Barangsiapa yang mempelajari Al-Qur'an di kala muda, maka Al-Qur'an akan menyatu dengan darah dan dagingnya.\" (Atsar Sahabat)",
    "\"Sesungguhnya Allah mengangkat derajat beberapa kaum dengan Al-Qur'an ini dan merendahkan kaum yang lain.\" (HR. Muslim)",
    "\"Mempelajari dan mengajarkan Al-Qur'an adalah perniagaan yang tidak akan pernah merugi.\" (QS. Fatir: 29-30)",
    "\"Barangsiapa menginginkan dunia maka dengan ilmu, barangsiapa menginginkan akhirat maka dengan ilmu Al-Qur'an.\" (Atsar)",
    "\"Penuntut ilmu Al-Qur'an senantiasa didoakan kebaikan oleh para malaikat hingga ikan di lautan.\" (HR. Tirmidzi)",
    "\"Hati yang di dalamnya tidak ada sedikit pun dari Al-Qur'an ibarat rumah yang runtuh.\" (HR. Tirmidzi)",
    "\" Sebaik-baik kesibukan di dunia ini adalah menyibukkan diri dengan mempelajari wahyu Allah Ta'ala.\" (Imam Asy-Syafii)",
    "\"Dua hal yang boleh dicemburui: seseorang yang dianugerahi Al-Qur'an lalu ia mengamalkannya siang dan malam.\" (HR. Bukhari)",
    "\"Orang tua yang anaknya mempelajari Al-Qur'an akan dipakaikan mahkota cahaya di hari kiamat.\" (HR. Abu Dawud)",
    "\"Membaca Al-Qur'an dengan tadabbur adalah obat paling mujarab untuk membersihkan kotoran di dalam hati.\" (Ibnu Qayyim)",
    "\"Siapa yang menempuh jalan untuk mencari ilmu (Al-Qur'an), Allah akan mudahkan baginya jalan menuju surga.\" (HR. Muslim)",
    "\"Penghafal Al-Qur'an adalah keluarga Allah di bumi (Ahlullah wa Khassatuh).\" (HR. Ahmad & Ibnu Majah)",
    "\"Setiap ayat yang dipelajari dan dibaca bernilai lebih baik daripada unta yang gemuk dan mewah.\" (HR. Muslim)",
    "\"Mempelajari satu ayat Al-Qur'an lebih baik bagimu daripada shalat sunnah seratus rakaat.\" (HR. Ibnu Majah)",
    "\"Sesungguhnya Al-Qur'an ini adalah jamuan Allah, maka terimalah jamuan-Nya dengan segenap kemampuanmu.\" (HR. Hakim)",
    "\"Al-Qur'an adalah cahaya di bumi dan simpanan pahala yang sangat berharga untukmu di langit.\" (HR. Ibnu Hibban)",
    "\"Tidak ada penenang jiwa yang paling indah selain melantunkan bait-bait suci kalamullah.\" (Utsman bin Affan)",
    "\"Barangsiapa yang disibukkan oleh Al-Qur'an hingga lupa meminta kepada-Ku, maka Aku beri pemberian terbaik.\" (Hadits Qudsi)",
    "\"Al-Qur'an adalah tali Allah yang kokoh, cahaya yang terang, dan penawar yang sangat mujarab.\" (HR. Al-Hakim)",
    "\"Cintailah Al-Qur'an, niscaya Allah dan seluruh makhluk di langit serta bumi akan mencintaimu.\" (Sufyan Ats-Tsauri)",
    "\"Barangsiapa mengamalkan apa yang ada di dalam Al-Qur'an, maka Al-Qur'an akan menuntunnya menuju surga.\" (HR. Ibnu Hibban)",
    "\"Sibukkanlah lisan dan hatimu dengan Al-Qur'an agar tidak ada celah bagi dunia untuk merusakmu.\" (Fudhail bin Iyadh)",
    "\"Mempelajari Al-Qur'an adalah kunci utama untuk meraih keberkahan hidup di dunia dan keselamatan di akhirat.\" (Atsar)"
];

export default function Dashboard({
    classCount = 0,
    studentCount = 0,
    logCount = 0,
    classrooms = [],
    students = [],
    chapters = [],
    weeklyActivity = [],
    labelDistribution = [],
    activeGoals = []
}: DashboardProps) {
    const { auth } = usePage<SharedData>().props;
    const teacherName = auth.user?.name || 'Ustadz';

    // Quotes Typing and Rotation Logic
    const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        const quoteTimer = setInterval(() => {
            setCurrentQuoteIndex((prev) => (prev + 1) % QURAN_QUOTES.length);
        }, 15000);
        return () => clearInterval(quoteTimer);
    }, []);

    useEffect(() => {
        let index = 0;
        setDisplayedText('');
        const activeQuote = QURAN_QUOTES[currentQuoteIndex];
        const typingTimer = setInterval(() => {
            if (index < activeQuote.length) {
                setDisplayedText((prev) => prev + activeQuote.charAt(index));
                index++;
            } else {
                clearInterval(typingTimer);
            }
        }, 30);
        return () => clearInterval(typingTimer);
    }, [currentQuoteIndex]);

    // Google Search logic
    const [searchQuery, setSearchQuery] = useState('');

    const query = searchQuery.toLowerCase().trim();

    // Normalize helper for robust spelling comparison (removing hyphens, spaces, etc)
    const normalizeStr = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedQuery = normalizeStr(query);

    // 1. Match Quran Verses (Ayat Suci Al Quran)
    // Parse formats like: "Al-Fatihah 5", "1:5", "surah 1 ayat 5", "2:255"
    const matchVerse = query.match(/^(.+?)(?:\s+(?:ayat|verse))?\s*(?::|\s)\s*(\d+)$/i);
    let matchedVerses: Array<{
        chapterId: number;
        chapterName: string;
        verseNumber: number;
        translatedChapterName: string;
    }> = [];

    if (matchVerse) {
        const potentialSurahIdentifier = matchVerse[1].trim();
        const verseNumber = parseInt(matchVerse[2], 10);

        // Strip out the word "surah", "sura", or "surat" if the user prefixed it
        const cleanIdentifier = potentialSurahIdentifier.replace(/^(?:surah|sura|surat)\s+/i, '').trim();

        const targetChapter = chapters.find(ch =>
            normalizeStr(ch.name_complex).includes(normalizeStr(cleanIdentifier)) ||
            normalizeStr(ch.translated_name.name).includes(normalizeStr(cleanIdentifier)) ||
            ch.id.toString() === cleanIdentifier
        );

        if (targetChapter && verseNumber >= 1 && verseNumber <= targetChapter.verses_count) {
            matchedVerses.push({
                chapterId: targetChapter.id,
                chapterName: targetChapter.name_complex,
                translatedChapterName: targetChapter.translated_name.name,
                verseNumber: verseNumber,
            });
        }
    }

    // 2. Match Quran Chapters (Surah)
    const matchedChapters = query
        ? chapters.filter(ch =>
            normalizeStr(ch.name_complex).includes(normalizedQuery) ||
            normalizeStr(ch.translated_name.name).includes(normalizedQuery) ||
            ch.id.toString() === query
        ).slice(0, 5)
        : [];

    // 3. Match Classrooms
    const matchedClassrooms = query
        ? classrooms.filter(cls =>
            cls.name.toLowerCase().includes(query) ||
            cls.type.toLowerCase().includes(query)
        ).slice(0, 5)
        : [];

    // 4. Match Students
    const matchedStudents = query
        ? students.filter(st =>
            st.name.toLowerCase().includes(query) ||
            st.nis.includes(query)
        ).slice(0, 5)
        : [];

    const hasResults = matchedChapters.length > 0 || matchedClassrooms.length > 0 || matchedStudents.length > 0 || matchedVerses.length > 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard - 3T Al Quran" />

            <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">

                {/* Google-like Search Bar Card */}
                <div className="text-center py-10 max-w-3xl mx-auto w-full relative">
                    <h2 className="text-xl font-bold text-neutral-500 dark:text-neutral-400 mb-4 font-arabic select-none tracking-wide">
                        بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                    </h2>

                    <div className="relative group">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5">
                            <Search className="h-6 w-6 text-neutral-400 group-focus-within:text-emerald-600 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari nama murid, kelas, atau ayat suci Al Quran..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-14 pr-16 py-4.5 bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-full text-base md:text-lg placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-lg hover:shadow-xl focus:shadow-2xl transition duration-300 dark:text-white"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute inset-y-0 right-0 pr-6 flex items-center text-xs font-semibold text-neutral-400 hover:text-emerald-650 cursor-pointer"
                            >
                                Bersihkan
                            </button>
                        )}
                    </div>

                    <p className="text-[10px] text-neutral-450 dark:text-neutral-500 mt-2.5">
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">Tips pencarian:</span> Ketik <span className="italic font-mono">"Ahmad"</span> untuk murid, <span className="italic font-mono">"7A"</span> untuk kelas, atau <span className="italic font-mono">"Al-Baqarah 255"</span> / <span className="italic font-mono">"2:255"</span> untuk ayat Al Quran.
                    </p>

                    {/* Google Autocomplete Results List */}
                    {searchQuery.trim() !== '' && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl overflow-hidden z-30 max-h-96 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800 text-left">

                            {/* Verse Matches */}
                            {matchedVerses.length > 0 && (
                                <div className="p-3.5 bg-emerald-50/10 dark:bg-emerald-950/5">
                                    <h3 className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <BookOpenCheck className="h-3.5 w-3.5 text-emerald-650" /> Ayat Al Quran
                                    </h3>
                                    <div className="space-y-1">
                                        {matchedVerses.map((v, idx) => (
                                            <Link
                                                key={idx}
                                                href={route('quran.show', { id: v.chapterId }) + `?verse=${v.verseNumber}`}
                                                className="block px-3 py-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 rounded-lg text-xs transition flex items-center justify-between"
                                            >
                                                <div>
                                                    <span className="font-semibold text-neutral-850 dark:text-neutral-200">
                                                        Surah {v.chapterName} Ayat {v.verseNumber}
                                                    </span>
                                                    <span className="text-neutral-400 text-[10px] block mt-0.5">
                                                        Buka ayat ini di Al Quran digital
                                                    </span>
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-neutral-400" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Surah Matches */}
                            {matchedChapters.length > 0 && (
                                <div className="p-3.5">
                                    <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <BookOpen className="h-3.5 w-3.5 text-emerald-650" /> Surah Al Quran
                                    </h3>
                                    <div className="space-y-1">
                                        {matchedChapters.map((ch) => (
                                            <Link
                                                key={ch.id}
                                                href={route('quran.show', { id: ch.id })}
                                                className="block px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 rounded-lg text-xs transition flex items-center justify-between"
                                            >
                                                <span className="font-semibold text-neutral-850 dark:text-neutral-200">{ch.id}. {ch.name_complex}</span>
                                                <span className="text-neutral-400 text-[10px] italic">{ch.translated_name.name}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Class Matches */}
                            {matchedClassrooms.length > 0 && (
                                <div className="p-3.5">
                                    <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <School className="h-3.5 w-3.5 text-purple-600" /> Kelas 3T
                                    </h3>
                                    <div className="space-y-1">
                                        {matchedClassrooms.map((cls) => (
                                            <Link
                                                key={cls.id}
                                                href={route('classrooms.index')}
                                                className="block px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 rounded-lg text-xs transition flex items-center justify-between"
                                            >
                                                <span className="font-semibold text-neutral-850 dark:text-neutral-200">{cls.name}</span>
                                                <span className="text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 px-2 py-0.5 rounded-full">{cls.type}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Student Matches */}
                            {matchedStudents.length > 0 && (
                                <div className="p-3.5">
                                    <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <Users className="h-3.5 w-3.5 text-amber-600" /> Murid
                                    </h3>
                                    <div className="space-y-1">
                                        {matchedStudents.map((st) => (
                                            <Link
                                                key={st.id}
                                                href={route('reading-histories.index') + `?search=${st.name}`}
                                                className="block px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 rounded-lg text-xs transition flex items-center justify-between"
                                            >
                                                <span className="font-semibold text-neutral-850 dark:text-neutral-200">{st.name}</span>
                                                <span className="text-neutral-400 text-[10px] font-mono">NIS: {st.nis}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* No results match */}
                            {!hasResults && (
                                <div className="p-6 text-center text-xs text-neutral-450 italic">
                                    Tidak ada murid, kelas, atau ayat/Surah yang cocok dengan pencarian "{searchQuery}"
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Greeting Banner */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 to-emerald-950 p-8 text-white shadow-xl">
                    <div className="absolute inset-0 opacity-5 pointer-events-none">
                        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                            <pattern id="islamic-grid-dashboard" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 20 0 L 40 20 L 20 40 L 0 20 Z" fill="none" stroke="#ffffff" strokeWidth="1" />
                            </pattern>
                            <rect width="100%" height="100%" fill="url(#islamic-grid-dashboard)" />
                        </svg>
                    </div>

                    <div className="relative z-10 space-y-2">
                        <span className="text-amber-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                            <GraduationCap className="h-4 w-4" />
                            Selamat Datang
                        </span>
                        <h1 className="text-3xl font-extrabold tracking-tight">
                            {teacherName}
                        </h1>
                        <div className="text-emerald-100/90 max-w-2xl text-sm leading-relaxed min-h-[3rem] md:min-h-[2.5rem] flex items-center">
                            <p className="italic font-medium">
                                {displayedText}
                                <span className="inline-block w-1.5 h-4 ml-1 bg-amber-400 animate-pulse align-middle" />
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Class Count Card */}
                    <Card className="border-neutral-200/60 dark:border-neutral-800 hover:border-emerald-600/40 transition duration-300 rounded-2xl bg-white dark:bg-neutral-900">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Total Kelas Anda</CardTitle>
                            <LayoutGrid className="h-5 w-5 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-extrabold text-neutral-800 dark:text-neutral-100">{classCount}</div>
                            <p className="text-[10px] text-neutral-400 mt-1">Kelas Takhasus, Tahsin, dan Tahfizh yang Anda kelola</p>
                        </CardContent>
                    </Card>

                    {/* Student Count Card */}
                    <Card className="border-neutral-200/60 dark:border-neutral-800 hover:border-emerald-600/40 transition duration-300 rounded-2xl bg-white dark:bg-neutral-900">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Total Murid Anda</CardTitle>
                            <Users className="h-5 w-5 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-extrabold text-neutral-800 dark:text-neutral-100">{studentCount}</div>
                            <p className="text-[10px] text-neutral-400 mt-1">Jumlah murid aktif yang terdaftar di kelas Anda</p>
                        </CardContent>
                    </Card>

                    {/* Logs Count Card */}
                    <Card className="border-neutral-200/60 dark:border-neutral-800 hover:border-emerald-600/40 transition duration-300 rounded-2xl bg-white dark:bg-neutral-900">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Total Catatan Bacaan</CardTitle>
                            <History className="h-5 w-5 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-extrabold text-neutral-800 dark:text-neutral-100">{logCount}</div>
                            <p className="text-[10px] text-neutral-400 mt-1">Total riwayat bacaan yang berhasil Anda catat</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Analytic Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Weekly Activity Chart Card */}
                    <Card className="border-neutral-200/60 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900 shadow-sm">
                        <CardHeader className="pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
                            <CardTitle className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                                <History className="h-4 w-4 text-emerald-600" />
                                Aktivitas Penginputan Catatan (7 Hari Terakhir)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 flex items-center justify-center min-h-[130px]">
                            <BarChart data={weeklyActivity} />
                        </CardContent>
                    </Card>

                    {/* Label Distribution Chart Card */}
                    <Card className="border-neutral-200/60 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900 shadow-sm">
                        <CardHeader className="pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
                            <CardTitle className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Tag className="h-4 w-4 text-emerald-600" />
                                Distribusi Label Hambatan Bacaan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 flex items-center justify-center min-h-[130px]">
                            <DonutChart data={labelDistribution} />
                        </CardContent>
                    </Card>
                </div>

                {/* Active Goals Progress Tracker Widget */}
                <Card className="border-neutral-200/60 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900 shadow-sm">
                    <CardHeader className="pb-3 border-b border-neutral-100 dark:border-neutral-800/80 flex flex-row items-center justify-between">
                        <CardTitle className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                            <BookOpenCheck className="h-4 w-4 text-emerald-650" />
                            Target & Kemajuan Belajar Murid Terkini (Aktif)
                        </CardTitle>
                        <Link
                            href="/student-goals"
                            className="text-[10px] font-bold text-emerald-650 hover:text-emerald-750 flex items-center gap-0.5"
                        >
                            Lihat Semua
                            <ChevronRight className="h-3 w-3" />
                        </Link>
                    </CardHeader>
                    <CardContent className="p-4">
                        {activeGoals.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {activeGoals.map((goal) => {
                                    const progressColor = goal.progress_percentage >= 100 ? 'bg-emerald-650' : 'bg-amber-500';
                                    return (
                                        <div
                                            key={goal.id}
                                            className="border border-neutral-150 dark:border-neutral-800 rounded-2xl p-4 bg-white dark:bg-neutral-950 hover:border-emerald-600/30 transition duration-200 flex flex-col justify-between gap-3"
                                        >
                                            <div>
                                                <div className="flex items-center justify-between">
                                                    <span className={`text-[8px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full ${goal.target_type === 'Takhasus'
                                                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400'
                                                            : goal.target_type === 'Tahsin'
                                                                ? 'bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400'
                                                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                                        }`}>
                                                        {goal.target_type} • {goal.classroom?.name}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-emerald-655 dark:text-emerald-450">
                                                        {goal.progress_percentage}%
                                                    </span>
                                                </div>
                                                <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 mt-2 line-clamp-1">
                                                    {goal.target_name}
                                                </h4>
                                                <p className="text-[10px] text-neutral-450 mt-0.5">
                                                    Murid: <strong className="font-semibold text-neutral-700 dark:text-neutral-300">{goal.student?.name}</strong>
                                                </p>
                                            </div>

                                            <div className="space-y-1 mt-1">
                                                <div className="h-1.5 w-full bg-neutral-150 dark:bg-neutral-850 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-300 ${progressColor}`}
                                                        style={{ width: `${goal.progress_percentage}%` }}
                                                    />
                                                </div>
                                                <div className="flex justify-between items-center text-[9px] text-neutral-400">
                                                    <span>{goal.logged_verses_count} / {goal.total_verses_count} Ayat Terkoreksi</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="py-8 text-center text-xs text-neutral-450 italic">
                                Belum ada target belajar aktif. Silakan tambahkan target belajar baru di menu Target Belajar.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Navigation Panel */}
                <div className="space-y-4">
                    <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Akses Cepat Menu</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Quran Link */}
                        <Link
                            href={route('quran.index')}
                            className="group flex items-center justify-between p-5 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl hover:border-emerald-600 dark:hover:border-emerald-500 bg-white dark:bg-neutral-900 transition duration-300 hover:shadow-md"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                    <BookOpen className="h-5 w-5" />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-bold text-xs text-neutral-800 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">Baca Al Quran</h3>
                                    <p className="text-[9px] text-neutral-400 mt-0.5">Mulai membimbing & catat bacaan</p>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:translate-x-0.5 transition duration-200" />
                        </Link>

                        {/* Classrooms Link */}
                        <Link
                            href={route('classrooms.index')}
                            className="group flex items-center justify-between p-5 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl hover:border-emerald-600 dark:hover:border-emerald-500 bg-white dark:bg-neutral-900 transition duration-300 hover:shadow-md"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                                    <Users className="h-5 w-5" />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-bold text-xs text-neutral-800 dark:text-neutral-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">Manajemen Kelas</h3>
                                    <p className="text-[9px] text-neutral-400 mt-0.5">Kelola kelas, murid & label</p>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:translate-x-0.5 transition duration-200" />
                        </Link>

                        {/* Reading Histories Link */}
                        <Link
                            href={route('reading-histories.index')}
                            className="group flex items-center justify-between p-5 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl hover:border-emerald-600 dark:hover:border-emerald-500 bg-white dark:bg-neutral-900 transition duration-300 hover:shadow-md"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                                    <History className="h-5 w-5" />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-bold text-xs text-neutral-800 dark:text-neutral-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">Riwayat Bacaan</h3>
                                    <p className="text-[9px] text-neutral-400 mt-0.5">Pantau seluruh catatan evaluasi</p>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:translate-x-0.5 transition duration-200" />
                        </Link>
                    </div>
                </div>

                {/* Explanation of 3T Programs */}
                <div className="border border-neutral-200/80 dark:border-neutral-800 rounded-3xl bg-neutral-50/40 dark:bg-neutral-900/40 p-6">
                    <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">Mengenal Program 3T</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-neutral-600 dark:text-neutral-300">
                        <div className="space-y-1.5">
                            <h4 className="font-bold text-purple-700 dark:text-purple-400">1. Takhasus (Khusus)</h4>
                            <p className="leading-relaxed opacity-85">
                                Program pendalaman khusus untuk peningkatan kualitas bacaan dan akselerasi hafalan dengan pembimbingan personal terstruktur.
                            </p>
                        </div>
                        <div className="space-y-1.5">
                            <h4 className="font-bold text-teal-700 dark:text-teal-400">2. Tahsin (Perbaikan)</h4>
                            <p className="leading-relaxed opacity-85">
                                Program fokus pada perbaikan makharijul huruf, sifat huruf, panjang pendek (mad), dan hukum tajwid agar bacaan sesuai kaidah.
                            </p>
                        </div>
                        <div className="space-y-1.5">
                            <h4 className="font-bold text-amber-700 dark:text-amber-400">3. Tahfizh (Hafalan)</h4>
                            <p className="leading-relaxed opacity-85">
                                Program penambahan hafalan baru (sabaq) dan pemeliharaan hafalan lama (sabaqi dan manzil) untuk menjaga kualitas memori ayat.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
