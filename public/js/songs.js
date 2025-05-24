// js/app.js

const API_URL = '../api';

// Elementos del DOM
const songsSection = document.getElementById('songs');
const loadingMessage = document.getElementById('loadingMessage');
const songList = document.getElementById('songList');
const songModal = document.getElementById('songModal');
const closeModalBtn = document.getElementById('closeModal');

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


// --- Existing Functions (Adapted to use the new structure) ---

async function logout() {
    try {
        const res = await fetch(`${API_URL}/logout.php`);
        const result = await res.json();

        if (res.ok) {
            alert(result.message || 'Sesión cerrada exitosamente.');
            window.location.href = 'login.html'; // Redirect to login after logout
        } else {
            alert(result.error || 'Error al cerrar sesión.');
        }
    } catch (error) {
        console.error('Error de conexión al cerrar sesión:', error);
        alert('Error de conexión con el servidor al cerrar sesión.');
    }
}

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
            const card = document.createElement('li'); // Changed to <li> for semantic correctness within <ul>
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

async function addSong() {
    const title = document.getElementById('title').value.trim();
    const artist = document.getElementById('artist').value.trim();
    const album = document.getElementById('album').value.trim();
    const year = parseInt(document.getElementById('year').value);
    const link = document.getElementById('link').value.trim();

    // Basic client-side validation for adding song
    if (!title || !artist || !album || isNaN(year) || !link) {
        alert('Por favor, completa todos los campos para añadir una canción.');
        return;
    }
    if (!/^https?:\/\/.+\..+/.test(link)) { // Simple URL regex
        alert('Por favor, introduce un enlace válido (debe empezar con http:// o https://).');
        return;
    }

    const data = { title, artist, album, year, link };

    try {
        const res = await fetch(`${API_URL}/songs.php`, {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify(data)
        });

        if (res.ok) {
            alert('Canción agregada exitosamente.');
            // Clear form fields
            document.getElementById('title').value = '';
            document.getElementById('artist').value = '';
            document.getElementById('album').value = '';
            document.getElementById('year').value = '';
            document.getElementById('link').value = '';
            loadSongs(); // Reload songs to show the new one
        } else {
            const errorData = await res.json();
            alert(errorData.error || 'Error al agregar la canción.');
        }
    } catch (error) {
        console.error('Error de conexión al agregar canción:', error);
        alert('Error de conexión con el servidor al agregar la canción.');
    }
}

// Note: getSongFormData and fillForm are helper functions often used with a dedicated form for editing
// For simplicity, I'm keeping them as is, but in a real app, you might have a modal for edit.
function getSongFormData() {
    return {
        title: document.getElementById('title').value,
        artist: document.getElementById('artist').value,
        album: document.getElementById('album').value,
        year: parseInt(document.getElementById('year').value),
        link: document.getElementById('link').value,
    };
}

function fillForm(data) {
    document.getElementById('title').value = data.title;
    document.getElementById('artist').value = data.artist;
    document.getElementById('album').value = data.album;
    document.getElementById('year').value = data.year;
    document.getElementById('link').value = data.link;
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

        // Fill the form with the song data for editing
        fillForm(songToEdit);

        // A more robust UI for editing would involve a modal or a dedicated edit form
        // For now, we'll use a prompt for the user to confirm changes after filling the form
        const confirmEdit = confirm('Los datos de la canción se han cargado en el formulario. Edita los campos y luego haz clic en "Agregar" para actualizar. ¿Deseas continuar?');
        
        if (!confirmEdit) {
            // Clear form if user cancels
            document.getElementById('title').value = '';
            document.getElementById('artist').value = '';
            document.getElementById('album').value = '';
            document.getElementById('year').value = '';
            document.getElementById('link').value = '';
            return;
        }

        // To actually update, you'd need a separate "Update" button or modify the "Add" button's behavior
        // For this example, I'll simulate the update after they click "Agregar"
        // In a real app, you'd likely disable the "Add" button and enable an "Update" button with the ID.
        // For simplicity, I'll just show the concept of fetching and filling.
        alert('Edita los campos en el formulario superior y luego haz clic en "Agregar" para guardar los cambios (la función "Agregar" ahora actuará como "Actualizar" para esta canción).');
        // You'd need to store the ID of the song being edited globally or pass it to addSong
        // For now, addSong will always add a new song. This is a simplification.
        // A proper edit flow would involve a separate function for PUT requests.
        
        // Let's modify addSong to handle both add and edit based on a global state or a hidden input
        // For now, I'll just alert that it's loaded for editing.
        // A better approach would be to have a hidden input for `songIdToEdit` and modify `addSong` to `saveSong`.
        // I will add a simplified `saveSong` function that handles both add and edit.
    } catch (error) {
        console.error('Error al editar canción:', error);
        alert('Error al obtener los datos de la canción para editar.');
    }
}

// Simplified saveSong to handle both add and edit based on a hidden input or global variable
// This requires a hidden input in your HTML: <input type="hidden" id="songIdToEdit">
// And modifying the "Agregar" button to call `saveSong()` instead of `addSong()`.
// I'll update the HTML button to call `saveSong()` and add the hidden input.
async function saveSong() {
    const songIdToEdit = document.getElementById('songIdToEdit').value;
    const data = getSongFormData();

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

    if (songIdToEdit) { // If there's an ID, it's an edit operation
        method = 'PUT';
        url = `${API_URL}/songs.php?id=${songIdToEdit}`;
    }

    try {
        const res = await fetch(url, {
            method: method,
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify(data)
        });

        if (res.ok) {
            alert(songIdToEdit ? 'Canción actualizada exitosamente.' : 'Canción agregada exitosamente.');
            // Clear form and hidden ID
            document.getElementById('title').value = '';
            document.getElementById('artist').value = '';
            document.getElementById('album').value = '';
            document.getElementById('year').value = '';
            document.getElementById('link').value = '';
            document.getElementById('songIdToEdit').value = ''; // Clear hidden ID
            loadSongs(); // Reload songs
        } else {
            const errorData = await res.json();
            alert(errorData.error || `Error al ${songIdToEdit ? 'actualizar' : 'agregar'} la canción.`);
        }
    } catch (error) {
        console.error(`Error de conexión al ${songIdToEdit ? 'actualizar' : 'agregar'} canción:`, error);
        alert('Error de conexión con el servidor.');
    }
}

// Modify editSong to set the hidden input and change button text (optional)
async function editSong(id) {
    try {
        const res = await fetch(`${API_URL}/songs.php`);
        const songs = await res.json();
        const songToEdit = songs.find(s => s.id === id);

        if (!songToEdit) {
            alert('Canción no encontrada para editar.');
            return;
        }

        fillForm(songToEdit);
        document.getElementById('songIdToEdit').value = id; // Set the hidden ID
        // Optional: Change button text to "Actualizar"
        const saveButton = document.querySelector('#songs button[onclick="saveSong()"]');
        if (saveButton) {
            saveButton.textContent = 'Actualizar Canción';
        }

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
            loadSongs(); // Reload songs
        } else {
            const errorData = await res.json();
            alert(errorData.error || 'Error al eliminar la canción.');
        }
    } catch (error) {
        console.error('Error de conexión al eliminar canción:', error);
        alert('Error de conexión con el servidor al eliminar la canción.');
    }
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