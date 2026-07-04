<?php
header("Content-Type: application/json");

require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../middleware/authMiddleware.php";

$data = json_decode(file_get_contents("php://input"), true);
$method = $_SERVER['REQUEST_METHOD'];

$user = authenticate();

switch ($method) {

    // ================= READ + FILTER =================
    case "GET":

        // Get result by ID
        if (isset($_GET['id'])) {

            $stmt = $conn->prepare("
                SELECT *
                FROM Results
                WHERE result_id = ?
            ");

            $stmt->execute([$_GET['id']]);

            echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
        }

        // Filter by User ID
        elseif (isset($_GET['user_id'])) {

            $stmt = $conn->prepare("
                SELECT *
                FROM Results
                WHERE user_id = ?
            ");

            $stmt->execute([$_GET['user_id']]);

            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }

        // Filter by Exam ID
        elseif (isset($_GET['exam_id'])) {

            $stmt = $conn->prepare("
                SELECT *
                FROM Results
                WHERE exam_id = ?
            ");

            $stmt->execute([$_GET['exam_id']]);

            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }

        // Filter by Grade
        elseif (isset($_GET['grade'])) {

            $stmt = $conn->prepare("
                SELECT *
                FROM Results
                WHERE grade = ?
            ");

            $stmt->execute([$_GET['grade']]);

            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }

        // Filter by Published Date
        elseif (isset($_GET['published_at'])) {

            $stmt = $conn->prepare("
                SELECT *
                FROM Results
                WHERE published_at = ?
            ");

            $stmt->execute([$_GET['published_at']]);

            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }

        // Get all results
        else {

            $stmt = $conn->prepare("SELECT * FROM Results");
            $stmt->execute();

            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }

        break;

    // ================= CREATE =================
    case "POST":

        $stmt = $conn->prepare("
            INSERT INTO Results
            (user_id, exam_id, marks_obtained, grade, published_at)
            VALUES (?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $data['user_id'],
            $data['exam_id'],
            $data['marks_obtained'],
            $data['grade'],
            $data['published_at']
        ]);

        echo json_encode([
            "status" => "success",
            "message" => "Result created"
        ]);

        break;

    // ================= UPDATE =================
    case "PUT":

        $stmt = $conn->prepare("
            UPDATE Results
            SET
                user_id = ?,
                exam_id = ?,
                marks_obtained = ?,
                grade = ?,
                published_at = ?
            WHERE result_id = ?
        ");

        $stmt->execute([
            $data['user_id'],
            $data['exam_id'],
            $data['marks_obtained'],
            $data['grade'],
            $data['published_at'],
            $data['result_id']
        ]);

        echo json_encode([
            "status" => "success",
            "message" => "Result updated"
        ]);

        break;

    // ================= DELETE =================
    case "DELETE":

        $stmt = $conn->prepare("
            DELETE FROM Results
            WHERE result_id = ?
        ");

        $stmt->execute([
            $data['result_id']
        ]);

        echo json_encode([
            "status" => "success",
            "message" => "Result deleted"
        ]);

        break;

    default:

        http_response_code(405);

        echo json_encode([
            "status" => "error",
            "message" => "Invalid request method"
        ]);

        break;
}