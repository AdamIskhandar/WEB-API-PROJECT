<?php
require_once "../config/db.php";

header("Content-Type: application/json");

// GET INPUT
$data = json_decode(file_get_contents("php://input"), true);

// VALIDATION
if (
    !isset($data['Name']) ||
    !isset($data['Email']) ||
    !isset($data['Password']) ||
    !isset($data['Role'])
) {
    http_response_code(400);
    echo json_encode(["message" => "Missing required fields"]);
    exit;
}

$name = $data['Name'];
$email = $data['Email'];
$password = $data['Password'];
$role = $data['Role'];
$facultyID = $data['FacultyID'] ?? null;

// CHECK IF USER EXISTS
$stmt = $conn->prepare("SELECT * FROM Users WHERE Email = ?");
$stmt->execute([$email]);

if ($stmt->rowCount() > 0) {
    http_response_code(409);
    echo json_encode(["message" => "Email already exists"]);
    exit;
}

// HASH PASSWORD (VERY IMPORTANT 🔐)
$hashedPassword = password_hash($password, PASSWORD_BCRYPT);

// INSERT USER
$stmt = $conn->prepare("
    INSERT INTO Users (name, Email, Password_Hash, Role, Faculty_ID)
    VALUES (?, ?, ?, ?, ?)
");

$result = $stmt->execute([
    $name,
    $email,
    $hashedPassword,
    $role,
    $facultyID
]);

if ($result) {
    echo json_encode([
        "message" => "User registered successfully"
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        "message" => "Registration failed"
    ]);
}
