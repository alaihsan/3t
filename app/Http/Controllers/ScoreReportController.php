<?php

namespace App\Http\Controllers;

use App\Models\Classroom;
use App\Models\Student;
use App\Models\GoalSetoran;
use App\Models\StudentGoal;
use App\Services\QuranService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ScoreReportController extends Controller
{
    protected QuranService $quranService;

    public function __construct(QuranService $quranService)
    {
        $this->quranService = $quranService;
    }

    /**
     * Display the score report.
     */
    public function index(Request $request): Response
    {
        $teacherId = auth()->id();

        // Get classrooms managed by the teacher
        $classrooms = Classroom::where('teacher_id', $teacherId)
            ->orderBy('name')
            ->get();

        // Inputs
        $classroomId = $request->input('classroom_id');
        $type = $request->input('type');

        // Fallbacks
        if (!$classroomId && $classrooms->count() > 0) {
            $classroomId = $classrooms->first()->id;
        }

        if (!$type) {
            $type = 'Tahfizh';
        }

        $students = [];
        $scores = [];

        if ($classroomId) {
            $classroom = Classroom::where('id', $classroomId)
                ->where('teacher_id', $teacherId)
                ->first();

            if ($classroom) {
                // Fetch students in this classroom
                $students = Student::whereHas('classrooms', function ($q) use ($classroomId) {
                    $q->where('classrooms.id', $classroomId);
                })->orderBy('name')->get();

                // Fetch all setorans for goals in this classroom and target type
                $setorans = GoalSetoran::whereHas('studentGoal', function ($q) use ($classroomId, $type) {
                    $q->where('classroom_id', $classroomId)
                      ->where('target_type', $type);
                })
                ->orderBy('created_at', 'asc') // older first, so newer overwrites in the array mapping
                ->get();

                foreach ($setorans as $setoran) {
                    $studentId = $setoran->studentGoal->student_id;
                    $surahNum = $setoran->surah_number;
                    $scores[$studentId][$surahNum] = $setoran->grade;
                }
            }
        }

        $chapters = $this->quranService->getChapters();

        return Inertia::render('rekap-nilai/index', [
            'classrooms' => $classrooms,
            'students' => $students,
            'scores' => (object) $scores,
            'chapters' => $chapters,
            'filters' => [
                'classroom_id' => $classroomId ? (int) $classroomId : null,
                'type' => $type,
            ]
        ]);
    }
}
