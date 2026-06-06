<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'quran' => [
        'client_id' => env('QURAN_CLIENT_ID', 'ecff8ef1-39c0-4339-95ba-e29b8af4172a'),
        'client_secret' => env('QURAN_CLIENT_SECRET', 'cF~AdOXbWlFQm.h1xJWRfAZjHI'),
        'auth_url' => env('QURAN_AUTH_URL', 'https://oauth2.quran.foundation'),
        'api_url' => env('QURAN_API_URL', 'https://apis.quran.foundation'),
    ],

];
