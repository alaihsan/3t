<?php

use App\Http\Controllers\QuranController;
use App\Http\Controllers\ClassroomController;
use App\Http\Controllers\ReadingHistoryController;
use App\Http\Controllers\SuggestionController;
use App\Http\Controllers\CorrectionLabelController;
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

        return Inertia::render('dashboard', [
            'classCount' => $classCount,
            'studentCount' => $studentCount,
            'logCount' => $logCount,
            'classrooms' => $classrooms,
            'students' => $students,
            'chapters' => $chapters,
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
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
