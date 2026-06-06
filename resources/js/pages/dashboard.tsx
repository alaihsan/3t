import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { BookOpen, Users, History, GraduationCap, ChevronRight, LayoutGrid, Search, BookOpenCheck, School } from 'lucide-react';
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
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({ 
    classCount = 0, 
    studentCount = 0, 
    logCount = 0,
    classrooms = [],
    students = [],
    chapters = []
}: DashboardProps) {
    const { auth } = usePage<SharedData>().props;
    const teacherName = auth.user?.name || 'Ustadz';

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
                            Selamat Datang, Guru
                        </span>
                        <h1 className="text-3xl font-extrabold tracking-tight">
                            {teacherName}
                        </h1>
                        <p className="text-emerald-100/80 max-w-xl text-sm leading-relaxed">
                            Aplikasi **3T** siap membantu Anda dalam memantau, membimbing, dan mencatat kemajuan bacaan Al-Qur'an murid Anda untuk program **Takhasus**, **Tahsin**, dan **Tahfizh**.
                        </p>
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
