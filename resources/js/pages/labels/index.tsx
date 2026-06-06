import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Tag, Plus, Edit2, Trash2, ShieldAlert, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface CorrectionLabel {
    id: number;
    teacher_id: number;
    name: string;
    color: string;
}

interface LabelsIndexProps {
    labels: CorrectionLabel[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pengaturan Label',
        href: '/correction-labels',
    },
];

const AVAILABLE_COLORS = ['merah', 'kuning', 'hijau', 'hitam', 'biru', 'orange', 'ungu'];

const colorMap: Record<string, { label: string; dotClass: string; badgeClass: string }> = {
    merah: {
        label: 'Merah',
        dotClass: 'bg-red-500 hover:ring-red-300 dark:hover:ring-red-950',
        badgeClass: 'bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-900/50',
    },
    kuning: {
        label: 'Kuning',
        dotClass: 'bg-amber-500 hover:ring-amber-300 dark:hover:ring-amber-950',
        badgeClass: 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/50',
    },
    hijau: {
        label: 'Hijau',
        dotClass: 'bg-emerald-500 hover:ring-emerald-300 dark:hover:ring-emerald-950',
        badgeClass: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50',
    },
    hitam: {
        label: 'Hitam',
        dotClass: 'bg-neutral-800 dark:bg-neutral-200 hover:ring-neutral-300 dark:hover:ring-neutral-700',
        badgeClass: 'bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800',
    },
    biru: {
        label: 'Biru',
        dotClass: 'bg-blue-500 hover:ring-blue-300 dark:hover:ring-blue-950',
        badgeClass: 'bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-900/50',
    },
    orange: {
        label: 'Orange',
        dotClass: 'bg-orange-500 hover:ring-orange-300 dark:hover:ring-orange-950',
        badgeClass: 'bg-orange-50 dark:bg-orange-950/30 text-orange-850 dark:text-orange-300 border-orange-200 dark:border-orange-900/50',
    },
    ungu: {
        label: 'Ungu',
        dotClass: 'bg-purple-500 hover:ring-purple-300 dark:hover:ring-purple-950',
        badgeClass: 'bg-purple-50 dark:bg-purple-950/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-900/50',
    },
};

