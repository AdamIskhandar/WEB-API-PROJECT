<?php


// Set JSON response always
header("Content-Type: application/json");

/**
 * Handle normal PHP errors
 */
function handleError($errno, $errstr, $errfile, $errline)
{
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "error" => "PHP Error Occurred",
        "message" => $errstr,
        "file" => $errfile,
        "line" => $errline
    ]);

    exit();
}

/**
 * Handle uncaught exceptions
 */
function handleException($exception)
{
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "error" => "Uncaught Exception",
        "message" => $exception->getMessage(),
        "file" => $exception->getFile(),
        "line" => $exception->getLine()
    ]);

    exit();
}

/**
 * Register handlers
 */
set_error_handler("handleError");
set_exception_handler("handleException");
