<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentGoal extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'classroom_id',
        'target_name',
        'target_type',
        'target_surah_start',
        'target_verse_start',
        'target_surah_end',
        'target_verse_end',
        'status',
        'created_by',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function classroom(): BelongsTo
    {
        return $this->belongsTo(Classroom::class);
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function setorans(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(GoalSetoran::class, 'student_goal_id');
    }

    public static $surahVerses = [
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

    public function getProgressData()
    {
        $sStart = $this->target_surah_start;
        $vStart = $this->target_verse_start;
        $sEnd = $this->target_surah_end;
        $vEnd = $this->target_verse_end;

        if ($sStart == $sEnd) {
            $total = max($vEnd - $vStart + 1, 0);
        } elseif ($sStart > $sEnd) {
            $total = 0;
        } else {
            $total = 0;
            $total += max((self::$surahVerses[$sStart] ?? 0) - $vStart + 1, 0);
            for ($s = $sStart + 1; $s < $sEnd; $s++) {
                $total += self::$surahVerses[$s] ?? 0;
            }
            $total += $vEnd;
        }

        $logs = ReadingHistory::where('student_id', $this->student_id)->get();
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

        $logged = count($uniqueLogged);
        $progress = $total > 0 ? round(($logged / $total) * 100, 1) : 0;
        $progress = min($progress, 100);

        return [
            'total_verses_count' => $total,
            'logged_verses_count' => $logged,
            'progress_percentage' => $progress,
        ];
    }
}
