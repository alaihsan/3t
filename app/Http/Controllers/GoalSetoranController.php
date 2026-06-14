<?php

namespace App\Http\Controllers;

use App\Models\GoalSetoran;
use App\Models\StudentGoal;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;

class GoalSetoranController extends Controller
{
    /**
     * Store a new setoran for a student goal.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'student_goal_id' => 'required|exists:student_goals,id',
            'surah_number' => 'required|integer|min:1|max:114',
            'verse_number' => 'nullable|required_without:grade|integer|min:1',
            'grade' => 'nullable|required_without:verse_number|string|in:A,B,C,D',
            'notes' => 'nullable|string',
        ]);

        $goal = StudentGoal::findOrFail($request->student_goal_id);

        // Ensure teacher owns this goal
        if ($goal->created_by !== auth()->id()) {
            abort(403, 'Aksi tidak diizinkan.');
        }

        // Validate verse number against maximum verses in the selected surah
        if ($request->filled('verse_number')) {
            $maxVerses = StudentGoal::$surahVerses[$request->surah_number] ?? 286; // default fallback
            if ($request->verse_number > $maxVerses) {
                return redirect()->back()->withErrors([
                    'verse_number' => "Surah tersebut hanya memiliki maksimal {$maxVerses} ayat."
                ])->withInput();
            }
        }

        GoalSetoran::create([
            'student_goal_id' => $request->student_goal_id,
            'surah_number' => $request->surah_number,
            'verse_number' => $request->verse_number,
            'grade' => $request->grade,
            'notes' => $request->notes,
            'logged_by' => auth()->id(),
        ]);

        return redirect()->back()->with('success', 'Setoran hafalan berhasil dicatat.');
    }

    /**
     * Delete a setoran record.
     */
    public function destroy(GoalSetoran $setoran): RedirectResponse
    {
        // Ensure teacher owns this goal
        if ($setoran->studentGoal->created_by !== auth()->id()) {
            abort(403, 'Aksi tidak diizinkan.');
        }

        $setoran->delete();

        return redirect()->back()->with('success', 'Catatan setoran hafalan berhasil dihapus.');
    }
}
