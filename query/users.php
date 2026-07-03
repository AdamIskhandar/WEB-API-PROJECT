<?php
header("Content-Type: application/json");
include "db.php";

$method = $_SERVER['REQUEST_METHOD'];

switch($method){

// ================= READ =================
case "GET":

    if(isset($_GET['id'])){

        $id = intval($_GET['id']);

        $sql = "SELECT * FROM users WHERE user_id=$id";
        $result = $conn->query($sql);

        echo json_encode($result->fetch_assoc());

    }else{

        $result = $conn->query("SELECT * FROM users");

        $data=[];

        while($row=$result->fetch_assoc()){
            $data[]=$row;
        }

        echo json_encode($data);
    }

break;


// ================= CREATE =================
case "POST":

    $data=json_decode(file_get_contents("php://input"),true);

    $name=$data['name'];
    $email=$data['email'];
    $password=password_hash($data['password'],PASSWORD_DEFAULT);
    $role=$data['role'];
    $faculty_id=$data['faculty_id'];

    $stmt=$conn->prepare("INSERT INTO users(name,email,password_hash,role,faculty_id)
                          VALUES(?,?,?,?,?)");

    $stmt->bind_param("ssssi",$name,$email,$password,$role,$faculty_id);

    if($stmt->execute()){
        echo json_encode([
            "status"=>true,
            "message"=>"User added"
        ]);
    }else{
        echo json_encode([
            "status"=>false,
            "message"=>$stmt->error
        ]);
    }

break;


// ================= UPDATE =================
case "PUT":

    $data=json_decode(file_get_contents("php://input"),true);

    $id=$data['user_id'];

    $name=$data['name'];
    $email=$data['email'];
    $role=$data['role'];
    $faculty_id=$data['faculty_id'];

    $stmt=$conn->prepare("UPDATE users
                          SET name=?,email=?,role=?,faculty_id=?
                          WHERE user_id=?");

    $stmt->bind_param("sssii",$name,$email,$role,$faculty_id,$id);

    if($stmt->execute()){
        echo json_encode([
            "status"=>true,
            "message"=>"User updated"
        ]);
    }else{
        echo json_encode([
            "status"=>false,
            "message"=>$stmt->error
        ]);
    }

break;


// ================= DELETE =================
case "DELETE":

    parse_str($_SERVER['QUERY_STRING'],$query);

    $id=$query['id'];

    $stmt=$conn->prepare("DELETE FROM users WHERE user_id=?");
    $stmt->bind_param("i",$id);

    if($stmt->execute()){
        echo json_encode([
            "status"=>true,
            "message"=>"User deleted"
        ]);
    }else{
        echo json_encode([
            "status"=>false,
            "message"=>$stmt->error
        ]);
    }

break;

}
?>