<?php
class User {
    private $pdo;
    public function __construct($pdo) {
        $this->pdo = $pdo;
    }
    public function create($name, $email, $password) {
        $sql = 'INSERT INTO usuarios (name, email, password) VALUES (?, ?, ?)';
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([$name, $email, $password]);
    }
    public function findByEmail($email) {
        $stmt = $this->pdo->prepare('SELECT * FROM usuarios WHERE email = ?');
        $stmt->execute([$email]);
        return $stmt->fetch();
    }
}
