<?php
require_once __DIR__ . '/../models/Song.php';
class SongController {
    private $pdo;
    public function __construct($pdo) {
        $this->pdo = $pdo;
    }
    public function getSongs() {
        session_start();
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error'=>'Unauthorized']);
            return;
        }
        $songModel = new Song($this->pdo);
        echo json_encode($songModel->allByUser($_SESSION['user_id']));
    }
    public function createSong() {
        session_start();
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error'=>'Unauthorized']);
            return;
        }
        $data = json_decode(file_get_contents('php://input'), true);
        if (!preg_match('/^https?:\/\//', $data['link'] ?? '')) {
            http_response_code(400);
            echo json_encode(['error'=>'Invalid link']);
            return;
        }
        $songModel = new Song($this->pdo);
        if ($songModel->create($_SESSION['user_id'], $data['title'], $data['artist'], $data['album'], $data['year'], $data['link'])) {
            http_response_code(201);
            echo json_encode(['message'=>'Song created']);
        } else {
            http_response_code(500);
            echo json_encode(['error'=>'Server error']);
        }
    }
    public function updateSong($id) {
        session_start();
        $data = json_decode(file_get_contents('php://input'), true);
        $songModel = new Song($this->pdo);
        if ($songModel->update($id, $_SESSION['user_id'], $data['title'], $data['artist'], $data['album'], $data['year'], $data['link'])) {
            echo json_encode(['message'=>'Song updated']);
        } else {
            http_response_code(500);
            echo json_encode(['error'=>'Server error']);
        }
    }
    public function deleteSong($id) {
        session_start();
        $songModel = new Song($this->pdo);
        if ($songModel->delete($id, $_SESSION['user_id'])) {
            echo json_encode(['message'=>'Song deleted']);
        } else {
            http_response_code(500);
            echo json_encode(['error'=>'Server error']);
        }
    }
}
