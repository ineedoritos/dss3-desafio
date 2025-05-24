<?php
require_once __DIR__ . '/../models/User.php';

// IMPORTANT: Do NOT call session_start() directly here.
// It should be handled by your main entry point (e.g., api/register.php or api/login.php)
// by including config/session.php FIRST.

class AuthController {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function register() {
        $data = json_decode(file_get_contents('php://input'), true);

        $errors = []; // Initialize an array to collect specific errors

        // --- START: VALIDATION CHANGES ---
        // Validate 'name' - Aligned with client-side regex for Spanish characters
        if (empty($data['name']) || !preg_match('/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,50}$/u', $data['name'])) {
            $errors['name'] = 'Nombre inválido (3-50 caracteres, solo letras y espacios)';
        }

        // Validate 'email'
        if (empty($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Formato de correo inválido';
        }

        // Validate 'password' - ALIGNED with client-side strictness (8 chars, uppercase, lowercase, digit)
        if (empty($data['password']) ||
            !preg_match('/[A-Z]/', $data['password']) ||    // At least one uppercase
            !preg_match('/[a-z]/', $data['password']) ||    // At least one lowercase
            !preg_match('/\d/', $data['password']) ||       // At least one digit
            strlen($data['password']) < 8) {                 // Minimum 8 characters
            $errors['password'] = 'Mínimo 8 caracteres, 1 mayúscula, 1 minúscula y 1 número';
        }

        // If there are any validation errors, return 400 Bad Request with specific errors
        if (!empty($errors)) {
            http_response_code(400);
            // Include 'errors' key for frontend to map to specific fields
            echo json_encode(['error' => 'Invalid input', 'errors' => $errors]);
            return;
        }
        // --- END: VALIDATION CHANGES ---

        $userModel = new User($this->pdo);

        // Check if email already exists
        if ($userModel->findByEmail($data['email'])) {
            http_response_code(409); // Conflict
            // Provide specific error for email existence
            echo json_encode(['error' => 'Email already exists', 'errors' => ['email' => 'El correo electrónico ya está registrado']]);
            return;
        }

        $hashed = password_hash($data['password'], PASSWORD_BCRYPT);

        if ($userModel->create($data['name'], $data['email'], $hashed)) {
            // --- START: SESSION CHANGE ---
            // REMOVE session_start() here. It's already handled by config/session.php
            // session_start(); 
            // --- END: SESSION CHANGE ---
            $_SESSION['user_id'] = $this->pdo->lastInsertId();
            echo json_encode(['message' => 'User created']);
        } else {
            http_response_code(500); // Internal Server Error
            echo json_encode(['error' => 'Server error', 'message' => 'Hubo un problema al crear el usuario.']);
        }
    }

    public function login() {
        $data = json_decode(file_get_contents('php://input'), true);

        // Basic validation for login inputs
        if (empty($data['email']) || empty($data['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input', 'message' => 'Correo y contraseña son requeridos.']);
            return;
        }

        $userModel = new User($this->pdo);
        $user = $userModel->findByEmail($data['email']);

        if ($user && password_verify($data['password'], $user['password'])) {
            // --- START: SESSION CHANGE ---
            // REMOVE session_start() here. It's already handled by config/session.php
            // session_start();
            // --- END: SESSION CHANGE ---
            $_SESSION['user_id'] = $user['id'];
            echo json_encode(['message' => 'Login successful']);
        } else {
            http_response_code(401); // Unauthorized
            echo json_encode(['error' => 'Authentication failed', 'message' => 'Correo o contraseña incorrectos.']);
        }
    }
}