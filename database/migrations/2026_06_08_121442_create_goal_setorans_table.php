<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('goal_setorans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_goal_id')->constrained('student_goals')->onDelete('cascade');
            $table->integer('surah_number');
            $table->integer('verse_number');
            $table->string('grade'); // A, B, C, D
            $table->text('notes')->nullable();
            $table->foreignId('logged_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('goal_setorans');
    }
};
