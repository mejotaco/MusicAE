// ====================================
// MusicAE - Admin Panel Script
// ====================================

const adminState = {
    currentAdmin: null,
    users: [],
    songs: [],
    reviews: [],
    analytics: {}
};

// ====================================
// INICIALIZACIÓN
// ====================================

document.addEventListener('DOMContentLoaded', () => {
    initAdminAuth();
    initParticles();
    setupAdminEventListeners();
    loadAdminData();
});

function setupAdminEventListeners() {
    // Admin login
    document.getElementById('adminLoginForm').addEventListener('submit', handleAdminLogin);
    
    // Logout
    document.getElementById('adminLogoutBtn').addEventListener('click', handleAdminLogout);
    
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => switchAdminView(btn.dataset.view));
    });
    
    // Search users
    const searchUsers = document.getElementById('searchUsers');
    if (searchUsers) {
        searchUsers.addEventListener('input', (e) => filterUsers(e.target.value));
    }
    
    // Search songs
    const searchSongs = document.getElementById('searchSongs');
    if (searchSongs) {
        searchSongs.addEventListener('input', (e) => filterAdminSongs(e.target.value));
    }
    
    // Filter genre
    const filterGenre = document.getElementById('filterGenre');
    if (filterGenre) {
        filterGenre.addEventListener('change', (e) => filterByGenre(e.target.value));
    }
    
    // Filter reviews
    const filterReviews = document.getElementById('filterReviews');
    if (filterReviews) {
        filterReviews.addEventListener('change', (e) => filterReviewsBy(e.target.value));
    }
}

// ====================================
// AUTENTICACIÓN ADMIN
// ====================================

function initAdminAuth() {
    const savedAdmin = localStorage.getItem('musicae_admin');
    if (savedAdmin) {
        adminState.currentAdmin = JSON.parse(savedAdmin);
        showAdminApp();
    }
}

function handleAdminLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('adminUser').value;
    const password = document.getElementById('adminPass').value;
    const twoFA = document.getElementById('admin2FA').value;
    
    // Simulación de login admin (en producción verificar contra backend)
    if (username === 'admin' && password === 'admin123' && twoFA === '123456') {
        const admin = {
            id: 1,
            username: 'Administrator',
            role: 'SUPER ADMIN',
            loginTime: new Date().toISOString()
        };
        
        adminState.currentAdmin = admin;
        localStorage.setItem('musicae_admin', JSON.stringify(admin));
        showAdminApp();
    } else {
        alert('Invalid credentials');
    }
}

function handleAdminLogout() {
    adminState.currentAdmin = null;
    localStorage.removeItem('musicae_admin');
    document.getElementById('adminAuthScreen').classList.add('active');
    document.getElementById('adminApp').classList.remove('active');
}

function showAdminApp() {
    document.getElementById('adminAuthScreen').classList.remove('active');
    document.getElementById('adminApp').classList.add('active');
    
    document.getElementById('adminName').textContent = adminState.currentAdmin.username;
    renderAllAdminViews();
}

// ====================================
// NAVEGACIÓN ADMIN PRUEBAa
// ====================================

function switchAdminView(view) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.content-view').forEach(v => v.classList.remove('active'));
    
    event.target.closest('.nav-btn').classList.add('active');
    document.getElementById(view + 'View').classList.add('active');
    
    renderAdminView(view);
}

function renderAdminView(view) {
    switch(view) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'users':
            renderUsersTable();
            break;
        case 'songs':
            renderSongsTable();
            break;
        case 'reviews':
            renderReviewsList();
            break;
        case 'analytics':
            renderAnalytics();
            break;
        case 'settings':
            // Settings ya está en HTML
            break;
    }
}

function renderAllAdminViews() {
    renderDashboard();
    renderUsersTable();
    renderSongsTable();
    updateAdminStats();
}

// ====================================
// CARGAR DATOS
// ====================================

function loadAdminData() {
    // Cargar usuarios mock
    const mockUsers = [
        {
            id: 1,
            username: 'MusicLover',
            email: 'music@example.com',
            songs: 4,
            reviews: 5,
            joined: '2024-01-10',
            status: 'active'
        },
        {
            id: 2,
            username: 'PopMaster',
            email: 'pop@example.com',
            songs: 1,
            reviews: 2,
            joined: '2024-01-12',
            status: 'active'
        },
        {
            id: 3,
            username: 'GrungeKid',
            email: 'grunge@example.com',
            songs: 1,
            reviews: 1,
            joined: '2024-01-14',
            status: 'active'
        },
        {
            id: 4,
            username: 'PeaceLover',
            email: 'peace@example.com',
            songs: 1,
            reviews: 0,
            joined: '2024-01-05',
            status: 'active'
        }
    ];
    
    // Cargar canciones
    const savedSongs = localStorage.getItem('musicae_songs');
    if (savedSongs) {
        adminState.songs = JSON.parse(savedSongs);
    } else {
        adminState.songs = [
            {
                id: 1,
                title: 'Bohemian Rhapsody',
                artist: 'Queen',
                genre: 'Rock',
                userId: 1,
                userName: 'MusicLover',
                downloads: 1523,
                rating: 5
            },
            {
                id: 2,
                title: 'Billie Jean',
                artist: 'Michael Jackson',
                genre: 'Pop',
                userId: 2,
                userName: 'PopMaster',
                downloads: 2145,
                rating: 5
            }
        ];
    }
    
    // Cargar reviews mock
    adminState.reviews = [
        {
            id: 1,
            songId: 1,
            songTitle: 'Bohemian Rhapsody',
            user: 'RockFan',
            rating: 5,
            comment: 'Absolute masterpiece! This song never gets old.',
            date: '2024-01-15',
            status: 'approved'
        },
        {
            id: 2,
            songId: 2,
            songTitle: 'Billie Jean',
            user: 'PopLover',
            rating: 5,
            comment: 'The King of Pop at his best!',
            date: '2024-01-16',
            status: 'pending'
        },
        {
            id: 3,
            songId: 1,
            songTitle: 'Bohemian Rhapsody',
            user: 'MusicCritic',
            rating: 4,
            comment: 'Great song but a bit overrated',
            date: '2024-01-17',
            status: 'flagged'
        }
    ];
    
    adminState.users = mockUsers;
}

