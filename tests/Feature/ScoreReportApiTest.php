<?php

use App\Models\User;
use App\Models\Classroom;

test('anyone can access score report API', function () {
    $response = $this->get('/api/rekap-nilai');

    $response->assertOk();
    $response->assertJsonStructure([
        'classrooms',
        'students',
        'scores',
        'chapters',
        'filters',
    ]);
    
    // Check CORS headers
    $response->assertHeader('Access-Control-Allow-Origin', '*');
});

test('score report API checks API token if configured', function () {
    putenv('API_TOKEN=my-secret-token');

    $response = $this->get('/api/rekap-nilai');
    $response->assertStatus(401);

    $responseWithHeader = $this->withHeaders(['X-API-TOKEN' => 'my-secret-token'])->get('/api/rekap-nilai');
    $responseWithHeader->assertOk();

    $responseWithQuery = $this->get('/api/rekap-nilai?api_token=my-secret-token');
    $responseWithQuery->assertOk();

    // Clean up env
    putenv('API_TOKEN');
});

test('score report API allows filtering by student NIS for parent view', function () {
    // Create teacher, student and classroom
    $teacher = User::factory()->create();
    $student = \App\Models\Student::create([
        'nis' => '99999',
        'name' => 'Anak Saya',
    ]);
    
    $classroom = Classroom::create([
        'name' => 'Kelas Test',
        'type' => 'Tahfizh',
        'teacher_id' => $teacher->id,
    ]);
    $classroom->students()->attach($student->id);

    $response = $this->get('/api/rekap-nilai?nis=99999');
    $response->assertOk();
    
    // Check if the student list returned contains only that student
    $data = $response->json();
    expect($data['students'])->toHaveCount(1);
    expect($data['students'][0]['nis'])->toBe('99999');
    expect($data['students'][0]['name'])->toBe('Anak Saya');
});
