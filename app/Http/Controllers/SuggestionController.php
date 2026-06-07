<?php

namespace App\Http\Controllers;

use App\Models\Suggestion;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class SuggestionController extends Controller
{
    /**
     * Display listing of suggestions.
     */
    public function index(): Response
    {
        $suggestions = Suggestion::with('user')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('suggestions/index', [
            'suggestions' => $suggestions
        ]);
    }

    /**
     * Store a new suggestion.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        Suggestion::create([
            'user_id' => auth()->id(),
            'subject' => $request->subject,
            'content' => $request->input('content'),
        ]);

        return redirect()->back()->with('success', 'Saran & perbaikan berhasil dikirim.');
    }

    /**
     * Update an existing suggestion.
     */
    public function update(Request $request, Suggestion $suggestion): RedirectResponse
    {
        // Check if suggestion belongs to current user
        if ($suggestion->user_id !== auth()->id()) {
            abort(403, 'Aksi tidak diizinkan.');
        }

        $request->validate([
            'subject' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $suggestion->update([
            'subject' => $request->subject,
            'content' => $request->input('content'),
        ]);

        return redirect()->back()->with('success', 'Saran & perbaikan berhasil diperbarui.');
    }

    /**
     * Delete a suggestion.
     */
    public function destroy(Suggestion $suggestion): RedirectResponse
    {
        if ($suggestion->user_id !== auth()->id()) {
            abort(403, 'Aksi tidak diizinkan.');
        }

        $suggestion->delete();

        return redirect()->back()->with('success', 'Saran & perbaikan berhasil dihapus.');
    }
}
