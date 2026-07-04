<?php

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

require_once __DIR__ . '/../vendor/autoload.php';

class JWTHandler
{

    private static $secret_key = "exam_management_system_super_secure_2026_key_!@#_JWT_SECRET_987654321";
    private static $algorithm = "HS256";

    // CREATE TOKEN
    public static function generateToken($user)
    {
        $payload = [
            "iss" => "exam-api",
            "iat" => time(),
            "exp" => time() + (60 * 60), // 1 hour
            "data" => [
                "id" => $user["user_id"],
                "email" => $user["email"],
                "role" => $user["role"]
            ]
        ];

        return JWT::encode($payload, self::$secret_key, self::$algorithm);
    }

    // VERIFY TOKEN
    public static function decodeToken($token)
    {
        return JWT::decode($token, new Key(self::$secret_key, self::$algorithm));
    }
}
