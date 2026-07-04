<?php
require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../middleware/authMiddleware.php";

header("Content-Type: application/json");
$method = $_SERVER['REQUEST_METHOD'];

$user = authenticate();

switch ($method) {

    case "GET":
        $stmt = $conn->prepare("SELECT * FROM Examination_Venues");
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    case "POST":
        $data = json_decode(file_get_contents("php://input"), true);

        $stmt = $conn->prepare("INSERT INTO Examination_Venues (Venue_Name, Capacity, Location)
                                VALUES (?, ?, ?)");
        $stmt->execute([
            $data['Venue_Name'],
            $data['Capacity'],
            $data['Location']
        ]);

        echo json_encode(["message" => "Venue created"]);
        break;

    case "PUT":
        $data = json_decode(file_get_contents("php://input"), true);

        $stmt = $conn->prepare("UPDATE Examination_Venues 
                                SET Venue_Name=?, Capacity=?, Location=? 
                                WHERE Venue_ID=?");

        $stmt->execute([
            $data['Venue_Name'],
            $data['Capacity'],
            $data['Location'],
            $data['Venue_ID']
        ]);

        echo json_encode(["message" => "Venue updated"]);
        break;

    case "DELETE":
        $data = json_decode(file_get_contents("php://input"), true);

        $stmt = $conn->prepare("DELETE FROM Examination_Venues WHERE Venue_ID=?");
        $stmt->execute([$data['Venue_ID']]);

        echo json_encode(["message" => "Venue deleted"]);
        break;
}
