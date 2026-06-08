import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { ClipboardList, ArrowUpDown, ArrowUp, ArrowDown, Award, Users, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Student {
    id: number;
    name: string;
    nis: string;
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
}

interface ScoreReportProps {
    classrooms: Classroom[];
    students: Student[];
    scores: Record<number, Record<number, 'A' | 'B' | 'C' | 'D'>>;
    chapters: Chapter[];
    filters: {
        classroom_id: number | null;
        type: 'Takhasus' | 'Tahsin' | 'Tahfizh';
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Rekap Nilai',
        href: '/rekap-nilai',
    },
];

// Juz to Surah mapping dictionary
const juzMap: Record<number, number[]> = {
    1: [1, 2],
    2: [2],
    3: [2, 3],
    4: [3, 4],
    5: [4],
    6: [4, 5],
    7: [5, 6],
    8: [6, 7],
    9: [7, 8],
    10: [8, 9],
    11: [9, 10, 11],
    12: [11, 12],
    13: [12, 13, 14],
    14: [15, 16],
    15: [17, 18],
    16: [18, 19, 20],
    17: [21, 22],
    18: [23, 24, 25],
    19: [25, 26, 27],
    20: [27, 28, 29],
    21: [29, 30, 31, 32, 33],
    22: [33, 34, 35, 36],
    23: [36, 37, 38, 39],
    24: [39, 40, 41],
    25: [41, 42, 43, 44, 45],
    26: [46, 47, 48, 49, 50, 51],
    27: [51, 52, 53, 54, 55, 56, 57],
    28: [58, 59, 60, 61, 62, 63, 64, 65, 66],
    29: [67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77],
    30: [78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114],
};

export default function ScoreReport({ classrooms = [], students = [], scores = {}, chapters = [], filters }: ScoreReportProps) {
    const [selectedClass, setSelectedClass] = useState<string>(filters.classroom_id?.toString() || '');
    const [selectedType, setSelectedType] = useState<'Takhasus' | 'Tahsin' | 'Tahfizh'>(filters.type || 'Tahfizh');
    const [selectedJuz, setSelectedJuz] = useState<string>('30'); // Default to Juz 30 as requested
    
    // Sort configuration state
    const [sortConfig, setSortConfig] = useState<{ key: 'name' | number; direction: 'asc' | 'desc' } | null>(null);

    // Run query when classroom or type filter changes
    useEffect(() => {
        if (selectedClass) {
            router.get(
                route('score-reports.index'),
                { classroom_id: selectedClass, type: selectedType },
                { preserveState: true, preserveScroll: true }
            );
        }
    }, [selectedClass, selectedType]);

    // Handle column sorting click
    const handleSort = (key: 'name' | number) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Export to Excel function
    const exportToExcel = () => {
        if (sortedStudents.length === 0) return;

        const classroomName = classrooms.find(c => c.id.toString() === selectedClass)?.name || 'Kelas';

        // Prepare JSON data for Excel sheet conversion
        const data = sortedStudents.map((student, idx) => {
            const row: Record<string, any> = {
                'No': idx + 1,
                'Nama Murid': student.name,
                'NIS': student.nis,
            };
            filteredChapters.forEach((ch) => {
                const colName = `${ch.id}. ${ch.name_complex} (${ch.name_arabic})`;
                row[colName] = scores[student.id]?.[ch.id] || '';
            });
            return row;
        });

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Nilai');

        // Set column widths
        const maxColWidths = [{ wch: 6 }, { wch: 25 }, { wch: 15 }];
        filteredChapters.forEach(() => {
            maxColWidths.push({ wch: 16 });
        });
        worksheet['!cols'] = maxColWidths;

        // Generate download
        XLSX.writeFile(workbook, `Rekap_Nilai_${selectedType}_${classroomName.replace(/\s+/g, '_')}_Juz_${selectedJuz}.xlsx`);
    };

    // Filter surahs based on selected Juz
    const filteredChapters = chapters.filter((ch) => {
        if (selectedJuz === 'all') return true;
        const juzNum = parseInt(selectedJuz, 10);
        const surahList = juzMap[juzNum] || [];
        return surahList.includes(ch.id);
    });

    // Sort students list based on sort config
    const sortedStudents = [...students].sort((a, b) => {
        if (!sortConfig) return 0;
        const { key, direction } = sortConfig;
        
        if (key === 'name') {
            return direction === 'asc' 
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name);
        } else {
            // Sort by specific surah grade
            const gradeA = scores[a.id]?.[key];
            const gradeB = scores[b.id]?.[key];
            
            // Put empty cells at the bottom in both directions
            if (!gradeA && !gradeB) return 0;
            if (!gradeA) return 1;
            if (!gradeB) return -1;
            
            const weights: Record<string, number> = { A: 1, B: 2, C: 3, D: 4 };
            const weightA = weights[gradeA] || 5;
            const weightB = weights[gradeB] || 5;
            
            if (weightA !== weightB) {
                return direction === 'asc' ? weightA - weightB : weightB - weightA;
            }
            
            // secondary sort by name
            return a.name.localeCompare(b.name);
        }
    });

    // Helper to get grade styling
    const getGradeBadge = (grade: 'A' | 'B' | 'C' | 'D' | undefined) => {
        if (!grade) return <span className="text-neutral-300 dark:text-neutral-700">-</span>;
        
        const colors = {
            A: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900',
            B: 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-900',
            C: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900',
            D: 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900',
        };
        
        return (
            <span className={`inline-flex items-center justify-center font-bold text-xs px-2 py-0.5 rounded-md min-w-[1.75rem] ${colors[grade]}`}>
                {grade}
            </span>
        );
    };

    // Render sort icon indicator
    const renderSortIcon = (key: 'name' | number) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40 shrink-0" />;
        }
        return sortConfig.direction === 'asc' 
            ? <ArrowUp className="h-3.5 w-3.5 ml-1 text-emerald-600 dark:text-emerald-450 shrink-0" />
            : <ArrowDown className="h-3.5 w-3.5 ml-1 text-emerald-600 dark:text-emerald-450 shrink-0" />;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Rekap Nilai Setoran - 3T" />

            <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
                            <ClipboardList className="h-6 w-6 text-emerald-650" />
                            Rekap Nilai Setoran Murid
                        </h1>
                        <p className="text-xs text-neutral-500 mt-1">
                            Lihat rekapitulasi nilai setoran (A - D) berdasarkan Kelas, Tipe Target, dan filter Juz Al-Qur'an.
                        </p>
                    </div>
                </div>

                {/* Filters Card */}
                <Card className="border-neutral-200/60 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900 shadow-sm">
                    <CardHeader className="pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
                        <CardTitle className="text-sm font-bold text-neutral-850 dark:text-neutral-200 flex items-center gap-1.5">
                            Filter Rekap Nilai
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="flex flex-wrap gap-4 items-end">
                            {/* Classroom Selector */}
                            <div className="space-y-1.5 w-full sm:w-56">
                                <Label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Pilih Kelas</Label>
                                <Select
                                    value={selectedClass}
                                    onValueChange={setSelectedClass}
                                >
                                    <SelectTrigger className="w-full bg-white dark:bg-neutral-950 border-neutral-300 dark:border-neutral-800 text-xs rounded-xl">
                                        <SelectValue placeholder="Pilih Kelas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classrooms.map((cls) => (
                                            <SelectItem key={cls.id} value={cls.id.toString()}>
                                                {cls.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Target Type Selector */}
                            <div className="space-y-1.5 w-full sm:w-44">
                                <Label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Pilih Program (Tipe)</Label>
                                <Select
                                    value={selectedType}
                                    onValueChange={(val: any) => setSelectedType(val)}
                                >
                                    <SelectTrigger className="w-full bg-white dark:bg-neutral-950 border-neutral-300 dark:border-neutral-800 text-xs rounded-xl">
                                        <SelectValue placeholder="Pilih Tipe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Takhasus">Takhasus</SelectItem>
                                        <SelectItem value="Tahsin">Tahsin</SelectItem>
                                        <SelectItem value="Tahfizh">Tahfizh</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Juz Selector */}
                            <div className="space-y-1.5 w-full sm:w-44">
                                <Label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Pilih Juz</Label>
                                <Select
                                    value={selectedJuz}
                                    onValueChange={setSelectedJuz}
                                >
                                    <SelectTrigger className="w-full bg-white dark:bg-neutral-950 border-neutral-300 dark:border-neutral-800 text-xs rounded-xl">
                                        <SelectValue placeholder="Pilih Juz" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Surah (1 - 114)</SelectItem>
                                        {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => (
                                            <SelectItem key={juz} value={juz.toString()}>
                                                Juz {juz}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Unduh Excel Button */}
                            {students.length > 0 && (
                                <button
                                    onClick={exportToExcel}
                                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl transition duration-200 cursor-pointer shadow-sm shadow-emerald-700/10 h-9 shrink-0"
                                >
                                    <FileSpreadsheet className="h-4 w-4 shrink-0" />
                                    Unduh Excel
                                </button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Score Grid Excel Card */}
                <Card className="border-neutral-200/60 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900 shadow-sm overflow-hidden relative z-0">
                    <CardHeader className="pb-3 border-b border-neutral-100 dark:border-neutral-800/80 flex flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-sm font-bold text-neutral-850 dark:text-neutral-200 flex items-center gap-1.5">
                                Spreadsheet Rekap Nilai
                            </CardTitle>
                            {students.length > 0 && (
                                <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 px-2.5 py-1 rounded-full font-bold">
                                    {students.length} Murid Terdaftar
                                </span>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {students.length > 0 ? (
                            <div className="relative overflow-auto max-h-[580px] w-full border-t border-neutral-100 dark:border-neutral-800 scrollbar-thin">
                                <table className="w-full border-collapse border-spacing-0">
                                    <thead>
                                        <tr className="bg-neutral-50 dark:bg-neutral-950">
                                            {/* Frozen No Header */}
                                            <th className="sticky top-0 left-0 bg-neutral-100 dark:bg-neutral-950 z-20 text-[10px] uppercase font-bold p-3 text-center border-r border-b border-neutral-200 dark:border-neutral-800 w-12 min-w-[3rem]">
                                                No
                                            </th>
                                            {/* Frozen Nama Header */}
                                            <th 
                                                onClick={() => handleSort('name')}
                                                className="sticky top-0 left-12 bg-neutral-100 dark:bg-neutral-950 z-20 text-[10px] uppercase font-bold p-3 text-left border-r border-b border-neutral-300 dark:border-neutral-800 w-48 min-w-[12rem] cursor-pointer hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 select-none group"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span>Nama Murid</span>
                                                    {renderSortIcon('name')}
                                                </div>
                                            </th>
                                            {/* Scrollable Surah Headers */}
                                            {filteredChapters.map((ch) => (
                                                <th 
                                                    key={ch.id}
                                                    onClick={() => handleSort(ch.id)}
                                                    className="sticky top-0 bg-neutral-50 dark:bg-neutral-900 z-10 text-[10px] font-bold p-3 text-center border-r border-b border-neutral-200 dark:border-neutral-800 min-w-[5.5rem] cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 select-none"
                                                >
                                                    <div className="flex flex-col items-center justify-center gap-0.5">
                                                        <span className="font-arabic text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">{ch.name_arabic}</span>
                                                        <span className="text-[9px] text-neutral-500 font-semibold truncate max-w-[5.5rem]">{ch.id}. {ch.name_complex}</span>
                                                        <div className="flex items-center justify-center mt-1">
                                                            {renderSortIcon(ch.id)}
                                                        </div>
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedStudents.map((student, studentIndex) => {
                                            const rowBg = studentIndex % 2 === 0 
                                                ? 'bg-white dark:bg-neutral-900' 
                                                : 'bg-neutral-50/50 dark:bg-neutral-950/20';

                                            return (
                                                <tr key={student.id} className="hover:bg-neutral-100/30 dark:hover:bg-neutral-800/10 transition duration-150">
                                                    {/* Frozen No Body */}
                                                    <td className={`sticky left-0 ${rowBg} z-10 text-center p-3 text-xs border-r border-b border-neutral-200 dark:border-neutral-850 w-12 min-w-[3rem] font-medium text-neutral-500`}>
                                                        {studentIndex + 1}
                                                    </td>
                                                    {/* Frozen Nama Body */}
                                                    <td className={`sticky left-12 ${rowBg} z-10 text-left p-3 text-xs border-r border-b border-neutral-300 dark:border-neutral-850 w-48 min-w-[12rem] font-semibold text-neutral-850 dark:text-neutral-200 truncate`}>
                                                        <div className="flex flex-col">
                                                            <span>{student.name}</span>
                                                            <span className="text-[9px] text-neutral-400 font-normal">NIS: {student.nis}</span>
                                                        </div>
                                                    </td>
                                                    {/* Scrollable Surah Body Cells */}
                                                    {filteredChapters.map((ch) => {
                                                        const grade = scores[student.id]?.[ch.id];
                                                        return (
                                                            <td 
                                                                key={ch.id}
                                                                className={`text-center p-3 text-xs border-r border-b border-neutral-200 dark:border-neutral-800 ${rowBg} min-w-[5.5rem]`}
                                                            >
                                                                {getGradeBadge(grade)}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="py-16 text-center text-xs text-neutral-450 italic flex flex-col items-center justify-center gap-2">
                                <Users className="h-8 w-8 text-neutral-300 animate-pulse" />
                                <span>Pilih kelas yang memiliki murid terdaftar untuk melihat rekap nilai.</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
