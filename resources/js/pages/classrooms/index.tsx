import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Plus, Users, Clipboard, Tag, Trash2, ShieldAlert, Sparkles, X, UserMinus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface StudentGoal {
    id: number;
    target_name: string;
    status: string;
    progress_percentage: number;
}

interface Student {
    id: number;
    nis: string;
    name: string;
    goals?: StudentGoal[];
}

interface CustomLabel {
    id: number;
    classroom_id: number;
    name: string;
}

interface Classroom {
    id: number;
    name: string;
    type: 'Takhasus' | 'Tahsin' | 'Tahfizh';
    description: string;
    students: Student[];
    students_count: number;
    custom_labels: CustomLabel[];
}

interface ClassroomsIndexProps {
    classrooms: Classroom[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manajemen Kelas',
        href: '/classrooms',
    },
];

export default function ClassroomsIndex({ classrooms = [] }: ClassroomsIndexProps) {
    const [selectedClass, setSelectedClass] = useState<Classroom | null>(classrooms[0] || null);
    const [activeTab, setActiveTab] = useState<'students' | 'labels' | 'import'>('students');
    
    // Modals state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfig, setDeleteConfig] = useState<{
        type: 'classroom' | 'student' | 'label';
        id: number;
        name: string;
        additionalId?: number; // e.g. classroom_id for student delete
    } | null>(null);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    // Reset tab to students when changing class selection
    useEffect(() => {
        setActiveTab('students');
    }, [selectedClass]);

    // Create Class Form
    const createForm = useForm({
        name: '',
        type: 'Tahfizh',
        description: '',
    });

    // Excel Import Form
    const importForm = useForm({
        paste_data: '',
    });

    // Add Label Form
    const labelForm = useForm({
        name: '',
    });

    const handleCreateClass = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('classrooms.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                createForm.reset();
                // Refresh local selections
                if (classrooms.length > 0 && !selectedClass) {
                    setSelectedClass(classrooms[0]);
                }
            },
        });
    };

    const handleImportStudents = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClass) return;
        importForm.post(route('classrooms.import', { classroom: selectedClass.id }), {
            onSuccess: () => {
                importForm.reset();
                // Refresh active selection to reflect new students
                const updated = classrooms.find((c) => c.id === selectedClass.id);
                if (updated) setSelectedClass(updated);
            },
        });
    };

    const handleAddLabel = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClass) return;
        labelForm.post(route('classrooms.add-label', { classroom: selectedClass.id }), {
            onSuccess: () => {
                labelForm.reset();
                const updated = classrooms.find((c) => c.id === selectedClass.id);
                if (updated) setSelectedClass(updated);
            },
        });
    };

    // Trigger strict delete confirmation
    const triggerDelete = (
        type: 'classroom' | 'student' | 'label',
        id: number,
        name: string,
        additionalId?: number
    ) => {
        setDeleteConfig({ type, id, name, additionalId });
        setDeleteConfirmText('');
        setIsDeleteModalOpen(true);
    };

    const executeDelete = () => {
        if (deleteConfirmText !== 'Hapus' || !deleteConfig) return;

        const cleanup = () => {
            setIsDeleteModalOpen(false);
            setDeleteConfig(null);
            setDeleteConfirmText('');
        };

        if (deleteConfig.type === 'classroom') {
            createForm.delete(route('classrooms.destroy', { classroom: deleteConfig.id }), {
                onSuccess: () => {
                    cleanup();
                    setSelectedClass(null);
                },
            });
        } else if (deleteConfig.type === 'student' && deleteConfig.additionalId) {
            createForm.delete(
                route('classrooms.remove-student', {
                    classroom: deleteConfig.additionalId,
                    student: deleteConfig.id,
                }),
                {
                    onSuccess: () => {
                        cleanup();
                        const updated = classrooms.find((c) => c.id === deleteConfig.additionalId);
                        if (updated) setSelectedClass(updated);
                    },
                }
            );
        } else if (deleteConfig.type === 'label') {
            createForm.delete(route('classrooms.delete-label', { label: deleteConfig.id }), {
                onSuccess: () => {
                    cleanup();
                    if (selectedClass) {
                        const updated = classrooms.find((c) => c.id === selectedClass.id);
                        if (updated) setSelectedClass(updated);
                    }
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Kelas - 3T" />

            <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full h-[calc(100vh-4rem)] overflow-hidden">
                {/* Header Section */}
                <div className="flex items-center justify-between shrink-0">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
                            <Users className="h-6 w-6 text-emerald-600" />
                            Manajemen Kelas
                        </h1>
                        <p className="text-xs text-neutral-500 mt-1">
                            Kelola data kelas Takhasus, Tahsin, Tahfizh beserta daftar murid dan label penilaian.
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold px-4 flex items-center gap-1.5 shadow-md active:scale-95 transition"
                    >
                        <Plus className="h-4 w-4" />
                        Tambah Kelas
                    </Button>
                </div>

                {/* Main Content Workspace (Side-by-side Layout) */}
                <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
                    {/* Left Column: Classrooms List */}
                    <div className="w-full md:w-80 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900 flex flex-col overflow-hidden shrink-0">
                        <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 font-semibold text-xs text-neutral-500 uppercase tracking-wider">
                            Daftar Kelas ({classrooms.length})
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            {classrooms.map((cls) => {
                                const isSelected = selectedClass?.id === cls.id;
                                return (
                                    <button
                                        key={cls.id}
                                        onClick={() => setSelectedClass(cls)}
                                        className={`w-full text-left p-3.5 rounded-xl border transition duration-250 flex flex-col gap-1.5 group relative ${
                                            isSelected
                                                ? 'bg-emerald-50/50 border-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-500'
                                                : 'bg-white border-neutral-200 hover:bg-neutral-50/60 hover:border-neutral-300 dark:bg-neutral-900 dark:border-neutral-800 dark:hover:bg-neutral-850'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            <span className="font-bold text-xs text-neutral-800 dark:text-neutral-200">
                                                {cls.name}
                                            </span>
                                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                                cls.type === 'Takhasus' 
                                                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400' 
                                                    : cls.type === 'Tahsin'
                                                        ? 'bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400'
                                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                            }`}>
                                                {cls.type}
                                            </span>
                                        </div>
                                        <div className="text-[10px] text-neutral-500 flex items-center justify-between">
                                            <span>{cls.students_count || cls.students?.length || 0} Murid Terdaftar</span>
                                            <Trash2
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    triggerDelete('classroom', cls.id, cls.name);
                                                }}
                                                className="h-3.5 w-3.5 text-neutral-400 hover:text-red-600 dark:hover:text-red-500 cursor-pointer transition"
                                                title="Hapus Kelas"
                                            />
                                        </div>
                                    </button>
                                );
                            })}
                            {classrooms.length === 0 && (
                                <div className="text-center py-8 text-neutral-400 text-xs italic">
                                    Belum ada kelas. Silakan tambah kelas baru.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Classroom Workspace */}
                    <div className="flex-1 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900 flex flex-col overflow-hidden">
                        {selectedClass ? (
                            <div className="flex-1 flex flex-col min-h-0">
                                {/* Details Header */}
                                <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 shrink-0 bg-neutral-50/20 dark:bg-neutral-950/20">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
                                            {selectedClass.name}
                                        </h2>
                                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                                            selectedClass.type === 'Takhasus' 
                                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400' 
                                                : selectedClass.type === 'Tahsin'
                                                    ? 'bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400'
                                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                        }`}>
                                            {selectedClass.type}
                                        </span>
                                    </div>
                                    <p className="text-xs text-neutral-500 mt-2">
                                        {selectedClass.description || 'Tidak ada deskripsi untuk kelas ini.'}
                                    </p>
                                </div>

                                {/* Custom Inline Navigation Tabs List */}
                                <div className="px-6 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
                                    <div className="flex bg-neutral-100/50 dark:bg-neutral-950/50 border border-neutral-200/40 dark:border-neutral-800 rounded-xl p-1 h-9 mt-2 w-fit">
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('students')}
                                            className={`text-xs rounded-lg px-4 py-1.5 flex items-center gap-1.5 transition cursor-pointer ${
                                                activeTab === 'students'
                                                    ? 'bg-white dark:bg-neutral-900 text-emerald-700 font-semibold shadow-sm'
                                                    : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
                                            }`}
                                        >
                                            <Users className="h-3.5 w-3.5" />
                                            Murid ({selectedClass.students?.length || 0})
                                        </button>
                                        
                                        {(selectedClass.type === 'Takhasus' || selectedClass.type === 'Tahsin') && (
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab('labels')}
                                                className={`text-xs rounded-lg px-4 py-1.5 flex items-center gap-1.5 transition cursor-pointer ${
                                                    activeTab === 'labels'
                                                        ? 'bg-white dark:bg-neutral-900 text-emerald-700 font-semibold shadow-sm'
                                                        : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
                                                }`}
                                            >
                                                <Tag className="h-3.5 w-3.5" />
                                                Label Penilaian ({selectedClass.custom_labels?.length || 0})
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('import')}
                                            className={`text-xs rounded-lg px-4 py-1.5 flex items-center gap-1.5 transition cursor-pointer ${
                                                activeTab === 'import'
                                                    ? 'bg-white dark:bg-neutral-900 text-emerald-700 font-semibold shadow-sm'
                                                    : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
                                            }`}
                                        >
                                            <Clipboard className="h-3.5 w-3.5" />
                                            Impor dari Excel
                                        </button>
                                    </div>
                                </div>

                                {/* Tab 1: Students List Content */}
                                {activeTab === 'students' && (
                                    <div className="flex-1 overflow-y-auto p-6 min-h-0">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {selectedClass.students?.map((student) => {
                                                const studentGoals = student.goals || [];
                                                return (
                                                    <div
                                                        key={student.id}
                                                        className="flex flex-col gap-2.5 p-3.5 border border-neutral-200/60 dark:border-neutral-800 rounded-xl hover:border-emerald-600/40 dark:hover:border-emerald-500/30 transition duration-200 bg-white dark:bg-neutral-950"
                                                    >
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div>
                                                                <div className="font-semibold text-xs text-neutral-800 dark:text-neutral-200">
                                                                    {student.name}
                                                                </div>
                                                                <div className="text-[10px] text-neutral-450 mt-0.5">
                                                                    NIS: {student.nis}
                                                                </div>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => triggerDelete('student', student.id, student.name, selectedClass.id)}
                                                                className="h-7 w-7 text-neutral-400 hover:text-red-655 dark:hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/20 rounded-lg shrink-0 cursor-pointer"
                                                                title="Keluarkan Murid"
                                                            >
                                                                <UserMinus className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>

                                                        {/* Goals and Progress percentages */}
                                                        {studentGoals.length > 0 && (
                                                            <div className="border-t border-neutral-100 dark:border-neutral-850 pt-2.5 space-y-2">
                                                                <div className="text-[9px] font-extrabold text-neutral-400 dark:text-neutral-550 uppercase tracking-wider">Target Belajar</div>
                                                                {studentGoals.map((goal) => (
                                                                    <div key={goal.id} className="space-y-1">
                                                                        <div className="flex items-center justify-between text-[10px]">
                                                                            <span className="text-neutral-600 dark:text-neutral-350 truncate max-w-[130px] font-medium" title={goal.target_name}>
                                                                                {goal.target_name}
                                                                            </span>
                                                                            <span className="text-emerald-655 dark:text-emerald-400 font-bold shrink-0">
                                                                                {goal.progress_percentage}%
                                                                            </span>
                                                                        </div>
                                                                        <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-850 rounded-full overflow-hidden">
                                                                            <div
                                                                                className={`h-full rounded-full transition-all duration-300 ${
                                                                                    goal.status === 'selesai' ? 'bg-emerald-600' : 'bg-amber-500'
                                                                                }`}
                                                                                style={{ width: `${goal.progress_percentage}%` }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                            {(!selectedClass.students || selectedClass.students.length === 0) && (
                                                <div className="col-span-2 text-center py-12 bg-neutral-50/40 dark:bg-neutral-950/10 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl flex flex-col items-center">
                                                    <Users className="h-8 w-8 text-neutral-300 dark:text-neutral-700 mb-2" />
                                                    <p className="text-xs text-neutral-500 font-medium">Belum ada murid di kelas ini.</p>
                                                    <p className="text-[10px] text-neutral-400 mt-1">Silakan impor dari excel atau tambahkan murid baru.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Tab 2: Custom Labels Content */}
                                {activeTab === 'labels' && (
                                    <div className="flex-1 overflow-y-auto p-6 min-h-0 flex flex-col gap-6">
                                        {/* Add Label Inline Form */}
                                        <form onSubmit={handleAddLabel} className="flex gap-2 bg-neutral-50 dark:bg-neutral-950/20 p-4 border border-neutral-100 dark:border-neutral-800 rounded-xl">
                                            <div className="flex-1">
                                                <Input
                                                    placeholder="Tambah label penilaian baru (contoh: Gunnah, Lupa Halaman...)"
                                                    value={labelForm.data.name}
                                                    onChange={(e) => labelForm.setData('name', e.target.value)}
                                                    className="w-full bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-800 rounded-lg text-xs"
                                                    required
                                                />
                                            </div>
                                            <Button
                                                type="submit"
                                                className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold px-4 shrink-0 cursor-pointer"
                                                disabled={labelForm.processing}
                                            >
                                                {labelForm.processing ? 'Menambah...' : 'Tambah'}
                                            </Button>
                                        </form>

                                        {/* Labels Grid */}
                                        <div className="space-y-2">
                                            <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">Daftar Label Aktif</div>
                                            <div className="flex flex-wrap gap-2.5">
                                                {selectedClass.custom_labels?.map((label) => (
                                                    <div
                                                        key={label.id}
                                                        className="flex items-center gap-2 px-3 py-1.5 bg-neutral-50 border border-neutral-200 dark:bg-neutral-950 dark:border-neutral-800 rounded-xl text-xs text-neutral-700 dark:text-neutral-300 group"
                                                    >
                                                        <span>{label.name}</span>
                                                        <X
                                                            onClick={() => triggerDelete('label', label.id, label.name)}
                                                            className="h-3.5 w-3.5 text-neutral-400 hover:text-red-600 cursor-pointer transition"
                                                            title="Hapus Label"
                                                        />
                                                    </div>
                                                ))}
                                                {(!selectedClass.custom_labels || selectedClass.custom_labels.length === 0) && (
                                                    <p className="text-xs text-neutral-400 italic">Belum ada label custom yang dibuat.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Tab 3: Excel Importer Content */}
                                {activeTab === 'import' && (
                                    <div className="flex-1 overflow-y-auto p-6 min-h-0">
                                        <form onSubmit={handleImportStudents} className="space-y-4">
                                            <div className="bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-200/50 dark:border-emerald-900/40 p-4 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 space-y-1.5">
                                                <p className="font-semibold flex items-center gap-1">
                                                    <Sparkles className="h-4 w-4 text-emerald-600" />
                                                    Cara Impor Salin-Tempel (Excel Copy-Paste)
                                                </p>
                                                <ol className="list-decimal pl-4 space-y-1 mt-1.5 opacity-90">
                                                    <li>Buka berkas data murid Anda di Microsoft Excel atau Google Sheets.</li>
                                                    <li>Salin (Ctrl+C) dua kolom: Kolom pertama berisi **NIS** dan kolom kedua berisi **Nama Murid**.</li>
                                                    <li>Tempel (Ctrl+V) data yang disalin ke kotak teks di bawah ini.</li>
                                                    <li>Klik tombol **Proses Impor Murid** untuk mendaftarkan murid secara massal.</li>
                                                </ol>
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label htmlFor="paste_data" className="text-xs text-neutral-400">Tempel Data Murid dari Excel</Label>
                                                <Textarea
                                                    id="paste_data"
                                                    rows={8}
                                                    placeholder="Contoh format:&#10;10001	Ahmad Fauzi&#10;10002	Siti Aminah"
                                                    value={importForm.data.paste_data}
                                                    onChange={(e) => importForm.setData('paste_data', e.target.value)}
                                                    className="w-full font-mono bg-white dark:bg-neutral-950 border-neutral-300 dark:border-neutral-800 text-xs rounded-xl focus:ring-emerald-500 focus:border-emerald-500"
                                                    required
                                                />
                                            </div>

                                            <Button
                                                type="submit"
                                                className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold px-4 cursor-pointer"
                                                disabled={importForm.processing}
                                            >
                                                {importForm.processing ? 'Sedang Memproses...' : 'Proses Impor Murid'}
                                            </Button>
                                        </form>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-neutral-50/20 dark:bg-neutral-950/10">
                                <Users className="h-12 w-12 text-neutral-300 dark:text-neutral-700 mb-3" />
                                <h3 className="font-bold text-neutral-700 dark:text-neutral-300 text-sm">Belum ada kelas yang dipilih</h3>
                                <p className="text-xs text-neutral-500 mt-1">Pilih kelas di daftar sebelah kiri untuk mengelola murid dan data penilaian.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Class Dialog Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
                            <Plus className="h-5 w-5 text-emerald-600" />
                            Buat Kelas Baru
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleCreateClass} className="space-y-4 mt-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-xs text-neutral-400">Nama Kelas</Label>
                            <Input
                                id="name"
                                placeholder="Contoh: Takhasus 7A"
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                className="w-full bg-white dark:bg-neutral-950 border-neutral-300 dark:border-neutral-800 text-xs rounded-xl"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="type" className="text-xs text-neutral-400">Jenis Kelas (3T)</Label>
                            <select
                                id="type"
                                value={createForm.data.type}
                                onChange={(e) => createForm.setData('type', e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                            >
                                <option value="Takhasus">Takhasus</option>
                                <option value="Tahsin">Tahsin</option>
                                <option value="Tahfizh">Tahfizh</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="description" className="text-xs text-neutral-400">Deskripsi Kelas (Opsional)</Label>
                            <Textarea
                                id="description"
                                rows={3}
                                placeholder="Tulis keterangan atau catatan kelas..."
                                value={createForm.data.description}
                                onChange={(e) => createForm.setData('description', e.target.value)}
                                className="w-full bg-white dark:bg-neutral-950 border-neutral-300 dark:border-neutral-800 text-xs rounded-xl"
                            />
                        </div>

                        <DialogFooter className="pt-2 flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-xs border-neutral-300 dark:border-neutral-800 rounded-xl"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 rounded-xl cursor-pointer"
                                disabled={createForm.processing}
                            >
                                {createForm.processing ? 'Menyimpan...' : 'Simpan Kelas'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* STRICT DELETE CONFIRMATION DIALOG */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="max-w-md bg-white dark:bg-neutral-900 border border-red-200 dark:border-red-950 rounded-2xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-red-600 dark:text-red-500 flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5" />
                            Konfirmasi Hapus Ketat
                        </DialogTitle>
                    </DialogHeader>

                    {deleteConfig && (
                        <div className="space-y-4 mt-2">
                            <div className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                                Anda akan menghapus {deleteConfig.type === 'classroom' ? 'Kelas' : deleteConfig.type === 'student' ? 'Murid' : 'Label Penilaian'}{' '}
                                <strong className="text-neutral-900 dark:text-white font-bold">"{deleteConfig.name}"</strong>.
                                <p className="mt-1 text-red-500 dark:text-red-400 font-semibold">Tindakan ini permanen dan tidak dapat dibatalkan!</p>
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
                                        setDeleteConfig(null);
                                    }}
                                    className="text-xs border-neutral-300 dark:border-neutral-800 rounded-xl"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="button"
                                    onClick={executeDelete}
                                    className="text-xs bg-red-600 hover:bg-red-700 text-white font-bold px-4 rounded-xl disabled:opacity-40 cursor-pointer"
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
