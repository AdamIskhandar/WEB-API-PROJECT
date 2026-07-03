<?php
require_once "db.php";

$data = json_decode(file_get_contents("php://input"), true);
$method = $_SERVER['REQUEST_METHOD'];

if ($method == "GET") {

    if (isset($_GET['id'])) {
        $stmt = $conn->prepare("SELECT * FROM Student_Course_Registration WHERE registration_id=?");
        $stmt->execute([$_GET['id']]);
        echo json_encode($stmt->fetch());
    } else {
        $stmt = $conn->query("SELECT * FROM Student_Course_Registration");
        echo json_encode($stmt->fetchAll());
    }
}

if ($method == "POST") {
    $stmt = $conn->prepare("
        INSERT INTO Student_Course_Registration (student_id, course_id, semester)
        VALUES (?, ?, ?)
    ");

    $stmt->execute([
        $data['student_id'],
        $data['course_id'],
        $data['semester']
    ]);

    echo json_encode(["message" => "Registration created"]);
}

if ($method == "PUT") {
    $stmt = $conn->prepare("
        UPDATE Student_Course_Registration
        SET student_id=?, course_id=?, semester=?
        WHERE registration_id=?
    ");

    $stmt->execute([
        $data['student_id'],
        $data['course_id'],
        $data['semester'],
        $data['registration_id']
    ]);

    echo json_encode(["message" => "Registration updated"]);
}

if ($method == "DELETE") {
    $id = $_GET['id'];
    $stmt = $conn->prepare("DELETE FROM Student_Course_Registration WHERE registration_id=?");
    $stmt->execute([$id]);

    echo json_encode(["message" => "Registration deleted"]);
}
