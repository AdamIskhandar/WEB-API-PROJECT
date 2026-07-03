<?php
include "db.php";

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

        $stmt = $conn->prepare("INSERT INTO Faculties (FacultyName, DeanName, ContactEmail)
                                VALUES (?, ?, ?)");
        $stmt->execute([
            $data['FacultyName'],
            $data['DeanName'],
            $data['ContactEmail']
        ]);

        echo json_encode(["message" => "Faculty created"]);
        break;

    case "PUT":
        $data = json_decode(file_get_contents("php://input"), true);

        $stmt = $conn->prepare("UPDATE Faculties 
                                SET FacultyName=?, DeanName=?, ContactEmail=? 
                                WHERE FacultyID=?");

        $stmt->execute([
            $data['FacultyName'],
            $data['DeanName'],
            $data['ContactEmail'],
            $data['FacultyID']
        ]);

        echo json_encode(["message" => "Faculty updated"]);
        break;

    case "DELETE":
        $data = json_decode(file_get_contents("php://input"), true);

        $stmt = $conn->prepare("DELETE FROM Faculties WHERE FacultyID=?");
        $stmt->execute([$data['FacultyID']]);

        echo json_encode(["message" => "Faculty deleted"]);
        break;
}
