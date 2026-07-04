<?php

require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../middleware/authMiddleware.php";

header("Content-Type: application/json");
$method = $_SERVER['REQUEST_METHOD'];

$user = authenticate();

switch ($method) {

    case "GET":
        $stmt = $conn->prepare("
            SELECT e.*, c.Course_Code, v.Venue_Name
            FROM Examinations e
            JOIN Courses c ON e.Course_ID = c.Course_ID
            JOIN Examination_venues v ON e.Venue_ID = v.Venue_ID
        ");
        $stmt->execute();
        echo json_encode([
            "user" => $user,
            "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)
        ]);
        break;

    case "POST":
        $data = json_decode(file_get_contents("php://input"), true);

        $stmt = $conn->prepare("
            INSERT INTO Examinations 
            (Course_ID, Venue_ID, Exam_Date, Start_Time, End_Time, Created_by)
            VALUES (?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $data['Course_ID'],
            $data['Venue_ID'],
            $data['Exam_Date'],
            $data['Start_Time'],
            $data['End_Time'],
            $data['Created_by'],
        ]);

        echo json_encode(["message" => "Exam scheduled successfully"]);
        break;

    case "PUT":
        $data = json_decode(file_get_contents("php://input"), true);

        $stmt = $conn->prepare("
            UPDATE Examinations 
            SET Course_ID=?, Venue_ID=?, Exam_Date=?, Start_Time=?, End_Time=?
            WHERE Exam_ID=?
        ");

        $stmt->execute([
            $data['Course_ID'],
            $data['Venue_ID'],
            $data['Exam_Date'],
            $data['Start_Time'],
            $data['End_Time'],
            $data['Exam_ID']
        ]);

        echo json_encode(["message" => "Exam updated"]);
        break;

    case "DELETE":
        $data = json_decode(file_get_contents("php://input"), true);

        $stmt = $conn->prepare("DELETE FROM Examinations WHERE Exam_ID=?");
        $stmt->execute([$data['Exam_ID']]);

        echo json_encode(["message" => "Exam deleted"]);
        break;
}
