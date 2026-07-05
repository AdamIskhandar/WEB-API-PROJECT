<?php

header("Content-Type: application/json");

require_once __DIR__ . "/../middleware/errorHandler.php";
require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../middleware/authMiddleware.php";

$data = json_decode(file_get_contents("php://input"), true);
$method = $_SERVER['REQUEST_METHOD'];

$user = authenticate();

switch ($method) {

    // ================= READ + FILTER =================
    case "GET":

        // Get registration by ID
        if (isset($_GET['id'])) {

            $stmt = $conn->prepare("
                SELECT *
                FROM Student_Course_Registration
                WHERE registration_id = ?
            ");

            $stmt->execute([$_GET['id']]);

            echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
        }

        // Filter by User ID
        elseif (isset($_GET['user_id'])) {

            $stmt = $conn->prepare("
                SELECT *
                FROM Student_Course_Registration
                WHERE user_id = ?
            ");

            $stmt->execute([$_GET['user_id']]);

            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }

        // Filter by Course ID
        elseif (isset($_GET['course_id'])) {

            $stmt = $conn->prepare("
                SELECT *
                FROM Student_Course_Registration
                WHERE course_id = ?
            ");

            $stmt->execute([$_GET['course_id']]);

            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }

        // Filter by Registration Date
        elseif (isset($_GET['registration_date'])) {

            $stmt = $conn->prepare("
                SELECT *
                FROM Student_Course_Registration
                WHERE registration_date = ?
            ");

            $stmt->execute([$_GET['registration_date']]);

            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }

        // Get all registrations
        else {

            $stmt = $conn->prepare("
                SELECT *
                FROM Student_Course_Registration
            ");

            $stmt->execute();

            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }

        break;

    // ================= CREATE =================
    case "POST":

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

        echo json_encode([
            "status" => "success",
            "message" => "Registration created"
        ]);

        break;

    // ================= UPDATE =================
    case "PUT":

        $stmt = $conn->prepare("
            UPDATE Student_Course_Registration
            SET
                user_id = ?,
                course_id = ?,
                registration_date = ?
            WHERE registration_id = ?
        ");

        $stmt->execute([
            $data['user_id'],
            $data['course_id'],
            $data['registration_date'],
            $data['registration_id']
        ]);

        echo json_encode([
            "status" => "success",
            "message" => "Registration updated"
        ]);

        break;

    // ================= DELETE =================
    case "DELETE":

        $stmt = $conn->prepare("
            DELETE FROM Student_Course_Registration
            WHERE registration_id = ?
        ");

        $stmt->execute([
            $data['registration_id']
        ]);

        echo json_encode([
            "status" => "success",
            "message" => "Registration deleted"
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
