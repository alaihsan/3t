<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Student;
use App\Models\Classroom;
use App\Models\CustomLabel;
use App\Models\CorrectionLabel;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Teachers
        $syawqi = User::create([
            'name' => 'Ustadz Syawqi',
            'username' => 'syawqi',
            'email' => 'syawqi@3t.com',
            'password' => Hash::make('passwd'),
        ]);

        $hafiz = User::create([
            'name' => 'Ustadz Hafiz',
            'username' => 'hafiz',
            'email' => 'hafiz@3t.com',
            'password' => Hash::make('passwd'),
        ]);

        $laila = User::create([
            'name' => 'Ustadzah Laila',
            'username' => 'laila',
            'email' => 'laila@3t.com',
            'password' => Hash::make('passwd'),
        ]);

        // 2. Seed Classrooms for grades 7, 8, 9 with letters A, B, C, D
        $types = ['Takhasus', 'Tahsin', 'Tahfizh'];
        $grades = ['7', '8', '9'];
        $letters = ['A', 'B', 'C', 'D'];

        // Map teacher IDs dynamically to seed
        $teachers = [$syawqi->id, $hafiz->id, $laila->id];
        $teacherIndex = 0;

        foreach ($types as $type) {
            foreach ($grades as $grade) {
                foreach ($letters as $letter) {
                    $className = "{$type} {$grade}{$letter}";
                    
                    // Assign to one of the teachers
                    $teacherId = $teachers[$teacherIndex % count($teachers)];
                    $teacherIndex++;

                    $classroom = Classroom::create([
                        'name' => $className,
                        'type' => $type,
                        'description' => "Kelas {$type} untuk angkatan kelas {$grade} kelompok {$letter}",
                        'teacher_id' => $teacherId,
                    ]);

                    // Seed default labels depending on the class type
                    if ($type === 'Tahsin') {
                        $labels = ["Makhraj", "Tajwid", "Ghunnah / Dengung", "Waqaf & Ibtida'", "Harakat"];
                    } elseif ($type === 'Takhasus') {
                        $labels = ["Sabaq (Hafalan Baru)", "Sabaqi (Hafalan Kemarin)", "Manzil (Hafalan Lama)", "Lancar", "Kurang Lancar"];
                    } else {
                        // Tahfizh
                        $labels = ["Lancar Sekali", "Lancar", "Banyak Salah", "Tercampur Ayat Lain"];
                    }

                    foreach ($labels as $labelName) {
                        CustomLabel::create([
                            'classroom_id' => $classroom->id,
                            'name' => $labelName,
                        ]);
                    }
                }
            }
        }

        // 3. Seed some default students and put them in a few classes
        $studentsData = [
            ['nis' => '10001', 'name' => 'Ahmad Fauzi'],
            ['nis' => '10002', 'name' => 'Siti Aminah'],
            ['nis' => '10003', 'name' => 'Muhammad Ali'],
            ['nis' => '10004', 'name' => 'Fatimah Az-Zahra'],
            ['nis' => '10005', 'name' => 'Yusuf Habibi'],
            ['nis' => '10006', 'name' => 'Zahra Humaira'],
            ['nis' => '10007', 'name' => 'Hamzah Asadullah'],
            ['nis' => '10008', 'name' => 'Aisyah Humaira'],
        ];

        $students = [];
        foreach ($studentsData as $data) {
            $students[] = Student::create($data);
        }

        // Assign some students to classes taught by Ustadz Syawqi
        $syawqiClasses = Classroom::where('teacher_id', $syawqi->id)->take(3)->get();
        foreach ($syawqiClasses as $class) {
            // Assign 3 random students
            $class->students()->attach([
                $students[rand(0, 3)]->id,
                $students[rand(4, 7)]->id
            ]);
        }

        // 4. Seed default CorrectionLabels for teachers
        $defaultLabels = [
            ['name' => 'Makhraj', 'color' => 'merah'],
            ['name' => 'Tajwid', 'color' => 'kuning'],
            ['name' => 'Lancar', 'color' => 'hijau'],
            ['name' => 'Sifat Huruf', 'color' => 'biru'],
            ['name' => 'Waqaf & Ibtida\'', 'color' => 'orange'],
            ['name' => 'Dengung', 'color' => 'ungu'],
            ['name' => 'Kurang Lancar', 'color' => 'hitam'],
        ];

        foreach ($teachers as $teacherId) {
            foreach ($defaultLabels as $lbl) {
                CorrectionLabel::create([
                    'teacher_id' => $teacherId,
                    'name' => $lbl['name'],
                    'color' => $lbl['color'],
                ]);
            }
        }

        // 5. Seed default StudentGoals and matching Reading Histories
        $syawqiStudents = \DB::table('classroom_student')
            ->join('classrooms', 'classroom_student.classroom_id', '=', 'classrooms.id')
            ->where('classrooms.teacher_id', $syawqi->id)
            ->select('classroom_student.student_id', 'classroom_student.classroom_id', 'classrooms.type')
            ->get();

        foreach ($syawqiStudents as $index => $item) {
            $surahStart = 78 + ($index % 4); // An-Naba, An-Naziat, Abasa, At-Takwir
            $versesCount = [78 => 40, 79 => 46, 80 => 42, 81 => 29];
            $endVerse = $versesCount[$surahStart] ?? 20;

            // Determine how many verses are read for realistic progress display
            $readCount = 0;
            $status = 'aktif';
            if ($index % 4 == 0) {
                $readCount = 15; // 15/40 = 37.5% progress
            } elseif ($index % 4 == 1) {
                $readCount = 23; // 23/46 = 50% progress
            } elseif ($index % 4 == 2) {
                $readCount = 10; // 10/42 = 23.8% progress
            } else {
                $readCount = $endVerse; // 100% progress
                $status = 'selesai';
            }

            \App\Models\StudentGoal::create([
                'student_id' => $item->student_id,
                'classroom_id' => $item->classroom_id,
                'target_name' => 'Khatam Surah ' . ($surahStart == 78 ? 'An-Naba' : ($surahStart == 79 ? 'An-Naziat' : ($surahStart == 80 ? 'Abasa' : 'At-Takwir'))),
                'target_type' => $item->type,
                'target_surah_start' => $surahStart,
                'target_verse_start' => 1,
                'target_surah_end' => $surahStart,
                'target_verse_end' => $endVerse,
                'status' => $status,
                'created_by' => $syawqi->id,
            ]);

            // Seed Reading Histories for this goal range to populate progress bar
            for ($v = 1; $v <= $readCount; $v++) {
                \App\Models\ReadingHistory::create([
                    'student_id' => $item->student_id,
                    'classroom_id' => $item->classroom_id,
                    'surah_number' => $surahStart,
                    'verse_number' => $v,
                    'comments' => $v % 3 == 0 ? 'Bacaan tajwid baik dan makhraj tepat.' : 'Lancar, teruskan.',
                    'labels' => $v % 5 == 0 ? ['Tajwid', 'Lancar'] : ['Lancar'],
                    'logged_by' => $syawqi->id,
                ]);
            }
        }
    }
}
