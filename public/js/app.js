
const API_URL = '../api';
window.onload = async () => {
    const res = await fetch(API_URL + '/session.php');
    const data = await res.json();
    if (data.loggedIn) {
        document.getElementById('auth').style.display = 'none';
        document.getElementById('songs').style.display = 'block';
        loadSongs();
    }
};


async function register() {
    const data = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
    };
    const res = await fetch(API_URL + '/register.php', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(data)
    });
    console.log(await res.json());
}

async function login() {
    const data = {
        email: document.getElementById('login_email').value,
        password: document.getElementById('login_password').value,
    };
    const res = await fetch(API_URL + '/login.php', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(data)
    });
    const result = await res.json();
    if (res.ok) {
        document.getElementById('auth').style.display = 'none';
        document.getElementById('songs').style.display = 'block';
        loadSongs();
    } else {
        alert(result.error);
    }
}

async function logout() {
    const res = await fetch(API_URL + '/logout.php');
    const result = await res.json();
    if (res.ok) {
        document.getElementById('auth').style.display = 'block';
        document.getElementById('songs').style.display = 'none';
        alert(result.message);
    } else {
        alert('Error al cerrar sesión');
    }
}

async function loadSongs() {
    const res = await fetch(API_URL + '/songs.php');
    const songs = await res.json();
    const list = document.getElementById('songList');
    list.innerHTML = '';
    songs.forEach(s => {
        const card = document.createElement('div');
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
        list.appendChild(card);
    });
}

function showDetails(s) {
    document.getElementById('modalTitle').textContent = s.title;
    document.getElementById('modalArtist').textContent = s.artist;
    document.getElementById('modalAlbum').textContent = s.album;
    document.getElementById('modalYear').textContent = s.year;
    const link = document.getElementById('modalLink');
    link.href = s.link;
    link.textContent = s.link;

    document.getElementById('songModal').style.display = 'block';
}

async function addSong() {
    const data = getSongFormData();
    const res = await fetch(API_URL + '/songs.php', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(data)
    });
    if (res.ok) loadSongs();
    else alert((await res.json()).error);
}

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
    const res = await fetch(API_URL + '/songs.php');
    const songs = await res.json();
    const song = songs.find(s => s.id === id);
    if (!song) return alert('Canción no encontrada');
    fillForm(song);
    const confirmEdit = confirm('¿Deseas guardar cambios a esta canción?');
    if (!confirmEdit) return;
    const updatedData = getSongFormData();
    const updateRes = await fetch(API_URL + `/songs.php?id=${id}`, {
        method: 'PUT',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(updatedData)
    });
    if (updateRes.ok) {
        alert('Canción actualizada');
        loadSongs();
    } else {
        alert('Error al actualizar');
    }
}

async function deleteSong(id) {
    const confirmDelete = confirm('¿Seguro que quieres eliminar esta canción?');
    if (!confirmDelete) return;
    const res = await fetch(API_URL + `/songs.php?id=${id}`, {
        method: 'DELETE'
    });
    if (res.ok) {
        alert('Canción eliminada');
        loadSongs();
    } else {
        alert('Error al eliminar');
    }
}

// cerrar modal
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('closeModal').addEventListener('click', () => {
        document.getElementById('songModal').style.display = 'none';
    });

    // cerrar si se hace click fuera del contenido
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('songModal');
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});