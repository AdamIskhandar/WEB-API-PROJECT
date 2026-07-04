<?php
require_once __DIR__ . '/../config/jwt.php';

function authenticate()
{

    $headers = getallheaders();

    if (!isset($headers['Authorization'])) {
        http_response_code(401);
        echo json_encode(["message" => "No token provided"]);
        exit;
    }

    $token = str_replace("Bearer ", "", $headers['Authorization']);

    try {
        $decoded = JWTHandler::decodeToken($token);

        // OPTIONAL: store user data globally
        return $decoded->data;
    } catch (Exception $e) {
        http_response_code(403);
        echo json_encode([
            "message" => "Invalid or expired token"
        ]);
        exit;
    }
}
