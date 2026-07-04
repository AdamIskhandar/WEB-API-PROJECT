<?php
header("Content-Type: application/json");

require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../middleware/authMiddleware.php";

$method = $_SERVER['REQUEST_METHOD'];

$user = authenticate();

switch ($method) {

    // ================= READ + FILTER =================
    case "GET":

        // Get notification by ID
        if (isset($_GET['id'])) {

            $stmt = $conn->prepare("
                SELECT *
                FROM notifications
                WHERE notification_id = ?
            ");

            $stmt->execute([$_GET['id']]);

            echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
        }

        // Filter by User ID
        elseif (isset($_GET['user_id'])) {

            $stmt = $conn->prepare("
                SELECT *
                FROM notifications
                WHERE user_id = ?
                ORDER BY created_at DESC
            ");

            $stmt->execute([$_GET['user_id']]);

            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }

        // Filter by Read Status
        elseif (isset($_GET['is_read'])) {

            $stmt = $conn->prepare("
                SELECT *
                FROM notifications
                WHERE is_read = ?
                ORDER BY created_at DESC
            ");

            $stmt->execute([$_GET['is_read']]);

            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }

        // Filter by Title
        elseif (isset($_GET['title'])) {

            $stmt = $conn->prepare("
                SELECT *
                FROM notifications
                WHERE title LIKE ?
                ORDER BY created_at DESC
            ");

            $stmt->execute(["%" . $_GET['title'] . "%"]);

            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }

        // Get all notifications
        else {

            $stmt = $conn->prepare("
                SELECT *
                FROM notifications
                ORDER BY created_at DESC
            ");

            $stmt->execute();

            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }

        break;

    // ================= CREATE =================
    case "POST":

        $data = json_decode(file_get_contents("php://input"), true);

        $stmt = $conn->prepare("
            INSERT INTO notifications
            (user_id, title, message, is_read)
            VALUES (?, ?, ?, ?)
        ");

        $stmt->execute([
            $data['user_id'],
            $data['title'],
            $data['message'],
            $data['is_read']
        ]);

        echo json_encode([
            "status" => "success",
            "message" => "Notification created"
        ]);

        break;

    // ================= UPDATE =================
    case "PUT":

        $data = json_decode(file_get_contents("php://input"), true);

        $stmt = $conn->prepare("
            UPDATE notifications
            SET
                user_id = ?,
                title = ?,
                message = ?,
                is_read = ?
            WHERE notification_id = ?
        ");

        $stmt->execute([
            $data['user_id'],
            $data['title'],
            $data['message'],
            $data['is_read'],
            $data['notification_id']
        ]);

        echo json_encode([
            "status" => "success",
            "message" => "Notification updated"
        ]);

        break;

    // ================= DELETE =================
    case "DELETE":

        $data = json_decode(file_get_contents("php://input"), true);

        $stmt = $conn->prepare("
            DELETE FROM notifications
            WHERE notification_id = ?
        ");

        $stmt->execute([
            $data['notification_id']
        ]);

        echo json_encode([
            "status" => "success",
            "message" => "Notification deleted"
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