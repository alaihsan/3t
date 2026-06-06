<?php

namespace App\Http\Controllers;

use App\Services\QuranService;
use App\Models\Classroom;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QuranController extends Controller
{
    protected QuranService $quranService;

    public function __construct(QuranService $quranService)
    {
        $this->quranService = $quranService;
    }

    /**
     * Display all Surahs.
     */
    public function index(Request $request): Response
    {
        $chapters = $this->quranService->getChapters();
        
        // Fetch classrooms managed by the logged in teacher, including their students and custom labels
        $classrooms = Classroom::where('teacher_id', auth()->id())
            ->with(['students', 'customLabels'])
            ->orderBy('name')
            ->get();

        return Inertia::render('quran/index', [
            'chapters' => $chapters,
            'classrooms' => $classrooms,
        ]);
    }

    /**
     * Display verses of a Surah.
     */
    public function show(Request $request, int $id): Response
    {
        $chapters = $this->quranService->getChapters();
        $verses = $this->quranService->getChapterVerses($id);

        // Find current chapter details
        $currentChapter = collect($chapters)->firstWhere('id', $id);
        if (!$currentChapter) {
            abort(404, 'Surah tidak ditemukan');
        }

        // Fetch classrooms managed by the logged in teacher
        $classrooms = Classroom::where('teacher_id', auth()->id())
            ->with(['students', 'customLabels'])
            ->orderBy('name')
            ->get();

        return Inertia::render('quran/show', [
            'chapter' => $currentChapter,
            'verses' => $verses,
            'classrooms' => $classrooms,
            'chapters' => $chapters, // For side quick-navigation
        ]);
    }
}
