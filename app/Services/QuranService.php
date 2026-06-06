<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class QuranService
{
    protected string $clientId;
    protected string $clientSecret;
    protected string $authUrl;
    protected string $apiUrl;

    public function __construct()
    {
        $this->clientId = config('services.quran.client_id');
        $this->clientSecret = config('services.quran.client_secret');
        $this->authUrl = config('services.quran.auth_url');
        $this->apiUrl = config('services.quran.api_url');
    }

    /**
     * Get OAuth2 Access Token with caching.
     */
    public function getAccessToken(): ?string
    {
        return Cache::remember('quran_access_token', 3000, function () {
            try {
                $response = Http::asForm()
                    ->withBasicAuth($this->clientId, $this->clientSecret)
                    ->post("{$this->authUrl}/oauth2/token", [
                        'grant_type' => 'client_credentials',
                        'scope' => 'content',
                    ]);

                if ($response->successful()) {
                    return $response->json('access_token');
                }

                Log::error('Quran Foundation OAuth Token Request failed', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
            } catch (\Exception $e) {
                Log::error('Quran Foundation OAuth Connection error', [
                    'message' => $e->getMessage()
                ]);
            }

            return null;
        });
    }

    /**
     * Fetch all chapters (Surahs).
     */
    public function getChapters(string $language = 'id'): array
    {
        return Cache::remember('quran_chapters_' . $language, 86400, function () use ($language) {
            $token = $this->getAccessToken();
            if (!$token) {
                return [];
            }

            try {
                $response = Http::withHeaders([
                    'x-auth-token' => $token,
                    'x-client-id' => $this->clientId,
                ])->get("{$this->apiUrl}/content/api/v4/chapters", [
                    'language' => $language
                ]);

                if ($response->successful()) {
                    return $response->json('chapters') ?? [];
                }

                Log::error('Failed to fetch chapters', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
            } catch (\Exception $e) {
                Log::error('Error fetching chapters', [
                    'message' => $e->getMessage()
                ]);
            }

            return [];
        });
    }

    /**
     * Fetch verses of a chapter with Indonesian translation.
     */
    public function getChapterVerses(int $chapterNumber, int $perPage = 300): array
    {
        return Cache::remember("quran_verses_ch_{$chapterNumber}_p_{$perPage}", 86400, function () use ($chapterNumber, $perPage) {
            $token = $this->getAccessToken();
            if (!$token) {
                return [];
            }

            try {
                // translation ID 33 is the Indonesian Kemenag translation.
                $response = Http::withHeaders([
                    'x-auth-token' => $token,
                    'x-client-id' => $this->clientId,
                ])->get("{$this->apiUrl}/content/api/v4/verses/by_chapter/{$chapterNumber}", [
                    'translations' => 33,
                    'fields' => 'text_uthmani,text_uthmani_tajweed',
                    'per_page' => $perPage
                ]);

                if ($response->successful()) {
                    return $response->json('verses') ?? [];
                }

                Log::error("Failed to fetch verses for chapter {$chapterNumber}", [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
            } catch (\Exception $e) {
                Log::error("Error fetching verses for chapter {$chapterNumber}", [
                    'message' => $e->getMessage()
                ]);
            }

            return [];
        });
    }
}
