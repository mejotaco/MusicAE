// ====================================
// MusicAE - IndexedDB Database
// ====================================

class MusicAEDB {
    constructor() {
        this.db = null;
        this.dbName = 'MusicAEDatabase';
        this.version = 1;
    }

    // Inicializar base de datos
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                console.error('Error opening database');
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('Database opened successfully');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Store de usuarios
                if (!db.objectStoreNames.contains('users')) {
                    const userStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
                    userStore.createIndex('username', 'username', { unique: true });
                    userStore.createIndex('email', 'email', { unique: true });
                }

                // Store de canciones
                if (!db.objectStoreNames.contains('songs')) {
                    const songStore = db.createObjectStore('songs', { keyPath: 'id', autoIncrement: true });
                    songStore.createIndex('userId', 'userId', { unique: false });
                    songStore.createIndex('genre', 'genre', { unique: false });
                    songStore.createIndex('title', 'title', { unique: false });
                }

                // Store de reviews/comentarios
                if (!db.objectStoreNames.contains('reviews')) {
                    const reviewStore = db.createObjectStore('reviews', { keyPath: 'id', autoIncrement: true });
                    reviewStore.createIndex('songId', 'songId', { unique: false });
                    reviewStore.createIndex('userId', 'userId', { unique: false });
                }

                // Store de hilos/conversaciones
                if (!db.objectStoreNames.contains('threads')) {
                    const threadStore = db.createObjectStore('threads', { keyPath: 'id', autoIncrement: true });
                    threadStore.createIndex('songId', 'songId', { unique: false });
                    threadStore.createIndex('userId', 'userId', { unique: false });
                }

                // Store de respuestas a hilos
                if (!db.objectStoreNames.contains('replies')) {
                    const replyStore = db.createObjectStore('replies', { keyPath: 'id', autoIncrement: true });
                    replyStore.createIndex('threadId', 'threadId', { unique: false });
                    replyStore.createIndex('userId', 'userId', { unique: false });
                }

                // Store de playlists
                if (!db.objectStoreNames.contains('playlists')) {
                    const playlistStore = db.createObjectStore('playlists', { keyPath: 'id', autoIncrement: true });
                    playlistStore.createIndex('userId', 'userId', { unique: false });
                }

                // Store de favoritos
                if (!db.objectStoreNames.contains('favorites')) {
                    const favStore = db.createObjectStore('favorites', { keyPath: 'id', autoIncrement: true });
                    favStore.createIndex('userId', 'userId', { unique: false });
                    favStore.createIndex('songId', 'songId', { unique: false });
                    favStore.createIndex('userSong', ['userId', 'songId'], { unique: true });
                }

