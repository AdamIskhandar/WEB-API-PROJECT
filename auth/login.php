<?php
require_once "../config/db.php";
require_once "../config/jwt.php";

header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

$email = $data['email'];
$password = $data['password'];

// FIND USER
$stmt = $conn->prepare("SELECT * FROM Users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    http_response_code(401);
    echo json_encode(["message" => "User not found"]);
    exit;
}

// VERIFY PASSWORD
if (!password_verify($password, $user['password_hash'])) {
    http_response_code(401);
    echo json_encode(["message" => "Invalid password"]);
    exit;
}

// GENERATE TOKEN
$token = JWTHandler::generateToken($user);

echo json_encode([
    "message" => "Login successful",
    "token" => $token
]);
