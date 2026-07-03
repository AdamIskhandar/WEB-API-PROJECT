<?php
require_once "db.php";

$data = json_decode(file_get_contents("php://input"), true);
$method = $_SERVER['REQUEST_METHOD'];

if ($method == "GET") {

    if (isset($_GET['id'])) {
        $stmt = $pdo->prepare("SELECT * FROM Results WHERE result_id=?");
        $stmt->execute([$_GET['id']]);
        echo json_encode($stmt->fetch());
    } else {
        $stmt = $pdo->query("SELECT * FROM Results");
        echo json_encode($stmt->fetchAll());
    }
}

if ($method == "POST") {
    $stmt = $pdo->prepare("
        INSERT INTO Results (student_id, exam_id, marks_obtained, grade, published_at)
        VALUES (?, ?, ?, ?, ?)
    ");

    $stmt->execute([
        $data['student_id'],
        $data['exam_id'],
        $data['marks_obtained'],
        $data['grade'],
        $data['published_at']
    ]);

    echo json_encode(["message" => "Result created"]);
}

if ($method == "PUT") {
    $stmt = $pdo->prepare("
        UPDATE Results
        SET student_id=?, exam_id=?, marks_obtained=?, grade=?, published_at=?
        WHERE result_id=?
    ");

    $stmt->execute([
        $data['student_id'],
        $data['exam_id'],
        $data['marks_obtained'],
        $data['grade'],
        $data['published_at'],
        $data['result_id']
    ]);

    echo json_encode(["message" => "Result updated"]);
}

if ($method == "DELETE") {
    $id = $_GET['id'];
    $stmt = $pdo->prepare("DELETE FROM Results WHERE result_id=?");
    $stmt->execute([$id]);

    echo json_encode(["message" => "Result deleted"]);
}
?>