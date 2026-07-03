<?php
header("Content-Type: application/json");
require_once __DIR__ . "/../config/db.php";

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    // ================= READ =================
    case "GET":

        if (isset($_GET['id'])) {

            $stmt = $conn->prepare("
                SELECT *
                FROM notifications
                WHERE notification_id=?
            ");

            $stmt->execute([$_GET['id']]);

            echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
        } else {

            $stmt = $conn->query("
                SELECT *
                FROM notifications
                ORDER BY created_at DESC
            ");

            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }

        break;

    // ================= CREATE =================
    case "POST":

        $data = json_decode(file_get_contents("php://input"), true);

        $stmt = $conn->prepare("
            INSERT INTO notifications
            (user_id,title,message,is_read)
            VALUES (?,?,?,?)
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
            user_id=?,
            title=?,
            message=?,
            is_read=?
            WHERE notification_id=?
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
            WHERE notification_id=?
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
        echo json_encode([
            "status" => "error",
            "message" => "Invalid request"
        ]);
}
