<?php
require_once __DIR__ . "/../config/db.php";

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

/* =========================
   INSERT
========================= */
if ($method == "POST") {

    $stmt = $conn->prepare("

        INSERT INTO Student_Course_Registration 
        (user_id, course_id, registration_date)
        VALUES (?, ?, ?)
    ");

    $stmt->execute([
        $data['user_id'],
        $data['course_id'],
        $data['registration_date']
    ]);

    echo json_encode(["message" => "Registration created"]);
}

/* =========================
   UPDATE
========================= */
if ($method == "PUT") {

    $stmt = $conn->prepare("
        UPDATE Student_Course_Registration

        SET user_id=?,
            course_id=?,
            registration_date=?
        WHERE registration_id=?
    ");

    $stmt->execute([
        $data['user_id'],
        $data['course_id'],
        $data['registration_date'],
        $data['registration_id']
    ]);

    echo json_encode(["message" => "Registration updated"]);
}

/* =========================
   DELETE
========================= */
if ($method == "DELETE") {

    $id = $_GET['id'];

    $stmt = $conn->prepare("
        DELETE FROM Student_Course_Registration 
        WHERE registration_id=?
    ");

    $stmt->execute([$id]);

    echo json_encode(["message" => "Registration deleted"]);
}
