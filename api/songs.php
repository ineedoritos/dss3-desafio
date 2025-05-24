<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../controllers/SongController.php';
header('Content-Type: application/json');
$controller = new SongController($pdo);
switch($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        $controller->getSongs();
        break;
    case 'POST':
        $controller->createSong();
        break;
    case 'PUT':
        if (isset($_GET['id'])) {
            $controller->updateSong($_GET['id']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'ID is required for PUT']);
        }
        break;
    case 'DELETE':
        if (isset($_GET['id'])) {
            $controller->deleteSong($_GET['id']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'ID is required for DELETE']);
        }
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
