<?php

namespace App\Http\Controllers;

use App\Models\StudentGoal;
use App\Models\Classroom;
use App\Models\Student;
use App\Services\QuranService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class StudentGoalController extends Controller
{
    protected QuranService $quranService;

    protected $surahVerses = [
        1 => 7, 2 => 286, 3 => 200, 4 => 176, 5 => 120, 6 => 165, 7 => 206, 8 => 75, 9 => 129, 10 => 109,
        11 => 123, 12 => 111, 13 => 43, 14 => 52, 15 => 99, 16 => 128, 17 => 111, 18 => 110, 19 => 98, 20 => 135,
        21 => 112, 22 => 78, 23 => 118, 24 => 64, 25 => 77, 26 => 227, 27 => 93, 28 => 88, 29 => 69, 30 => 60,
        31 => 34, 32 => 30, 33 => 73, 34 => 54, 35 => 45, 36 => 83, 37 => 182, 38 => 88, 39 => 75, 40 => 85,
        41 => 54, 42 => 53, 43 => 89, 44 => 59, 45 => 37, 46 => 35, 47 => 38, 48 => 29, 49 => 18, 50 => 45,
        51 => 60, 52 => 49, 53 => 62, 54 => 55, 55 => 78, 56 => 96, 57 => 29, 58 => 22, 59 => 24, 60 => 13,
        61 => 14, 62 => 11, 63 => 11, 64 => 18, 65 => 12, 66 => 12, 67 => 30, 68 => 52, 69 => 52, 70 => 44,
        71 => 28, 72 => 28, 73 => 20, 74 => 56, 75 => 40, 76 => 31, 77 => 50, 78 => 40, 79 => 46, 80 => 42,
        81 => 29, 82 => 19, 83 => 36, 84 => 25, 85 => 22, 86 => 17, 87 => 19, 88 => 26, 89 => 30, 90 => 20,
        91 => 15, 92 => 21, 93 => 11, 94 => 8, 95 => 8, 96 => 19, 97 => 5, 98 => 8, 99 => 8, 100 => 11,
        101 => 11, 102 => 8, 103 => 3, 104 => 9, 105 => 5, 106 => 4, 107 => 7, 108 => 3, 109 => 6, 110 => 3,
        111 => 5, 112 => 4, 113 => 5, 114 => 6
    ];

    public function __construct(QuranService $quranService)
    {
        $this->quranService = $quranService;
    }

    /**
     * Display a listing of goals with their calculated progress.
     */
    public function index(): Response
    {
        $teacherId = auth()->id();

        // Get student goals created by this teacher
        $rawGoals = StudentGoal::where('created_by', $teacherId)
            ->with(['student', 'classroom'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Calculate progress for each goal dynamically using the model helper
        $goals = $rawGoals->map(function (StudentGoal $goal) {
            $progressData = $goal->getProgressData();
            
            $goal->total_verses_count = $progressData['total_verses_count'];
            $goal->logged_verses_count = $progressData['logged_verses_count'];
            $goal->progress_percentage = $progressData['progress_percentage'];

            return $goal;
        });

        // Get classrooms managed by the teacher to populate forms
        $classrooms = Classroom::where('teacher_id', $teacherId)
            ->with('students')
            ->orderBy('name')
            ->get();

        $chapters = $this->quranService->getChapters();

        return Inertia::render('goals/index', [
            'goals' => $goals,
            'classrooms' => $classrooms,
            'chapters' => $chapters,
        ]);
    }

    /**
     * Store a new student goal.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'classroom_id' => 'required|exists:classrooms,id',
            'target_name' => 'required|string|max:255',
            'target_type' => 'required|string|in:Takhasus,Tahsin,Tahfizh',
            'target_surah_start' => 'required|integer|min:1|max:114',
            'target_verse_start' => 'required|integer|min:1',
            'target_surah_end' => 'required|integer|min:1|max:114',
            'target_verse_end' => 'required|integer|min:1',
        ]);

        // Verify teacher manages the classroom
        $classroom = Classroom::findOrFail($request->classroom_id);
        if ($classroom->teacher_id !== auth()->id()) {
            abort(403, 'Aksi tidak diizinkan.');
        }

        StudentGoal::create([
            'student_id' => $request->student_id,
            'classroom_id' => $request->classroom_id,
            'target_name' => $request->target_name,
            'target_type' => $request->target_type,
            'target_surah_start' => $request->target_surah_start,
            'target_verse_start' => $request->target_verse_start,
            'target_surah_end' => $request->target_surah_end,
            'target_verse_end' => $request->target_verse_end,
            'status' => 'aktif',
            'created_by' => auth()->id(),
        ]);

        return redirect()->back()->with('success', 'Target belajar berhasil ditambahkan.');
    }

    /**
     * Update goal status.
     */
    public function update(Request $request, StudentGoal $goal): RedirectResponse
    {
        if ($goal->created_by !== auth()->id()) {
            abort(403, 'Aksi tidak diizinkan.');
        }

        $request->validate([
            'status' => 'required|string|in:aktif,selesai,dibatalkan',
        ]);

        $goal->update([
            'status' => $request->status,
        ]);

        return redirect()->back()->with('success', 'Status target belajar berhasil diperbarui.');
    }

    /**
     * Delete student goal.
     */
    public function destroy(StudentGoal $goal): RedirectResponse
    {
        if ($goal->created_by !== auth()->id()) {
            abort(403, 'Aksi tidak diizinkan.');
        }

        $goal->delete();

        return redirect()->back()->with('success', 'Target belajar berhasil dihapus.');
    }

    /* --- Helper functions for dynamic progress --- */

    private function getVersesInRange($sStart, $vStart, $sEnd, $vEnd)
    {
        if ($sStart == $sEnd) {
            return max($vEnd - $vStart + 1, 0);
        }

        // Keep bounds orderly
        if ($sStart > $sEnd) {
            return 0;
        }

        $total = 0;
        // Verses in first surah
        $total += max(($this->surahVerses[$sStart] ?? 0) - $vStart + 1, 0);

        // Verses in middle surahs
        for ($s = $sStart + 1; $s < $sEnd; $s++) {
            $total += $this->surahVerses[$s] ?? 0;
        }

        // Verses in end surah
        $total += $vEnd;

        return $total;
    }

    private function getLoggedVersesCount($studentId, $sStart, $vStart, $sEnd, $vEnd)
    {
        $logs = \App\Models\ReadingHistory::where('student_id', $studentId)->get();
        $uniqueLogged = [];

        foreach ($logs as $log) {
            $s = $log->surah_number;
            $v = $log->verse_number;

            $inRange = false;
            if ($sStart == $sEnd) {
                if ($s == $sStart && $v >= $vStart && $v <= $vEnd) {
                    $inRange = true;
                }
            } else {
                if ($s == $sStart && $v >= $vStart) {
                    $inRange = true;
                } elseif ($s > $sStart && $s < $sEnd) {
                    $inRange = true;
                } elseif ($s == $sEnd && $v <= $vEnd) {
                    $inRange = true;
                }
            }

            if ($inRange) {
                $uniqueLogged["{$s}_{$v}"] = true;
            }
        }

        return count($uniqueLogged);
    }
}
