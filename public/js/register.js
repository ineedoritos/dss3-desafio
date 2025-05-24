// register.js

const API_URL = '../api'; 
console.log(API_URL);

const validations = {
    name: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,50}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
};

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    } else {
        console.error(`Error: Elemento con ID ${elementId} no encontrado.`);
        alert(message);
    }
}

function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    document.body.appendChild(successDiv);

    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

async function handleRegister(e) {
    e.preventDefault();

    document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
    });

    const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value.trim()
    };

    let hasErrors = false;

    if (!formData.name) {
        showError('nameError', 'El nombre es requerido');
        hasErrors = true;
    } else if (!validations.name.test(formData.name)) {
        showError('nameError', 'Nombre inválido (3-50 caracteres, solo letras y espacios)');
        hasErrors = true;
    }

    if (!formData.email) {
        showError('emailError', 'El correo es requerido');
        hasErrors = true;
    } else if (!validations.email.test(formData.email)) {
        showError('emailError', 'Formato de correo inválido');
        hasErrors = true;
    }

    if (!formData.password) {
        showError('passwordError', 'La contraseña es requerida');
        hasErrors = true;
    } else if (!validations.password.test(formData.password)) {
        showError('passwordError', 'Mínimo 8 caracteres, con al menos una mayúscula, una minúscula y un número.');
        hasErrors = true;
    }

    if (hasErrors) return;

    try {
        const res = await fetch(API_URL + '/register.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(formData)
        });

        const data = await res.json();

        if (!res.ok) {
            if (data.errors) {
                Object.entries(data.errors).forEach(([field, message]) => {
                    showError(`${field}Error`, message);
                });
            } else {
                showError('formError', data.error || 'Error en el registro');
            }
            return;
        }

        showSuccessMessage('¡Registro exitoso! Redirigiendo...');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);

    } catch (error) {
        console.error('Error de red:', error);
        showError('formError', 'Error de conexión con el servidor. Intenta de nuevo más tarde.');
    }
}

// Password toggle functionality
document.addEventListener('DOMContentLoaded', () => {
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function () {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            if (type === 'password') {
                this.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-eye">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>`;
            } else {
                this.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-eye-off">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.54 18.54 0 0 1 2.42-3.15m3.75-2.73A9.46 9.46 0 0 1 12 4c7 0 11 8 11 8a18.54 18.54 0 0 1-2.42 3.15"></path>
                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                </svg>`;
            }
        });
    }

    document.getElementById('registerForm').addEventListener('submit', handleRegister);
});