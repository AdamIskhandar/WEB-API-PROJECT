<?php
require_once "db.php";

$data = json_decode(file_get_contents("php://input"), true);
$method = $_SERVER['REQUEST_METHOD'];

if ($method == "GET") {

    if (isset($_GET['id'])) {
        $stmt = $pdo->prepare("SELECT * FROM Courses WHERE course_id=?");
        $stmt->execute([$_GET['id']]);
        echo json_encode($stmt->fetch());
    } else {
        $stmt = $pdo->query("SELECT * FROM Courses");
        echo json_encode($stmt->fetchAll());
    }
}

if ($method == "POST") {
    $stmt = $pdo->prepare("
        INSERT INTO Courses (course_code, course_name, credit_hours, faculty_id, lecturer_id)
        VALUES (?, ?, ?, ?, ?)
    ");

    $stmt->execute([
        $data['course_code'],
        $data['course_name'],
        $data['credit_hours'],
        $data['faculty_id'],
        $data['lecturer_id']
    ]);

    echo json_encode(["message" => "Course created"]);
}

if ($method == "PUT") {
    $stmt = $pdo->prepare("
        UPDATE Courses 
        SET course_code=?, course_name=?, credit_hours=?, faculty_id=?, lecturer_id=?
        WHERE course_id=?
    ");

    $stmt->execute([
        $data['course_code'],
        $data['course_name'],
        $data['credit_hours'],
        $data['faculty_id'],
        $data['lecturer_id'],
        $data['course_id']
    ]);

    echo json_encode(["message" => "Course updated"]);
}

if ($method == "DELETE") {
    $id = $_GET['id'];
    $stmt = $pdo->prepare("DELETE FROM Courses WHERE course_id=?");
    $stmt->execute([$id]);

    echo json_encode(["message" => "Course deleted"]);
}
?>