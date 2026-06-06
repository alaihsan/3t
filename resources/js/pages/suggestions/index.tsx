import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, SharedData } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Folder, MessageSquare, Send, Calendar, Pencil, Trash2, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface User {
    id: number;
    name: string;
}

interface Suggestion {
    id: number;
    user_id: number;
    subject: string;
    content: string;
    created_at: string;
    user: User;
}

interface SuggestionsIndexProps {
    suggestions: Suggestion[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Saran & Perbaikan',
        href: '/suggestions',
    },
];

export default function SuggestionsIndex({ suggestions = [] }: SuggestionsIndexProps) {
    const { auth } = usePage<SharedData>().props;
    const currentUserId = auth.user?.id;

    // Modals state
    const [editTarget, setEditTarget] = useState<Suggestion | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    
    const [deleteTarget, setDeleteTarget] = useState<Suggestion | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    // Create Form
    const createForm = useForm({
        subject: '',
        content: '',
    });

    // Edit Form
    const editForm = useForm({
        subject: '',
        content: '',
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('suggestions.store'), {
            onSuccess: () => createForm.reset(),
        });
    };

    const triggerEdit = (suggestion: Suggestion) => {
        setEditTarget(suggestion);
        editForm.setData({
            subject: suggestion.subject,
            content: suggestion.content,
        });
        setIsEditOpen(true);
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editTarget) return;
        editForm.put(route('suggestions.update', { suggestion: editTarget.id }), {
            onSuccess: () => {
                setIsEditOpen(false);
                setEditTarget(null);
            },
        });
    };

    const triggerDelete = (suggestion: Suggestion) => {
        setDeleteTarget(suggestion);
        setDeleteConfirmText('');
        setIsDeleteOpen(true);
    };

    const executeDelete = () => {
        if (deleteConfirmText !== 'Hapus' || !deleteTarget) return;
        createForm.delete(route('suggestions.destroy', { suggestion: deleteTarget.id }), {
            onSuccess: () => {
                setIsDeleteOpen(false);
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
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Saran & Perbaikan - 3T" />

            <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full h-[calc(100vh-4rem)] overflow-hidden">
                {/* Header */}
                <div className="shrink-0">
                    <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
                        <Folder className="h-6 w-6 text-emerald-600" />
                        Saran & Perbaikan
                    </h1>
                    <p className="text-xs text-neutral-500 mt-1">
                        Sampaikan masukan, laporan bug, atau perbaikan fitur untuk pengembangan aplikasi 3T.
                    </p>
                </div>

                {/* Workspace Panels */}
                <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden min-h-0">
                    {/* Left Panel: Form to create suggestion */}
                    <div className="w-full md:w-96 shrink-0">
                        <Card className="border-neutral-200/80 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900 shadow-sm h-full flex flex-col overflow-hidden">
                            <CardHeader className="pb-4 border-b border-neutral-100 dark:border-neutral-800">
                                <CardTitle className="text-sm font-bold flex items-center gap-2 text-neutral-800 dark:text-neutral-200">
                                    <MessageSquare className="h-4.5 w-4.5 text-emerald-600" />
                                    Kirim Masukan Baru
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Berikan ide atau koreksi Anda untuk membantu menyempurnakan aplikasi ini.
                                </CardDescription>
                            </CardHeader>
                            
                            <CardContent className="pt-4 flex-1 overflow-y-auto">
                                <form onSubmit={handleCreate} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="subject" className="text-xs text-neutral-400">Judul Masukan / Topik</Label>
                                        <Input
                                            id="subject"
                                            placeholder="Contoh: Perbaikan UI Quran, Laporan Bug..."
                                            value={createForm.data.subject}
                                            onChange={(e) => createForm.setData('subject', e.target.value)}
                                            className="w-full bg-white dark:bg-neutral-950 border-neutral-300 dark:border-neutral-800 text-xs rounded-xl"
                                            required
                                        />
                                        {createForm.errors.subject && <p className="text-xs text-red-500">{createForm.errors.subject}</p>}
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="content" className="text-xs text-neutral-400">Isi Masukan / Detail</Label>
                                        <Textarea
                                            id="content"
                                            rows={6}
                                            placeholder="Jelaskan secara detail saran atau perbaikan yang Anda usulkan..."
                                            value={createForm.data.content}
                                            onChange={(e) => createForm.setData('content', e.target.value)}
                                            className="w-full bg-white dark:bg-neutral-950 border-neutral-300 dark:border-neutral-800 text-xs rounded-xl"
                                            required
                                        />
                                        {createForm.errors.content && <p className="text-xs text-red-500">{createForm.errors.content}</p>}
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold px-4 flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
                                        disabled={createForm.processing}
                                    >
                                        <Send className="h-3.5 w-3.5" />
                                        {createForm.processing ? 'Mengirim...' : 'Kirim Masukan'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Panel: List of Suggestions */}
                    <div className="flex-1 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900 flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 font-semibold text-xs text-neutral-500 uppercase tracking-wider shrink-0 bg-neutral-50/20 dark:bg-neutral-950/20">
                            Daftar Masukan Rekan Guru ({suggestions.length})
                        </div>
                        
                        <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800 p-3 space-y-3">
                            {suggestions.map((item) => {
                                const isOwner = item.user_id === currentUserId;
                                return (
                                    <div key={item.id} className="p-4 rounded-xl border border-neutral-200 bg-white dark:bg-neutral-950 dark:border-neutral-850 hover:shadow-sm transition">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-1.5">
                                                <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-100 leading-tight">
                                                    {item.subject}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-3 text-[10px] text-neutral-400">
                                                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">Oleh: {item.user.name}</span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {formatDateTime(item.created_at)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Action buttons (only for owner) */}
                                            {isOwner && (
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => triggerEdit(item)}
                                                        className="h-7 w-7 text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-lg cursor-pointer"
                                                        title="Edit Masukan"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => triggerDelete(item)}
                                                        className="h-7 w-7 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg cursor-pointer"
                                                        title="Hapus Masukan"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        <p className="mt-3 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
                                            {item.content}
                                        </p>
                                    </div>
                                );
                            })}
                            {suggestions.length === 0 && (
                                <div className="text-center py-12 text-neutral-400 text-xs italic flex flex-col items-center">
                                    <MessageSquare className="h-10 w-10 text-neutral-300 dark:text-neutral-700 mb-2" />
                                    <span>Belum ada masukan yang dikirim. Jadilah yang pertama memberikan saran!</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* EDIT MODAL DIALOG */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
                            <Pencil className="h-5 w-5 text-emerald-600" />
                            Ubah Masukan
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleEdit} className="space-y-4 mt-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="edit_subject" className="text-xs text-neutral-400">Judul Masukan</Label>
                            <Input
                                id="edit_subject"
                                value={editForm.data.subject}
                                onChange={(e) => editForm.setData('subject', e.target.value)}
                                className="w-full bg-white dark:bg-neutral-950 border-neutral-300 dark:border-neutral-800 text-xs rounded-xl"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="edit_content" className="text-xs text-neutral-400">Isi Masukan</Label>
                            <Textarea
                                id="edit_content"
                                rows={6}
                                value={editForm.data.content}
                                onChange={(e) => editForm.setData('content', e.target.value)}
                                className="w-full bg-white dark:bg-neutral-950 border-neutral-300 dark:border-neutral-800 text-xs rounded-xl"
                                required
                            />
                        </div>

                        <DialogFooter className="pt-2 flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsEditOpen(false);
                                    setEditTarget(null);
                                }}
                                className="text-xs border-neutral-300 dark:border-neutral-800 rounded-xl"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 rounded-xl cursor-pointer"
                                disabled={editForm.processing}
                            >
                                {editForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* STRICT DELETE DIALOG */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="max-w-md bg-white dark:bg-neutral-900 border border-red-200 dark:border-red-950 rounded-2xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-red-600 dark:text-red-500 flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5" />
                            Hapus Masukan Permanen
                        </DialogTitle>
                    </DialogHeader>

                    {deleteTarget && (
                        <div className="space-y-4 mt-2">
                            <div className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                                Anda akan menghapus saran/perbaikan berjudul{' '}
                                <strong className="text-neutral-900 dark:text-white font-bold">"{deleteTarget.subject}"</strong>.
                                <p className="mt-1 text-red-500 dark:text-red-400 font-semibold">Tindakan ini tidak dapat dibatalkan!</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="delete_confirm" className="text-xs text-neutral-400">
                                    Silakan ketik <strong className="text-neutral-800 dark:text-neutral-200">Hapus</strong> di bawah untuk melanjutkan:
                                </Label>
                                <Input
                                    id="delete_confirm"
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
                                        setIsDeleteOpen(false);
                                        setDeleteTarget(null);
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
                                    Hapus
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
