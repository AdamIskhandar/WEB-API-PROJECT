<?php
$host = "localhost";
$dbname = "exam_management_system";
$username = "root";
$password = "";
$port     = 3307;

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;port=$port", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}
