<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GoalSetoran extends Model
{
    use HasFactory;

    protected $table = 'goal_setorans';

    protected $fillable = [
        'student_goal_id',
        'surah_number',
        'verse_number',
        'grade',
        'notes',
        'logged_by',
    ];

    public function studentGoal(): BelongsTo
    {
        return $this->belongsTo(StudentGoal::class, 'student_goal_id');
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'logged_by');
    }
}