                console.log('Database schema created');
            };
        });
    }

    // ====================================
    // OPERACIONES CRUD GENÉRICAS
    // ====================================

    async add(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async get(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async getAll(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async update(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async delete(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async getByIndex(storeName, indexName, value) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.getAll(value);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // ====================================
    // MÉTODOS ESPECÍFICOS - USUARIOS
    // ====================================

    async createUser(userData) {
        const user = {
            username: userData.username,
            email: userData.email,
            password: userData.password, // En producción: hashear
            joined: new Date().toISOString(),
            isAdmin: userData.isAdmin || false,
            avatar: userData.username.charAt(0).toUpperCase()
        };
        return await this.add('users', user);
    }

    async getUserByUsername(username) {
        const users = await this.getByIndex('users', 'username', username);
        return users[0] || null;
    }

    async getUserByEmail(email) {
        const users = await this.getByIndex('users', 'email', email);
        return users[0] || null;
    }

    async getAllUsers() {
        return await this.getAll('users');
    }

    // ====================================
    // MÉTODOS ESPECÍFICOS - CANCIONES
    // ====================================

    async createSong(songData) {
        const song = {
            title: songData.title,
            artist: songData.artist,
            album: songData.album || 'Unknown',
            genre: songData.genre,
            youtubeUrl: songData.youtubeUrl,
            youtubeId: this.extractYouTubeId(songData.youtubeUrl),
            userId: songData.userId,
            userName: songData.userName,
            downloads: 0,
            plays: 0,
            addedDate: new Date().toISOString(),
            thumbnail: `https://img.youtube.com/vi/${this.extractYouTubeId(songData.youtubeUrl)}/mqdefault.jpg`
        };
        return await this.add('songs', song);
    }

    async getSongsByUser(userId) {
        return await this.getByIndex('songs', 'userId', userId);
    }

    async getSongsByGenre(genre) {
        return await this.getByIndex('songs', 'genre', genre);
    }

    async getAllSongs() {
        return await this.getAll('songs');
    }

    async incrementPlays(songId) {
        const song = await this.get('songs', songId);
        if (song) {
            song.plays = (song.plays || 0) + 1;
            await this.update('songs', song);
        }
    }

    async incrementDownloads(songId) {
        const song = await this.get('songs', songId);
        if (song) {
            song.downloads = (song.downloads || 0) + 1;
            await this.update('songs', song);
        }
    }

    // ====================================
    // MÉTODOS ESPECÍFICOS - REVIEWS
    // ====================================

    async createReview(reviewData) {
        const review = {
            songId: reviewData.songId,
            userId: reviewData.userId,
            userName: reviewData.userName,
            rating: reviewData.rating,
            comment: reviewData.comment,
            date: new Date().toISOString(),
            likes: 0,
            status: 'approved' // pending, approved, rejected
        };
        return await this.add('reviews', review);
    }

    async getReviewsBySong(songId) {
        return await this.getByIndex('reviews', 'songId', songId);
    }

    async getReviewsByUser(userId) {
        return await this.getByIndex('reviews', 'userId', userId);
    }

    async getAllReviews() {
        return await this.getAll('reviews');
    }

    async getAverageSongRating(songId) {
        const reviews = await this.getReviewsBySong(songId);
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        return sum / reviews.length;
    }

    // ====================================
    // MÉTODOS ESPECÍFICOS - HILOS
    // ====================================

    async createThread(threadData) {
        const thread = {
            songId: threadData.songId,
            userId: threadData.userId,
            userName: threadData.userName,
            title: threadData.title,
            content: threadData.content,
            date: new Date().toISOString(),
            likes: 0,
            replyCount: 0
        };
        return await this.add('threads', thread);
    }

    async getThreadsBySong(songId) {
        return await this.getByIndex('threads', 'songId', songId);
    }

    async getAllThreads() {
        return await this.getAll('threads');
    }

    // ====================================
    // MÉTODOS ESPECÍFICOS - RESPUESTAS
    // ====================================

    async createReply(replyData) {
        const reply = {
            threadId: replyData.threadId,
            userId: replyData.userId,
            userName: replyData.userName,
            content: replyData.content,
            date: new Date().toISOString(),
            likes: 0
        };
        
        const replyId = await this.add('replies', reply);
        
        // Incrementar contador de respuestas en el hilo
        const thread = await this.get('threads', replyData.threadId);
        if (thread) {
            thread.replyCount = (thread.replyCount || 0) + 1;
            await this.update('threads', thread);
        }
        
        return replyId;
    }

    async getRepliesByThread(threadId) {
        return await this.getByIndex('replies', 'threadId', threadId);
    }

    // ====================================
    // MÉTODOS ESPECÍFICOS - FAVORITOS
    // ====================================

    async toggleFavorite(userId, songId) {
        try {
            // Buscar si ya existe el favorito
            const transaction = this.db.transaction(['favorites'], 'readwrite');
            const store = transaction.objectStore('favorites');
            const index = store.index('userSong');
            const request = index.get([userId, songId]);

            return new Promise((resolve, reject) => {
                request.onsuccess = async () => {
                    if (request.result) {
                        // Ya existe, eliminarlo
                        await this.delete('favorites', request.result.id);
                        resolve(false); // No es favorito
                    } else {
                        // No existe, agregarlo
                        await this.add('favorites', {
                            userId: userId,
                            songId: songId,
                            date: new Date().toISOString()
                        });
                        resolve(true); // Es favorito
                    }
                };

                request.onerror = () => {
                    reject(request.error);
                };
            });
        } catch (error) {
            console.error('Error toggling favorite:', error);
            return false;
        }
    }

    async isFavorite(userId, songId) {
        try {
            const transaction = this.db.transaction(['favorites'], 'readonly');
            const store = transaction.objectStore('favorites');
            const index = store.index('userSong');
            const request = index.get([userId, songId]);

            return new Promise((resolve) => {
                request.onsuccess = () => {
                    resolve(!!request.result);
                };
                request.onerror = () => {
                    resolve(false);
                };
            });
        } catch (error) {
            return false;
        }
    }

    async getFavoritesByUser(userId) {
        return await this.getByIndex('favorites', 'userId', userId);
    }

    // ====================================
    // MÉTODOS ESPECÍFICOS - PLAYLISTS
    // ====================================

    async createPlaylist(playlistData) {
        const playlist = {
            userId: playlistData.userId,
            name: playlistData.name,
            description: playlistData.description || '',
            songs: playlistData.songs || [],
            isPublic: playlistData.isPublic || false,
            created: new Date().toISOString()
        };
        return await this.add('playlists', playlist);
    }

    async getPlaylistsByUser(userId) {
        return await this.getByIndex('playlists', 'userId', userId);
    }

    async addSongToPlaylist(playlistId, songId) {
        const playlist = await this.get('playlists', playlistId);
        if (playlist) {
            if (!playlist.songs.includes(songId)) {
                playlist.songs.push(songId);
                await this.update('playlists', playlist);
            }
        }
    }

    async removeSongFromPlaylist(playlistId, songId) {
        const playlist = await this.get('playlists', playlistId);
        if (playlist) {
            playlist.songs = playlist.songs.filter(id => id !== songId);
            await this.update('playlists', playlist);
        }
    }

    // ====================================
    // UTILIDADES
    // ====================================

    extractYouTubeId(url) {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : null;
    }

    async seedData() {
        // Verificar si ya hay datos
        const songs = await this.getAllSongs();
        if (songs.length > 0) {
            console.log('Database already has data');
            return;
        }

        console.log('Seeding database with initial data...');

        // Crear usuarios de ejemplo
        const user1 = await this.createUser({
            username: 'MusicLover',
            email: 'music@example.com',
            password: 'demo123'
        });

        const user2 = await this.createUser({
            username: 'RockFan',
            email: 'rock@example.com',
            password: 'demo123'
        });

        const user3 = await this.createUser({
            username: 'mejo',
            email: 'mdej0013@gmail.com',
            password: '1234'
        });


        // Crear canciones de ejemplo
        const songs_data = [
            {
                title: 'Bohemian Rhapsody',
                artist: 'Queen',
                album: 'A Night at the Opera',
                genre: 'Rock',
                youtubeUrl: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
                userId: user1,
                userName: 'MusicLover'
            },
            {
                title: 'Stairway to Heaven',
                artist: 'Led Zeppelin',
                album: 'Led Zeppelin IV',
                genre: 'Rock',
                youtubeUrl: 'https://www.youtube.com/watch?v=QkF3oxziUI4',
                userId: user1,
                userName: 'MusicLover'
            },
            {
                title: 'Hotel California',
                artist: 'Eagles',
                album: 'Hotel California',
                genre: 'Rock',
                youtubeUrl: 'https://www.youtube.com/watch?v=09839DpTctU',
                userId: user1,
                userName: 'MusicLover'
            },
            {
                title: 'Smells Like Teen Spirit',
                artist: 'Nirvana',
                album: 'Nevermind',
                genre: 'Rock',
                youtubeUrl: 'https://www.youtube.com/watch?v=hTWKbfoikeg',
                userId: user2,
                userName: 'RockFan'
            },
            {
                title: 'Imagine',
                artist: 'John Lennon',
                album: 'Imagine',
                genre: 'Rock',
                youtubeUrl: 'https://www.youtube.com/watch?v=YkgkThdzX-8',
                userId: user2,
                userName: 'RockFan'
            },
            {
                title: 'Billie Jean',
                artist: 'Michael Jackson',
                album: 'Thriller',
                genre: 'Pop',
                youtubeUrl: 'https://www.youtube.com/watch?v=Zi_XLOBDo_Y',
                userId: user1,
                userName: 'MusicLover'
            },
            {
                title: 'Heroes tonight',
                artist: 'Janji feat. Johnning',
                album: 'Heroes tonight',
                genre: 'Electronic',
                youtubeUrl: 'https://www.youtube.com/watch?v=3nQNiWdeH2Q',
                userId: user3,
                userName: 'RockFan'




            }
        ];

        for (const songData of songs_data) {
            const songId = await this.createSong(songData);
            
            // Agregar algunas reviews
            if (Math.random() > 0.5) {
                await this.createReview({
                    songId: songId,
                    userId: user2,
                    userName: 'RockFan',
                    rating: 5,
                    comment: '¡Excelente canción! Un clásico que nunca pasa de moda.'
                });
            }
        }

        console.log('Database seeded successfully!');
    }

    async clearAll() {
        const stores = ['users', 'songs', 'reviews', 'threads', 'replies', 'favorites', 'playlists'];
        for (const storeName of stores) {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            await store.clear();
        }
        console.log('All data cleared');
    }
}

// Exportar instancia global
const musicDB = new MusicAEDB();
