<?php
require_once __DIR__ . '/../config/session.php';
session_destroy();
echo json_encode(['message' => 'Sesión cerrada']);
