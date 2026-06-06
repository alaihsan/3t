import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { History, Search, BookOpen, Clock, Tag, Trash2, ShieldAlert, Filter, User, BookOpenCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

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

interface ReadingLog {
    id: number;
    student_id: number;
    classroom_id: number;
    surah_number: number;
    verse_number: number;
    word_position: number | null;
    word_text: string | null;
    comments: string | null;
    labels: string[] | null;
    created_at: string;
    student: Student;
    classroom: Classroom;
}

interface CorrectionLabel {
    id: number;
    name: string;
    color: string;
}

interface ReadingHistoryIndexProps {
    histories: ReadingLog[];
    classrooms: Classroom[];
    correctionLabels: CorrectionLabel[];
    filters: {
        search?: string;
        classroom_id?: string;
        type?: string;
    };
}

interface GroupedStudent {
    student: Student;
    logs: ReadingLog[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Riwayat Bacaan Murid',
        href: '/reading-histories',
    },
];

const labelColors: Record<string, string> = {
    merah: 'bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-900/50',
    kuning: 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/50',
    hijau: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50',
    hitam: 'bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800',
    biru: 'bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-900/50',
    orange: 'bg-orange-50 dark:bg-orange-950/30 text-orange-850 dark:text-orange-300 border-orange-200 dark:border-orange-900/50',
    ungu: 'bg-purple-50 dark:bg-purple-950/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-900/50',
};

export default function ReadingHistoryIndex({ 
    histories = [], 
    classrooms = [], 
    correctionLabels = [], 
    filters = {} 
}: ReadingHistoryIndexProps) {
    const [searchVal, setSearchVal] = useState(filters.search || '');
    const [classroomVal, setClassroomVal] = useState(filters.classroom_id || 'all');
    const [typeVal, setTypeVal] = useState(filters.type || 'all');

    // Group logs by student
    const getGroupedStudents = (): GroupedStudent[] => {
        const map = new Map<number, GroupedStudent>();
        histories.forEach((log) => {
            if (!map.has(log.student.id)) {
                map.set(log.student.id, {
                    student: log.student,
                    logs: [],
                });
            }
            map.get(log.student.id)!.logs.push(log);
        });
        return Array.from(map.values());
    };

    const groupedStudents = getGroupedStudents();
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

    // Get currently selected student's data
    const activeGroup = groupedStudents.find((g) => g.student.id === selectedStudentId) || groupedStudents[0] || null;

    // Keep selection valid when histories data changes
    useEffect(() => {
        if (groupedStudents.length > 0) {
            if (!selectedStudentId || !groupedStudents.some((g) => g.student.id === selectedStudentId)) {
                setSelectedStudentId(groupedStudents[0].student.id);
            }
        } else {
            setSelectedStudentId(null);
        }
    }, [histories]);

    // Strict delete modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<ReadingLog | null>(null);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    const deleteForm = useForm();

    const handleFilterChange = (key: string, value: string) => {
        const queryParams: any = {
            search: searchVal,
            classroom_id: classroomVal === 'all' ? '' : classroomVal,
            type: typeVal === 'all' ? '' : typeVal,
        };

        if (key === 'search') queryParams.search = value;
        if (key === 'classroom_id') queryParams.classroom_id = value === 'all' ? '' : value;
        if (key === 'type') queryParams.type = value === 'all' ? '' : value;

        router.get(route('reading-histories.index'), queryParams, {
            preserveState: true,
            replace: true,
        });
    };

    const triggerSearch = () => {
        handleFilterChange('search', searchVal);
    };

    const handleClearFilters = () => {
        setSearchVal('');
        setClassroomVal('all');
        setTypeVal('all');
        router.get(route('reading-histories.index'));
    };

    const triggerDelete = (log: ReadingLog) => {
        setDeleteTarget(log);
        setDeleteConfirmText('');
        setIsDeleteModalOpen(true);
    };

    const executeDelete = () => {
        if (deleteConfirmText !== 'Hapus' || !deleteTarget) return;

        deleteForm.delete(route('reading-histories.destroy', { readingHistory: deleteTarget.id }), {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setDeleteTarget(null);
                setDeleteConfirmText('');
            },
        });
    };

    const formatDateTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Calculate summary stats for the active student
    const getStats = (logs: ReadingLog[]) => {
        const stats = { Takhasus: 0, Tahsin: 0, Tahfizh: 0 };
        logs.forEach((log) => {
            if (log.classroom.type in stats) {
                stats[log.classroom.type]++;
            }
        });
        return stats;
    };

    const activeStats = activeGroup ? getStats(activeGroup.logs) : { Takhasus: 0, Tahsin: 0, Tahfizh: 0 };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Riwayat Bacaan Murid - 3T" />

            <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full h-[calc(100vh-4rem)] overflow-hidden">
                {/* Header */}
                <div className="shrink-0">
                    <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
                        <History className="h-6 w-6 text-emerald-600" />
                        Riwayat Bacaan Murid
                    </h1>
                    <p className="text-xs text-neutral-500 mt-1">
                        Daftar catatan kemajuan membaca murid dikelompokkan secara kategorikal per nama murid.
                    </p>
                </div>

                {/* Filter Controls Bar */}
                <div className="shrink-0 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-center gap-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 shrink-0">
                        <Filter className="h-4 w-4 text-emerald-600" />
                        Saring Data
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 md:flex md:items-center gap-3 w-full md:w-auto md:flex-1">
                        {/* Search Input */}
                        <div className="relative md:w-60">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Search className="h-4 w-4 text-neutral-400" />
                            </div>
                            <Input
                                placeholder="Cari Nama / NIS Murid..."
                                value={searchVal}
                                onChange={(e) => setSearchVal(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && triggerSearch()}
                                className="pl-9 bg-white dark:bg-neutral-950 border-neutral-300 dark:border-neutral-800 text-xs rounded-xl"
                            />
                        </div>

                        {/* Class filter */}
                        <div className="w-full md:w-48">
                            <Select
                                value={classroomVal}
                                onValueChange={(val) => {
                                    setClassroomVal(val);
                                    handleFilterChange('classroom_id', val);
                                }}
                            >
                                <SelectTrigger className="w-full bg-white dark:bg-neutral-950 border-neutral-300 dark:border-neutral-800 text-xs rounded-xl">
                                    <SelectValue placeholder="Pilih Kelas" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Kelas</SelectItem>
                                    {classrooms.map((cls) => (
                                        <SelectItem key={cls.id} value={cls.id.toString()}>
                                            {cls.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Class Type Filter */}
                        <div className="w-full md:w-40">
                            <Select
                                value={typeVal}
                                onValueChange={(val) => {
                                    setTypeVal(val);
                                    handleFilterChange('type', val);
                                }}
                            >
                                <SelectTrigger className="w-full bg-white dark:bg-neutral-950 border-neutral-300 dark:border-neutral-800 text-xs rounded-xl">
                                    <SelectValue placeholder="Pilih Jenis" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Jenis (3T)</SelectItem>
                                    <SelectItem value="Takhasus">Takhasus</SelectItem>
                                    <SelectItem value="Tahsin">Tahsin</SelectItem>
                                    <SelectItem value="Tahfizh">Tahfizh</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 shrink-0 md:ml-auto">
                            <Button
                                onClick={triggerSearch}
                                className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold px-4 active:scale-95 transition"
                            >
                                Terapkan
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleClearFilters}
                                className="border-neutral-300 dark:border-neutral-800 rounded-xl text-xs font-semibold px-3"
                            >
                                Bersihkan
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Side-by-side categorical workspace */}
                <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
                    {/* Left Panel: Students list */}
                    <div className="w-full md:w-80 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900 flex flex-col overflow-hidden shrink-0">
                        <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 font-semibold text-xs text-neutral-500 uppercase tracking-wider">
                            Daftar Murid ({groupedStudents.length})
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            {groupedStudents.map((g) => {
                                const isSelected = activeGroup?.student.id === g.student.id;
                                return (
                                    <button
                                        key={g.student.id}
                                        onClick={() => setSelectedStudentId(g.student.id)}
                                        className={`w-full text-left p-3.5 rounded-xl border transition duration-200 flex flex-col gap-1 ${
                                            isSelected
                                                ? 'bg-emerald-50/50 border-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-500'
                                                : 'bg-white border-neutral-200 hover:bg-neutral-50/60 hover:border-neutral-300 dark:bg-neutral-900 dark:border-neutral-800'
                                        }`}
                                    >
                                        <div className="font-bold text-xs text-neutral-855 dark:text-neutral-200 truncate">
                                            {g.student.name}
                                        </div>
                                        <div className="text-[10px] text-neutral-500 flex items-center justify-between">
                                            <span>NIS: {g.student.nis}</span>
                                            <span className="font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg">
                                                {g.logs.length} Catatan
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                            {groupedStudents.length === 0 && (
                                <div className="text-center py-8 text-neutral-400 text-xs italic">
                                    Tidak ada murid yang sesuai filter.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Panel: Student Reading Logs Detail Timeline */}
                    <div className="flex-1 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900 flex flex-col overflow-hidden">
                        {activeGroup ? (
                            <div className="flex-1 flex flex-col min-h-0">
                                {/* Detail Header */}
                                <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/20 dark:bg-neutral-950/20 shrink-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/40 dark:border-emerald-900 rounded-xl flex items-center justify-center shrink-0">
                                                <User className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                                            </div>
                                            <div>
                                                <h2 className="text-base font-bold text-neutral-800 dark:text-neutral-100">
                                                    {activeGroup.student.name}
                                                </h2>
                                                <p className="text-[10px] text-neutral-500 mt-0.5">
                                                    NIS: {activeGroup.student.nis}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Summarized Badges */}
                                        <div className="flex gap-2">
                                            <span className="text-[10px] font-semibold px-2.5 py-1 bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 rounded-lg">
                                                Takhasus: {activeStats.Takhasus}
                                            </span>
                                            <span className="text-[10px] font-semibold px-2.5 py-1 bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 rounded-lg">
                                                Tahsin: {activeStats.Tahsin}
                                            </span>
                                            <span className="text-[10px] font-semibold px-2.5 py-1 bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 rounded-lg">
                                                Tahfizh: {activeStats.Tahfizh}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Timeline list of logs */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0 bg-neutral-50/15 dark:bg-neutral-900/10">
                                    {activeGroup.logs.map((log) => (
                                        <Card key={log.id} className="border-neutral-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-950 rounded-2xl overflow-hidden hover:shadow-sm transition">
                                            <div className="p-4 space-y-3">
                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                    {/* Location indicator */}
                                                    <Link
                                                        href={route('quran.show', { id: log.surah_number }) + `?verse=${log.verse_number}${log.classroom_id ? `&classroom_id=${log.classroom_id}` : ''}${log.student_id ? `&student_id=${log.student_id}` : ''}`}
                                                        className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 hover:border-emerald-600 dark:hover:border-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 px-3 py-1 rounded-xl w-fit transition cursor-pointer"
                                                        title="Klik untuk lihat bacaan di Al Quran"
                                                    >
                                                        <BookOpenCheck className="h-4 w-4 shrink-0" />
                                                        <span>Surah Ke-{log.surah_number}, Ayat {log.verse_number}</span>
                                                        {log.word_position && (
                                                            <span className="ml-1 px-1.5 py-0.2 bg-emerald-700 text-white rounded text-[9px] leading-tight">
                                                                Kata ke-{log.word_position} {log.word_text && `("${log.word_text}")`}
                                                            </span>
                                                        )}
                                                    </Link>

                                                    <div className="flex items-center gap-3">
                                                        {/* Program Class indicator */}
                                                        <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                                                            log.classroom.type === 'Takhasus' 
                                                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400' 
                                                                : log.classroom.type === 'Tahsin'
                                                                    ? 'bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400'
                                                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                                        }`}>
                                                            {log.classroom.name}
                                                        </span>

                                                        <Trash2
                                                            onClick={() => triggerDelete(log)}
                                                            className="h-4 w-4 text-neutral-400 hover:text-red-600 dark:hover:text-red-500 cursor-pointer transition shrink-0"
                                                            title="Hapus Catatan"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Labels */}
                                                {log.labels && log.labels.length > 0 && (
                                                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                                                        <Tag className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                                                        {log.labels.map((lbl, idx) => {
                                                            const match = correctionLabels.find(c => c.name.toLowerCase() === lbl.toLowerCase());
                                                            const colorClass = match ? (labelColors[match.color] || labelColors['hitam']) : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-250 dark:border-neutral-700';
                                                            return (
                                                                <span key={idx} className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border ${colorClass}`}>
                                                                    {lbl}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                {/* Text Comment */}
                                                {log.comments && (
                                                    <div className="text-xs text-neutral-600 dark:text-neutral-300 bg-neutral-50/50 dark:bg-neutral-900 border border-neutral-150/40 dark:border-neutral-800/40 p-3 rounded-xl leading-relaxed italic">
                                                        "{log.comments}"
                                                    </div>
                                                )}

                                                {/* Date logged footer */}
                                                <div className="text-[10px] text-neutral-400 flex items-center gap-1 pt-1 justify-end">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    <span>Dicatat pada {formatDateTime(log.created_at)}</span>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                    {activeGroup.logs.length === 0 && (
                                        <p className="text-xs text-neutral-400 italic text-center py-12">Belum ada catatan bacaan untuk murid ini.</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-neutral-50/20 dark:bg-neutral-950/10">
                                <History className="h-12 w-12 text-neutral-300 dark:text-neutral-700 mb-3" />
                                <h3 className="font-bold text-neutral-700 dark:text-neutral-300 text-sm">Belum ada data riwayat</h3>
                                <p className="text-xs text-neutral-500 mt-1 max-w-sm">
                                    Catatan kemajuan belajar murid yang Anda simpan di Al Quran akan dikelompokkan secara teratur di sini.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* STRICT DELETE CONFIRMATION DIALOG */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="max-w-md bg-white dark:bg-neutral-900 border border-red-200 dark:border-red-950 rounded-2xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-red-600 dark:text-red-500 flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5" />
                            Konfirmasi Hapus Riwayat
                        </DialogTitle>
                    </DialogHeader>

                    {deleteTarget && (
                        <div className="space-y-4 mt-2">
                            <div className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                                Anda akan menghapus riwayat bacaan milik murid{' '}
                                <strong className="text-neutral-900 dark:text-white font-bold">"{deleteTarget.student.name}"</strong> pada Surah Ke-{deleteTarget.surah_number}, Ayat {deleteTarget.verse_number}.
                                <p className="mt-1 text-red-500 dark:text-red-400 font-semibold">Tindakan ini tidak dapat dibatalkan!</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirm_text" className="text-xs text-neutral-400">
                                    Silakan ketik <strong className="text-neutral-800 dark:text-neutral-200">Hapus</strong> di bawah untuk melanjutkan:
                                </Label>
                                <Input
                                    id="confirm_text"
                                    placeholder="Ketik Hapus..."
                                    value={deleteConfirmText}
                                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                                    className="w-full bg-white dark:bg-neutral-950 border-red-300 dark:border-red-900 text-xs rounded-xl focus:ring-red-500 focus:border-red-500 focus:ring-1"
                                    autoComplete="off"
                                />
                            </div>

                            <DialogFooter className="pt-2 flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsDeleteModalOpen(false);
                                        setDeleteTarget(null);
                                    }}
                                    className="text-xs border-neutral-300 dark:border-neutral-800 rounded-xl"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="button"
                                    onClick={executeDelete}
                                    className="text-xs bg-red-600 hover:bg-red-700 text-white font-bold px-4 rounded-xl disabled:opacity-40"
                                    disabled={deleteConfirmText !== 'Hapus'}
                                >
                                    Hapus Permanen
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
