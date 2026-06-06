import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { BookOpen, ArrowLeft, Check, Users, AlertCircle, AlertTriangle, ChevronDown, Search } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

interface CustomLabel {
    id: number;
    classroom_id: number;
    name: string;
}

interface Student {
    id: number;
    nis: string;
    name: string;
}

interface Classroom {
    id: number;
    name: string;
    type: 'Takhasus' | 'Tahsin' | 'Tahfizh';
    description: string;
    students: Student[];
    custom_labels: CustomLabel[];
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

interface Verse {
    id: number;
    verse_number: number;
    verse_key: string;
    text_uthmani: string;
    translations: {
        id: number;
        text: string;
    }[];
}

interface CorrectionLabel {
    id: number;
    name: string;
    color: string;
}

interface QuranShowProps {
    chapter: Chapter;
    verses: Verse[];
    classrooms: Classroom[];
    correctionLabels: CorrectionLabel[];
    chapters: Chapter[];
}

interface StudentOption {
    studentId: string;
    studentName: string;
    studentNis: string;
    classroomId: string;
    classroomName: string;
    classroomType: string;
}

interface StudentClassSelectProps {
    value: { studentId: string; classroomId: string } | null;
    onChange: (val: { studentId: string; classroomId: string } | null) => void;
    options: StudentOption[];
    placeholder: string;
}

function StudentClassSelect({ value, onChange, options, placeholder }: StudentClassSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const selectedOption = value
        ? options.find((opt) => opt.studentId === value.studentId && opt.classroomId === value.classroomId)
        : null;

    const filteredOptions = options.filter((opt) =>
        opt.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opt.studentNis.includes(searchTerm) ||
        opt.classroomName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        if (!isOpen) return;
        const handleOutsideClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.searchable-student-class-select-container')) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };
        document.addEventListener('click', handleOutsideClick);
        return () => document.removeEventListener('click', handleOutsideClick);
    }, [isOpen]);

