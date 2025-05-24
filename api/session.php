<?php
require_once __DIR__ . '/../config/session.php';
echo json_encode(['loggedIn' => isset($_SESSION['user_id'])]);