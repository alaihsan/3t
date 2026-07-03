<?php

namespace App\Http\Controllers;

use App\Models\CorrectionLabel;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class CorrectionLabelController extends Controller
{
    /**
     * Display a listing of the correction labels.
     */
    public function index(): Response
    {
        $labels = CorrectionLabel::where('teacher_id', auth()->id())
            ->orderBy('name')
            ->get();

        return Inertia::render('labels/index', [
            'labels' => $labels,
        ]);
    }

    /**
     * Store a newly created correction label.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'required|string|in:merah,kuning,hijau,hitam,biru,orange,ungu',
        ]);

        CorrectionLabel::create([
            'teacher_id' => auth()->id(),
            'name' => $request->name,
            'color' => $request->color,
        ]);

        return redirect()->back()->with('success', 'Label berhasil ditambahkan.');
    }

    /**
     * Update the specified correction label.
     */
    public function update(Request $request, CorrectionLabel $label): RedirectResponse
    {
        if ($label->teacher_id != auth()->id()) {
            abort(403, 'Aksi tidak diizinkan.');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'required|string|in:merah,kuning,hijau,hitam,biru,orange,ungu',
        ]);

        $label->update([
            'name' => $request->name,
            'color' => $request->color,
        ]);

        return redirect()->back()->with('success', 'Label berhasil diperbarui.');
    }

    /**
     * Remove the specified correction label.
     */
    public function destroy(CorrectionLabel $label): RedirectResponse
    {
        if ($label->teacher_id != auth()->id()) {
            abort(403, 'Aksi tidak diizinkan.');
        }

        $label->delete();

        return redirect()->back()->with('success', 'Label berhasil dihapus.');
    }
}
