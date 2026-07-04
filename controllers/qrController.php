<?php
require_once __DIR__ . "/../middleware/errorHandler.php";
require_once __DIR__ . "/../middleware/authMiddleware.php";



require_once "services/qrService.php";

header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

$user = authenticate();

// Validate input
if (!isset($data['examId']) || !isset($data['studentId'])) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Missing required fields"
    ]);
    exit;
}

// Build QR content (Exam Slip Info)
$qrText = "
Exam Slip
Exam ID: {$data['examId']}
Student ID: {$data['studentId']}
Course: {$data['course']}
Date: {$data['date']}
";

// Generate QR
$qrCode = QRService::generate($qrText);

// Response
echo json_encode([
    "success" => true,
    "message" => "QR Code generated successfully",
    "qr_code_url" => $qrCode
]);
