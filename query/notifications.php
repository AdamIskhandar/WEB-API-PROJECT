<?php
header("Content-Type: application/json");
include "db.php";

$method=$_SERVER['REQUEST_METHOD'];

switch($method){

// ================= READ =================
case "GET":

    if(isset($_GET['id'])){

        $id=intval($_GET['id']);

        $result=$conn->query("SELECT * FROM notifications
                              WHERE notification_id=$id");

        echo json_encode($result->fetch_assoc());

    }else{

        $result=$conn->query("SELECT * FROM notifications");

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

    $user_id=$data['user_id'];
    $title=$data['title'];
    $message=$data['message'];

    $stmt=$conn->prepare("INSERT INTO notifications(user_id,title,message)
                          VALUES(?,?,?)");

    $stmt->bind_param("iss",$user_id,$title,$message);

    if($stmt->execute()){
        echo json_encode([
            "status"=>true,
            "message"=>"Notification created"
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

    $id=$data['notification_id'];
    $title=$data['title'];
    $message=$data['message'];
    $is_read=$data['is_read'];

    $stmt=$conn->prepare("UPDATE notifications
                          SET title=?,message=?,is_read=?
                          WHERE notification_id=?");

    $stmt->bind_param("ssii",$title,$message,$is_read,$id);

    if($stmt->execute()){
        echo json_encode([
            "status"=>true,
            "message"=>"Notification updated"
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

    $stmt=$conn->prepare("DELETE FROM notifications
                          WHERE notification_id=?");

    $stmt->bind_param("i",$id);

    if($stmt->execute()){
        echo json_encode([
            "status"=>true,
            "message"=>"Notification deleted"
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