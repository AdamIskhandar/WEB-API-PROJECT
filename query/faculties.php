<?php
require_once __DIR__ . "/../config/db.php";

header("Content-Type: application/json");
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    case "GET":
        $stmt = $conn->prepare("SELECT * FROM Faculties");
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    case "POST":
        $data = json_decode(file_get_contents("php://input"), true);

        $stmt = $conn->prepare("INSERT INTO Faculties (Faculty_Name)
                                VALUES (?, ?, ?)");
        $stmt->execute([
            $data['Faculty_Name']
        ]);

        echo json_encode(["message" => "Faculty created"]);
        break;

    case "PUT":
        $data = json_decode(file_get_contents("php://input"), true);

        $stmt = $conn->prepare("UPDATE Faculties 
                                SET faculty_name=?
                                WHERE faculty_id=?");

        $stmt->execute([
            $data['faculty_name'],
            $data['faculty_id']
        ]);

        echo json_encode(["message" => "Faculty updated"]);
        break;

    case "DELETE":
        $data = json_decode(file_get_contents("php://input"), true);

        $stmt = $conn->prepare("DELETE FROM Faculties WHERE Faculty_ID=?");
        $stmt->execute([$data['Faculty_ID']]);

        echo json_encode(["message" => "Faculty deleted"]);
        break;
}