    return (
        <div className="relative w-full sm:w-80 searchable-student-class-select-container">
            <div className="relative">
                <input
                    type="text"
                    placeholder={placeholder}
                    value={isOpen ? searchTerm : (selectedOption ? `${selectedOption.studentName} (${selectedOption.classroomName})` : '')}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        if (!isOpen) setIsOpen(true);
                    }}
                    onFocus={() => {
                        setIsOpen(true);
                        setSearchTerm('');
                    }}
                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 pr-10 cursor-pointer select-none font-medium text-neutral-850 dark:text-neutral-200"
                    readOnly={!isOpen}
                />
                {selectedOption && !isOpen ? (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onChange(null);
                        }}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-semibold text-neutral-400 hover:text-red-500 cursor-pointer"
                    >
                        Batal
                    </button>
                ) : (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-neutral-400">
                        <ChevronDown className="h-4 w-4" />
                    </span>
                )}
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-lg max-h-72 overflow-y-auto p-1.5 space-y-0.5">
                    <div className="p-1 border-b border-neutral-100 dark:border-neutral-800/80 mb-1 flex items-center gap-1.5 sticky top-0 bg-white dark:bg-neutral-900 z-10">
                        <Search className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                        <input
                            type="text"
                            placeholder="Ketik nama murid atau kelas..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent border-0 text-xs focus:ring-0 focus:outline-none p-1 placeholder:text-neutral-450 dark:text-white"
                            autoFocus
                        />
                    </div>

                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((opt, idx) => {
                            const isSelected = value?.studentId === opt.studentId && value?.classroomId === opt.classroomId;
                            return (
                                <button
                                    key={`${opt.studentId}-${opt.classroomId}-${idx}`}
                                    type="button"
                                    onClick={() => {
                                        onChange({ studentId: opt.studentId, classroomId: opt.classroomId });
                                        setIsOpen(false);
                                        setSearchTerm('');
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition duration-150 flex flex-col ${
                                        isSelected
                                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold'
                                            : 'hover:bg-neutral-50 dark:hover:bg-neutral-850/60 text-neutral-700 dark:text-neutral-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-2 w-full">
                                        <span className="font-bold truncate">{opt.studentName}</span>
                                        <span className="text-[9px] font-mono text-neutral-400">NIS: {opt.studentNis}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] text-neutral-450 dark:text-neutral-500 mt-0.5">
                                        <span>Kelas: {opt.classroomName}</span>
                                        <span className="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.2 rounded uppercase text-[8px] tracking-wide font-bold">
                                            {opt.classroomType}
                                        </span>
                                    </div>
                                </button>
                            );
                        })
                    ) : (
                        <div className="text-center py-4 text-xs text-neutral-450 italic">
                            Tidak ada murid atau kelas yang cocok
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

const labelColors: Record<string, string> = {
    merah: 'bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-900/50',
    kuning: 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/50',
    hijau: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50',
    hitam: 'bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800',
    biru: 'bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-900/50',
    orange: 'bg-orange-50 dark:bg-orange-950/30 text-orange-850 dark:text-orange-300 border-orange-200 dark:border-orange-900/50',
    ungu: 'bg-purple-50 dark:bg-purple-950/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-900/50',
};

export default function QuranShow({ 
    chapter, 
    verses = [], 
    classrooms = [], 
    correctionLabels = [], 
    chapters = [] 
}: QuranShowProps) {
    const [selectedClassroomId, setSelectedClassroomId] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return new URLSearchParams(window.location.search).get('classroom_id') || '';
        }
        return '';
    });
    const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return new URLSearchParams(window.location.search).get('student_id') || '';
        }
        return '';
    });

    // Build flat list of student options across all classrooms
    const studentOptions: StudentOption[] = classrooms.flatMap((cls) =>
        cls.students.map((student) => ({
            studentId: student.id.toString(),
            studentName: student.name,
            studentNis: student.nis,
            classroomId: cls.id.toString(),
            classroomName: cls.name,
            classroomType: cls.type,
        }))
    );
    const [activeClassroom, setActiveClassroom] = useState<Classroom | null>(null);
    const [highlightedVerse, setHighlightedVerse] = useState<number | null>(null);
    
    // Modal State
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [modalContext, setModalContext] = useState<{
        verseNumber: number;
        wordPosition?: number;
        wordText?: string;
    } | null>(null);
    const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

    // Form logic
    const { data, setData, post, processing, reset, errors } = useForm({
        student_id: '',
        classroom_id: '',
        surah_number: chapter.id,
        verse_number: 1,
        word_position: '' as string | number,
        word_text: '',
        comments: '',
        labels: [] as string[],
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Al Quran', href: '/quran' },
        { title: chapter.name_complex, href: `/quran/${chapter.id}` },
    ];

    // Track active classroom changes to update students selection and set custom labels
    useEffect(() => {
        if (selectedClassroomId) {
            const cls = classrooms.find((c) => c.id.toString() === selectedClassroomId);
            setActiveClassroom(cls || null);
            // Only reset student if the current selected student is not enrolled in this classroom
            const hasStudent = cls?.students.some((s) => s.id.toString() === selectedStudentId);
            if (!hasStudent) {
                setSelectedStudentId('');
            }
        } else {
            setActiveClassroom(null);
            setSelectedStudentId('');
        }
    }, [selectedClassroomId, classrooms]);

    // Scroll and highlight target verse when redirected from history
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const targetVerse = params.get('verse');
        if (targetVerse && verses.length > 0) {
            const verseNum = parseInt(targetVerse, 10);
            setHighlightedVerse(verseNum);

            // Scroll to target element with a slight delay to allow rendering
            const scrollTimer = setTimeout(() => {
                const element = document.getElementById(`verse-container-${verseNum}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 400);

            // Clear highlight after 4 seconds
            const highlightTimer = setTimeout(() => {
                setHighlightedVerse(null);
            }, 4000);

            return () => {
                clearTimeout(scrollTimer);
                clearTimeout(highlightTimer);
            };
        }
    }, [verses]);

    // Handle clicking a word
    const handleWordClick = (verseNumber: number, wordIndex: number, wordText: string) => {
        if (!selectedClassroomId || !selectedStudentId) {
            alert('Silakan pilih Kelas dan Murid terlebih dahulu pada menu di atas halaman!');
            return;
        }

        setModalContext({
            verseNumber,
            wordPosition: wordIndex + 1,
            wordText: wordText.replace(/[^\u0600-\u06FF\s]/g, ''), // Strip out punctuation if any
        });
        setSelectedLabels([]);
        
        setData({
            student_id: selectedStudentId,
            classroom_id: selectedClassroomId,
            surah_number: chapter.id,
            verse_number: verseNumber,
            word_position: wordIndex + 1,
            word_text: wordText.replace(/[^\u0600-\u06FF\s]/g, ''),
            comments: '',
            labels: [],
        });
        
        setIsLogModalOpen(true);
    };

    // Handle double clicking a verse number
    const handleVerseDoubleClick = (verseNumber: number) => {
        if (!selectedClassroomId || !selectedStudentId) {
            alert('Silakan pilih Kelas dan Murid terlebih dahulu pada menu di atas halaman!');
            return;
        }

        setModalContext({
            verseNumber,
        });
        setSelectedLabels([]);

        setData({
            student_id: selectedStudentId,
            classroom_id: selectedClassroomId,
            surah_number: chapter.id,
            verse_number: verseNumber,
            word_position: '',
            word_text: '',
            comments: '',
            labels: [],
        });

        setIsLogModalOpen(true);
    };

    const handleLabelChange = (labelName: string, checked: boolean) => {
        let updated: string[];
        if (checked) {
            updated = [...selectedLabels, labelName];
        } else {
            updated = selectedLabels.filter((l) => l !== labelName);
        }
        setSelectedLabels(updated);
        setData('labels', updated);
    };

    const submitLog = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('reading-histories.store'), {
            onSuccess: () => {
                setIsLogModalOpen(false);
                reset('comments', 'labels', 'word_position', 'word_text');
            },
        });
    };

    // Helper to render HTML translation safely
    const createMarkup = (htmlContent: string) => {
        return { __html: htmlContent };
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Surah ${chapter.name_complex} - Al Quran 3T`} />

            <div className="flex h-[calc(100vh-4rem)] overflow-hidden w-full">
                {/* Left Side Quick Navigation (hidden on mobile, visible on desktop) */}
                <div className="hidden lg:flex w-64 border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 flex-col">
                    <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-emerald-600" />
                        Daftar Surah
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {chapters.map((ch) => {
                            const isCurrent = ch.id === chapter.id;
                            return (
                                <Link
                                    key={ch.id}
                                    href={route('quran.show', { id: ch.id })}
                                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition duration-200 ${
                                        isCurrent
                                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold border-l-4 border-emerald-600'
                                            : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
                                    }`}
                                >
                                    <span className="truncate">{ch.id}. {ch.name_complex}</span>
                                    <span className="font-arabic font-bold text-neutral-500 group-hover:text-emerald-600">{ch.name_arabic}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Right Side Quran Reader Area */}
                <div className="flex-1 flex flex-col h-full bg-white dark:bg-neutral-950 overflow-hidden">
                    {/* Sticky Context Bar */}
                    <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur-md flex flex-col md:flex-row items-center gap-4 z-20">
                        <Link
                            href={route('quran.index')}
                            className="mr-auto flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-emerald-600 transition"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke Daftar Surah
                        </Link>

                        {/* Context selectors (Single Searchable Student/Class Selector) */}
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                            <StudentClassSelect
                                value={
                                    selectedStudentId && selectedClassroomId
                                        ? { studentId: selectedStudentId, classroomId: selectedClassroomId }
                                        : null
                                }
                                onChange={(val) => {
                                    if (val) {
                                        setSelectedClassroomId(val.classroomId);
                                        setSelectedStudentId(val.studentId);
                                    } else {
                                        setSelectedClassroomId('');
                                        setSelectedStudentId('');
                                    }
                                }}
                                options={studentOptions}
                                placeholder="Ketik nama murid untuk menilai..."
                            />
                        </div>
                    </div>

                    {/* Surah Verses Container */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 max-w-4xl mx-auto w-full">
                        {/* Surah Header Card */}
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 to-emerald-950 p-6 text-white text-center shadow-lg">
                            <div className="absolute inset-0 opacity-5 pointer-events-none">
                                <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                                    <pattern id="islamic-grid-show" width="30" height="30" patternUnits="userSpaceOnUse">
                                        <path d="M 15 0 L 30 15 L 15 30 L 0 15 Z" fill="none" stroke="#ffffff" strokeWidth="0.5" />
                                    </pattern>
                                    <rect width="100%" height="100%" fill="url(#islamic-grid-show)" />
                                </svg>
                            </div>
                            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">Surah ke-{chapter.id}</span>
                            <h2 className="text-3xl font-extrabold font-arabic mt-1">{chapter.name_arabic}</h2>
                            <h3 className="text-xl font-bold mt-1 text-emerald-100">{chapter.name_complex}</h3>
                            <p className="text-xs text-emerald-200 mt-2 capitalize">
                                {chapter.revelation_place} • {chapter.verses_count} Ayat
                            </p>
                        </div>

                        {/* Interactive Info Banner */}
                        {selectedClassroomId && selectedStudentId && (
                            <div className="bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                                <Users className="h-4 w-4 mt-0.5 text-emerald-600" />
                                <div>
                                    <p className="font-semibold">Mode Penilaian Aktif</p>
                                    <p className="mt-0.5 opacity-80">
                                        Menilai murid <strong className="text-emerald-950 dark:text-emerald-100 font-bold">{activeClassroom?.students.find(s => s.id.toString() === selectedStudentId)?.name}</strong> pada kelas <strong>{activeClassroom?.name}</strong>.
                                    </p>
                                    <p className="mt-1 text-[10px] text-amber-600 dark:text-amber-400">
                                        * Klik sebuah kata arab untuk memberi catatan kata, atau klik 2x nomor di akhir ayat untuk memberi catatan ayat lengkap.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Bismillah (skip for Al-Fatihah and At-Tawbah, though Al-Fatihah is chapter 1 and includes it in verse 1) */}
                        {chapter.id !== 1 && chapter.id !== 9 && (
                            <div className="py-6 text-center font-arabic text-2xl text-neutral-800 dark:text-neutral-100">
                                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                            </div>
                        )}

                        {/* Verses List */}
                        <div className="divide-y divide-neutral-100 dark:divide-neutral-900">
                            {verses.map((verse) => {
                                const arabicWords = verse.text_uthmani.split(' ');
                                const isHighlighted = highlightedVerse === verse.verse_number;
                                return (
                                    <div
                                            key={verse.id}
                                            id={`verse-container-${verse.verse_number}`}
                                            className={`py-8 space-y-4 px-3 rounded-2xl transition duration-500 ${
                                                isHighlighted
                                                    ? 'bg-amber-100/30 dark:bg-amber-950/20 border border-amber-400/60 shadow-lg shadow-amber-500/5 animate-[pulse_2s_infinite]'
                                                    : 'hover:bg-neutral-50/30 dark:hover:bg-neutral-900/10'
                                            }`}
                                        >
                                        {/* Verse Arabic Text (Right Aligned) */}
                                        <div className="text-right flex flex-wrap flex-row-reverse gap-y-3 justify-start items-center leading-[3rem]">
                                            {arabicWords.map((word, wordIdx) => (
                                                <span
                                                    key={wordIdx}
                                                    onClick={() => handleWordClick(verse.verse_number, wordIdx, word)}
                                                    className={`font-arabic text-3xl font-bold cursor-pointer px-1 rounded transition duration-200 ${
                                                        selectedClassroomId && selectedStudentId
                                                            ? 'hover:bg-emerald-100 dark:hover:bg-emerald-900/50 hover:text-emerald-900 dark:hover:text-emerald-100'
                                                            : 'cursor-default'
                                                    }`}
                                                >
                                                    {word}
                                                </span>
                                            ))}

                                            {/* Verse End Marker (Double Clickable) */}
                                            <div 
                                                onDoubleClick={() => handleVerseDoubleClick(verse.verse_number)}
                                                className={`inline-flex relative items-center justify-center h-10 w-10 shrink-0 font-arabic select-none cursor-pointer mx-2 rounded-full border border-amber-600/30 text-amber-600 dark:text-amber-500 text-xs font-bold transition hover:bg-amber-500/15 ${
                                                    selectedClassroomId && selectedStudentId ? 'cursor-pointer' : 'cursor-default'
                                                }`}
                                                title="Klik 2x untuk beri catatan ayat"
                                            >
                                                {verse.verse_number}
                                            </div>
                                        </div>

                                        {/* Translation Text (Left Aligned) */}
                                        <div className="text-left text-neutral-600 dark:text-neutral-300 text-sm pl-4 border-l-2 border-neutral-200 dark:border-neutral-800">
                                            <div className="font-semibold text-neutral-400 text-xs mb-1">
                                                Ayat {verse.verse_number}
                                            </div>
                                            <div 
                                                dangerouslySetInnerHTML={createMarkup(verse.translations[0]?.text || '')} 
                                                className="prose dark:prose-invert max-w-none text-xs leading-relaxed"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Assessment Comment Modal */}
            <Dialog open={isLogModalOpen} onOpenChange={setIsLogModalOpen}>
                <DialogContent className="max-w-md rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-emerald-600" />
                            Tambah Catatan Bacaan
                        </DialogTitle>
                    </DialogHeader>

                    {modalContext && (
                        <form onSubmit={submitLog} className="space-y-4 mt-2">
                            <div className="bg-neutral-50 dark:bg-neutral-950 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 text-xs space-y-1">
                                <div>
                                    <span className="text-neutral-400">Murid: </span>
                                    <strong className="text-neutral-800 dark:text-neutral-200 font-bold">
                                        {activeClassroom?.students.find(s => s.id.toString() === selectedStudentId)?.name}
                                    </strong>
                                </div>
                                <div>
                                    <span className="text-neutral-400">Kelas: </span>
                                    <strong className="text-neutral-800 dark:text-neutral-200 font-bold">{activeClassroom?.name} ({activeClassroom?.type})</strong>
                                </div>
                                <div>
                                    <span className="text-neutral-400">Posisi: </span>
                                    <strong className="text-neutral-800 dark:text-neutral-200 font-bold">
                                        Surah {chapter.name_complex}, Ayat {modalContext.verseNumber}
                                        {modalContext.wordPosition && ` (Kata ke-${modalContext.wordPosition})`}
                                    </strong>
                                </div>
                                {modalContext.wordText && (
                                    <div className="flex items-center gap-1.5 mt-1 pt-1.5 border-t border-neutral-200/40 dark:border-neutral-800/40">
                                        <span className="text-neutral-400">Lafaz: </span>
                                        <strong className="text-lg font-arabic text-emerald-600 font-bold leading-none">{modalContext.wordText}</strong>
                                    </div>
                                )}
                            </div>

                            {/* Correction Labels */}
                            <div className="space-y-2">
                                <Label className="text-xs text-neutral-400">Pilih Label Penilaian (Pendukung Komentar)</Label>
                                <div className="grid grid-cols-2 gap-2 bg-neutral-50/50 dark:bg-neutral-950/20 p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-800 max-h-36 overflow-y-auto">
                                    {correctionLabels.map((label) => {
                                        const isChecked = selectedLabels.includes(label.name);
                                        const colorClass = labelColors[label.color] || labelColors['hitam'];
                                        return (
                                            <div key={label.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`label-${label.id}`}
                                                    checked={isChecked}
                                                    onCheckedChange={(checked) => handleLabelChange(label.name, checked === true)}
                                                    className="border-neutral-300 dark:border-neutral-700 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                                                />
                                                <Label 
                                                    htmlFor={`label-${label.id}`} 
                                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${colorClass} cursor-pointer truncate max-w-[140px]`}
                                                    title={label.name}
                                                >
                                                    {label.name}
                                                </Label>
                                            </div>
                                        );
                                    })}
                                    {correctionLabels.length === 0 && (
                                        <p className="col-span-2 text-[10px] text-neutral-400 italic">
                                            Belum ada label koreksi yang ditambahkan. Tambahkan di menu Pengaturan Label.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Comment Text Area */}
                            <div className="space-y-1.5">
                                <Label htmlFor="comments" className="text-xs text-neutral-400">Tulis Catatan / Komentar Guru</Label>
                                <Textarea
                                    id="comments"
                                    rows={3}
                                    placeholder="Contoh: Bacaan makhraj kurang sempurna pada huruf 'ha'..."
                                    value={data.comments}
                                    onChange={(e) => setData('comments', e.target.value)}
                                    className="w-full bg-white dark:bg-neutral-950 border-neutral-300 dark:border-neutral-800 text-xs rounded-xl focus:ring-emerald-500 focus:border-emerald-500"
                                />
                                {errors.comments && <p className="text-xs text-red-500 mt-1">{errors.comments}</p>}
                            </div>

                            <DialogFooter className="pt-2 flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsLogModalOpen(false)}
                                    className="text-xs border-neutral-300 dark:border-neutral-800 rounded-xl"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 rounded-xl"
                                    disabled={processing}
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan Catatan'}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
