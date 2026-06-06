import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { BookOpen, HelpCircle, GraduationCap, Users, History, FileText, CheckCircle, Search, MessageSquare, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dokumentasi',
        href: '/documentation',
    },
];

export default function DocumentationIndex() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dokumentasi - 3T Al Quran" />

            <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full h-[calc(100vh-4rem)] overflow-y-auto">
                {/* Header Banner */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 to-emerald-950 p-8 text-white shadow-xl shrink-0">
                    <div className="absolute inset-0 opacity-5 pointer-events-none">
                        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                            <pattern id="islamic-grid-docs" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 20 0 L 40 20 L 20 40 L 0 20 Z" fill="none" stroke="#ffffff" strokeWidth="1" />
                            </pattern>
                            <rect width="100%" height="100%" fill="url(#islamic-grid-docs)" />
                        </svg>
                    </div>

                    <div className="relative z-10 flex items-center gap-4">
                        <BookOpen className="h-10 w-10 text-amber-400 shrink-0" />
                        <div>
                            <h1 className="text-2xl font-bold">Dokumentasi & Panduan Penggunaan</h1>
                            <p className="text-xs text-emerald-100/80 mt-1">
                                Pelajari cara mudah mengoperasikan aplikasi 3T (Takhasus, Tahsin, Tahfizh) untuk membimbing murid.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Section 1: Pendahuluan */}
                <div className="space-y-3 bg-neutral-50/50 dark:bg-neutral-900/30 p-5 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                    <h2 className="text-sm font-bold text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
                        <HelpCircle className="h-4.5 w-4.5 text-emerald-600" />
                        Apa itu Aplikasi 3T?
                    </h2>
                    <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                        Aplikasi <strong>3T (Takhasus, Tahsin, Tahfizh)</strong> adalah platform pembelajaran Al-Qur'an interaktif yang dikembangkan untuk membantu para Ustadz dan Ustadzah (Guru/Teacher) dalam mendata murid, mengelola kelas, serta merekam perkembangan kualitas bacaan dan setoran hafalan secara praktis. Aplikasi ini terhubung langsung secara digital ke data mushaf Al-Qur'an resmi.
                    </p>
                </div>

                {/* Section 2: Penjelasan Fitur */}
                <div className="space-y-4">
                    <h2 className="text-sm font-bold text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
                        <CheckCircle className="h-4.5 w-4.5 text-emerald-600" />
                        Fitur Utama & Penjelasan
                    </h2>

                    <div className="grid grid-cols-1 gap-4">
                        {/* Feature: Google Search */}
                        <Card className="border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-950 rounded-2xl shadow-sm overflow-hidden">
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-xs font-bold flex items-center gap-2 text-neutral-800 dark:text-neutral-200">
                                    <Search className="h-4 w-4 text-emerald-600" />
                                    Pencarian Pintar Dashboard (Model Google Search)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                                Di halaman utama (Dashboard) terdapat kotak pencarian besar yang didesain mirip Google Search. Fitur ini memungkinkan Anda mencari data secara global:
                                <ul className="list-disc list-inside mt-2 space-y-1 pl-1 text-[11px]">
                                    <li><strong>Nama Murid:</strong> Menampilkan murid yang cocok untuk langsung diarahkan ke riwayat belajarnya.</li>
                                    <li><strong>Nama Kelas:</strong> Menampilkan kelas 3T yang terdaftar untuk langsung mengelola kelas tersebut.</li>
                                    <li><strong>Ayat Al-Qur'an:</strong> Ketik nama surah diikuti nomor ayat (misalnya <code className="font-mono bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded text-emerald-650">Al-Baqarah 255</code> atau <code className="font-mono bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded text-emerald-650">2:255</code>) untuk melompat langsung ke halaman pembaca Al-Qur'an pada posisi ayat tersebut secara presisi.</li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Feature: Quran Interaktif */}
                        <Card className="border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-950 rounded-2xl shadow-sm overflow-hidden">
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-xs font-bold flex items-center gap-2 text-neutral-800 dark:text-neutral-200">
                                    <BookOpen className="h-4 w-4 text-emerald-600" />
                                    Al-Qur'an Digital & Penilaian Instan
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                                Membaca Al-Qur'an secara live di depan murid. Jika Anda mengaktifkan pilihan **Kelas** dan **Nama Murid** di bar atas halaman Quran:
                                <ul className="list-disc list-inside mt-2 space-y-1 pl-1 text-[11px]">
                                    <li><strong>Klik Per Kata:</strong> Jika murid salah melafalkan kata tertentu, cukup klik kata bahasa Arab tersebut untuk mencatat evaluasi khusus kata (dilengkapi lafaz arab otomatis).</li>
                                    <li><strong>Klik Dua Kali (Double-Click) Nomor Ayat:</strong> Klik dua kali lingkaran nomor ayat untuk mencatat catatan evaluasi satu ayat utuh.</li>
                                    <li><strong>Label Penilaian Kustom:</strong> Untuk kelas Takhasus dan Tahsin, Anda dapat menggunakan label kustom yang sudah Anda buat sebelumnya (seperti Tajwid, Makhraj, Lancar, dll.) untuk mempercepat pemberian tanda kesalahan.</li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Feature: Kelas Excel */}
                        <Card className="border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-950 rounded-2xl shadow-sm overflow-hidden">
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-xs font-bold flex items-center gap-2 text-neutral-800 dark:text-neutral-200">
                                    <Users className="h-4 w-4 text-emerald-600" />
                                    Manajemen Kelas & Impor Salin-Tempel Excel
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                                Membuat kelas pendampingan 3T dengan mudah. Anda tidak perlu memasukkan nama murid satu per satu. Cukup salin dua kolom (kolom pertama berisi **NIS** dan kolom kedua berisi **Nama Murid**) dari aplikasi Excel atau Google Sheets, lalu tempelkan (paste) langsung ke kolom yang disediakan untuk mendaftarkan seluruh murid secara massal dalam hitungan detik.
                            </CardContent>
                        </Card>

                        {/* Feature: Riwayat Bacaan */}
                        <Card className="border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-950 rounded-2xl shadow-sm overflow-hidden">
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-xs font-bold flex items-center gap-2 text-neutral-800 dark:text-neutral-200">
                                    <History className="h-4 w-4 text-emerald-600" />
                                    Riwayat Bacaan Murid & Autoscroll Kembali ke Quran
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                                Semua evaluasi dikelompokkan secara rapi berdasarkan nama murid. Anda dapat memantau grafik perkembangan setoran murid, melihat catatan khusus, dan menghapus logs. Yang paling istimewa: Anda dapat mengklik lencana lokasi ayat (contoh: `Surah Ke-2, Ayat 10`), dan aplikasi akan otomatis mengarahkan Anda kembali ke halaman mushaf, melakukan gulir (scroll) otomatis ke ayat tersebut, serta memberikan efek kedipan highlight warna kuning emas agar mudah ditinjau bersama murid.
                            </CardContent>
                        </Card>

                        {/* Feature: Saran & Perbaikan CRUD */}
                        <Card className="border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-950 rounded-2xl shadow-sm overflow-hidden">
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-xs font-bold flex items-center gap-2 text-neutral-800 dark:text-neutral-200">
                                    <MessageSquare className="h-4 w-4 text-emerald-600" />
                                    Saran & Perbaikan (CRUD)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                                Menu khusus bagi para Ustadz dan Ustadzah untuk saling berbagi masukan, kritik konstruktif, ide pengembangan aplikasi, atau melaporkan bug. Fitur ini mendukung operasi CRUD penuh: Anda dapat **membuat** usulan baru, **melihat** daftar masukan dari rekan guru lain, **mengubah** isi masukan Anda sendiri, atau **menghapusnya** secara aman.
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Section 3: Langkah Penggunaan */}
                <div className="space-y-4">
                    <h2 className="text-sm font-bold text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
                        <FileText className="h-4.5 w-4.5 text-emerald-600" />
                        Panduan Langkah Demi Langkah
                    </h2>

                    <div className="space-y-4 border-l-2 border-emerald-650/30 pl-4 py-1">
                        <div>
                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">1. Persiapan Kelas Baru</span>
                            <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1 leading-relaxed">
                                Masuk ke menu **Kelas**. Buat kelas baru dengan menekan tombol tambah kelas, isi nama kelas (misal: <code className="font-mono bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded text-emerald-650">Takhasus 7A</code>) dan tentukan jenis programnya.
                            </p>
                        </div>

                        <div>
                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">2. Mendaftarkan Murid Massal (Impor Excel)</span>
                            <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1 leading-relaxed">
                                Buka kelas yang telah Anda buat, klik tab **Impor Murid**. Buka file data murid Anda di Microsoft Excel. Blok kolom NIS dan Nama murid (tanpa header tabel), salin (Ctrl+C), lalu paste (Ctrl+V) langsung ke area input teks besar di aplikasi. Klik **Proses Impor Murid** untuk menyimpannya.
                            </p>
                        </div>

                        <div>
                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">3. Melakukan Penilaian Mengaji</span>
                            <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1 leading-relaxed">
                                Buka menu **Al Quran**. Di bagian atas halaman reader, pilih **Kelas** dan pilih **Nama Murid** yang akan menyetor bacaan. Buka surah yang dituju. Lakukan penilaian dengan mengklik kata bahasa arab yang salah dibaca atau klik dua kali nomor di akhir ayat. Tulis catatan evaluasi Anda dan klik **Simpan Catatan**.
                            </p>
                        </div>

                        <div>
                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">4. Evaluasi Mandiri Rekap Murid</span>
                            <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1 leading-relaxed">
                                Buka menu **Riwayat Bacaan**. Di panel sebelah kiri, pilih nama murid yang ingin ditinjau. Anda akan melihat daftar kesalahan dan perkembangan setoran murid tersebut secara rinci.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Section 4: Keamanan Strict Deletion */}
                <div className="p-5 border border-red-200 dark:border-red-950 bg-red-50/10 dark:bg-red-950/10 rounded-2xl space-y-2 shrink-0">
                    <h3 className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                        <AlertTriangle className="h-4.5 w-4.5" />
                        Sistem Keamanan Penghapusan Data (Verifikasi Ketat)
                    </h3>
                    <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                        Untuk mencegah terhapusnya data penting secara tidak sengaja, aplikasi 3T menerapkan sistem konfirmasi ketat untuk semua aksi penghapusan (seperti menghapus kelas, mengeluarkan murid, menghapus catatan riwayat bacaan, maupun saran perbaikan). Anda diharuskan mengetik kata secara manual berupa kata <strong className="text-red-600 dark:text-red-400 font-bold">"Hapus"</strong> (sensitif huruf besar-kecil) di dalam dialog konfirmasi sebelum tombol hapus dapat diaktifkan.
                    </p>
                </div>

                {/* Footer info */}
                <div className="text-[10px] text-neutral-400 text-center border-t border-neutral-100 dark:border-neutral-800 pt-6 mt-4 shrink-0">
                    Dokumentasi Panduan Aplikasi Al Quran 3T • Versi 1.0.0
                </div>
            </div>
        </AppLayout>
    );
}
