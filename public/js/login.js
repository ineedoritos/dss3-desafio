const API_URL = '../api';

// Elementos del DOM
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('login_email');
const passwordInput = document.getElementById('login_password');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const formError = document.getElementById('formError');

// Expresiones regulares
const validations = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Formato email válido
    password: /^[a-zA-Z0-9]{6,}$/ // Mínimo 8 caracteres, 1 mayúscula, 1 minúscula y 1 número
};

// Mensajes de error
const errorMessages = {
    email: {
        required: 'El correo electrónico es requerido',
        invalid: 'Formato de correo electrónico no válido'
    },
    password: {
        required: 'La contraseña es requerida',
        invalid: 'Mínimo 8 caracteres, 1 mayúscula, 1 minúscula y 1 número'
    }
};

// Manejar envío del formulario
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    let isValid = true;

    // Validar email
    if (!email) {
        showError('emailError', errorMessages.email.required);
        isValid = false;
    } else if (!validations.email.test(email)) {
        showError('emailError', errorMessages.email.invalid);
        isValid = false;
    }

    // Validar contraseña
    if (!password) {
        showError('passwordError', errorMessages.password.required);
        isValid = false;
    } else if (!validations.password.test(password)) {
        showError('passwordError', errorMessages.password.invalid);
        isValid = false;
    }

    if (!isValid) return;

    try {
        const response = await fetch(`${API_URL}/login.php`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            if (data.errors) {
                Object.entries(data.errors).forEach(([field, message]) => {
                    showError(`${field}Error`, message);
                });
            } else {
                showError('formError', data.error || 'Error en el inicio de sesión');
            }
            return;
        }

        // Login exitoso
        window.location.href = 'songs.html'; // Redirigir a la página principal

    } catch (error) {
        showError('formError', 'Error de conexión con el servidor');
    }
});

// Funciones de utilidad
function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
    });
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    } else {
        console.error(`Elemento ${elementId} no encontrado`);
        alert(message); // Fallback
    }
}