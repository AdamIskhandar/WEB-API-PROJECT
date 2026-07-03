<?php
header("Content-Type: application/json");
require "db.php";

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    // ================= READ =================
    case "GET":

        if(isset($_GET['id'])){

            $stmt = $pdo->prepare("SELECT * FROM users WHERE user_id=?");
            $stmt->execute([$_GET['id']]);

            echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));

        }else{

            $stmt = $pdo->query("SELECT * FROM users");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));

        }

    break;

    // ================= CREATE =================
    case "POST":

        $data = json_decode(file_get_contents("php://input"), true);

        $stmt = $pdo->prepare("
            INSERT INTO users
            (name,email,password_hash,role,faculty_id)
            VALUES (?,?,?,?,?)
        ");

        $stmt->execute([
            $data['name'],
            $data['email'],
            password_hash($data['password'], PASSWORD_DEFAULT),
            $data['role'],
            $data['faculty_id']
        ]);

        echo json_encode([
            "status"=>"success",
            "message"=>"User created"
        ]);

    break;

    // ================= UPDATE =================
    case "PUT":

        $data = json_decode(file_get_contents("php://input"), true);

        $stmt = $pdo->prepare("
            UPDATE users
            SET
            name=?,
            email=?,
            role=?,
            faculty_id=?
            WHERE user_id=?
        ");

        $stmt->execute([
            $data['name'],
            $data['email'],
            $data['role'],
            $data['faculty_id'],
            $data['user_id']
        ]);

        echo json_encode([
            "status"=>"success",
            "message"=>"User updated"
        ]);

    break;

    // ================= DELETE =================
    case "DELETE":

        $data = json_decode(file_get_contents("php://input"), true);

        $stmt = $pdo->prepare("DELETE FROM users WHERE user_id=?");
        $stmt->execute([$data['user_id']]);

        echo json_encode([
            "status"=>"success",
            "message"=>"User deleted"
        ]);

    break;

    default:
        echo json_encode([
            "status"=>"error",
            "message"=>"Invalid request"
        ]);
}
?>