// ====================================
// DASHBOARD
// ====================================

function renderDashboard() {
    updateAdminStats();
    renderActivityFeed();
}

function updateAdminStats() {
    document.getElementById('adminStatUsers').textContent = adminState.users.length;
    document.getElementById('adminStatSongs').textContent = adminState.songs.length;
    
    const totalDownloads = adminState.songs.reduce((acc, s) => acc + (s.downloads || 0), 0);
    document.getElementById('adminStatDownloads').textContent = totalDownloads;
    
    document.getElementById('adminStatReviews').textContent = adminState.reviews.length;
}

function renderActivityFeed() {
    const activities = [
        { type: 'user', text: 'New user registered: GrungeKid', time: '2 hours ago' },
        { type: 'song', text: 'New song added: "Smells Like Teen Spirit"', time: '3 hours ago' },
        { type: 'review', text: 'New review on "Bohemian Rhapsody"', time: '5 hours ago' },
        { type: 'download', text: '50+ downloads today', time: '6 hours ago' }
    ];
    
    const container = document.getElementById('adminActivityFeed');
    if (!container) return;
    
    container.innerHTML = activities.map(a => `
        <div class="activity-item">
            <div class="activity-icon">
                <svg viewBox="0 0 24 24">
                    ${a.type === 'user' ? '<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>' : ''}
                    ${a.type === 'song' ? '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>' : ''}
                    ${a.type === 'review' ? '<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>' : ''}
                    ${a.type === 'download' ? '<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>' : ''}
                </svg>
            </div>
            <div class="activity-content">
                <p>${a.text}</p>
                <span class="activity-time">${a.time}</span>
            </div>
        </div>
    `).join('');
}

// ====================================
// GESTIÓN DE USUARIOS
// ====================================

function renderUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = adminState.users.map(user => `
        <tr>
            <td>${user.id}</td>
            <td><strong style="color: var(--white);">${user.username}</strong></td>
            <td>${user.email}</td>
            <td>${user.songs}</td>
            <td>${user.reviews}</td>
            <td>${user.joined}</td>
            <td>
                <span class="status-badge ${user.status}">${user.status.toUpperCase()}</span>
            </td>
            <td>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn-icon" onclick="viewUser(${user.id})" title="View">
                        <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                    <button class="btn-icon" onclick="editUser(${user.id})" title="Edit">
                        <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="btn-icon" onclick="deleteUser(${user.id})" title="Delete">
                        <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function viewUser(id) {
    const user = adminState.users.find(u => u.id === id);
    if (user) {
        alert(`User Details:\n\nUsername: ${user.username}\nEmail: ${user.email}\nSongs: ${user.songs}\nReviews: ${user.reviews}\nJoined: ${user.joined}`);
    }
}

function editUser(id) {
    alert('Edit user functionality - would open edit modal');
}

function deleteUser(id) {
    if (confirm('Are you sure you want to delete this user?')) {
        adminState.users = adminState.users.filter(u => u.id !== id);
        renderUsersTable();
        updateAdminStats();
    }
}

function filterUsers(query) {
    const tbody = document.getElementById('usersTableBody');
    const filtered = adminState.users.filter(u => 
        u.username.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase())
    );
    
    // Re-render con filtro (simplificado)
    if (query.trim() === '') {
        renderUsersTable();
    }
}

// ====================================
// GESTIÓN DE CANCIONES
// ====================================

function renderSongsTable() {
    const tbody = document.getElementById('songsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = adminState.songs.map(song => `
        <tr>
            <td>${song.id}</td>
            <td><strong style="color: var(--white);">${song.title}</strong></td>
            <td>${song.artist}</td>
            <td>${song.genre}</td>
            <td>${song.userName}</td>
            <td>${song.downloads || 0}</td>
            <td>
                <div class="stars">
                    ${[1,2,3,4,5].map(i => `<span class="star ${i <= (song.rating || 0) ? 'filled' : ''}">★</span>`).join('')}
                </div>
            </td>
            <td>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn-icon" onclick="viewSong(${song.id})" title="View">
                        <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                    <button class="btn-icon" onclick="deleteSong(${song.id})" title="Delete">
                        <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function viewSong(id) {
    const song = adminState.songs.find(s => s.id === id);
    if (song) {
        alert(`Song Details:\n\nTitle: ${song.title}\nArtist: ${song.artist}\nGenre: ${song.genre}\nUploaded by: ${song.userName}\nDownloads: ${song.downloads || 0}`);
    }
}

function deleteSong(id) {
    if (confirm('Are you sure you want to delete this song?')) {
        adminState.songs = adminState.songs.filter(s => s.id !== id);
        localStorage.setItem('musicae_songs', JSON.stringify(adminState.songs));
        renderSongsTable();
        updateAdminStats();
    }
}

function filterAdminSongs(query) {
    // Filtrado de canciones
}

function filterByGenre(genre) {
    if (genre === 'all') {
        renderSongsTable();
    } else {
        const tbody = document.getElementById('songsTableBody');
        const filtered = adminState.songs.filter(s => s.genre === genre);
        // Re-render filtrado
    }
}

// ====================================
// GESTIÓN DE REVIEWS
// ====================================

function renderReviewsList() {
    const container = document.getElementById('adminReviewsList');
    if (!container) return;
    
    container.innerHTML = adminState.reviews.map(review => `
        <div class="activity-item" style="padding: 1.5rem; background: var(--bg-secondary); border: 1px solid var(--accent-border); border-radius: 12px; margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                <div>
                    <h4 style="color: var(--white); margin-bottom: 0.5rem;">${review.songTitle}</h4>
                    <p style="color: var(--gray-400); font-size: 0.9rem;">by ${review.user}</p>
                </div>
                <span class="status-badge ${review.status}">${review.status.toUpperCase()}</span>
            </div>
            
            <div class="stars" style="margin-bottom: 1rem;">
                ${[1,2,3,4,5].map(i => `<span class="star ${i <= review.rating ? 'filled' : ''}">★</span>`).join('')}
            </div>
            
            <p style="color: var(--gray-300); margin-bottom: 1rem;">${review.comment}</p>
            
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.85rem; color: var(--gray-500);">${review.date}</span>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn-secondary" onclick="approveReview(${review.id})" style="padding: 0.5rem 1rem; font-size: 0.85rem;">
                        Approve
                    </button>
                    <button class="btn-secondary" onclick="deleteReview(${review.id})" style="padding: 0.5rem 1rem; font-size: 0.85rem;">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function approveReview(id) {
    const review = adminState.reviews.find(r => r.id === id);
    if (review) {
        review.status = 'approved';
        renderReviewsList();
    }
}

function deleteReview(id) {
    if (confirm('Delete this review?')) {
        adminState.reviews = adminState.reviews.filter(r => r.id !== id);
        renderReviewsList();
        updateAdminStats();
    }
}

function filterReviewsBy(filter) {
    if (filter === 'all') {
        renderReviewsList();
    } else {
        const container = document.getElementById('adminReviewsList');
        const filtered = adminState.reviews.filter(r => r.status === filter);
        // Re-render filtrado
    }
}

// ====================================
// ANALYTICS
// ====================================

function renderAnalytics() {
    // Verificar si Chart.js está disponible
    if (typeof Chart === 'undefined') {
        console.log('Chart.js not loaded yet');
        return;
    }
    
    renderUserGrowthChart();
    renderGenresChart();
    renderDownloadsChart();
}

function renderUserGrowthChart() {
    const ctx = document.getElementById('userGrowthChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Users',
                data: [5, 12, 25, 38, 52, 68],
                borderColor: '#00ff88',
                backgroundColor: 'rgba(0, 255, 136, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#cccccc'
                    }
                }
            },
            scales: {
                y: {
                    ticks: { color: '#999999' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    ticks: { color: '#999999' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        }
    });
}

function renderGenresChart() {
    const ctx = document.getElementById('genresChart');
    if (!ctx) return;
    
    const genreCounts = {};
    adminState.songs.forEach(s => {
        genreCounts[s.genre] = (genreCounts[s.genre] || 0) + 1;
    });
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(genreCounts),
            datasets: [{
                data: Object.values(genreCounts),
                backgroundColor: [
                    '#00ff88',
                    '#00cc6f',
                    '#009956',
                    '#00663d',
                    '#003324'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#cccccc'
                    }
                }
            }
        }
    });
}

function renderDownloadsChart() {
    const ctx = document.getElementById('downloadsChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Downloads',
                data: [120, 190, 150, 220, 180, 250, 300],
                backgroundColor: 'rgba(0, 255, 136, 0.8)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#cccccc'
                    }
                }
            },
            scales: {
                y: {
                    ticks: { color: '#999999' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    ticks: { color: '#999999' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        }
    });
}

// ====================================
// PARTICLES ANIMATION
// ====================================

function initParticles() {
    const canvas = document.getElementById('particlesCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 60;
    
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
        ctx.fillStyle = 'rgba(0, 255, 136, 0.6)';
        
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
