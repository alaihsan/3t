<?php

namespace App\Http\Controllers;

use App\Models\Classroom;
use App\Models\Student;
use App\Models\CustomLabel;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class ClassroomController extends Controller
{
    /**
     * Display classroom listing.
     */
    public function index(): Response
    {
        $classrooms = Classroom::where('teacher_id', auth()->id())
            ->with(['students.goals' => function ($query) {
                $query->where('created_by', auth()->id());
            }, 'students.classrooms', 'customLabels'])
            ->withCount('students')
            ->orderBy('name')
            ->get();

        // Calculate progress for each student's goals
        foreach ($classrooms as $classroom) {
            foreach ($classroom->students as $student) {
                foreach ($student->goals as $goal) {
                    $progressData = $goal->getProgressData();
                    $goal->total_verses_count = $progressData['total_verses_count'];
                    $goal->logged_verses_count = $progressData['logged_verses_count'];
                    $goal->progress_percentage = $progressData['progress_percentage'];
                }
            }
        }

        $allStudents = Student::orderBy('name')->get();

        return Inertia::render('classrooms/index', [
            'classrooms' => $classrooms,
            'allStudents' => $allStudents,
        ]);
    }

    /**
     * Store a new classroom.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:Takhasus,Tahsin,Tahfizh',
            'description' => 'nullable|string',
        ]);

        Classroom::create([
            'name' => $request->name,
            'type' => $request->type,
            'description' => $request->description,
            'teacher_id' => auth()->id(),
        ]);

        return redirect()->back()->with('success', 'Kelas berhasil dibuat.');
    }

    /**
     * Delete a classroom.
     */
    public function destroy(Classroom $classroom): RedirectResponse
    {
        // Ensure the logged in teacher owns this class
        if ($classroom->teacher_id !== auth()->id()) {
            abort(403, 'Aksi tidak diizinkan.');
        }

        $classroom->delete();

        return redirect()->back()->with('success', 'Kelas berhasil dihapus.');
    }

    /**
     * Import students into a classroom via Excel copy-paste.
     */
    public function importStudents(Request $request, Classroom $classroom): RedirectResponse
    {
        if ($classroom->teacher_id !== auth()->id()) {
            abort(403, 'Aksi tidak diizinkan.');
        }

        $request->validate([
            'paste_data' => 'required|string',
        ]);

        $rawText = $request->paste_data;
        $lines = preg_split('/\r\n|\r|\n/', $rawText);
        $studentIds = [];

        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) {
                continue;
            }

            // Detect delimiter: tab, semicolon, comma, or default to splitting by spaces
            $delimiter = "\t";
            if (strpos($line, "\t") !== false) {
                $delimiter = "\t";
            } elseif (strpos($line, ";") !== false) {
                $delimiter = ";";
            } elseif (strpos($line, ",") !== false) {
                $delimiter = ",";
            } else {
                // If no standard delimiter, try split by space between NIS (alphanumeric/numbers) and Name
                if (preg_match('/^([a-zA-Z0-9_-]+)\s+(.+)$/', $line, $matches)) {
                    $nis = trim($matches[1]);
                    $name = trim($matches[2]);
                    
                    if (!empty($nis) && !empty($name)) {
                        $student = Student::firstOrCreate(
                            ['nis' => $nis],
                            ['name' => $name]
                        );
                        $studentIds[] = $student->id;
                        continue;
                    }
                }
            }

            $parts = explode($delimiter, $line);
            $nis = isset($parts[0]) ? trim($parts[0]) : '';
            $name = isset($parts[1]) ? trim($parts[1]) : '';

            // Fallback if split didn't result in a valid name but we have columns
            if (empty($name) && count($parts) > 1) {
                $name = implode(' ', array_slice($parts, 1));
            }

            if (!empty($nis) && !empty($name)) {
                $student = Student::firstOrCreate(
                    ['nis' => $nis],
                    ['name' => $name]
                );
                $studentIds[] = $student->id;
            }
        }

        if (count($studentIds) > 0) {
            // Attach students to this classroom, ignoring duplicates
            $classroom->students()->syncWithoutDetaching($studentIds);
            return redirect()->back()->with('success', count($studentIds) . ' murid berhasil diimpor.');
        }

        return redirect()->back()->with('error', 'Format data tidak valid. Pastikan berisi NIS dan Nama.');
    }

    /**
     * Add a custom label to a classroom.
     */
    public function addLabel(Request $request, Classroom $classroom): RedirectResponse
    {
        if ($classroom->teacher_id !== auth()->id()) {
            abort(403, 'Aksi tidak diizinkan.');
        }

        $request->validate([
            'name' => 'required|string|max:100',
        ]);

        CustomLabel::create([
            'classroom_id' => $classroom->id,
            'name' => trim($request->name),
        ]);

        return redirect()->back()->with('success', 'Label berhasil ditambahkan.');
    }

    /**
     * Delete a custom label.
     */
    public function deleteLabel(CustomLabel $label): RedirectResponse
    {
        $classroom = $label->classroom;
        if ($classroom->teacher_id !== auth()->id()) {
            abort(403, 'Aksi tidak diizinkan.');
        }

        $label->delete();

        return redirect()->back()->with('success', 'Label berhasil dihapus.');
    }

    /**
     * Add an existing student to a classroom.
     */
    public function addStudent(Request $request, Classroom $classroom): RedirectResponse
    {
        if ($classroom->teacher_id !== auth()->id()) {
            abort(403, 'Aksi tidak diizinkan.');
        }

        $request->validate([
            'student_id' => 'required|exists:students,id',
        ]);

        $classroom->students()->syncWithoutDetaching([$request->student_id]);

        return redirect()->back()->with('success', 'Murid berhasil ditambahkan ke kelas.');
    }

    /**
     * Remove a student from a classroom.
     */
    public function removeStudent(Classroom $classroom, Student $student): RedirectResponse
    {
        if ($classroom->teacher_id !== auth()->id()) {
            abort(403, 'Aksi tidak diizinkan.');
        }

        $classroom->students()->detach($student->id);

        return redirect()->back()->with('success', 'Murid berhasil dikeluarkan dari kelas.');
    }
}

