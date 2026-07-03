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
                    if ($setoran->verse_number !== null && $setoran->verse_number !== '') {
                        $scores[$studentId][$surahNum] = 'Ayt ' . $setoran->verse_number;
                    } else {
                        $scores[$studentId][$surahNum] = $setoran->grade;
                    }
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

    /**
     * Get score report data as JSON for external sites.
     */
    public function apiReport(Request $request): \Illuminate\Http\JsonResponse
    {
        // Simple security: check token if API_TOKEN is configured in env
        $apiToken = env('API_TOKEN');
        if ($apiToken && $request->header('X-API-TOKEN') !== $apiToken && $request->input('api_token') !== $apiToken) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        // Parent portal query parameters: nis or student_id
        $nis = $request->input('nis');
        $studentId = $request->input('student_id');
        
        $targetStudent = null;
        if ($studentId) {
            $targetStudent = Student::find($studentId);
        } elseif ($nis) {
            $targetStudent = Student::where('nis', $nis)->first();
        }

        $classroomId = $request->input('classroom_id');
        $type = $request->input('type');

        if (!$type) {
            $type = 'Tahfizh';
        }

        // If we are looking for a specific student (Parent account view)
        if ($targetStudent) {
            $studentClassrooms = Classroom::whereHas('students', function ($q) use ($targetStudent) {
                $q->where('students.id', $targetStudent->id);
            })->orderBy('name')->get();

            if (!$classroomId && $studentClassrooms->count() > 0) {
                $classroomId = $studentClassrooms->first()->id;
            }

            $students = [$targetStudent];
            $scores = [];

            if ($classroomId) {
                $setorans = GoalSetoran::whereHas('studentGoal', function ($q) use ($classroomId, $type, $targetStudent) {
                    $q->where('classroom_id', $classroomId)
                      ->where('target_type', $type)
                      ->where('student_id', $targetStudent->id);
                })
                ->orderBy('created_at', 'asc')
                ->get();

                foreach ($setorans as $setoran) {
                    $surahNum = $setoran->surah_number;
                    if ($setoran->verse_number !== null && $setoran->verse_number !== '') {
                        $scores[$targetStudent->id][$surahNum] = 'Ayt ' . $setoran->verse_number;
                    } else {
                        $scores[$targetStudent->id][$surahNum] = $setoran->grade;
                    }
                }
            }

            $chapters = $this->quranService->getChapters();

            return response()->json([
                'classrooms' => $studentClassrooms,
                'students' => $students,
                'scores' => (object) $scores,
                'chapters' => $chapters,
                'filters' => [
                    'classroom_id' => $classroomId ? (int) $classroomId : null,
                    'type' => $type,
                    'student_id' => $targetStudent->id,
                    'nis' => $targetStudent->nis,
                ]
            ])
            ->header('Access-Control-Allow-Origin', '*')
            ->header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization, X-API-TOKEN, X-Requested-With');
        }

        // Otherwise, standard classroom-wide query (teacher view)
        $teacherId = $request->input('teacher_id');
        
        $classroomsQuery = Classroom::orderBy('name');
        if ($teacherId) {
            $classroomsQuery->where('teacher_id', $teacherId);
        }
        $classrooms = $classroomsQuery->get();

        if (!$classroomId && $classrooms->count() > 0) {
            $classroomId = $classrooms->first()->id;
        }

        $students = [];
        $scores = [];

        if ($classroomId) {
            $classroom = Classroom::find($classroomId);

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
                ->orderBy('created_at', 'asc')
                ->get();

                foreach ($setorans as $setoran) {
                    $studentId = $setoran->studentGoal->student_id;
                    $surahNum = $setoran->surah_number;
                    if ($setoran->verse_number !== null && $setoran->verse_number !== '') {
                        $scores[$studentId][$surahNum] = 'Ayt ' . $setoran->verse_number;
                    } else {
                        $scores[$studentId][$surahNum] = $setoran->grade;
                    }
                }
            }
        }

        $chapters = $this->quranService->getChapters();

        return response()->json([
            'classrooms' => $classrooms,
            'students' => $students,
            'scores' => (object) $scores,
            'chapters' => $chapters,
            'filters' => [
                'classroom_id' => $classroomId ? (int) $classroomId : null,
                'type' => $type,
                'teacher_id' => $teacherId ? (int) $teacherId : null,
            ]
        ])
        ->header('Access-Control-Allow-Origin', '*')
        ->header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization, X-API-TOKEN, X-Requested-With');
    }
}
