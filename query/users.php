<?php
header("Content-Type: application/json");
require_once __DIR__ . "/../middleware/errorHandler.php";
require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../middleware/authMiddleware.php";

$method = $_SERVER['REQUEST_METHOD'];

// Authenticate user
$user = authenticate();

switch ($method) {

    // ================= READ + FILTER =================
    case "GET":

        // Get user by ID
        if (isset($_GET['user_id'])) {

            $stmt = $conn->prepare("SELECT * FROM users WHERE user_id = ?");
            $stmt->execute([$_GET['user_id']]);

            echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
        }

        // Filter by role
        elseif (isset($_GET['role'])) {

            $stmt = $conn->prepare("SELECT * FROM users WHERE role = ?");
            $stmt->execute([$_GET['role']]);

            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }

        // Filter by faculty
        elseif (isset($_GET['faculty_id'])) {

            $stmt = $conn->prepare("SELECT * FROM users WHERE faculty_id = ?");
            $stmt->execute([$_GET['faculty_id']]);

            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }

        // Filter by name
        elseif (isset($_GET['name'])) {

            $stmt = $conn->prepare("SELECT * FROM users WHERE name LIKE ?");
            $stmt->execute(["%" . $_GET['name'] . "%"]);

            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }

        // Get all users
        else {

            $stmt = $conn->prepare("SELECT * FROM users");
            $stmt->execute();

            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }

        break;

    // ================= CREATE =================
    case "POST":

        $data = json_decode(file_get_contents("php://input"), true);

        $stmt = $conn->prepare("
            INSERT INTO users
            (name, email, password_hash, role, faculty_id)
            VALUES (?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $data['name'],
            $data['email'],
            password_hash($data['password'], PASSWORD_DEFAULT),
            $data['role'],
            $data['faculty_id']
        ]);

        echo json_encode([
            "status" => "success",
            "message" => "User created"
        ]);

        break;

    // ================= UPDATE =================
    case "PUT":

        $data = json_decode(file_get_contents("php://input"), true);

        $stmt = $conn->prepare("
            UPDATE users
            SET
                name = ?,
                email = ?,
                role = ?,
                faculty_id = ?
            WHERE user_id = ?
        ");

        $stmt->execute([
            $data['name'],
            $data['email'],
            $data['role'],
            $data['faculty_id'],
            $data['user_id']
        ]);

        echo json_encode([
            "status" => "success",
            "message" => "User updated"
        ]);

        break;

    // ================= DELETE =================
    case "DELETE":

        $data = json_decode(file_get_contents("php://input"), true);

        $stmt = $conn->prepare("DELETE FROM users WHERE user_id = ?");
        $stmt->execute([
            $data['user_id']
        ]);

        echo json_encode([
            "status" => "success",
            "message" => "User deleted"
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
