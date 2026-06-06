<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\StudentGoal;
use App\Models\ReadingHistory;

echo "--- STUDENT GOALS ---\n";
$goals = StudentGoal::with(['student', 'classroom'])->get();
foreach ($goals as $goal) {
    echo "ID: {$goal->id} | Student: {$goal->student->name} | Classroom: {$goal->classroom->name} | Target: {$goal->target_name} | Range: {$goal->target_surah_start}:{$goal->target_verse_start} - {$goal->target_surah_end}:{$goal->target_verse_end} | Status: {$goal->status}\n";
}

echo "\n--- READING HISTORIES ---\n";
$histories = ReadingHistory::with('student')->get();
foreach ($histories as $log) {
    echo "Log ID: {$log->id} | Student: {$log->student->name} | Surah: {$log->surah_number} | Verse: {$log->verse_number}\n";
}
