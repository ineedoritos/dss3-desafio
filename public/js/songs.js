// js/songs.js (anteriormente app.js)

const API_URL = '../api'; // Ajustado según tu estructura de carpetas
// Asegúrate de que esta URL sea correcta. Si songs.html está en `public/`
// y la carpeta `api` está al mismo nivel que `public/`, entonces `../../api` es correcto.

// Elementos del DOM
const songsSection = document.getElementById('songs');
const loadingMessage = document.getElementById('loadingMessage');
const songList = document.getElementById('songList');
const songModal = document.getElementById('songModal');
const closeModalBtn = document.getElementById('closeModal');

const titleInput = document.getElementById('title');
const artistInput = document.getElementById('artist');
const albumInput = document.getElementById('album');
const yearInput = document.getElementById('year');
const linkInput = document.getElementById('link');
const songIdToEditInput = document.getElementById('songIdToEdit'); // Nuevo: Referencia al input oculto
const saveSongBtn = document.getElementById('saveSongBtn'); // Nuevo: Referencia al botón "Agregar/Actualizar"


// --- Session Check and Page Initialization ---
async function checkAuthAndLoadSongs() {
    try {
        const res = await fetch(`${API_URL}/session.php`);
        const data = await res.json();

        if (data.loggedIn) {
            // User is logged in, show content and load songs
            loadingMessage.style.display = 'none'; // Hide loading message
            songsSection.style.display = 'block'; // Show songs section
            loadSongs(); // Load the songs
        } else {
            // User is not logged in, redirect to login page
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Error al verificar la sesión:', error);
        // In case of network error or API issue, redirect to login or show an error
        alert('No se pudo verificar la sesión. Por favor, inicia sesión de nuevo.');
        window.location.href = 'login.html';
    }
}

// Call this function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', checkAuthAndLoadSongs);


// --- Helper Functions for Form ---
function getSongFormData() {
    return {
        title: titleInput.value.trim(),
        artist: artistInput.value.trim(),
        album: albumInput.value.trim(),
        year: parseInt(yearInput.value),
        link: linkInput.value.trim(),
    };
}

function fillForm(data) {
    titleInput.value = data.title;
    artistInput.value = data.artist;
    albumInput.value = data.album;
    yearInput.value = data.year;
    linkInput.value = data.link;
}

function clearForm() {
    titleInput.value = '';
    artistInput.value = '';
    albumInput.value = '';
    yearInput.value = '';
    linkInput.value = '';
    songIdToEditInput.value = ''; // Limpiar el ID oculto
    saveSongBtn.textContent = 'Agregar'; // Restablecer el texto del botón
}


// --- CRUD Operations (songs) ---

async function loadSongs() {
    try {
        const res = await fetch(`${API_URL}/songs.php`);
        const songs = await res.json();

        songList.innerHTML = ''; // Clear existing list
        if (songs.length === 0) {
            songList.innerHTML = '<p style="text-align: center; color: #666;">No hay canciones registradas. ¡Añade una!</p>';
            return;
        }

        songs.forEach(s => {
            const card = document.createElement('li');
            card.className = 'song-card';
            card.innerHTML = `
                <strong>${s.title}</strong><br>
                <em>${s.artist}</em> (${s.year})<br>
                <button class="ver-btn">Ver</button>
                <button onclick="editSong(${s.id})">Editar</button>
                <button onclick="deleteSong(${s.id})">Eliminar</button>
            `;
            const verBtn = card.querySelector('.ver-btn');
            verBtn.addEventListener('click', () => showDetails(s));
            songList.appendChild(card);
        });
    } catch (error) {
        console.error('Error al cargar canciones:', error);
        alert('Error al cargar las canciones. Por favor, intenta de nuevo.');
    }
}

async function saveSong() { // Esta función reemplaza a addSong y manejará también la edición
    const songIdToEdit = songIdToEditInput.value; // Obtener el ID oculto
    const data = getSongFormData();

    // Validación básica del lado del cliente
    if (!data.title || !data.artist || !data.album || isNaN(data.year) || !data.link) {
        alert('Por favor, completa todos los campos para guardar la canción.');
        return;
    }
    if (!/^https?:\/\/.+\..+/.test(data.link)) {
        alert('Por favor, introduce un enlace válido (debe empezar con http:// o https://).');
        return;
    }

    let method = 'POST';
    let url = `${API_URL}/songs.php`;

    if (songIdToEdit) { // Si hay un ID, es una operación de edición (PUT)
        method = 'PUT';
        url = `${API_URL}/songs.php?id=${songIdToEdit}`; // Para PUT, el ID generalmente va en la URL
    }

    try {
        const res = await fetch(url, {
            method: method,
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify(data)
        });

        if (res.ok) {
            alert(songIdToEdit ? 'Canción actualizada exitosamente.' : 'Canción agregada exitosamente.');
            clearForm(); // Limpiar el formulario después de guardar/actualizar
            loadSongs(); // Recargar canciones para mostrar los cambios
        } else {
            const errorData = await res.json();
            alert(errorData.error || `Error al ${songIdToEdit ? 'actualizar' : 'agregar'} la canción.`);
        }
    } catch (error) {
        console.error(`Error de conexión al ${songIdToEdit ? 'actualizar' : 'agregar'} canción:`, error);
        alert('Error de conexión con el servidor al guardar la canción.');
    }
}


async function editSong(id) {
    try {
        const res = await fetch(`${API_URL}/songs.php`);
        const songs = await res.json();
        const songToEdit = songs.find(s => s.id === id);

        if (!songToEdit) {
            alert('Canción no encontrada para editar.');
            return;
        }

        fillForm(songToEdit); // Llenar el formulario con los datos de la canción
        songIdToEditInput.value = id; // Establecer el ID en el campo oculto
        saveSongBtn.textContent = 'Actualizar Canción'; // Cambiar texto del botón

        alert('Los datos de la canción se han cargado en el formulario. Edita los campos y luego haz clic en "Actualizar Canción".');

    } catch (error) {
        console.error('Error al obtener datos para edición:', error);
        alert('Error al obtener los datos de la canción para editar.');
    }
}


async function deleteSong(id) {
    const confirmDelete = confirm('¿Seguro que quieres eliminar esta canción?');
    if (!confirmDelete) return;

    try {
        const res = await fetch(`${API_URL}/songs.php?id=${id}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            alert('Canción eliminada exitosamente.');
            loadSongs(); // Recargar canciones
        } else {
            const errorData = await res.json();
            alert(errorData.error || 'Error al eliminar la canción.');
        }
    } catch (error) {
        console.error('Error de conexión al eliminar canción:', error);
        alert('Error de conexión con el servidor al eliminar la canción.');
    }
}

// --- Modal Details Functions ---
function showDetails(s) {
    document.getElementById('modalTitle').textContent = s.title;
    document.getElementById('modalArtist').textContent = s.artist;
    document.getElementById('modalAlbum').textContent = s.album;
    document.getElementById('modalYear').textContent = s.year;
    const linkElement = document.getElementById('modalLink');
    linkElement.href = s.link;
    linkElement.textContent = s.link;

    songModal.style.display = 'flex'; // Use flex to center
}

// --- Modal Close Logic ---
closeModalBtn.addEventListener('click', () => {
    songModal.style.display = 'none';
});

// Close modal if clicked outside content
window.addEventListener('click', (e) => {
    if (e.target === songModal) {
        songModal.style.display = 'none';
    }
});

// (Opcional) Listener para resetear el botón si se borran los campos manualmente
// Considera añadir un botón "Cancelar Edición" si la UI se vuelve más compleja
titleInput.addEventListener('input', () => {
    if (titleInput.value === '' && songIdToEditInput.value !== '') {
        // Si el usuario borra el título y estamos en modo edición,
        // podría querer cancelar la edición. Podrías añadir un botón de "Cancelar"
        // o resetear el estado del botón a "Agregar" aquí.
        // Por ahora, lo dejaremos para cuando se limpie el formulario con clearForm().
    }
});