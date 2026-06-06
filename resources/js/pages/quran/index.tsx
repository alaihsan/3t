import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Search, BookOpen, MapPin, Hash, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface Chapter {
    id: number;
    name_complex: string;
    name_arabic: string;
    translated_name: {
        name: string;
    };
    verses_count: number;
    revelation_place: string;
    revelation_order: number;
}

interface QuranIndexProps {
    chapters: Chapter[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Al Quran',
        href: '/quran',
    },
];

export default function QuranIndex({ chapters = [] }: QuranIndexProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredChapters = chapters.filter((chapter) => {
        const query = searchQuery.toLowerCase();
        return (
            chapter.name_complex.toLowerCase().includes(query) ||
            chapter.translated_name.name.toLowerCase().includes(query) ||
            chapter.name_arabic.includes(query) ||
            chapter.id.toString() === query
        );
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Al Quran - 3T" />

            <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
                {/* Header Banner */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 to-emerald-950 p-8 text-white shadow-xl">
                    <div className="absolute inset-0 opacity-5 pointer-events-none">
                        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                            <pattern id="islamic-grid-header" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 20 0 L 40 20 L 20 40 L 0 20 Z" fill="none" stroke="#ffffff" strokeWidth="1" />
                            </pattern>
                            <rect width="100%" height="100%" fill="url(#islamic-grid-header)" />
                        </svg>
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <BookOpen className="h-8 w-8 text-amber-400" />
                                Al-Qur'anul Karim
                            </h1>
                            <p className="text-emerald-100/80 mt-2 max-w-xl">
                                Hubungkan bacaan murid dengan penilaian kelas Takhasus, Tahsin, dan Tahfizh secara langsung pada setiap ayat dan kata.
                            </p>
                        </div>
                        
                        <div className="relative w-full md:w-80">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Search className="h-5 w-5 text-emerald-400" />
                            </div>
                            <Input
                                type="text"
                                placeholder="Cari Surah (contoh: Al-Fatihah, 1)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-emerald-900/40 border-emerald-700 text-white placeholder:text-emerald-300/60 focus:ring-amber-500 focus:border-amber-500 rounded-xl"
                            />
                        </div>
                    </div>
                </div>

                {/* Grid of Surahs */}
                {filteredChapters.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredChapters.map((chapter) => (
                            <Link 
                                href={route('quran.show', { id: chapter.id })} 
                                key={chapter.id}
                                className="group block"
                            >
                                <Card className="h-full border-neutral-200/60 dark:border-neutral-800 hover:border-emerald-600 dark:hover:border-emerald-500 transition duration-300 hover:shadow-lg hover:shadow-emerald-950/5 hover:-translate-y-0.5 rounded-2xl overflow-hidden bg-white dark:bg-neutral-900">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                        <div className="flex items-center gap-3">
                                            {/* Surah Number Icon with 8-Point Islamic Star border */}
                                            <div className="relative flex h-10 w-10 items-center justify-center shrink-0">
                                                <svg className="absolute inset-0 h-full w-full text-emerald-100 dark:text-emerald-950/80 group-hover:text-emerald-600 transition duration-300" viewBox="0 0 100 100" fill="currentColor">
                                                    <path d="M 50 0 L 65 35 L 100 50 L 65 65 L 50 100 L 35 65 L 0 50 L 35 35 Z" />
                                                </svg>
                                                <span className="relative text-xs font-bold text-emerald-800 dark:text-emerald-400 group-hover:text-white transition duration-300">
                                                    {chapter.id}
                                                </span>
                                            </div>
                                            
                                            <div>
                                                <h3 className="font-semibold text-neutral-800 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition duration-200">
                                                    {chapter.name_complex}
                                                </h3>
                                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                                                    {chapter.translated_name.name}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Arabic Name */}
                                        <span className="font-arabic text-xl text-emerald-700 dark:text-emerald-400 font-bold">
                                            {chapter.name_arabic}
                                        </span>
                                    </CardHeader>
                                    
                                    <CardContent className="pt-0 pb-4 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 border-t border-neutral-100 dark:border-neutral-800/80 mt-2 px-6">
                                        <div className="flex items-center gap-1.5 mt-2">
                                            <MapPin className="h-3.5 w-3.5 text-neutral-400 group-hover:text-emerald-500 transition duration-300" />
                                            <span className="capitalize">{chapter.revelation_place}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-2">
                                            <Hash className="h-3.5 w-3.5 text-neutral-400 group-hover:text-amber-500 transition duration-300" />
                                            <span>{chapter.verses_count} Ayat</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-12 text-center bg-neutral-50 dark:bg-neutral-900 rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800">
                        <Sparkles className="h-10 w-10 text-neutral-400 animate-pulse mb-3" />
                        <h3 className="font-semibold text-neutral-700 dark:text-neutral-300">Surah tidak ditemukan</h3>
                        <p className="text-sm text-neutral-500 mt-1">Gunakan kata kunci pencarian yang lain.</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
