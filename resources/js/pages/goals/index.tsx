import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Target, Plus, CheckCircle, Clock, Trash2, ShieldAlert, ArrowRight, BookOpen, Award, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface Student {
    id: number;
    name: string;
    nis: string;
}

interface Classroom {
    id: number;
    name: string;
    type: 'Takhasus' | 'Tahsin' | 'Tahfizh';
    students: Student[];
}

interface Chapter {
    id: number;
    name_complex: string;
    name_arabic: string;
}

interface GoalSetoran {
    id: number;
    student_goal_id: number;
    surah_number: number;
    verse_number: number;
    grade: 'A' | 'B' | 'C' | 'D';
    notes?: string;
    created_at: string;
}

interface StudentGoal {
    id: number;
    student_id: number;
    classroom_id: number;
    target_name: string;
    target_type: 'Takhasus' | 'Tahsin' | 'Tahfizh';
    target_surah_start: number;
    target_verse_start: number;
    target_surah_end: number;
    target_verse_end: number;
    status: 'aktif' | 'selesai' | 'dibatalkan';
    student: Student;
    classroom: Classroom;
    total_verses_count: number;
    logged_verses_count: number;
    progress_percentage: number;
    created_at: string;
    setorans: GoalSetoran[];
}

interface GoalsIndexProps {
    goals: StudentGoal[];
    classrooms: Classroom[];
    chapters: Chapter[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Target Belajar',
        href: '/student-goals',
    },
];

