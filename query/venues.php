<?php

header("Content-Type: application/json");
require_once __DIR__ . "/../middleware/errorHandler.php.php";
>>>>>>> Stashed changes
require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../middleware/authMiddleware.php";

$method = $_SERVER['REQUEST_METHOD'];

$user = authenticate();

switch ($method) {

    // ================= READ + FILTER =================
    case "GET":

        // Get venue by ID
        if (isset($_GET['id'])) {

            $stmt = $conn->prepare("
                SELECT *
                FROM Examination_Venues
                WHERE Venue_ID = ?
            ");

            $stmt->execute([$_GET['id']]);

            echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
        }

        // Filter by Venue Name
        elseif (isset($_GET['Venue_Name'])) {

            $stmt = $conn->prepare("
                SELECT *
                FROM Examination_Venues
                WHERE Venue_Name LIKE ?
            ");

            $stmt->execute(["%" . $_GET['Venue_Name'] . "%"]);

            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }

        // Filter by Capacity
        elseif (isset($_GET['Capacity'])) {

            $stmt = $conn->prepare("
                SELECT *
                FROM Examination_Venues
                WHERE Capacity = ?
            ");

            $stmt->execute([$_GET['Capacity']]);

            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }

        // Filter by Location
        elseif (isset($_GET['Location'])) {

            $stmt = $conn->prepare("
                SELECT *
                FROM Examination_Venues
                WHERE Location LIKE ?
            ");

            $stmt->execute(["%" . $_GET['Location'] . "%"]);

            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }

        // Get all venues
        else {

            $stmt = $conn->prepare("
                SELECT *
                FROM Examination_Venues
            ");

            $stmt->execute();

            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }

        break;

    // ================= CREATE =================
    case "POST":

        $data = json_decode(file_get_contents("php://input"), true);

        $stmt = $conn->prepare("
            INSERT INTO Examination_Venues
            (Venue_Name, Capacity, Location)
            VALUES (?, ?, ?)
        ");

        $stmt->execute([
            $data['Venue_Name'],
            $data['Capacity'],
            $data['Location']
        ]);

        echo json_encode([
            "status" => "success",
            "message" => "Venue created"
        ]);

        break;

    // ================= UPDATE =================
    case "PUT":

        $data = json_decode(file_get_contents("php://input"), true);

        $stmt = $conn->prepare("
            UPDATE Examination_Venues
            SET
                Venue_Name = ?,
                Capacity = ?,
                Location = ?
            WHERE Venue_ID = ?
        ");

        $stmt->execute([
            $data['Venue_Name'],
            $data['Capacity'],
            $data['Location'],
            $data['Venue_ID']
        ]);

        echo json_encode([
            "status" => "success",
            "message" => "Venue updated"
        ]);

        break;

    // ================= DELETE =================
    case "DELETE":

        $data = json_decode(file_get_contents("php://input"), true);

        $stmt = $conn->prepare("
            DELETE FROM Examination_Venues
            WHERE Venue_ID = ?
        ");

        $stmt->execute([
            $data['Venue_ID']
        ]);

        echo json_encode([
            "status" => "success",
            "message" => "Venue deleted"
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