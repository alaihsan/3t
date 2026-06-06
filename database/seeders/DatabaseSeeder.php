<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Student;
use App\Models\Classroom;
use App\Models\CustomLabel;
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
    }
}
