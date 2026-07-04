<?php
header("Content-Type: application/json");

require_once __DIR__ . "/../middleware/errorHandler.php";
require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../middleware/authMiddleware.php";
require_once __DIR__ . "/../services/searchService.php";

$method = $_SERVER['REQUEST_METHOD'];

// Make sure SearchService class exists after require_once
if (!class_exists('SearchService')) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "SearchService class not found. Check services/searchService.php and make sure the class name is SearchService."
    ]);
    exit;
}

// Authenticate user using JWT middleware
$user = authenticate();

switch ($method) {

    // ================= SEARCH =================
    case "GET":

        $keyword = $_GET['q'] ?? "";
        $module = $_GET['module'] ?? "all";
        $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 10;

        $searchService = new \SearchService($conn);
        $response = $searchService->search($keyword, $module, $limit);

        if (isset($response["status"]) && $response["status"] === "error") {
            http_response_code(400);
        }

        echo json_encode($response);
        break;

    default:

        http_response_code(405);

        echo json_encode([
            "status" => "error",
            "message" => "Invalid request method"
        ]);

        break;
}