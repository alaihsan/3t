<?php

use App\Http\Controllers\QuranController;
use App\Http\Controllers\ClassroomController;
use App\Http\Controllers\ReadingHistoryController;
use App\Http\Controllers\SuggestionController;
use App\Http\Controllers\CorrectionLabelController;
use App\Http\Controllers\StudentGoalController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Land on login page by default
Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        $teacherId = auth()->id();
        
        // Count classrooms managed by this teacher
        $classrooms = \App\Models\Classroom::where('teacher_id', $teacherId)->with('students')->get();
        $students = \App\Models\Student::whereHas('classrooms', function ($q) use ($teacherId) {
            $q->where('teacher_id', $teacherId);
        })->get();
        $chapters = app(\App\Services\QuranService::class)->getChapters();

        $classCount = $classrooms->count();
        $studentCount = $students->count();
        $logCount = \App\Models\ReadingHistory::where('logged_by', $teacherId)->count();

        // Weekly activity calculation for analytic dashboard
        $weeklyActivity = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $englishDay = now()->subDays($i)->format('l');
            $shortDays = [
                'Sunday' => 'Min', 'Monday' => 'Sen', 'Tuesday' => 'Sel', 'Wednesday' => 'Rab',
                'Thursday' => 'Kam', 'Friday' => 'Jum', 'Saturday' => 'Sab'
            ];
            $dayLabel = $shortDays[$englishDay] ?? substr($englishDay, 0, 3);
            
            $count = \App\Models\ReadingHistory::where('logged_by', $teacherId)
                ->whereDate('created_at', $date)
                ->count();
            
            $weeklyActivity[] = [
                'day' => $dayLabel,
                'count' => $count
            ];
        }

        // Label distribution calculation for donut chart
        $histories = \App\Models\ReadingHistory::where('logged_by', $teacherId)->get();
        $labelCounts = [];
        foreach ($histories as $history) {
            if (is_array($history->labels)) {
                foreach ($history->labels as $label) {
                    $labelCounts[$label] = ($labelCounts[$label] ?? 0) + 1;
                }
            }
        }
        
        $correctionLabels = \App\Models\CorrectionLabel::where('teacher_id', $teacherId)->get();
        $labelDistribution = [];
        foreach ($correctionLabels as $cLabel) {
            $count = $labelCounts[$cLabel->name] ?? 0;
            $labelDistribution[] = [
                'name' => $cLabel->name,
                'color' => $cLabel->color,
                'count' => $count
            ];
        }

        // Fetch top 5 active student goals and calculate their progress percentages
        $activeGoals = \App\Models\StudentGoal::where('created_by', $teacherId)
            ->where('status', 'aktif')
            ->with(['student', 'classroom'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function (\App\Models\StudentGoal $goal) {
                $progressData = $goal->getProgressData();
                $goal->total_verses_count = $progressData['total_verses_count'];
                $goal->logged_verses_count = $progressData['logged_verses_count'];
                $goal->progress_percentage = $progressData['progress_percentage'];
                return $goal;
            });

        return Inertia::render('dashboard', [
            'classCount' => $classCount,
            'studentCount' => $studentCount,
            'logCount' => $logCount,
            'classrooms' => $classrooms,
            'students' => $students,
            'chapters' => $chapters,
            'weeklyActivity' => $weeklyActivity,
            'labelDistribution' => $labelDistribution,
            'activeGoals' => $activeGoals,
        ]);
    })->name('dashboard');

    // Al Quran API connected routes
    Route::get('quran', [QuranController::class, 'index'])->name('quran.index');
    Route::get('quran/{id}', [QuranController::class, 'show'])->name('quran.show');

    // Classrooms Management
    Route::get('classrooms', [ClassroomController::class, 'index'])->name('classrooms.index');
    Route::post('classrooms', [ClassroomController::class, 'store'])->name('classrooms.store');
    Route::delete('classrooms/{classroom}', [ClassroomController::class, 'destroy'])->name('classrooms.destroy');
    Route::post('classrooms/{classroom}/import', [ClassroomController::class, 'importStudents'])->name('classrooms.import');
    Route::post('classrooms/{classroom}/labels', [ClassroomController::class, 'addLabel'])->name('classrooms.add-label');
    Route::delete('labels/{label}', [ClassroomController::class, 'deleteLabel'])->name('classrooms.delete-label');
    Route::delete('classrooms/{classroom}/students/{student}', [ClassroomController::class, 'removeStudent'])->name('classrooms.remove-student');
    Route::post('classrooms/{classroom}/students', [ClassroomController::class, 'addStudent'])->name('classrooms.add-student');

    // Reading Histories
    Route::get('reading-histories', [ReadingHistoryController::class, 'index'])->name('reading-histories.index');
    Route::post('reading-histories', [ReadingHistoryController::class, 'store'])->name('reading-histories.store');
    Route::delete('reading-histories/{readingHistory}', [ReadingHistoryController::class, 'destroy'])->name('reading-histories.destroy');

    // Suggestions & Feedback (Saran & Perbaikan)
    Route::get('suggestions', [SuggestionController::class, 'index'])->name('suggestions.index');
    Route::post('suggestions', [SuggestionController::class, 'store'])->name('suggestions.store');
    Route::put('suggestions/{suggestion}', [SuggestionController::class, 'update'])->name('suggestions.update');
    Route::delete('suggestions/{suggestion}', [SuggestionController::class, 'destroy'])->name('suggestions.destroy');

    // Dokumentasi
    Route::get('documentation', function () {
        return Inertia::render('documentation/index');
    })->name('documentation.index');

    // Pengaturan Label CRUD
    Route::get('correction-labels', [CorrectionLabelController::class, 'index'])->name('correction-labels.index');
    Route::post('correction-labels', [CorrectionLabelController::class, 'store'])->name('correction-labels.store');
    Route::put('correction-labels/{label}', [CorrectionLabelController::class, 'update'])->name('correction-labels.update');
    Route::delete('correction-labels/{label}', [CorrectionLabelController::class, 'destroy'])->name('correction-labels.destroy');

    // Student Goals (Goal Tracker)
    Route::get('student-goals', [StudentGoalController::class, 'index'])->name('student-goals.index');
    Route::post('student-goals', [StudentGoalController::class, 'store'])->name('student-goals.store');
    Route::put('student-goals/{goal}', [StudentGoalController::class, 'update'])->name('student-goals.update');
    Route::delete('student-goals/{goal}', [StudentGoalController::class, 'destroy'])->name('student-goals.destroy');

    // Student Goal Submissions (Setoran)
    Route::post('goal-setorans', [\App\Http\Controllers\GoalSetoranController::class, 'store'])->name('goal-setorans.store');
    Route::delete('goal-setorans/{setoran}', [\App\Http\Controllers\GoalSetoranController::class, 'destroy'])->name('goal-setorans.destroy');

    // Score Reports (Rekap Nilai)
    Route::get('rekap-nilai', [\App\Http\Controllers\ScoreReportController::class, 'index'])->name('score-reports.index');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
