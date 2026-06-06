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
        Schema::create('student_goals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->foreignId('classroom_id')->constrained('classrooms')->onDelete('cascade');
            $table->string('target_name');
            $table->string('target_type'); // Takhasus, Tahsin, Tahfizh
            $table->integer('target_surah_start');
            $table->integer('target_verse_start');
            $table->integer('target_surah_end');
            $table->integer('target_verse_end');
            $table->string('status')->default('aktif'); // aktif, selesai, dibatalkan
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_goals');
    }
};
