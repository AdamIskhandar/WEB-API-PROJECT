<?php

class SearchService
{
    private PDO $conn;

    /**
     * Search configuration is kept here to make the feature modular.
     * Only tables and columns listed here can be searched.
     */
    private array $modules = [
        "users" => [
            "table" => "users",
            "columns" => ["name", "email", "role"],
            "select" => "user_id, name, email, role, faculty_id"
        ],
        "courses" => [
            "table" => "Courses",
            "columns" => ["course_code", "course_name"],
            "select" => "course_id, course_code, course_name, credit_hours, faculty_id, user_id"
        ],
        "faculties" => [
            "table" => "Faculties",
            "columns" => ["Faculty_Name"],
            "select" => "Faculty_ID, Faculty_Name"
        ],
        "examinations" => [
            "table" => "Examinations",
            "columns" => ["Exam_Date", "Start_Time", "End_Time"],
            "select" => "Exam_ID, Course_ID, Venue_ID, Exam_Date, Start_Time, End_Time, Created_by"
        ],
        "venues" => [
            "table" => "Examination_Venues",
            "columns" => ["Venue_Name", "Location"],
            "select" => "Venue_ID, Venue_Name, Capacity, Location"
        ],
        "notifications" => [
            "table" => "notifications",
            "columns" => ["title", "message"],
            "select" => "notification_id, user_id, title, message, is_read, created_at"
        ]
    ];

    public function __construct(PDO $conn)
    {
        $this->conn = $conn;
    }

    /**
     * Search one module or all modules.
     */
    public function search(string $keyword, string $module = "all", int $limit = 10): array
    {
        $keyword = trim($keyword);
        $module = strtolower(trim($module));
        $limit = $this->sanitizeLimit($limit);

        if ($keyword === "") {
            return [
                "status" => "error",
                "message" => "Search keyword is required"
            ];
        }

        if ($module !== "all") {
            if (!array_key_exists($module, $this->modules)) {
                return [
                    "status" => "error",
                    "message" => "Invalid search module",
                    "allowed_modules" => array_merge(["all"], array_keys($this->modules))
                ];
            }

            return [
                "status" => "success",
                "keyword" => $keyword,
                "module" => $module,
                "count" => 1,
                "results" => [
                    $module => $this->searchModule($module, $keyword, $limit)
                ]
            ];
        }

        $results = [];
        foreach (array_keys($this->modules) as $moduleName) {
            $results[$moduleName] = $this->searchModule($moduleName, $keyword, $limit);
        }

        return [
            "status" => "success",
            "keyword" => $keyword,
            "module" => "all",
            "count" => count($results),
            "results" => $results
        ];
    }

    private function searchModule(string $module, string $keyword, int $limit): array
    {
        $config = $this->modules[$module];
        $likeKeyword = "%" . $keyword . "%";

        $whereParts = [];
        $params = [];

        foreach ($config["columns"] as $column) {
            $whereParts[] = $column . " LIKE ?";
            $params[] = $likeKeyword;
        }

        $sql = "SELECT " . $config["select"] .
            " FROM " . $config["table"] .
            " WHERE " . implode(" OR ", $whereParts) .
            " LIMIT " . $limit;

        $stmt = $this->conn->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function sanitizeLimit(int $limit): int
    {
        if ($limit < 1) {
            return 10;
        }

        if ($limit > 50) {
            return 50;
        }

        return $limit;
    }
}
