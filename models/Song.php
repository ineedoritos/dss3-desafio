<?php
class Song {
    private $pdo;
    public function __construct($pdo) {
        $this->pdo = $pdo;
    }
    public function allByUser($userId) {
        $stmt = $this->pdo->prepare('SELECT * FROM canciones WHERE user_id = ?');
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }
    public function create($userId, $title, $artist, $album, $year, $link) {
        $stmt = $this->pdo->prepare('INSERT INTO canciones (user_id, title, artist, album, year, link) VALUES (?, ?, ?, ?, ?, ?)');
        return $stmt->execute([$userId, $title, $artist, $album, $year, $link]);
    }
    public function update($id, $userId, $title, $artist, $album, $year, $link) {
        $stmt = $this->pdo->prepare('UPDATE canciones SET title=?, artist=?, album=?, year=?, link=? WHERE id=? AND user_id=?');
        return $stmt->execute([$title, $artist, $album, $year, $link, $id, $userId]);
    }
    public function delete($id, $userId) {
        $stmt = $this->pdo->prepare('DELETE FROM canciones WHERE id=? AND user_id=?');
        return $stmt->execute([$id, $userId]);
    }
}
