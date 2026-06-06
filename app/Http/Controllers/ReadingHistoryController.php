<?php

namespace App\Http\Controllers;

use App\Models\ReadingHistory;
use App\Models\Classroom;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class ReadingHistoryController extends Controller
{
    /**
     * Display reading history lists.
     */
    public function index(Request $request): Response
    {
        $query = ReadingHistory::with(['student', 'classroom', 'teacher'])
            ->whereHas('classroom', function ($q) {
                // Only see histories of classrooms taught by the current teacher
                $q->where('teacher_id', auth()->id());
            });

        // Search by student name or NIS
        if ($request->filled('search')) {
            $query->whereHas('student', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('nis', 'like', '%' . $request->search . '%');
            });
        }

        // Filter by classroom
        if ($request->filled('classroom_id')) {
            $query->where('classroom_id', $request->classroom_id);
        }

        // Filter by type
        if ($request->filled('type')) {
            $query->whereHas('classroom', function ($q) use ($request) {
                $q->where('type', $request->type);
            });
        }

        $histories = $query->orderBy('created_at', 'desc')->get();

        // Get classrooms filter options
        $classrooms = Classroom::where('teacher_id', auth()->id())
            ->orderBy('name')
            ->get();

        return Inertia::render('reading-histories/index', [
            'histories' => $histories,
            'classrooms' => $classrooms,
            'filters' => $request->only(['search', 'classroom_id', 'type']),
        ]);
    }

    /**
     * Store a reading history entry.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'classroom_id' => 'required|exists:classrooms,id',
            'surah_number' => 'required|integer|min:1|max:114',
            'verse_number' => 'required|integer|min:1',
            'word_position' => 'nullable|integer',
            'word_text' => 'nullable|string|max:255',
            'comments' => 'nullable|string',
            'labels' => 'nullable|array',
        ]);

        // Verify teacher owns this classroom
        $classroom = Classroom::findOrFail($request->classroom_id);
        if ($classroom->teacher_id !== auth()->id()) {
            abort(403, 'Aksi tidak diizinkan.');
        }

        ReadingHistory::create([
            'student_id' => $request->student_id,
            'classroom_id' => $request->classroom_id,
            'surah_number' => $request->surah_number,
            'verse_number' => $request->verse_number,
            'word_position' => $request->word_position,
            'word_text' => $request->word_text,
            'comments' => $request->comments,
            'labels' => $request->labels, // automatically casted to json
            'logged_by' => auth()->id(),
        ]);

        return redirect()->back()->with('success', 'Catatan bacaan berhasil disimpan.');
    }

    /**
     * Delete a reading history entry.
     */
    public function destroy(ReadingHistory $readingHistory): RedirectResponse
    {
        // Check if teacher owns the classroom this log belongs to
        if ($readingHistory->classroom->teacher_id !== auth()->id()) {
            abort(403, 'Aksi tidak diizinkan.');
        }

        $readingHistory->delete();

        return redirect()->back()->with('success', 'Catatan bacaan berhasil dihapus.');
    }
}