export default function LabelsIndex({ labels = [] }: LabelsIndexProps) {
    const [editingLabelId, setEditingLabelId] = useState<number | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<CorrectionLabel | null>(null);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    // Create Form
    const createForm = useForm({
        name: '',
        color: 'hijau',
    });

    // Edit Form
    const editForm = useForm({
        name: '',
        color: '',
    });

    // Delete Form
    const deleteForm = useForm();

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('correction-labels.store'), {
            onSuccess: () => {
                createForm.reset('name');
            },
        });
    };

    const startEditing = (label: CorrectionLabel) => {
        setEditingLabelId(label.id);
        editForm.setData({
            name: label.name,
            color: label.color,
        });
    };

    const cancelEditing = () => {
        setEditingLabelId(null);
        editForm.reset();
    };

    const handleEditSubmit = (e: React.FormEvent, id: number) => {
        e.preventDefault();
        editForm.put(route('correction-labels.update', { label: id }), {
            onSuccess: () => {
                setEditingLabelId(null);
                editForm.reset();
            },
        });
    };

    const triggerDelete = (label: CorrectionLabel) => {
        setDeleteTarget(label);
        setDeleteConfirmText('');
        setIsDeleteModalOpen(true);
    };

    const executeDelete = () => {
        if (deleteConfirmText !== 'Hapus' || !deleteTarget) return;

        deleteForm.delete(route('correction-labels.destroy', { label: deleteTarget.id }), {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setDeleteTarget(null);
                setDeleteConfirmText('');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengaturan Label Koreksi - 3T" />

            <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
                        <Tag className="h-6 w-6 text-emerald-600" />
                        Pengaturan Label Koreksi
                    </h1>
                    <p className="text-xs text-neutral-500 mt-1">
                        Kelola daftar label penilaian yang dapat Anda sematkan saat mencatat koreksi bacaan Al Quran murid.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    {/* Add Label Form Card */}
                    <Card className="border-neutral-200/60 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900 shadow-sm md:col-span-1">
                        <CardHeader className="pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
                            <CardTitle className="text-sm font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                                <Plus className="h-4 w-4 text-emerald-600" />
                                Tambah Label Baru
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <form onSubmit={handleCreateSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="name" className="text-xs font-semibold text-neutral-600 dark:text-neutral-450">Nama Label</Label>
                                    <Input
                                        id="name"
                                        placeholder="Contoh: Makhraj, Tajwid, dll."
                                        value={createForm.data.name}
                                        onChange={(e) => createForm.setData('name', e.target.value)}
                                        className="bg-white dark:bg-neutral-950 border-neutral-300 dark:border-neutral-800 text-xs rounded-xl focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                    {createForm.errors.name && (
                                        <p className="text-xs text-red-500 mt-1">{createForm.errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-neutral-600 dark:text-neutral-450">Pilih Warna</Label>
                                    <div className="flex flex-wrap gap-2.5 bg-neutral-50 dark:bg-neutral-950/40 p-3 rounded-xl border border-neutral-150/40 dark:border-neutral-800/40">
                                        {AVAILABLE_COLORS.map((color) => {
                                            const isSelected = createForm.data.color === color;
                                            const colorCfg = colorMap[color];
                                            return (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    onClick={() => createForm.setData('color', color)}
                                                    className={`h-7 w-7 rounded-full flex items-center justify-center transition duration-200 cursor-pointer ${colorCfg.dotClass} ${
                                                        isSelected ? 'ring-4 ring-offset-2 ring-emerald-500 scale-110' : ''
                                                    }`}
                                                    title={colorCfg.label}
                                                >
                                                    {isSelected && <Check className="h-4 w-4 text-white shrink-0" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {createForm.errors.color && (
                                        <p className="text-xs text-red-500 mt-1">{createForm.errors.color}</p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2 rounded-xl transition duration-250 mt-2"
                                    disabled={createForm.processing}
                                >
                                    {createForm.processing ? 'Menyimpan...' : 'Tambah Label'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Labels List Card */}
                    <Card className="border-neutral-200/60 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900 shadow-sm md:col-span-2">
                        <CardHeader className="pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
                            <CardTitle className="text-sm font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                                <Tag className="h-4 w-4 text-emerald-600" />
                                Daftar Label Anda
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {labels.length > 0 ? (
                                <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                    {labels.map((lbl) => {
                                        const isEditing = editingLabelId === lbl.id;
                                        const colorCfg = colorMap[lbl.color] || colorMap['hitam'];

                                        return (
                                            <div key={lbl.id} className="p-4 transition hover:bg-neutral-50/50 dark:hover:bg-neutral-800/10">
                                                {isEditing ? (
                                                    <form onSubmit={(e) => handleEditSubmit(e, lbl.id)} className="space-y-3">
                                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                                            <Input
                                                                value={editForm.data.name}
                                                                onChange={(e) => editForm.setData('name', e.target.value)}
                                                                className="flex-1 bg-white dark:bg-neutral-950 border-neutral-300 dark:border-neutral-800 text-xs rounded-xl focus:ring-emerald-500 focus:border-emerald-500"
                                                                placeholder="Nama Label"
                                                            />
                                                            <div className="flex gap-1.5 shrink-0">
                                                                <Button
                                                                    type="submit"
                                                                    size="sm"
                                                                    className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold"
                                                                    disabled={editForm.processing}
                                                                >
                                                                    Simpan
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={cancelEditing}
                                                                    className="border-neutral-300 dark:border-neutral-800 rounded-xl text-xs"
                                                                >
                                                                    Batal
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2 items-center">
                                                            <span className="text-[10px] text-neutral-400 font-semibold mr-1">Warna:</span>
                                                            {AVAILABLE_COLORS.map((color) => {
                                                                const isSelected = editForm.data.color === color;
                                                                const itemCfg = colorMap[color];
                                                                return (
                                                                    <button
                                                                        key={color}
                                                                        type="button"
                                                                        onClick={() => editForm.setData('color', color)}
                                                                        className={`h-6 w-6 rounded-full flex items-center justify-center transition cursor-pointer ${itemCfg.dotClass} ${
                                                                            isSelected ? 'ring-2 ring-offset-2 ring-emerald-500 scale-105' : ''
                                                                        }`}
                                                                        title={itemCfg.label}
                                                                    >
                                                                        {isSelected && <Check className="h-3 w-3 text-white" />}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                        {editForm.errors.name && (
                                                            <p className="text-xs text-red-500 mt-1">{editForm.errors.name}</p>
                                                        )}
                                                        {editForm.errors.color && (
                                                            <p className="text-xs text-red-500 mt-1">{editForm.errors.color}</p>
                                                        )}
                                                    </form>
                                                ) : (
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <span className={`text-xs font-bold px-3 py-1 rounded-xl border ${colorCfg.badgeClass} truncate`}>
                                                                {lbl.name}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <button
                                                                onClick={() => startEditing(lbl)}
                                                                className="p-1.5 text-neutral-450 hover:text-emerald-600 rounded-lg transition"
                                                                title="Ubah Label"
                                                            >
                                                                <Edit2 className="h-3.5 w-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => triggerDelete(lbl)}
                                                                className="p-1.5 text-neutral-450 hover:text-red-650 rounded-lg transition"
                                                                title="Hapus Label"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-xs text-neutral-450 italic">
                                    Belum ada label koreksi yang ditambahkan. Gunakan formulir di sebelah kiri untuk menambahkannya.
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
                            Konfirmasi Hapus Label
                        </DialogTitle>
                    </DialogHeader>

                    {deleteTarget && (
                        <div className="space-y-4 mt-2">
                            <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-250/30 p-3.5 rounded-xl text-xs text-red-800 dark:text-red-300">
                                <p className="font-semibold">Peringatan: Aksi ini tidak dapat dibatalkan!</p>
                                <p className="mt-1 opacity-95">
                                    Anda akan menghapus label <strong className="font-extrabold">"{deleteTarget.name}"</strong>. 
                                    Menghapus label ini tidak akan menghapus riwayat bacaan, namun label ini tidak akan muncul lagi di pilihan koreksi bacaan.
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="confirm-input" className="text-xs text-neutral-500 font-medium">
                                    Ketik <strong className="text-neutral-800 dark:text-neutral-200">Hapus</strong> di bawah ini untuk mengonfirmasi:
                                </Label>
                                <Input
                                    id="confirm-input"
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
        </AppLayout>
    );
}
