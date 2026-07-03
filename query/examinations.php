<?php
require_once __DIR__ . "/../config/db.php";

header("Content-Type: application/json");
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    case "GET":
        $stmt = $conn->prepare("
            SELECT e.*, c.Course_Code, v.Venue_Name
            FROM Examinations e
            JOIN Courses c ON e.Course_ID = c.Course_ID
            JOIN Examination_venues v ON e.Venue_ID = v.Venue_ID
        ");
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    case "POST":
        $data = json_decode(file_get_contents("php://input"), true);

        $stmt = $conn->prepare("
            INSERT INTO Examinations 
            (CourseID, VenueID, ExamDate, StartTime, EndTime, ExamType)
            VALUES (?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $data['CourseID'],
            $data['VenueID'],
            $data['ExamDate'],
            $data['StartTime'],
            $data['EndTime'],
            $data['ExamType']
        ]);

        echo json_encode(["message" => "Exam scheduled successfully"]);
        break;

    case "PUT":
        $data = json_decode(file_get_contents("php://input"), true);

        $stmt = $conn->prepare("
            UPDATE Examinations 
            SET CourseID=?, VenueID=?, ExamDate=?, StartTime=?, EndTime=?, ExamType=?
            WHERE ExamID=?
        ");

        $stmt->execute([
            $data['CourseID'],
            $data['VenueID'],
            $data['ExamDate'],
            $data['StartTime'],
            $data['EndTime'],
            $data['ExamType'],
            $data['ExamID']
        ]);

        echo json_encode(["message" => "Exam updated"]);
        break;

    case "DELETE":
        $data = json_decode(file_get_contents("php://input"), true);

        $stmt = $conn->prepare("DELETE FROM Examinations WHERE ExamID=?");
        $stmt->execute([$data['ExamID']]);

        echo json_encode(["message" => "Exam deleted"]);
        break;
}
