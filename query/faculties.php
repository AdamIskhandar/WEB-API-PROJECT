<?php

require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../middleware/authMiddleware.php";

header("Content-Type: application/json");

$method = $_SERVER['REQUEST_METHOD'];

$user = authenticate();

switch ($method) {

    // ================= READ + FILTER =================
    case "GET":

        // Get faculty by ID
        if (isset($_GET['id'])) {

            $stmt = $conn->prepare("SELECT * FROM Faculties WHERE Faculty_ID = ?");
            $stmt->execute([$_GET['id']]);

            echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
        }

        // Filter by faculty name
        elseif (isset($_GET['faculty_name'])) {

            $stmt = $conn->prepare("
                SELECT *
                FROM Faculties
                WHERE Faculty_Name LIKE ?
            ");

            $stmt->execute(["%" . $_GET['faculty_name'] . "%"]);

            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }

        // Get all faculties
        else {

            $stmt = $conn->prepare("SELECT * FROM Faculties");
            $stmt->execute();

            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }

        break;

    // ================= CREATE =================
    case "POST":

        $data = json_decode(file_get_contents("php://input"), true);

        $stmt = $conn->prepare("
            INSERT INTO Faculties (Faculty_Name)
            VALUES (?)
        ");

        $stmt->execute([
            $data['faculty_name']
        ]);

        echo json_encode([
            "status" => "success",
            "message" => "Faculty created"
        ]);

        break;

    // ================= UPDATE =================
    case "PUT":

        $data = json_decode(file_get_contents("php://input"), true);

        $stmt = $conn->prepare("
            UPDATE Faculties
            SET Faculty_Name = ?
            WHERE Faculty_ID = ?
        ");

        $stmt->execute([
            $data['faculty_name'],
            $data['faculty_id']
        ]);

        echo json_encode([
            "status" => "success",
            "message" => "Faculty updated"
        ]);

        break;

    // ================= DELETE =================
    case "DELETE":

        $data = json_decode(file_get_contents("php://input"), true);

        $stmt = $conn->prepare("
            DELETE FROM Faculties
            WHERE Faculty_ID = ?
        ");

        $stmt->execute([
            $data['faculty_id']
        ]);

        echo json_encode([
            "status" => "success",
            "message" => "Faculty deleted"
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