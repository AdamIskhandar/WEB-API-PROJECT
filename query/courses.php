<?php
header("Content-Type: application/json");
require_once __DIR__ . "/../middleware/errorHandler.php";
require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../middleware/authMiddleware.php";

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);

$user = authenticate();

switch ($method) {

    // ================= READ + FILTER =================
    case "GET":

        // Get course by ID
        if (isset($_GET['id'])) {

            $stmt = $conn->prepare("SELECT * FROM Courses WHERE course_id = ?");
            $stmt->execute([$_GET['id']]);

            echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
        }

        // Filter by course code
        elseif (isset($_GET['course_code'])) {

            $stmt = $conn->prepare("SELECT * FROM Courses WHERE course_code = ?");
            $stmt->execute([$_GET['course_code']]);

            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }

        // Filter by course name
        elseif (isset($_GET['course_name'])) {

            $stmt = $conn->prepare("SELECT * FROM Courses WHERE course_name LIKE ?");
            $stmt->execute(["%" . $_GET['course_name'] . "%"]);

            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }

        // Filter by faculty
        elseif (isset($_GET['faculty_id'])) {

            $stmt = $conn->prepare("SELECT * FROM Courses WHERE faculty_id = ?");
            $stmt->execute([$_GET['faculty_id']]);

            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }

        // Filter by lecturer/user
        elseif (isset($_GET['user_id'])) {

            $stmt = $conn->prepare("SELECT * FROM Courses WHERE user_id = ?");
            $stmt->execute([$_GET['user_id']]);

            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }

        // Get all courses
        else {

            $stmt = $conn->prepare("SELECT * FROM Courses");
            $stmt->execute();

            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }

        break;

    // ================= CREATE =================
    case "POST":

        $stmt = $conn->prepare("
            INSERT INTO Courses
            (course_code, course_name, credit_hours, faculty_id, user_id)
            VALUES (?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $data['course_code'],
            $data['course_name'],
            $data['credit_hours'],
            $data['faculty_id'],
            $data['user_id']
        ]);

        echo json_encode([
            "status" => "success",
            "message" => "Course created"
        ]);

        break;

    // ================= UPDATE =================
    case "PUT":

        $stmt = $conn->prepare("
            UPDATE Courses
            SET
                course_code=?,
                course_name=?,
                credit_hours=?,
                faculty_id=?,
                user_id=?
            WHERE course_id=?
        ");

        $stmt->execute([
            $data['course_code'],
            $data['course_name'],
            $data['credit_hours'],
            $data['faculty_id'],
            $data['user_id'],
            $data['course_id']
        ]);

        echo json_encode([
            "status" => "success",
            "message" => "Course updated"
        ]);

        break;

    // ================= DELETE =================
    case "DELETE":

        $stmt = $conn->prepare("DELETE FROM Courses WHERE course_id = ?");
        $stmt->execute([
            $data['course_id']
        ]);

        echo json_encode([
            "status" => "success",
            "message" => "Course deleted"
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
