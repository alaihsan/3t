import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
import { BookOpen, Users, History, GraduationCap, ChevronRight, LayoutGrid, Search, BookOpenCheck, School, Tag, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';

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

interface Teacher {
    id: number;
    name: string;
    username: string;
    email: string;
    notes_count: number;
    labels_count: number;
}

interface Contribution {
    date: string;
    teacher_id: number;
    notes_count: number;
    labels_count: number;
}

interface ReadingHistory {
    id: number;
    date: string;
    student_name: string;
    classroom_id: number;
    surah_number: number;
    verse_number: number;
    comments: string;
    labels: string[];
    logged_by: number;
    teacher_name: string;
}

interface LabelDistributionItem {
    name: string;
    color: string;
    count: number;
    teacher_id: number;
}

interface DashboardProps {
    classCount: number;
    studentCount: number;
    logCount: number;
    classrooms: Classroom[];
    students: Student[];
    chapters: Chapter[];
    teachers: Teacher[];
    flatContributions: Contribution[];
    labelDistribution: LabelDistributionItem[];
    historiesForGraph: ReadingHistory[];
    activeGoals?: any[];
}


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
    teachers = [],
    flatContributions = [],
    labelDistribution = [],
    historiesForGraph = [],
    activeGoals = []
}: DashboardProps) {
    const { auth } = usePage<SharedData>().props;
    const teacherName = auth.user?.name || 'Ustadz';

    const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
    const [metric, setMetric] = useState<'notes' | 'labels'>('notes');
    const [selectedCellDate, setSelectedCellDate] = useState<string | null>(null);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

    // Format date string to YYYY-MM-DD
    const formatDateString = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    // Calculate dynamic counts lookup map for the grid
    const contributionMap = useMemo(() => {
        const map = new Map<string, number>();
        flatContributions.forEach((contrib) => {
            if (selectedTeacherId === null || contrib.teacher_id === selectedTeacherId) {
                const dateStr = contrib.date;
                const count = metric === 'notes' ? contrib.notes_count : contrib.labels_count;
                map.set(dateStr, (map.get(dateStr) || 0) + count);
            }
        });
        return map;
    }, [flatContributions, selectedTeacherId, metric]);

    // Generate contribution calendar grid (last 365 days ending today)
    const { weeks, monthLabels } = useMemo(() => {
        const range: Date[] = [];
        const today = new Date();
        for (let i = 364; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            range.push(d);
        }

        const weeksGrid: (Date | null)[][] = [];
        let currentWeek: (Date | null)[] = [];

        // Pad start of first week
        const firstDayOfWeek = range[0].getDay();
        for (let i = 0; i < firstDayOfWeek; i++) {
            currentWeek.push(null);
        }

        range.forEach((date) => {
            currentWeek.push(date);
            if (currentWeek.length === 7) {
                weeksGrid.push(currentWeek);
                currentWeek = [];
            }
        });

        if (currentWeek.length > 0) {
            while (currentWeek.length < 7) {
                currentWeek.push(null);
            }
            weeksGrid.push(currentWeek);
        }

        // Compute month labels with column indexes
        const labels: { text: string; colIndex: number }[] = [];
        let lastMonth = -1;
        weeksGrid.forEach((week, wIdx) => {
            const firstDate = week.find((d) => d !== null);
            if (firstDate) {
                const m = firstDate.getMonth();
                if (m !== lastMonth) {
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
                    labels.push({ text: monthNames[m], colIndex: wIdx });
                    lastMonth = m;
                }
            }
        });

        return { weeks: weeksGrid, monthLabels: labels };
    }, []);

    // Get color based on contribution count
    const getCellColor = (count: number) => {
        if (count === 0) return 'bg-neutral-100 dark:bg-neutral-800/60';
        if (count <= 1) return 'bg-emerald-100 dark:bg-emerald-900/30';
        if (count <= 3) return 'bg-emerald-300 dark:bg-emerald-700/50';
        if (count <= 5) return 'bg-emerald-500 dark:bg-emerald-500/80';
        return 'bg-emerald-750 dark:bg-emerald-400';
    };


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
                                                href={route('classrooms.index') + `?classroom_id=${cls.id}`}
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
                <div className="grid grid-cols-1 gap-6">
                    {/* Contribution Calendar Graph */}
                    <Card className="border-neutral-200/60 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900 shadow-md overflow-hidden">
                        <CardHeader className="pb-4 border-b border-neutral-150 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-neutral-50/40 dark:bg-neutral-900/40">
                            <div>
                                <CardTitle className="text-sm font-extrabold text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
                                    <History className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
                                    Grafik Kontribusi Guru & Aktivitas Bimbingan
                                </CardTitle>
                                <p className="text-[10px] text-neutral-450 dark:text-neutral-450 mt-1 font-semibold">
                                    Visualisasi aktivitas penginputan catatan dan pelabelan koreksi dari seluruh guru.
                                </p>
                            </div>
                            
                            {/* Metric and Mode Selectors */}
                            <div className="flex flex-wrap items-center gap-2 select-none self-start sm:self-center">
                                <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-lg p-0.5 text-[10px] font-bold">
                                    <button
                                        type="button"
                                        onClick={() => setMetric('notes')}
                                        className={`px-3 py-1 rounded-md transition-all duration-200 cursor-pointer ${
                                            metric === 'notes'
                                                ? 'bg-white dark:bg-neutral-900 text-emerald-650 dark:text-emerald-400 shadow-xs'
                                                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
                                        }`}
                                    >
                                        Catatan Masuk
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMetric('labels')}
                                        className={`px-3 py-1 rounded-md transition-all duration-200 cursor-pointer ${
                                            metric === 'labels'
                                                ? 'bg-white dark:bg-neutral-900 text-emerald-650 dark:text-emerald-400 shadow-xs'
                                                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
                                        }`}
                                    >
                                        Label Koreksi
                                    </button>
                                </div>
                                {selectedTeacherId !== null && (
                                    <button
                                        type="button"
                                        onClick={() => setSelectedTeacherId(null)}
                                        className="px-2.5 py-1 border border-neutral-200 dark:border-neutral-850 rounded-lg text-[10px] font-bold text-emerald-600 dark:text-emerald-450 hover:bg-neutral-50 dark:hover:bg-neutral-850 cursor-pointer transition duration-150"
                                    >
                                        Semua Guru
                                    </button>
                                )}
                            </div>
                        </CardHeader>
                        
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Calendar Grid area */}
                                <div className="lg:col-span-2 flex flex-col gap-4 overflow-hidden">
                                    <div className="overflow-x-auto pb-4 scrollbar-thin select-none max-w-full">
                                        <div className="flex gap-2 items-start w-max">
                                            {/* Day Labels Column */}
                                            <div className="grid grid-rows-7 gap-[3px] text-[8px] font-extrabold text-neutral-450 dark:text-neutral-500 pt-[18px] h-[105px] pr-1 select-none">
                                                <div className="h-[12px] flex items-center"></div> {/* Min */}
                                                <div className="h-[12px] flex items-center">Sen</div>
                                                <div className="h-[12px] flex items-center"></div> {/* Sel */}
                                                <div className="h-[12px] flex items-center">Rab</div>
                                                <div className="h-[12px] flex items-center"></div> {/* Kam */}
                                                <div className="h-[12px] flex items-center">Jum</div>
                                                <div className="h-[12px] flex items-center"></div> {/* Sab */}
                                            </div>
                                            
                                            {/* Grid Area with Month Header */}
                                            <div className="relative">
                                                {/* Month Labels row */}
                                                <div className="h-[15px] relative text-[8px] font-extrabold text-neutral-450 dark:text-neutral-500 mb-1 select-none">
                                                    {monthLabels.map((lbl, idx) => (
                                                        <div 
                                                            key={idx} 
                                                            className="absolute" 
                                                            style={{ left: `${lbl.colIndex * 15}px` }}
                                                        >
                                                            {lbl.text}
                                                        </div>
                                                    ))}
                                                </div>
                                                
                                                {/* Contribution Grid */}
                                                <div className="grid grid-flow-col grid-rows-7 gap-[3px] h-[105px] w-max">
                                                    <TooltipProvider delayDuration={50}>
                                                        {weeks.flat().map((day, idx) => {
                                                            if (!day) {
                                                                return <div key={`empty-${idx}`} className="w-3 h-3 bg-transparent rounded-[2px]" />;
                                                            }
                                                            
                                                            const dateStr = formatDateString(day);
                                                            const count = contributionMap.get(dateStr) || 0;
                                                            const colorClass = getCellColor(count);
                                                            
                                                            // Find notes for this day (filtered)
                                                            const dayHistories = historiesForGraph.filter(h => h.date === dateStr && (selectedTeacherId === null || h.logged_by === selectedTeacherId));
                                                            
                                                            return (
                                                                <Tooltip key={dateStr}>
                                                                    <TooltipTrigger asChild>
                                                                        <div
                                                                            onClick={() => {
                                                                                if (count > 0) {
                                                                                    setSelectedCellDate(dateStr);
                                                                                    setIsDetailDialogOpen(true);
                                                                                }
                                                                            }}
                                                                            className={`w-3 h-3 rounded-[2px] transition-all duration-200 ${colorClass} ${
                                                                                count > 0 ? 'cursor-pointer hover:scale-110 hover:ring-1 hover:ring-neutral-450 dark:hover:ring-neutral-400' : 'cursor-default'
                                                                            }`}
                                                                        />
                                                                    </TooltipTrigger>
                                                                    <TooltipContent className="p-2.5 max-w-[280px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[10px]">
                                                                        <div className="font-extrabold border-b border-neutral-150 dark:border-neutral-800 pb-1 mb-1 text-[9px] text-neutral-400 dark:text-neutral-500">
                                                                            {day.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <p className="font-bold text-neutral-800 dark:text-neutral-200">
                                                                                {count} {metric === 'notes' ? 'catatan masuk' : 'label koreksi digunakan'}
                                                                            </p>
                                                                            {dayHistories.length > 0 && (
                                                                                <div className="mt-1.5 pt-1.5 border-t border-dashed border-neutral-150 dark:border-neutral-800 text-[8px] leading-relaxed text-neutral-500 dark:text-neutral-400 space-y-1 max-h-[90px] overflow-y-auto">
                                                                                    {dayHistories.slice(0, 3).map((h, hIdx) => {
                                                                                        const surahName = chapters.find(c => c.id === h.surah_number)?.name_complex || h.surah_number;
                                                                                        return (
                                                                                            <div key={h.id} className="border-b border-neutral-50 dark:border-neutral-950 pb-1 last:border-b-0">
                                                                                                <strong className="font-extrabold text-neutral-700 dark:text-neutral-300">{h.teacher_name}</strong>: {h.student_name} ({surahName}:{h.verse_number}) <span className="italic">"{h.comments || 'Tanpa keterangan'}"</span>
                                                                                            </div>
                                                                                        );
                                                                                    })}
                                                                                    {dayHistories.length > 3 && (
                                                                                        <div className="italic text-[8px] font-extrabold text-emerald-605 dark:text-emerald-450 mt-0.5">
                                                                                            + {dayHistories.length - 3} catatan lainnya (klik untuk detail)
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            );
                                                        })}
                                                    </TooltipProvider>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Legend & Summary info */}
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[10px] text-neutral-400 dark:text-neutral-500 border-t border-neutral-100 dark:border-neutral-800/80 pt-3">
                                        <div className="font-semibold text-neutral-500 dark:text-neutral-450">
                                            {selectedTeacherId === null ? (
                                                <span className="flex items-center gap-1">
                                                    <Sparkles className="h-3 w-3 text-amber-500" />
                                                    Menampilkan kontribusi gabungan semua guru
                                                </span>
                                            ) : (
                                                <span>
                                                    Menampilkan kontribusi: <strong className="font-bold text-emerald-650 dark:text-emerald-455">{teachers.find(t => t.id === selectedTeacherId)?.name}</strong>
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5 font-bold self-end sm:self-auto select-none">
                                            <span>Kurang</span>
                                            <span className="h-3 w-3 rounded-[2px] bg-neutral-100 dark:bg-neutral-800/60" />
                                            <span className="h-3 w-3 rounded-[2px] bg-emerald-100 dark:bg-emerald-900/30" />
                                            <span className="h-3 w-3 rounded-[2px] bg-emerald-300 dark:bg-emerald-700/50" />
                                            <span className="h-3 w-3 rounded-[2px] bg-emerald-500 dark:bg-emerald-500/80" />
                                            <span className="h-3 w-3 rounded-[2px] bg-emerald-750 dark:bg-emerald-400" />
                                            <span>Banyak</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Teachers List Card Widget */}
                                <div className="border-t lg:border-t-0 lg:border-l border-neutral-150 dark:border-neutral-800 pt-5 lg:pt-0 lg:pl-6">
                                    <h3 className="text-[10px] font-extrabold text-neutral-450 uppercase tracking-widest mb-3 flex items-center justify-between">
                                        <span>Guru / Kontributor</span>
                                        <Badge variant="secondary" className="text-[8px] font-extrabold px-1.5 py-0">Real Data</Badge>
                                    </h3>
                                    <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin">
                                        {/* All Teachers selection row */}
                                        <div
                                            onClick={() => setSelectedTeacherId(null)}
                                            className={`flex items-center justify-between p-2 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
                                                selectedTeacherId === null
                                                    ? 'border-emerald-500 bg-emerald-50/15 dark:bg-emerald-950/10 shadow-xs'
                                                    : 'border-neutral-150 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="h-7 w-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-extrabold text-[10px] shrink-0">
                                                    ALL
                                                </div>
                                                <div className="text-left">
                                                    <h4 className="text-[11px] font-bold text-neutral-850 dark:text-neutral-200">Semua Guru</h4>
                                                    <p className="text-[8px] text-neutral-400 font-semibold mt-0.5">Gabungan seluruh catatan bimbingan</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="text-[8px] font-bold border-neutral-250 dark:border-neutral-850">
                                                {teachers.reduce((acc, t) => acc + t.notes_count, 0)} Catatan
                                            </Badge>
                                        </div>
                                        
                                        {/* Individual Teachers row */}
                                        {teachers.map((t) => (
                                            <div
                                                key={t.id}
                                                onClick={() => setSelectedTeacherId(t.id)}
                                                className={`flex items-center justify-between p-2 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
                                                    selectedTeacherId === t.id
                                                        ? 'border-emerald-500 bg-emerald-50/15 dark:bg-emerald-950/10 shadow-xs'
                                                        : 'border-neutral-150 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="h-7 w-7 rounded-lg bg-neutral-100 dark:bg-neutral-850 text-neutral-705 dark:text-neutral-350 flex items-center justify-center font-extrabold text-[10px] shrink-0">
                                                        {t.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div className="text-left">
                                                        <h4 className="text-[11px] font-bold text-neutral-850 dark:text-neutral-200">{t.name}</h4>
                                                        <p className="text-[8px] text-neutral-400 font-semibold mt-0.5 truncate max-w-[110px]">{t.email || t.username}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-0.5">
                                                    <Badge variant="outline" className="text-[8px] font-bold border-neutral-250 dark:border-neutral-850">
                                                        {t.notes_count} Catatan
                                                    </Badge>
                                                    <span className="text-[7.5px] text-neutral-400 dark:text-neutral-500 font-extrabold">{t.labels_count} Label</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                     </Card>
                </div>

                {/* Dialog to view detail notes of a specific date */}
                <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
                    <DialogContent className="max-w-md w-full rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 shadow-xl p-5 gap-3">
                        <DialogHeader>
                            <DialogTitle className="text-sm font-extrabold text-neutral-850 dark:text-neutral-100 flex items-center gap-2">
                                <BookOpenCheck className="h-5 w-5 text-emerald-650" />
                                Detail Catatan Bimbingan Quran
                            </DialogTitle>
                            <DialogDescription className="text-[9px] text-neutral-450 dark:text-neutral-500 font-bold uppercase tracking-wider mt-0.5">
                                {selectedCellDate && new Date(selectedCellDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="mt-2 space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                            {historiesForGraph.filter(h => {
                                const matchesDate = h.date === selectedCellDate;
                                const matchesTeacher = selectedTeacherId === null || h.logged_by === selectedTeacherId;
                                return matchesDate && matchesTeacher;
                            }).map((h) => {
                                const surahName = chapters.find(c => c.id === h.surah_number)?.name_complex || h.surah_number;
                                return (
                                    <div 
                                        key={h.id} 
                                        className="p-3 border border-neutral-150 dark:border-neutral-800 rounded-xl bg-neutral-50/20 dark:bg-neutral-950/20 flex flex-col gap-2 hover:border-emerald-600/30 transition duration-150"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-[9px] font-extrabold text-emerald-700 dark:text-emerald-400">
                                                Surah {surahName} • Ayat {h.verse_number}
                                            </span>
                                            <span className="text-[8px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 px-2 py-0.5 rounded-full font-bold">
                                                {h.teacher_name}
                                            </span>
                                        </div>
                                        <div className="text-xs font-semibold text-neutral-850 dark:text-neutral-250">
                                            Murid: <span className="font-extrabold text-neutral-900 dark:text-neutral-100">{h.student_name}</span>
                                        </div>
                                        {h.comments && (
                                            <p className="text-[10px] text-neutral-600 dark:text-neutral-300 italic bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-850 p-2.5 rounded-lg leading-relaxed">
                                                "{h.comments}"
                                            </p>
                                        )}
                                        {h.labels && h.labels.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {h.labels.map((lbl, lblIdx) => (
                                                    <Badge 
                                                        key={lblIdx} 
                                                        variant="outline" 
                                                        className="text-[8px] font-bold text-neutral-500 border-neutral-250 dark:border-neutral-800 px-2 py-0"
                                                    >
                                                        {lbl}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </DialogContent>
                </Dialog>

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