export default function GoalsIndex({ goals = [], classrooms = [], chapters = [] }: GoalsIndexProps) {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<StudentGoal | null>(null);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [filterClass, setFilterClass] = useState<string>('all');

    // Create Form
    const createForm = useForm({
        classroom_id: '',
        student_id: '',
        target_name: '',
        target_type: 'Tahfizh' as 'Takhasus' | 'Tahsin' | 'Tahfizh',
        target_surah_start: 1,
        target_verse_start: 1,
        target_surah_end: 1,
        target_verse_end: 7,
    });

    // Setoran Form
    const setoranForm = useForm({
        student_goal_id: '',
        surah_number: 1,
        verse_number: 1,
        grade: 'A' as 'A' | 'B' | 'C' | 'D',
        notes: '',
    });

    const [isSetoranModalOpen, setIsSetoranModalOpen] = useState(false);
    const [selectedGoalForSetoran, setSelectedGoalForSetoran] = useState<StudentGoal | null>(null);
    const [expandedSetoranGoalIds, setExpandedSetoranGoalIds] = useState<Record<number, boolean>>({});

    // Delete Form
    const deleteForm = useForm();

    // Find selected classroom in the form to populate its students list
    const selectedClass = classrooms.find((c) => c.id.toString() === createForm.data.classroom_id);

    // Auto update target type when classroom selection changes
    useEffect(() => {
        if (selectedClass) {
            createForm.setData((prev) => ({
                ...prev,
                target_type: selectedClass.type,
                student_id: '', // Reset student choice
            }));
        }
    }, [createForm.data.classroom_id]);

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('student-goals.store'), {
            onSuccess: () => {
                createForm.reset('target_name', 'student_id');
            },
        });
    };

    const triggerDelete = (goal: StudentGoal) => {
        setDeleteTarget(goal);
        setDeleteConfirmText('');
        setIsDeleteModalOpen(true);
    };

    const executeDelete = () => {
        if (deleteConfirmText !== 'Hapus' || !deleteTarget) return;

        deleteForm.delete(route('student-goals.destroy', { goal: deleteTarget.id }), {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setDeleteTarget(null);
                setDeleteConfirmText('');
            },
        });
    };

    const toggleGoalStatus = (goal: StudentGoal, currentStatus: string) => {
        const newStatus = currentStatus === 'aktif' ? 'selesai' : 'aktif';
        router.put(route('student-goals.update', { goal: goal.id }), {
            status: newStatus,
        }, {
            preserveScroll: true,
        });
    };

    const triggerSetoran = (goal: StudentGoal) => {
        setSelectedGoalForSetoran(goal);
        // Default to the last setoran surah/verse if available, otherwise target start
        const lastSetoran = goal.setorans && goal.setorans.length > 0 ? goal.setorans[0] : null;
        setoranForm.setData({
            student_goal_id: goal.id.toString(),
            surah_number: lastSetoran ? lastSetoran.surah_number : goal.target_surah_start,
            verse_number: lastSetoran ? lastSetoran.verse_number : goal.target_verse_start,
            grade: 'A',
            notes: '',
        });
        setIsSetoranModalOpen(true);
    };

    const handleSetoranSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setoranForm.post(route('goal-setorans.store'), {
            onSuccess: () => {
                setIsSetoranModalOpen(false);
                setSelectedGoalForSetoran(null);
                setoranForm.reset();
            },
        });
    };

    const handleDeleteSetoran = (setoranId: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus catatan setoran ini?')) return;
        router.delete(route('goal-setorans.destroy', { setoran: setoranId }), {
            preserveScroll: true,
        });
    };

    const toggleSetoranExpanded = (goalId: number) => {
        setExpandedSetoranGoalIds((prev) => ({
            ...prev,
            [goalId]: !prev[goalId],
        }));
    };

    const getChapterName = (id: number) => {
        const ch = chapters.find((c) => c.id === id);
        return ch ? ch.name_complex : `Surah ${id}`;
    };

    // Filtered list of goals
    const filteredGoals = goals.filter((g) => {
        if (filterClass === 'all') return true;
        return g.classroom_id.toString() === filterClass;
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Target Belajar Murid - 3T" />

            <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto w-full">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
                        <Target className="h-6 w-6 text-emerald-600 animate-pulse" />
                        Target & Kemajuan Belajar Murid
                    </h1>
                    <p className="text-xs text-neutral-500 mt-1">
                        Buat target hafalan (*tahfizh*), perbaikan bacaan (*tahsin*), atau bacaan khusus (*takhasus*), dan pantau persentase kemajuan murid secara real-time.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* Left: Create Target Card */}
                    <Card className="border-neutral-200/60 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900 shadow-sm lg:col-span-1">
                        <CardHeader className="pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
                            <CardTitle className="text-sm font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                                <Plus className="h-4 w-4 text-emerald-600" />
                                Buat Target Baru
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <form onSubmit={handleCreateSubmit} className="space-y-4">
                                {/* Choose Classroom */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-neutral-600 dark:text-neutral-450">Pilih Kelas</Label>
                                    <Select
                                        value={createForm.data.classroom_id}
                                        onValueChange={(val) => createForm.setData('classroom_id', val)}
                                    >
                                        <SelectTrigger className="w-full bg-white dark:bg-neutral-950 border-neutral-300 dark:border-neutral-800 text-xs rounded-xl">
                                            <SelectValue placeholder="Pilih Kelas" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {classrooms.map((cls) => (
                                                <SelectItem key={cls.id} value={cls.id.toString()}>
                                                    {cls.name} ({cls.type})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {createForm.errors.classroom_id && (
                                        <p className="text-xs text-red-500 mt-1">{createForm.errors.classroom_id}</p>
                                    )}
                                </div>

                                {/* Choose Student */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-neutral-600 dark:text-neutral-450">Pilih Murid</Label>
                                    <Select
                                        value={createForm.data.student_id}
                                        onValueChange={(val) => createForm.setData('student_id', val)}
                                        disabled={!createForm.data.classroom_id}
                                    >
                                        <SelectTrigger className="w-full bg-white dark:bg-neutral-950 border-neutral-300 dark:border-neutral-800 text-xs rounded-xl">
                                            <SelectValue placeholder={selectedClass ? "Pilih Murid" : "Pilih kelas terlebih dahulu"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {selectedClass?.students.map((st) => (
                                                <SelectItem key={st.id} value={st.id.toString()}>
                                                    {st.name} (NIS: {st.nis})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {createForm.errors.student_id && (
                                        <p className="text-xs text-red-500 mt-1">{createForm.errors.student_id}</p>
                                    )}
                                </div>

                                {/* Target Name */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="target_name" className="text-xs font-semibold text-neutral-600 dark:text-neutral-450">Nama/Judul Target</Label>
                                    <Input
                                        id="target_name"
                                        placeholder="Contoh: Hafalan Juz Amma, Lancar Mad..."
                                        value={createForm.data.target_name}
                                        onChange={(e) => createForm.setData('target_name', e.target.value)}
                                        className="bg-white dark:bg-neutral-950 border-neutral-300 dark:border-neutral-800 text-xs rounded-xl focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                    {createForm.errors.target_name && (
                                        <p className="text-xs text-red-500 mt-1">{createForm.errors.target_name}</p>
                                    )}
                                </div>

                                {/* Coordinates Range */}
                                <div className="border-t border-neutral-100 dark:border-neutral-800 pt-3 space-y-3">
                                    <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Koordinat Rentang Ayat</h4>

                                    {/* Start coordinate */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <Label className="text-[10px] text-neutral-500">Mulai Surah</Label>
                                            <Select
                                                value={createForm.data.target_surah_start.toString()}
                                                onValueChange={(val) => createForm.setData('target_surah_start', parseInt(val, 10))}
                                            >
                                                <SelectTrigger className="w-full bg-white dark:bg-neutral-950 border-neutral-300 dark:border-neutral-800 text-xs rounded-xl">
                                                    <SelectValue placeholder="Pilih Surah" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {chapters.map((ch) => (
                                                        <SelectItem key={ch.id} value={ch.id.toString()}>
                                                            {ch.id}. {ch.name_complex}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="start_verse" className="text-[10px] text-neutral-500">Ayat</Label>
                                            <Input
                                                id="start_verse"
                                                type="number"
                                                min={1}
                                                value={createForm.data.target_verse_start}
                                                onChange={(e) => createForm.setData('target_verse_start', parseInt(e.target.value, 10) || 1)}
                                                className="bg-white dark:bg-neutral-950 border-neutral-300 dark:border-neutral-800 text-xs rounded-xl focus:ring-emerald-500 focus:border-emerald-500"
                                            />
                                        </div>
                                    </div>

                                    {/* End coordinate */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <Label className="text-[10px] text-neutral-500">Sampai Surah</Label>
                                            <Select
                                                value={createForm.data.target_surah_end.toString()}
                                                onValueChange={(val) => createForm.setData('target_surah_end', parseInt(val, 10))}
                                            >
                                                <SelectTrigger className="w-full bg-white dark:bg-neutral-950 border-neutral-300 dark:border-neutral-800 text-xs rounded-xl">
                                                    <SelectValue placeholder="Pilih Surah" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {chapters.map((ch) => (
                                                        <SelectItem key={ch.id} value={ch.id.toString()}>
                                                            {ch.id}. {ch.name_complex}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="end_verse" className="text-[10px] text-neutral-500">Ayat</Label>
                                            <Input
                                                id="end_verse"
                                                type="number"
                                                min={1}
                                                value={createForm.data.target_verse_end}
                                                onChange={(e) => createForm.setData('target_verse_end', parseInt(e.target.value, 10) || 1)}
                                                className="bg-white dark:bg-neutral-950 border-neutral-300 dark:border-neutral-800 text-xs rounded-xl focus:ring-emerald-500 focus:border-emerald-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2 rounded-xl transition duration-200 mt-2"
                                    disabled={createForm.processing}
                                >
                                    {createForm.processing ? 'Menyimpan...' : 'Simpan Target'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Right: Targets List Card */}
                    <Card className="border-neutral-200/60 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900 shadow-sm lg:col-span-2">
                        <CardHeader className="pb-3 border-b border-neutral-100 dark:border-neutral-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <CardTitle className="text-sm font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                                <Target className="h-4 w-4 text-emerald-600" />
                                Daftar Target Belajar
                            </CardTitle>
                            
                            {/* Class filter */}
                            <Select value={filterClass} onValueChange={setFilterClass}>
                                <SelectTrigger className="w-full sm:w-48 bg-white dark:bg-neutral-950 border-neutral-300 dark:border-neutral-800 text-xs rounded-xl shrink-0">
                                    <SelectValue placeholder="Saring Kelas" />
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
                        </CardHeader>
                        
                        <CardContent className="p-4 space-y-4">
                            {filteredGoals.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4">
                                    {filteredGoals.map((goal) => {
                                        const isCompleted = goal.status === 'selesai' || goal.progress_percentage >= 100;
                                        
                                        return (
                                            <div 
                                                key={goal.id} 
                                                className={`border rounded-2xl p-4 transition duration-300 flex flex-col gap-3 relative overflow-hidden ${
                                                    isCompleted 
                                                        ? 'bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/60' 
                                                        : 'bg-white dark:bg-neutral-950 border-neutral-150 dark:border-neutral-800/85 hover:border-emerald-600/30'
                                                }`}
                                            >
                                                {/* Card Header Section */}
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="space-y-1">
                                                        <span className={`text-[8px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full ${
                                                            goal.target_type === 'Takhasus'
                                                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400'
                                                                : goal.target_type === 'Tahsin'
                                                                    ? 'bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400'
                                                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                                        }`}>
                                                            {goal.target_type} • {goal.classroom.name}
                                                        </span>
                                                        <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mt-1.5">{goal.target_name}</h3>
                                                        <p className="text-[10px] text-neutral-400">
                                                            Murid: <strong className="font-semibold text-neutral-700 dark:text-neutral-300">{goal.student.name}</strong> (NIS: {goal.student.nis})
                                                        </p>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex items-center gap-1.5">
                                                        <button
                                                            onClick={() => triggerSetoran(goal)}
                                                            className="p-1.5 border border-neutral-200 dark:border-neutral-800 hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-lg text-neutral-500 hover:text-emerald-600 transition"
                                                            title="Catat Setoran Bacaan"
                                                        >
                                                            <Award className="h-4 w-4 shrink-0" />
                                                        </button>
                                                        <button
                                                            onClick={() => toggleGoalStatus(goal, goal.status)}
                                                            className={`p-1.5 rounded-lg border transition ${
                                                                goal.status === 'selesai'
                                                                    ? 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700'
                                                                    : 'border-neutral-200 hover:border-emerald-600 hover:bg-emerald-50 dark:border-neutral-800 dark:hover:bg-emerald-950/20 text-neutral-500 hover:text-emerald-600'
                                                            }`}
                                                            title={goal.status === 'selesai' ? 'Tandai Belum Selesai' : 'Tandai Selesai'}
                                                        >
                                                            <CheckCircle className="h-4 w-4 shrink-0" />
                                                        </button>
                                                        <button
                                                            onClick={() => triggerDelete(goal)}
                                                            className="p-1.5 border border-neutral-200 dark:border-neutral-800 hover:border-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-neutral-500 hover:text-red-650 transition"
                                                            title="Hapus Target"
                                                        >
                                                            <Trash2 className="h-4 w-4 shrink-0" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Range and Progress */}
                                                <div className="bg-neutral-50/50 dark:bg-neutral-900/40 border border-neutral-100 dark:border-neutral-850 p-2.5 rounded-xl space-y-2.5">
                                                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                                        <span className="text-neutral-450 flex items-center gap-1">
                                                            <BookOpen className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                                            Rentang:
                                                        </span>
                                        <div className="flex items-center gap-1.5 font-semibold text-neutral-700 dark:text-neutral-300 text-[11px]">
                                                            <span>{getChapterName(goal.target_surah_start)} {goal.target_verse_start}</span>
                                                            <ArrowRight className="h-3 w-3 text-neutral-400" />
                                                            <span>{getChapterName(goal.target_surah_end)} {goal.target_verse_end}</span>
                                                        </div>
                                                    </div>

                                                    {/* Progress Bar */}
                                                    <div className="space-y-1">
                                                        <div className="flex items-center justify-between text-[10px] font-bold">
                                                            <span className="text-neutral-450">Kemajuan Koreksi Bacaan</span>
                                                            <span className={isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-500'}>
                                                                {goal.progress_percentage}% ({goal.logged_verses_count}/{goal.total_verses_count} Ayat)
                                                            </span>
                                                        </div>
                                                        <div className="h-2 w-full bg-neutral-200 dark:bg-neutral-850 rounded-full overflow-hidden">
                                                            <div 
                                                                className={`h-full rounded-full transition-all duration-500 ${
                                                                    isCompleted ? 'bg-emerald-600' : 'bg-amber-500'
                                                                }`}
                                                                style={{ width: `${goal.progress_percentage}%` }}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Latest Setoran */}
                                                    {goal.setorans && goal.setorans.length > 0 ? (
                                                        <div className="border-t border-neutral-200/50 dark:border-neutral-800/50 pt-2 flex items-center justify-between text-[10px]">
                                                            <span className="text-neutral-450 flex items-center gap-1">
                                                                <Award className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                                                Setoran Terakhir:
                                                            </span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-neutral-700 dark:text-neutral-300">
                                                                    {getChapterName(goal.setorans[0].surah_number)}: {goal.setorans[0].verse_number}
                                                                </span>
                                                                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                                                                    goal.setorans[0].grade === 'A'
                                                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-450'
                                                                        : goal.setorans[0].grade === 'B'
                                                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-450'
                                                                            : goal.setorans[0].grade === 'C'
                                                                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-450'
                                                                                : 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-450'
                                                                }`}>
                                                                    Nilai: {goal.setorans[0].grade}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="border-t border-neutral-200/50 dark:border-neutral-800/50 pt-2 text-center text-[10px] text-neutral-400 italic">
                                                            Belum ada setoran dicatat.
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Expandable Setoran History */}
                                                <div className="border-t border-neutral-100 dark:border-neutral-850 pt-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleSetoranExpanded(goal.id)}
                                                        className="w-full flex items-center justify-between text-[10px] text-neutral-500 hover:text-emerald-600 dark:hover:text-emerald-450 transition font-bold"
                                                    >
                                                        <span className="flex items-center gap-1">
                                                            <FileText className="h-3.5 w-3.5 shrink-0 text-emerald-650 dark:text-emerald-450" />
                                                            Riwayat Setoran ({goal.setorans ? goal.setorans.length : 0})
                                                        </span>
                                                        {expandedSetoranGoalIds[goal.id] ? (
                                                            <ChevronUp className="h-3.5 w-3.5 shrink-0" />
                                                        ) : (
                                                            <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                                                        )}
                                                    </button>

                                                    {expandedSetoranGoalIds[goal.id] && (
                                                        <div className="mt-2 space-y-1.5 max-h-40 overflow-y-auto pr-1">
                                                            {goal.setorans && goal.setorans.length > 0 ? (
                                                                goal.setorans.map((setoran) => (
                                                                    <div key={setoran.id} className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-850 rounded-lg p-2 flex items-start justify-between gap-2 text-[10px]">
                                                                        <div className="space-y-0.5 w-full">
                                                                            <div className="flex items-center justify-between">
                                                                                <div className="flex items-center gap-1.5 font-semibold text-neutral-700 dark:text-neutral-300">
                                                                                    <span>{getChapterName(setoran.surah_number)}: {setoran.verse_number}</span>
                                                                                    <span className={`text-[8px] font-bold px-1.5 rounded-full ${
                                                                                        setoran.grade === 'A'
                                                                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-450'
                                                                                            : setoran.grade === 'B'
                                                                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-450'
                                                                                                : setoran.grade === 'C'
                                                                                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-450'
                                                                                                    : 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-450'
                                                                                    }`}>
                                                                                        {setoran.grade}
                                                                                    </span>
                                                                                </div>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleDeleteSetoran(setoran.id)}
                                                                                    className="text-red-500 hover:text-red-700 p-0.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition"
                                                                                    title="Hapus Catatan Setoran"
                                                                                >
                                                                                    <Trash2 className="h-3 w-3" />
                                                                                </button>
                                                                            </div>
                                                                            {setoran.notes && (
                                                                                <p className="text-neutral-500 italic font-normal text-[9px] mt-0.5">{setoran.notes}</p>
                                                                            )}
                                                                            <span className="text-[8px] text-neutral-400 block pt-0.5">
                                                                                {new Date(setoran.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <p className="text-center text-neutral-400 text-[10px] italic py-2">Belum ada riwayat setoran.</p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Date indicators */}
                                                <div className="flex items-center justify-between text-[9px] text-neutral-400 pt-1 border-t border-neutral-100/50 dark:border-neutral-800/50">
                                                    <span className="flex items-center gap-0.5">
                                                        <Clock className="h-3 w-3" />
                                                        Dibuat: {new Date(goal.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                    <span className={`font-semibold capitalize ${
                                                        goal.status === 'selesai' 
                                                            ? 'text-emerald-600 dark:text-emerald-450' 
                                                            : goal.status === 'dibatalkan'
                                                                ? 'text-red-500'
                                                                : 'text-amber-600 dark:text-amber-500'
                                                    }`}>
                                                        Status: {goal.status}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-12 text-center text-xs text-neutral-450 italic">
                                    Belum ada target belajar yang terdaftar untuk saringan kelas ini.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* STRICT DELETE CONFIRMATION DIALOG */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="max-w-md bg-white dark:bg-neutral-900 border border-red-200 dark:border-red-950 rounded-2xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-red-600 dark:text-red-500 flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5" />
                            Konfirmasi Hapus Target
                        </DialogTitle>
                    </DialogHeader>

                    {deleteTarget && (
                        <div className="space-y-4 mt-2">
                            <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-250/30 p-3.5 rounded-xl text-xs text-red-800 dark:text-red-300">
                                <p className="font-semibold">Peringatan: Aksi ini tidak dapat dibatalkan!</p>
                                <p className="mt-1 opacity-95">
                                    Anda akan menghapus target <strong className="font-extrabold">"{deleteTarget.target_name}"</strong> milik murid <strong className="font-bold">{deleteTarget.student.name}</strong>.
                                    Catatan riwayat bacaan tidak akan terhapus, namun target progress tracker ini akan dihapus permanen.
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="confirm-delete-goal" className="text-xs text-neutral-500 font-medium">
                                    Ketik <strong className="text-neutral-800 dark:text-neutral-200">Hapus</strong> di bawah ini untuk mengonfirmasi:
                                </Label>
                                <Input
                                    id="confirm-delete-goal"
                                    placeholder="Ketik Hapus..."
                                    value={deleteConfirmText}
                                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                                    className="bg-white dark:bg-neutral-950 border-neutral-300 dark:border-neutral-800 text-xs rounded-xl focus:ring-red-500 focus:border-red-500"
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
                                    className="text-xs bg-red-600 hover:bg-red-700 text-white font-bold px-4 rounded-xl"
                                    disabled={deleteConfirmText !== 'Hapus' || deleteForm.processing}
                                >
                                    {deleteForm.processing ? 'Menghapus...' : 'Ya, Hapus'}
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* RECORD SETORAN DIALOG */}
            <Dialog open={isSetoranModalOpen} onOpenChange={setIsSetoranModalOpen}>
                <DialogContent className="max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                            <Award className="h-5 w-5 text-emerald-600 animate-bounce" />
                            Catat Setoran Bacaan
                        </DialogTitle>
                    </DialogHeader>

                    {selectedGoalForSetoran && (
                        <form onSubmit={handleSetoranSubmit} className="space-y-4 mt-2">
                            {/* Student and Target Info */}
                            <div className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-150 dark:border-neutral-850 p-3 rounded-xl text-xs space-y-1">
                                <p className="text-neutral-500">
                                    Murid: <strong className="font-bold text-neutral-800 dark:text-neutral-200">{selectedGoalForSetoran.student.name}</strong>
                                </p>
                                <p className="text-neutral-500">
                                    Target: <strong className="font-semibold text-neutral-700 dark:text-neutral-300">{selectedGoalForSetoran.target_name}</strong>
                                </p>
                                <p className="text-neutral-400 text-[10px]">
                                    Rentang Target: {getChapterName(selectedGoalForSetoran.target_surah_start)} {selectedGoalForSetoran.target_verse_start} - {getChapterName(selectedGoalForSetoran.target_surah_end)} {selectedGoalForSetoran.target_verse_end}
                                </p>
                            </div>

                            {/* Surah Dropdown */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-neutral-600 dark:text-neutral-450">Surah</Label>
                                <Select
                                    value={setoranForm.data.surah_number.toString()}
                                    onValueChange={(val) => setoranForm.setData('surah_number', parseInt(val, 10))}
                                >
                                    <SelectTrigger className="w-full bg-white dark:bg-neutral-950 border-neutral-300 dark:border-neutral-800 text-xs rounded-xl">
                                        <SelectValue placeholder="Pilih Surah" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {chapters.map((ch) => (
                                            <SelectItem key={ch.id} value={ch.id.toString()}>
                                                {ch.id}. {ch.name_complex}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Verse Number Input */}
                            <div className="space-y-1.5">
                                <Label htmlFor="setoran_verse" className="text-xs font-semibold text-neutral-600 dark:text-neutral-450">Sampai Ayat</Label>
                                <Input
                                    id="setoran_verse"
                                    type="number"
                                    min={1}
                                    value={setoranForm.data.verse_number}
                                    onChange={(e) => setoranForm.setData('verse_number', parseInt(e.target.value, 10) || 1)}
                                    className="bg-white dark:bg-neutral-950 border-neutral-300 dark:border-neutral-800 text-xs rounded-xl focus:ring-emerald-500 focus:border-emerald-500"
                                />
                                {setoranForm.errors.verse_number && (
                                    <p className="text-xs text-red-500 mt-1">{setoranForm.errors.verse_number}</p>
                                )}
                            </div>

                            {/* Grade Select A-D */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-neutral-600 dark:text-neutral-450">Nilai (Rentang A sampai D)</Label>
                                <div className="grid grid-cols-4 gap-2">
                                    {(['A', 'B', 'C', 'D'] as const).map((g) => (
                                        <button
                                            key={g}
                                            type="button"
                                            onClick={() => setoranForm.setData('grade', g)}
                                            className={`py-2 text-sm font-bold rounded-xl border transition-all duration-200 ${
                                                setoranForm.data.grade === g
                                                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm ring-2 ring-emerald-550/20'
                                                    : 'border-neutral-200 hover:border-neutral-350 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-600 dark:text-neutral-300'
                                            }`}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                                {setoranForm.errors.grade && (
                                    <p className="text-xs text-red-500 mt-1">{setoranForm.errors.grade}</p>
                                )}
                            </div>

                            {/* Notes/Comments */}
                            <div className="space-y-1.5">
                                <Label htmlFor="setoran_notes" className="text-xs font-semibold text-neutral-600 dark:text-neutral-450">Catatan/Komentar (Opsional)</Label>
                                <textarea
                                    id="setoran_notes"
                                    rows={3}
                                    placeholder="Tulis catatan perkembangan setoran, misal: Tajwid baik, perlu lancarkan lagi..."
                                    value={setoranForm.data.notes}
                                    onChange={(e) => setoranForm.setData('notes', e.target.value)}
                                    className="w-full bg-white dark:bg-neutral-950 border border-neutral-350 dark:border-neutral-800 text-xs rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-550 dark:focus:ring-emerald-450 focus:border-transparent text-neutral-800 dark:text-neutral-100"
                                />
                                {setoranForm.errors.notes && (
                                    <p className="text-xs text-red-500 mt-1">{setoranForm.errors.notes}</p>
                                )}
                            </div>

                            <DialogFooter className="pt-2 flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsSetoranModalOpen(false);
                                        setSelectedGoalForSetoran(null);
                                    }}
                                    className="text-xs border-neutral-300 dark:border-neutral-800 rounded-xl"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 rounded-xl"
                                    disabled={setoranForm.processing}
                                >
                                    {setoranForm.processing ? 'Menyimpan...' : 'Simpan Setoran'}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
