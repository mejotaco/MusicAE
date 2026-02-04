// ====================================
// MusicAE - User Application Script
// ====================================

// Estado global
const state = {
    currentUser: null,
    songs: [],
    currentSong: null,
    isPlaying: false,
    playlist: [],
    playlistIndex: 0,
    shuffle: false,
    repeat: false,
    volume: 70,
    ytPlayer: null,
    ytReady: false,
    playerReady: false
};

// ====================================
// INICIALIZACIÓN
// ====================================

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Inicializar base de datos
        await musicDB.init();
        console.log('✅ Database initialized');
        
        // Sembrar datos si es primera vez
        await musicDB.seedData();
        
        // Iniciar app
        initAuth();
        initParticles();
        setupEventListeners();
        await loadSongsFromDB();
    } catch (error) {
        console.error('Error initializing app:', error);
        alert('Error al inicializar la aplicación. Por favor recarga la página.');
    }
});

// YouTube API Ready
function onYouTubeIframeAPIReady() {
    state.ytReady = true;
    console.log('✅ YouTube API Ready');
}

window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

// ====================================
// AUTENTICACIÓN
// ====================================

function initAuth() {
    const savedUser = localStorage.getItem('musicae_user');
    if (savedUser) {
        state.currentUser = JSON.parse(savedUser);
        showApp();
    }
}

function setupEventListeners() {
    // Auth tabs
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => switchAuthTab(tab.dataset.tab));
    });
    
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Register form
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => switchView(btn.dataset.view));
    });
    
    // Add Song Button
    document.getElementById('btnAddSong').addEventListener('click', openAddSongModal);
    
    // Modal close buttons
    document.querySelectorAll('.btn-close, .btn-cancel').forEach(btn => {
        btn.addEventListener('click', closeModals);
    });
    
    // Add song form
    document.getElementById('formAddSong').addEventListener('submit', handleAddSong);
    
    // Player controls
    document.getElementById('btnPlay').addEventListener('click', togglePlay);
    document.getElementById('btnPrev').addEventListener('click', playPrevious);
    document.getElementById('btnNext').addEventListener('click', playNext);
    document.getElementById('btnShuffle').addEventListener('click', toggleShuffle);
    document.getElementById('btnRepeat').addEventListener('click', toggleRepeat);
    document.getElementById('btnPlayerFavorite').addEventListener('click', toggleFavorite);
    
    // Volume
    document.getElementById('volumeBar').addEventListener('input', (e) => {
        setVolume(e.target.value);
    });
    
    document.getElementById('btnVolume').addEventListener('click', toggleMute);
    
    // Progress bar
    document.getElementById('progressBar').addEventListener('input', (e) => {
        seekTo(e.target.value);
    });
    
    // Search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => filterSongs(e.target.value));
    }
    
    // Filter sort
    const filterSort = document.getElementById('filterSort');
    if (filterSort) {
        filterSort.addEventListener('change', (e) => sortSongs(e.target.value));
    }
}

function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tab + 'Form').classList.add('active');
}

async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUser').value;
    const password = document.getElementById('loginPass').value;
    
    try {
        // Buscar usuario en base de datos
        const user = await musicDB.getUserByUsername(username);
        
        if (user && user.password === password) {
            state.currentUser = user;
            localStorage.setItem('musicae_user', JSON.stringify(user));
            await showApp();
        } else {
            alert('Usuario o contraseña incorrectos');
        }
    } catch (error) {
        console.error('Error en login:', error);
        alert('Error al iniciar sesión');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('regUser').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPass').value;
    
    try {
        // Verificar si el usuario ya existe
        const existingUser = await musicDB.getUserByUsername(username);
        if (existingUser) {
            alert('El nombre de usuario ya existe');
            return;
        }
        
        const existingEmail = await musicDB.getUserByEmail(email);
        if (existingEmail) {
            alert('El email ya está registrado');
            return;
        }
        
        // Crear nuevo usuario
        const userId = await musicDB.createUser({
            username: username,
            email: email,
            password: password
        });
        
        // Obtener usuario completo
        const user = await musicDB.get('users', userId);
        state.currentUser = user;
        localStorage.setItem('musicae_user', JSON.stringify(user));
        
        await showApp();
    } catch (error) {
        console.error('Error en registro:', error);
        alert('Error al registrar usuario');
    }
}

function handleLogout() {
    state.currentUser = null;
    localStorage.removeItem('musicae_user');
    document.getElementById('authScreen').classList.add('active');
    document.getElementById('mainApp').classList.remove('active');
    if (state.ytPlayer) {
        state.ytPlayer.stopVideo();
    }
}

async function showApp() {
    document.getElementById('authScreen').classList.remove('active');
    document.getElementById('mainApp').classList.add('active');
    
    updateUserInfo();
    await loadSongsFromDB();
    await renderAllViews();
}

function updateUserInfo() {
    const user = state.currentUser;
    const initial = user.username.charAt(0).toUpperCase();
    
    document.getElementById('userAvatar').textContent = initial;
    document.getElementById('userName').textContent = user.username;
    document.getElementById('profileAvatar').textContent = initial;
    document.getElementById('profileName').textContent = user.username;
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('profileJoined').textContent = user.joined;
}

// ====================================
// NAVEGACIÓN
// ====================================

function switchView(view) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.content-view').forEach(v => v.classList.remove('active'));
    
    event.target.closest('.nav-btn').classList.add('active');
    document.getElementById(view + 'View').classList.add('active');
    
    renderView(view);
}

function renderView(view) {
    switch(view) {
        case 'home':
            renderHome();
            break;
        case 'library':
            renderLibrary();
            break;
        case 'discover':
            renderDiscover();
            break;
        case 'downloads':
            renderDownloads();
            break;
        case 'profile':
            renderProfile();
            break;
    }
}

function renderAllViews() {
    renderHome();
    renderLibrary();
    updateStats();
}

// ====================================
// DATOS DESDE BASE DE DATOS
// ====================================

async function loadSongsFromDB() {
    try {
        state.songs = await musicDB.getAllSongs();
        
        // Cargar favoritos para el usuario actual
        if (state.currentUser) {
            const favorites = await musicDB.getFavoritesByUser(state.currentUser.id);
            const favoriteSongIds = favorites.map(f => f.songId);
            
            // Marcar canciones favoritas
            state.songs.forEach(song => {
                song.isFavorite = favoriteSongIds.includes(song.id);
            });
        }
        
        state.playlist = [...state.songs];
        console.log(`✅ Loaded ${state.songs.length} songs from database`);
    } catch (error) {
        console.error('Error loading songs:', error);
        state.songs = [];
    }
}

// ====================================
// RENDER VISTAS
// ====================================

async function renderHome() {
    const recentTracks = state.songs.slice(0, 6);
    const container = document.getElementById('recentTracks');
    
    if (recentTracks.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <svg viewBox="0 0 24 24"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                <h3>No hay canciones aún</h3>
                <p>Agrega tu primera canción para empezar</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = recentTracks.map(song => `
        <div class="track-card" onclick="playSong(${song.id})">
            <div class="track-thumbnail" style="background-image: url('${song.thumbnail || ''}'); background-size: cover; background-position: center;">
                ${!song.thumbnail ? '<svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>' : ''}
                <div class="track-play-overlay">
                    <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </div>
            </div>
            <div class="track-info">
                <h4>${song.title}</h4>
                <p>${song.artist}</p>
            </div>
            <div class="track-footer">
                <span class="track-genre">${song.genre}</span>
                <div class="track-actions">
                    <button class="track-action-btn" onclick="event.stopPropagation(); toggleSongFavorite(${song.id})">
                        <svg viewBox="0 0 24 24" ${song.isFavorite ? 'fill="currentColor"' : ''}>
                            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                        </svg>
                    </button>
                    <button class="track-action-btn" onclick="event.stopPropagation(); showSongDetails(${song.id})">
                        <svg viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="1"/>
                            <circle cx="12" cy="5" r="1"/>
                            <circle cx="12" cy="19" r="1"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderLibrary() {
    const container = document.getElementById('libraryTracks');
    
    if (state.songs.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                <h3>No songs yet</h3>
                <p>Start building your library by adding your first song</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        ${state.songs.map((song, index) => `
            <div class="track-list-item" onclick="playSong(${song.id})">
                <span class="track-list-number">${(index + 1).toString().padStart(2, '0')}</span>
                <div class="track-list-title">
                    <div class="track-list-thumb">
                        <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    </div>
                    <div class="track-list-meta">
                        <h4>${song.title}</h4>
                        <p>${song.artist}</p>
                    </div>
                </div>
                <span class="track-list-album">${song.album || 'Unknown'}</span>
                <span class="track-list-genre">${song.genre}</span>
                <div class="track-list-rating">
                    <div class="stars">
                        ${[1,2,3,4,5].map(i => `<span class="star ${i <= song.rating ? 'filled' : ''}">★</span>`).join('')}
                    </div>
                </div>
                <div class="track-list-actions">
                    <button class="btn-icon" onclick="event.stopPropagation(); toggleSongFavorite(${song.id})">
                        <svg viewBox="0 0 24 24" ${song.isFavorite ? 'fill="currentColor"' : ''}>
                            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                        </svg>
                    </button>
                    <button class="btn-icon" onclick="event.stopPropagation(); downloadSong(${song.id})">
                        <svg viewBox="0 0 24 24">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                        </svg>
                    </button>
                    <button class="btn-icon" onclick="event.stopPropagation(); showSongDetails(${song.id})">
                        <svg viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="1"/>
                            <circle cx="12" cy="5" r="1"/>
                            <circle cx="12" cy="19" r="1"/>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('')}
    `;
}

function renderDiscover() {
    // Mostrar todas las canciones de otros usuarios
    const container = document.getElementById('discoverTracks');
    const allSongs = state.songs;
    
    container.innerHTML = `
        <div class="tracks-grid">
            ${allSongs.map(song => `
                <div class="track-card" onclick="playSong(${song.id})">
                    <div class="track-thumbnail">
                        <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        <div class="track-play-overlay">
                            <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        </div>
                    </div>
                    <div class="track-info">
                        <h4>${song.title}</h4>
                        <p>${song.artist}</p>
                    </div>
                    <div class="track-footer">
                        <span class="track-genre">${song.genre}</span>
                        <div class="track-actions">
                            <span style="font-size: 0.75rem; color: var(--gray-500);">by ${song.userName}</span>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderDownloads() {
    const downloads = state.songs.filter(s => s.downloaded);
    const container = document.getElementById('downloadsList');
    
    if (downloads.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                <h3>No downloads yet</h3>
                <p>Download songs to access them offline</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = downloads.map(song => `
        <div class="track-list-item" onclick="playSong(${song.id})">
            <div class="track-list-title">
                <div class="track-list-thumb">
                    <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </div>
                <div class="track-list-meta">
                    <h4>${song.title}</h4>
                    <p>${song.artist}</p>
                </div>
            </div>
            <span class="track-list-album">${song.album || 'Unknown'}</span>
        </div>
    `).join('');
}

function renderProfile() {
    const userSongs = state.songs.filter(s => s.userId === state.currentUser?.id);
    const userReviews = state.songs.reduce((acc, s) => acc + (s.reviews?.length || 0), 0);
    const downloads = state.songs.filter(s => s.downloaded).length;
    
    document.getElementById('profileSongs').textContent = userSongs.length;
    document.getElementById('profileReviews').textContent = userReviews;
    document.getElementById('profileDownloads').textContent = downloads;
    
    // Activity feed
    const activities = [
        { icon: 'music', text: 'Added a new song', time: '2 hours ago' },
        { icon: 'download', text: 'Downloaded 3 songs', time: '5 hours ago' },
        { icon: 'heart', text: 'Liked "Bohemian Rhapsody"', time: '1 day ago' }
    ];
    
    const activityContainer = document.getElementById('activityList');
    activityContainer.innerHTML = activities.map(a => `
        <div class="activity-item">
            <div class="activity-icon">
                <svg viewBox="0 0 24 24">
                    ${a.icon === 'music' ? '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>' : ''}
                    ${a.icon === 'download' ? '<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>' : ''}
                    ${a.icon === 'heart' ? '<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>' : ''}
                </svg>
            </div>
            <div class="activity-content">
                <p>${a.text}</p>
                <span class="activity-time">${a.time}</span>
            </div>
        </div>
    `).join('');
}

function updateStats() {
    document.getElementById('statTotal').textContent = state.songs.length;
    document.getElementById('statDownloads').textContent = state.songs.filter(s => s.downloaded).length;
    document.getElementById('statFavorites').textContent = state.songs.filter(s => s.isFavorite).length;
}

// ====================================
// GESTIÓN DE CANCIONES
// ====================================

function openAddSongModal() {
    document.getElementById('modalAddSong').classList.add('active');
}

function closeModals() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
}

async function handleAddSong(e) {
    e.preventDefault();
    
    try {
        const songData = {
            title: document.getElementById('inputTitle').value,
            artist: document.getElementById('inputArtist').value,
            album: document.getElementById('inputAlbum').value || 'Unknown',
            genre: document.getElementById('inputGenre').value,
            youtubeUrl: document.getElementById('inputYouTube').value,
            userId: state.currentUser.id,
            userName: state.currentUser.username
        };
        
        // Guardar en base de datos
        const songId = await musicDB.createSong(songData);
        console.log('✅ Song created with ID:', songId);
        
        // Recargar canciones
        await loadSongsFromDB();
        
        closeModals();
        await renderAllViews();
        updateStats();
        
        e.target.reset();
        
        // Mostrar mensaje de éxito
        alert('¡Canción agregada exitosamente!');
    } catch (error) {
        console.error('Error adding song:', error);
        alert('Error al agregar la canción');
    }
}

async function toggleSongFavorite(id) {
    try {
        const isFavorite = await musicDB.toggleFavorite(state.currentUser.id, id);
        
        // Actualizar en el estado local
        const song = state.songs.find(s => s.id === id);
        if (song) {
            song.isFavorite = isFavorite;
        }
        
        await renderAllViews();
        updateStats();
    } catch (error) {
        console.error('Error toggling favorite:', error);
    }
}

async function downloadSong(id) {
    try {
        const song = state.songs.find(s => s.id === id);
        if (song) {
            await musicDB.incrementDownloads(id);
            
            // Simular descarga abriendo YouTube
            window.open(song.youtubeUrl, '_blank');
            
            // Recargar datos
            await loadSongsFromDB();
            updateStats();
        }
    } catch (error) {
        console.error('Error downloading song:', error);
    }
}

async function showSongDetails(id) {
    try {
        const song = state.songs.find(s => s.id === id);
        if (!song) return;
        
        // Obtener reviews desde la base de datos
        const reviews = await musicDB.getReviewsBySong(id);
        const avgRating = await musicDB.getAverageSongRating(id);
        
        // Obtener hilos de discusión
        const threads = await musicDB.getThreadsBySong(id);
        
        const modal = document.getElementById('modalSongDetails');
        const content = document.getElementById('songDetailsContent');
        
        content.innerHTML = `
            <div style="display: grid; gap: 2rem;">
                <div style="text-align: center;">
                    <img src="${song.thumbnail || ''}" alt="${song.title}" style="max-width: 100%; border-radius: 12px; margin-bottom: 1rem;" onerror="this.style.display='none'">
                    <h3 style="font-size: 2rem; color: var(--white); margin-bottom: 0.5rem;">${song.title}</h3>
                    <p style="font-size: 1.25rem; color: var(--gray-400); margin-bottom: 1rem;">${song.artist}</p>
                    <div style="display: flex; gap: 1rem; justify-content: center; margin-bottom: 2rem;">
                        <span class="track-genre">${song.genre}</span>
                        <span style="font-size: 0.85rem; color: var(--gray-500);">${song.downloads || 0} downloads</span>
                        <span style="font-size: 0.85rem; color: var(--gray-500);">${song.plays || 0} plays</span>
                    </div>
                </div>
                
                <div>
                    <h4 style="color: var(--white); margin-bottom: 1rem;">Información</h4>
                    <div style="display: grid; grid-template-columns: 120px 1fr; gap: 0.5rem; color: var(--gray-300);">
                        <strong>Album:</strong><span>${song.album}</span>
                        <strong>Género:</strong><span>${song.genre}</span>
                        <strong>Subido por:</strong><span>${song.userName}</span>
                        <strong>Fecha:</strong><span>${new Date(song.addedDate).toLocaleDateString()}</span>
                        <strong>Rating:</strong><span>${avgRating.toFixed(1)} ⭐ (${reviews.length} reviews)</span>
                    </div>
                </div>
                
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h4 style="color: var(--white);">Reviews (${reviews.length})</h4>
                        <button class="btn-secondary" onclick="openAddReviewModal(${song.id})" style="padding: 0.5rem 1rem; font-size: 0.85rem;">
                            Agregar Review
                        </button>
                    </div>
                    <div style="max-height: 300px; overflow-y: auto;">
                        ${reviews.length === 0 ? '<p style="color: var(--gray-500); text-align: center; padding: 2rem;">No hay reviews todavía</p>' : ''}
                        ${reviews.map(r => `
                            <div style="padding: 1rem; background: var(--bg-tertiary); border-radius: 8px; margin-bottom: 1rem;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                    <strong style="color: var(--white);">${r.userName}</strong>
                                    <div class="stars">
                                        ${[1,2,3,4,5].map(i => `<span class="star ${i <= r.rating ? 'filled' : ''}">★</span>`).join('')}
                                    </div>
                                </div>
                                <p style="color: var(--gray-300); margin-bottom: 0.5rem;">${r.comment}</p>
                                <p style="font-size: 0.8rem; color: var(--gray-500);">${new Date(r.date).toLocaleDateString()}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h4 style="color: var(--white);">Hilos de Discusión (${threads.length})</h4>
                        <button class="btn-secondary" onclick="openCreateThreadModal(${song.id})" style="padding: 0.5rem 1rem; font-size: 0.85rem;">
                            Crear Hilo
                        </button>
                    </div>
                    <div style="max-height: 300px; overflow-y: auto;">
                        ${threads.length === 0 ? '<p style="color: var(--gray-500); text-align: center; padding: 2rem;">No hay hilos de discusión</p>' : ''}
                        ${threads.map(t => `
                            <div style="padding: 1rem; background: var(--bg-tertiary); border-radius: 8px; margin-bottom: 1rem; cursor: pointer;" onclick="viewThread(${t.id})">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                    <strong style="color: var(--white);">${t.title}</strong>
                                    <span style="font-size: 0.85rem; color: var(--gray-500);">${t.replyCount || 0} respuestas</span>
                                </div>
                                <p style="color: var(--gray-400); font-size: 0.9rem; margin-bottom: 0.5rem;">${t.content}</p>
                                <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--gray-500);">
                                    <span>por ${t.userName}</span>
                                    <span>${new Date(t.date).toLocaleDateString()}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div style="display: flex; gap: 1rem;">
                    <button class="btn-primary" onclick="playSong(${song.id}); closeModals();" style="flex: 1;">
                        <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        <span>Reproducir</span>
                    </button>
                    <button class="btn-secondary" onclick="downloadSong(${song.id})" style="flex: 1;">
                        <svg viewBox="0 0 24 24" style="width: 18px; height: 18px; margin-right: 0.5rem;">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                        </svg>
                        Descargar
                    </button>
                </div>
            </div>
        `;
        
        modal.classList.add('active');
    } catch (error) {
        console.error('Error showing song details:', error);
    }
}

function filterSongs(query) {
    const filtered = state.songs.filter(s => 
        s.title.toLowerCase().includes(query.toLowerCase()) ||
        s.artist.toLowerCase().includes(query.toLowerCase()) ||
        s.album.toLowerCase().includes(query.toLowerCase())
    );
    
    // Re-render con filtro
    const container = document.getElementById('libraryTracks');
    // Aquí iría la lógica de render filtrado
}

function sortSongs(sortType) {
    switch(sortType) {
        case 'title':
            state.songs.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'artist':
            state.songs.sort((a, b) => a.artist.localeCompare(b.artist));
            break;
        case 'rating':
            state.songs.sort((a, b) => b.rating - a.rating);
            break;
        default:
            state.songs.sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate));
    }
    renderLibrary();
}

// ====================================
// REPRODUCTOR
// ====================================

async function playSong(id) {
    try {
        const song = state.songs.find(s => s.id === id);
        if (!song) {
            console.error('Song not found:', id);
            return;
        }
        
        console.log('🎵 Playing song:', song.title);
        
        state.currentSong = song;
        state.playlistIndex = state.playlist.findIndex(s => s.id === id);
        
        // Incrementar contador de reproducciones
        await musicDB.incrementPlays(id);
        
        updatePlayerUI();
        await loadYouTubeVideo(song.youtubeUrl);
    } catch (error) {
        console.error('Error playing song:', error);
        alert('Error al reproducir la canción');
    }
}

function updatePlayerUI() {
    if (!state.currentSong) return;
    
    document.getElementById('playerTitle').textContent = state.currentSong.title;
    document.getElementById('playerArtist').textContent = state.currentSong.artist;
    
    // Actualizar thumbnail si existe
    const playerThumb = document.getElementById('playerThumb');
    if (state.currentSong.thumbnail) {
        playerThumb.style.backgroundImage = `url('${state.currentSong.thumbnail}')`;
        playerThumb.style.backgroundSize = 'cover';
        playerThumb.style.backgroundPosition = 'center';
        playerThumb.innerHTML = '';
    }
    
    const favoriteBtn = document.getElementById('btnPlayerFavorite');
    if (state.currentSong.isFavorite) {
        favoriteBtn.querySelector('svg').setAttribute('fill', 'currentColor');
    } else {
        favoriteBtn.querySelector('svg').removeAttribute('fill');
    }
}

async function loadYouTubeVideo(url) {
    const videoId = extractYouTubeId(url);
    if (!videoId) {
        console.error('Invalid YouTube URL:', url);
        alert('URL de YouTube inválida');
        return;
    }
    
    console.log('Loading video:', videoId);
    
    // Esperar a que la API de YouTube esté lista
    if (!window.YT || !window.YT.Player) {
        console.log('YouTube API not ready yet, waiting...');
        setTimeout(() => loadYouTubeVideo(url), 500);
        return;
    }
    
    if (!state.ytPlayer) {
        console.log('Creating YouTube player...');
        try {
            state.ytPlayer = new YT.Player('ytPlayerContainer', {
                height: '1',
                width: '1',
                videoId: videoId,
                playerVars: {
                    autoplay: 1,
                    controls: 0,
                    disablekb: 1,
                    fs: 0,
                    modestbranding: 1,
                    playsinline: 1
                },
                events: {
                    onReady: onPlayerReady,
                    onStateChange: onPlayerStateChange,
                    onError: onPlayerError
                }
            });
        } catch (error) {
            console.error('Error creating player:', error);
        }
    } else {
        console.log('Loading video in existing player...');
        state.ytPlayer.loadVideoById(videoId);
        state.ytPlayer.playVideo();
    }
}

function extractYouTubeId(url) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
}

function onPlayerReady(event) {
    console.log('✅ YouTube Player Ready');
    state.playerReady = true;
    state.isPlaying = true;
    updatePlayButton();
    setVolume(state.volume);
    startProgressUpdate();
    event.target.playVideo();
}

function onPlayerStateChange(event) {
    console.log('Player state changed:', event.data);
    
    if (event.data === YT.PlayerState.PLAYING) {
        state.isPlaying = true;
        updatePlayButton();
    } else if (event.data === YT.PlayerState.PAUSED) {
        state.isPlaying = false;
        updatePlayButton();
    } else if (event.data === YT.PlayerState.ENDED) {
        console.log('Song ended, playing next...');
        playNext();
    } else if (event.data === YT.PlayerState.BUFFERING) {
        console.log('Buffering...');
    }
}

function onPlayerError(event) {
    console.error('YouTube Player Error:', event.data);
    let errorMsg = 'Error al reproducir el video';
    
    switch(event.data) {
        case 2:
            errorMsg = 'ID de video inválido';
            break;
        case 5:
            errorMsg = 'Error de HTML5 player';
            break;
        case 100:
            errorMsg = 'Video no encontrado';
            break;
        case 101:
        case 150:
            errorMsg = 'El propietario del video no permite reproducción embebida';
            break;
    }
    
    alert(errorMsg + '. Intenta con otro video.');
}

function togglePlay() {
    if (!state.ytPlayer || !state.playerReady) {
        console.log('Player not ready');
        return;
    }
    
    try {
        if (state.isPlaying) {
            state.ytPlayer.pauseVideo();
        } else {
            state.ytPlayer.playVideo();
        }
    } catch (error) {
        console.error('Error toggling play:', error);
    }
}

function updatePlayButton() {
    const playIcon = document.getElementById('playIcon');
    const pauseIcon = document.getElementById('pauseIcon');
    
    if (state.isPlaying) {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
    } else {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
    }
}

function playPrevious() {
    if (state.playlistIndex > 0) {
        state.playlistIndex--;
        playSong(state.playlist[state.playlistIndex].id);
    } else {
        // Volver al final
        state.playlistIndex = state.playlist.length - 1;
        playSong(state.playlist[state.playlistIndex].id);
    }
}

function playNext() {
    if (state.repeat && state.currentSong) {
        playSong(state.currentSong.id);
    } else if (state.shuffle) {
        const randomIndex = Math.floor(Math.random() * state.playlist.length);
        playSong(state.playlist[randomIndex].id);
    } else if (state.playlistIndex < state.playlist.length - 1) {
        state.playlistIndex++;
        playSong(state.playlist[state.playlistIndex].id);
    } else {
        // Volver al inicio
        state.playlistIndex = 0;
        playSong(state.playlist[state.playlistIndex].id);
    }
}

function toggleShuffle() {
    state.shuffle = !state.shuffle;
    event.target.closest('.btn-icon').classList.toggle('active');
}

function toggleRepeat() {
    state.repeat = !state.repeat;
    event.target.closest('.btn-icon').classList.toggle('active');
}

function toggleFavorite() {
    if (state.currentSong) {
        toggleSongFavorite(state.currentSong.id);
        updatePlayerUI();
    }
}

function setVolume(value) {
    state.volume = value;
    if (state.ytPlayer && state.ytPlayer.setVolume) {
        state.ytPlayer.setVolume(value);
    }
}

function toggleMute() {
    if (state.ytPlayer && state.playerReady) {
        if (state.ytPlayer.isMuted()) {
            state.ytPlayer.unMute();
        } else {
            state.ytPlayer.mute();
        }
    }
}

function seekTo(value) {
    if (state.ytPlayer && state.ytPlayer.getDuration && state.playerReady) {
        const duration = state.ytPlayer.getDuration();
        const seekTime = (value / 100) * duration;
        state.ytPlayer.seekTo(seekTime, true);
    }
}

let progressInterval = null;

function startProgressUpdate() {
    if (progressInterval) {
        clearInterval(progressInterval);
    }
    
    progressInterval = setInterval(() => {
        if (state.ytPlayer && state.ytPlayer.getCurrentTime && state.isPlaying && state.playerReady) {
            try {
                const current = state.ytPlayer.getCurrentTime();
                const duration = state.ytPlayer.getDuration();
                
                if (duration > 0) {
                    const percentage = (current / duration) * 100;
                    
                    document.getElementById('progressFill').style.width = percentage + '%';
                    document.getElementById('progressBar').value = percentage;
                    document.getElementById('currentTime').textContent = formatTime(current);
                    document.getElementById('totalTime').textContent = formatTime(duration);
                }
            } catch (error) {
                // Ignorar errores de API no disponible
            }
        }
    }, 1000);
}

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ====================================
// ANIMACIONES
// ====================================

function initParticles() {
    const canvas = document.getElementById('particlesCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2 + 1
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            
            p.x += p.vx;
            p.y += p.vy;
            
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// ====================================
// REVIEWS Y HILOS
// ====================================

function openAddReviewModal(songId) {
    const html = `
        <div class="modal active" id="modalAddReview">
            <div class="modal-overlay" onclick="closeModals()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Agregar Review</h2>
                    <button class="btn-close" onclick="closeModals()">&times;</button>
                </div>
                <form class="modal-body" onsubmit="handleAddReview(event, ${songId})">
                    <div class="form-group">
                        <label>Calificación</label>
                        <div class="rating-input" id="ratingInput">
                            ${[1,2,3,4,5].map(i => `<span class="star-input" data-rating="${i}" onclick="selectRating(${i})">★</span>`).join('')}
                        </div>
                        <input type="hidden" id="reviewRating" value="5" required>
                    </div>
                    <div class="form-group">
                        <label>Comentario</label>
                        <textarea id="reviewComment" rows="4" placeholder="Escribe tu opinión..." required style="width: 100%; padding: 0.875rem 1rem; background: var(--bg-secondary); border: 1px solid var(--accent-border); border-radius: 8px; color: var(--white); font-family: var(--font-display); resize: vertical;"></textarea>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary btn-cancel" onclick="closeModals()">Cancelar</button>
                        <button type="submit" class="btn-primary">Enviar Review</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', html);
    setTimeout(() => selectRating(5), 100);
}

function selectRating(rating) {
    document.getElementById('reviewRating').value = rating;
    const stars = document.querySelectorAll('.star-input');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.style.color = '#ffffff';
        } else {
            star.style.color = '#666666';
        }
    });
}

async function handleAddReview(event, songId) {
    event.preventDefault();
    
    try {
        const rating = parseInt(document.getElementById('reviewRating').value);
        const comment = document.getElementById('reviewComment').value;
        
        await musicDB.createReview({
            songId: songId,
            userId: state.currentUser.id,
            userName: state.currentUser.username,
            rating: rating,
            comment: comment
        });
        
        closeModals();
        showSongDetails(songId);
        alert('¡Review agregada exitosamente!');
    } catch (error) {
        console.error('Error adding review:', error);
        alert('Error al agregar review');
    }
}

function openCreateThreadModal(songId) {
    const html = `
        <div class="modal active" id="modalCreateThread">
            <div class="modal-overlay" onclick="closeModals()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Crear Hilo de Discusión</h2>
                    <button class="btn-close" onclick="closeModals()">&times;</button>
                </div>
                <form class="modal-body" onsubmit="handleCreateThread(event, ${songId})">
                    <div class="form-group">
                        <label>Título</label>
                        <input type="text" id="threadTitle" placeholder="Título del hilo" required style="width: 100%; padding: 0.875rem 1rem; background: var(--bg-secondary); border: 1px solid var(--accent-border); border-radius: 8px; color: var(--white); font-family: var(--font-display);">
                    </div>
                    <div class="form-group">
                        <label>Contenido</label>
                        <textarea id="threadContent" rows="6" placeholder="Escribe tu mensaje..." required style="width: 100%; padding: 0.875rem 1rem; background: var(--bg-secondary); border: 1px solid var(--accent-border); border-radius: 8px; color: var(--white); font-family: var(--font-display); resize: vertical;"></textarea>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary btn-cancel" onclick="closeModals()">Cancelar</button>
                        <button type="submit" class="btn-primary">Crear Hilo</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', html);
}

async function handleCreateThread(event, songId) {
    event.preventDefault();
    
    try {
        const title = document.getElementById('threadTitle').value;
        const content = document.getElementById('threadContent').value;
        
        await musicDB.createThread({
            songId: songId,
            userId: state.currentUser.id,
            userName: state.currentUser.username,
            title: title,
            content: content
        });
        
        closeModals();
        showSongDetails(songId);
        alert('¡Hilo creado exitosamente!');
    } catch (error) {
        console.error('Error creating thread:', error);
        alert('Error al crear hilo');
    }
}

async function viewThread(threadId) {
    try {
        const thread = await musicDB.get('threads', threadId);
        const replies = await musicDB.getRepliesByThread(threadId);
        
        const html = `
            <div class="modal active" id="modalViewThread">
                <div class="modal-overlay" onclick="closeModals()"></div>
                <div class="modal-content large">
                    <div class="modal-header">
                        <h2>${thread.title}</h2>
                        <button class="btn-close" onclick="closeModals()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div style="padding: 1.5rem; background: var(--bg-tertiary); border-radius: 12px; margin-bottom: 2rem;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                                <strong style="color: var(--white);">${thread.userName}</strong>
                                <span style="font-size: 0.85rem; color: var(--gray-500);">${new Date(thread.date).toLocaleString()}</span>
                            </div>
                            <p style="color: var(--gray-300); line-height: 1.6;">${thread.content}</p>
                        </div>
                        
                        <h4 style="color: var(--white); margin-bottom: 1rem;">Respuestas (${replies.length})</h4>
                        
                        <div style="max-height: 400px; overflow-y: auto; margin-bottom: 2rem;">
                            ${replies.map(r => `
                                <div style="padding: 1rem; background: var(--bg-secondary); border: 1px solid var(--accent-border); border-radius: 8px; margin-bottom: 1rem;">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
                                        <strong style="color: var(--white);">${r.userName}</strong>
                                        <span style="font-size: 0.8rem; color: var(--gray-500);">${new Date(r.date).toLocaleString()}</span>
                                    </div>
                                    <p style="color: var(--gray-300);">${r.content}</p>
                                </div>
                            `).join('')}
                        </div>
                        
                        <form onsubmit="handleAddReply(event, ${threadId})">
                            <div class="form-group">
                                <label>Agregar Respuesta</label>
                                <textarea id="replyContent" rows="3" placeholder="Escribe tu respuesta..." required style="width: 100%; padding: 0.875rem 1rem; background: var(--bg-secondary); border: 1px solid var(--accent-border); border-radius: 8px; color: var(--white); font-family: var(--font-display); resize: vertical;"></textarea>
                            </div>
                            <button type="submit" class="btn-primary">Enviar Respuesta</button>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        closeModals();
        setTimeout(() => {
            document.body.insertAdjacentHTML('beforeend', html);
        }, 100);
    } catch (error) {
        console.error('Error viewing thread:', error);
    }
}

async function handleAddReply(event, threadId) {
    event.preventDefault();
    
    try {
        const content = document.getElementById('replyContent').value;
        
        await musicDB.createReply({
            threadId: threadId,
            userId: state.currentUser.id,
            userName: state.currentUser.username,
            content: content
        });
        
        viewThread(threadId);
    } catch (error) {
        console.error('Error adding reply:', error);
        alert('Error al agregar respuesta');
    }
}
