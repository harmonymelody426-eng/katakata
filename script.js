(function() {
    // ================================================
    // API KEY PIXABAY
    // ================================================
    const PIXABAY_API_KEY = '56708277-1122a65ab11fe5066b2a03f65';

    // ================================================
    // SUPABASE CONFIG
    // ================================================
    const SUPABASE_URL = 'https://deicxytgwshptijgkouv.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlaWN4eXRnd3NocHRpamdrb3V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyMTI5NTEsImV4cCI6MjA5OTc4ODk1MX0.oibKnMAnhnA7EJwu7OTVMASRfSC3n85EJp7LugJzRaU';

    // ================================================
    // DATA LEVEL & KATA
    // ================================================
    const LEVELS = [
        { words: ['babi', 'bola', 'kuda', 'loli', 'mama'], emoji: ['🐷', '⚽', '🐴', '🍭', '👩'] },
        { words: ['kotak', 'pensil', 'sandal', 'topi', 'buku'], emoji: ['📦', '✏️', '👡', '🧢', '📘'] },
        { words: ['kereta', 'pisang', 'sekolah', 'mobil', 'kamera'], emoji: ['🚂', '🍌', '🏫', '🚗', '📷'] },
        { words: ['telepon', 'sepeda', 'komputer', 'penggaris', 'bendera'], emoji: ['📞', '🚲', '💻', '📏', '🚩'] }
    ];

    const WORD_QUERY_MAP = {
        'babi': 'pig animal farm',
        'bola': 'ball sport football',
        'kuda': 'horse animal farm',
        'loli': 'lollipop candy sweet',
        'mama': 'mother woman parent',
        'kotak': 'box cardboard cube',
        'pensil': 'pencil writing tool',
        'sandal': 'sandals footwear shoes',
        'topi': 'hat cap headwear',
        'buku': 'book reading library',
        'kereta': 'train locomotive railway',
        'pisang': 'banana fruit yellow',
        'sekolah': 'school building education',
        'mobil': 'car vehicle automobile',
        'kamera': 'camera photography device',
        'telepon': 'telephone phone device',
        'sepeda': 'bicycle bike cycling',
        'komputer': 'computer laptop device',
        'penggaris': 'ruler measurement school',
        'bendera': 'flag national symbol'
    };

    const imageCache = {};

    function fetchPixabayImage(word, emoji) {
        return new Promise((resolve, reject) => {
            if (imageCache[word]) {
                resolve(imageCache[word]);
                return;
            }
            const query = WORD_QUERY_MAP[word] || word;
            const url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&lang=en&per_page=10&safesearch=true&orientation=horizontal&min_width=400&min_height=300`;
            console.log(`🔍 Mencari: "${query}" untuk kata "${word}"`);
            fetch(url)
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.json();
                })
                .then(data => {
                    if (data.hits && data.hits.length > 0) {
                        const imageUrl = data.hits[0].webformatURL;
                        imageCache[word] = imageUrl;
                        console.log(`✅ Gambar ditemukan untuk "${word}"`);
                        resolve(imageUrl);
                    } else {
                        console.log(`⚠️ Tidak ada hasil untuk "${query}", coba kata dasar "${word}"`);
                        const fallbackUrl = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(word)}&image_type=photo&lang=en&per_page=10&safesearch=true&orientation=horizontal`;
                        return fetch(fallbackUrl)
                            .then(res => res.json())
                            .then(fallbackData => {
                                if (fallbackData.hits && fallbackData.hits.length > 0) {
                                    const imgUrl = fallbackData.hits[0].webformatURL;
                                    imageCache[word] = imgUrl;
                                    console.log(`✅ Gambar fallback ditemukan untuk "${word}"`);
                                    resolve(imgUrl);
                                } else {
                                    console.log(`⚠️ Tidak ada hasil, coba bahasa Indonesia`);
                                    const lastResortUrl = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(word)}&image_type=photo&lang=id&per_page=5&safesearch=true`;
                                    return fetch(lastResortUrl)
                                        .then(res => res.json())
                                        .then(lastData => {
                                            if (lastData.hits && lastData.hits.length > 0) {
                                                const imgUrl = lastData.hits[0].webformatURL;
                                                imageCache[word] = imgUrl;
                                                console.log(`✅ Gambar last-resort ditemukan untuk "${word}"`);
                                                resolve(imgUrl);
                                            } else {
                                                console.log(`❌ Gagal total untuk "${word}"`);
                                                reject(new Error('No image found'));
                                            }
                                        });
                                }
                            });
                    }
                })
                .catch(error => {
                    console.warn('Gagal ambil gambar dari Pixabay:', error);
                    reject(error);
                });
        });
    }

    // ================================================
    // MUSIK
    // ================================================
    const bgMusic = document.getElementById('bgMusic');
    const musicControl = document.getElementById('musicControl');
    let musicPlaying = false;

    if (bgMusic) {
        bgMusic.volume = 0.3;
        bgMusic.loop = true;

        function playMusic() {
            return bgMusic.play().then(() => {
                musicPlaying = true;
                if (musicControl) musicControl.textContent = '🔊';
                console.log('✅ Musik berhasil diputar');
            }).catch(err => {
                console.warn('❌ Gagal memutar musik:', err.message);
                if (err.name === 'NotSupportedError' || err.message.includes('404') || err.message.includes('Failed to load')) {
                    console.warn('🔄 Coba reload audio source...');
                    bgMusic.load();
                    return bgMusic.play().then(() => {
                        musicPlaying = true;
                        if (musicControl) musicControl.textContent = '🔊';
                        console.log('✅ Musik berhasil diputar setelah reload');
                    }).catch(e => {
                        console.warn('❌ Gagal juga setelah reload:', e.message);
                        throw e;
                    });
                }
                throw err;
            });
        }

        playMusic().catch(() => {
            musicPlaying = false;
            if (musicControl) musicControl.textContent = '🔇';
            console.log('🔇 Autoplay diblokir, tunggu klik user');
        });

        if (musicControl) {
            musicControl.addEventListener('click', function(e) {
                e.stopPropagation();
                if (bgMusic.paused) {
                    playMusic().catch(() => {});
                } else {
                    bgMusic.pause();
                    musicControl.textContent = '🔇';
                    musicPlaying = false;
                    console.log('⏸️ Musik di-pause');
                }
            });
        }

        let musicStarted = false;
        document.addEventListener('click', function startMusicOnClick() {
            if (!musicStarted && bgMusic.paused) {
                musicStarted = true;
                playMusic().catch(() => {
                    musicStarted = false;
                });
                document.removeEventListener('click', startMusicOnClick);
            }
        });

        document.addEventListener('click', function retryMusic() {
            if (bgMusic.paused && !musicPlaying) {
                playMusic().catch(() => {});
            }
        }, { once: true });

    } else {
        console.warn('⚠️ Elemen audio #bgMusic tidak ditemukan!');
    }

    // ================================================
    // LEADERBOARD DENGAN SUPABASE
    // ================================================
    const RANKING_KEY = 'belajarBacaRanking';
    let currentPlayerName = '';
    let currentPlayerScore = 0;
    let gameStarted = false;

    const startOverlay = document.getElementById('startOverlay');
    const playerNameInput = document.getElementById('playerNameInput');
    const startGameBtn = document.getElementById('startGameBtn');
    const playerNameDisplay = document.getElementById('playerNameText');
    const gameContainer = document.getElementById('app');

    const leaderboardModal = document.getElementById('leaderboardModal');
    const showLeaderboardBtn = document.getElementById('showLeaderboardBtn');
    const closeLeaderboardBtn = document.getElementById('closeLeaderboardBtn');
    const inGameLeaderboardBtn = document.getElementById('inGameLeaderboardBtn');
    const leaderboardList = document.getElementById('leaderboardList');
    const deleteRankingBtn = document.getElementById('deleteRankingBtn');
    const exportLeaderboardBtn = document.getElementById('exportLeaderboardBtn');
    const exportModalBtn = document.getElementById('exportModalBtn');
    const deleteDataBtn = document.getElementById('deleteDataBtn');

    async function getRanking() {
        try {
            const url = `${SUPABASE_URL}/rest/v1/leaderboard?select=*&order=score.desc&limit=100`;
            const response = await fetch(url, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch ranking');
            const data = await response.json();
            return data || [];
        } catch (error) {
            console.warn('⚠️ Gagal ambil data dari Supabase, pakai localStorage:', error);
            try {
                const local = localStorage.getItem(RANKING_KEY);
                return local ? JSON.parse(local) : [];
            } catch {
                return [];
            }
        }
    }

    async function saveRankingToSupabase(ranking) {
        try {
            for (const item of ranking) {
                const deleteUrl = `${SUPABASE_URL}/rest/v1/leaderboard?name=eq.${encodeURIComponent(item.name)}`;
                await fetch(deleteUrl, {
                    method: 'DELETE',
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                    }
                });
                const insertUrl = `${SUPABASE_URL}/rest/v1/leaderboard`;
                const response = await fetch(insertUrl, {
                    method: 'POST',
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({
                        name: item.name,
                        score: item.score,
                        level: item.level,
                        created_at: item.created_at || new Date().toISOString()
                    })
                });
                if (!response.ok) {
                    console.warn(`⚠️ Gagal insert data untuk ${item.name}:`, response.status);
                }
            }
            console.log('✅ Data leaderboard berhasil disimpan ke Supabase');
        } catch (error) {
            console.warn('⚠️ Gagal simpan ke Supabase, simpan ke localStorage:', error);
            localStorage.setItem(RANKING_KEY, JSON.stringify(ranking));
        }
    }

    async function updateRanking(name, score, level) {
        let ranking = await getRanking();
        const existing = ranking.find(item => item.name.toLowerCase() === name.toLowerCase());
        if (existing) {
            if (score > existing.score) {
                existing.score = score;
                existing.level = level;
                existing.created_at = new Date().toISOString();
                console.log(`🔄 Update skor ${name}: ${score}`);
            } else {
                console.log(`⏩ Skor ${name} tidak berubah (${score} <= ${existing.score})`);
            }
        } else {
            ranking.push({ name, score, level, created_at: new Date().toISOString() });
            console.log(`➕ Tambah pemain baru: ${name} (${score})`);
        }
        ranking.sort((a, b) => b.score - a.score);
        await saveRankingToSupabase(ranking);
        localStorage.setItem(RANKING_KEY, JSON.stringify(ranking));
        return ranking;
    }

    async function renderLeaderboard() {
        const ranking = await getRanking();
        if (ranking.length === 0) {
            leaderboardList.innerHTML = `<p style="color:rgba(255,255,255,0.6); text-align:center;">Belum ada data. Mulai bermain dulu!</p>`;
            return;
        }
        let html = '';
        ranking.forEach((item, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index+1}`;
            html += `
                <div class="leaderboard-item">
                    <span class="rank">${medal}</span>
                    <span class="name">${item.name}</span>
                    <span class="score">${item.score}</span>
                    <span class="level">Level ${item.level}</span>
                </div>
            `;
        });
        leaderboardList.innerHTML = html;
    }

    async function exportLeaderboardToXLS() {
        const password = prompt('Masukkan password untuk ekspor data:');
        if (password !== 'katakatasule') {
            if (password !== null) alert('❌ Password salah! Ekspor dibatalkan.');
            return;
        }
        const ranking = await getRanking();
        if (ranking.length === 0) {
            alert('Belum ada data untuk diekspor.');
            return;
        }
        let content = "Peringkat\tNama\tSkor\tLevel\n";
        ranking.forEach((item, index) => {
            content += `${index+1}\t${item.name}\t${item.score}\t${item.level}\n`;
        });
        const blob = new Blob(["\uFEFF" + content], { type: 'application/vnd.ms-excel;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leaderboard_${new Date().toISOString().slice(0,10)}.xls`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert('✅ Data berhasil diekspor!');
    }

    async function openLeaderboard() {
        await renderLeaderboard();
        leaderboardModal.classList.add('active');
    }

    function closeLeaderboard() {
        leaderboardModal.classList.remove('active');
    }

    showLeaderboardBtn.addEventListener('click', openLeaderboard);
    closeLeaderboardBtn.addEventListener('click', closeLeaderboard);
    inGameLeaderboardBtn.addEventListener('click', openLeaderboard);
    leaderboardModal.addEventListener('click', function(e) {
        if (e.target === this) closeLeaderboard();
    });

    async function deleteAllData() {
        const password = prompt('Masukkan password untuk menghapus semua data peringkat:');
        if (password !== 'katakatasule') {
            if (password !== null) alert('❌ Password salah! Data tidak dihapus.');
            return;
        }
        if (!confirm('Yakin ingin menghapus semua data peringkat?')) return;
        try {
            const deleteUrl = `${SUPABASE_URL}/rest/v1/leaderboard?name=neq.null`;
            await fetch(deleteUrl, {
                method: 'DELETE',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                }
            });
            console.log('✅ Data di Supabase dihapus');
        } catch (e) {
            console.warn('⚠️ Gagal hapus dari Supabase:', e);
        }
        localStorage.removeItem(RANKING_KEY);
        await renderLeaderboard();
        alert('✅ Semua data peringkat telah dihapus!');
    }

    deleteDataBtn.addEventListener('click', deleteAllData);
    deleteRankingBtn.addEventListener('click', deleteAllData);
    exportLeaderboardBtn.addEventListener('click', exportLeaderboardToXLS);
    exportModalBtn.addEventListener('click', exportLeaderboardToXLS);

    // ================================================
    // START GAME
    // ================================================
    function startGame() {
        const name = playerNameInput.value.trim();
        if (!name) {
            alert('Masukkan namamu dulu ya!');
            playerNameInput.focus();
            return;
        }
        currentPlayerName = name;
        playerNameDisplay.textContent = name;
        startOverlay.style.display = 'none';
        gameContainer.style.display = 'flex';
        gameStarted = true;
        initGameAfterStart();
    }

    startGameBtn.addEventListener('click', startGame);
    playerNameInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') startGame();
    });

    // ================================================
    // VARIABEL GAME
    // ================================================
    let currentLevel = 0, currentWordIndex = 0, score = 0;
    let currentWord = '', currentEmoji = '🐷';
    let shuffledLetters = [];
    let selectedIndices = [];
    let answerSlots = [];
    const maxLevel = LEVELS.length;
    let isProcessing = false;
    let animationFrameId = null;
    let floatingTiles = [];
    let currentTimeout = null;

    const objectImage = document.getElementById('objectImage');
    const levelDisplay = document.getElementById('levelDisplay');
    const scoreDisplay = document.getElementById('scoreDisplay');
    const letterGrid = document.getElementById('letterGrid');
    const answerZone = document.getElementById('answerZone');
    const messageBox = document.getElementById('messageBox');
    const resetBtn = document.getElementById('resetBtn');
    const confettiContainer = document.getElementById('confetti-container');
    const bgVideo = document.getElementById('bgVideo');

    // ================================================
    // DRAG BACKGROUND VIDEO (AMAN UNTUK HP)
    // ================================================
    if (bgVideo) {
        let isDragging = false;
        let startX = 0, startY = 0;
        let currentX = 0, currentY = 0;
        let translateX = 0, translateY = 0;

        bgVideo.addEventListener('loadedmetadata', function() {
            if (bgVideo.style) {
                bgVideo.style.transform = `translate(${translateX}px, ${translateY}px)`;
                bgVideo.style.willChange = 'transform';
            }
        });

        bgVideo.addEventListener('touchstart', function(e) {
            if (e.touches.length === 1 && bgVideo.readyState >= 2) {
                isDragging = true;
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                currentX = translateX;
                currentY = translateY;
                if (bgVideo.style) {
                    bgVideo.style.transition = 'none';
                }
            }
        }, { passive: true });

        bgVideo.addEventListener('touchmove', function(e) {
            if (!isDragging) return;
            e.preventDefault();
            const dx = e.touches[0].clientX - startX;
            const dy = e.touches[0].clientY - startY;
            translateX = currentX + dx;
            translateY = currentY + dy;
            const maxOffset = 150;
            translateX = Math.max(-maxOffset, Math.min(maxOffset, translateX));
            translateY = Math.max(-maxOffset, Math.min(maxOffset, translateY));
            if (bgVideo.style) {
                bgVideo.style.transform = `translate(${translateX}px, ${translateY}px)`;
            }
        }, { passive: false });

        bgVideo.addEventListener('touchend', function() {
            if (isDragging) {
                isDragging = false;
                if (bgVideo.style) {
                    bgVideo.style.transition = 'transform 0.3s ease';
                }
            }
        }, { passive: true });

        window.addEventListener('resize', function() {
            translateX = 0;
            translateY = 0;
            if (bgVideo.style) {
                bgVideo.style.transform = `translate(0px, 0px)`;
                bgVideo.style.transition = 'transform 0.5s ease';
            }
        });
    }

    // ================================================
    // FUNGSI VIDEO (DENGAN DETEKSI HP)
    // ================================================
    function isMobileDevice() {
        return window.innerWidth < 768;
    }

    function getVideoFile(baseName) {
        const mobile = isMobileDevice();
        const hpVersion = `${baseName}-hp.mp4`;
        const desktopVersion = `${baseName}.mp4`;
        return mobile ? hpVersion : desktopVersion;
    }

    function playVideo(baseName, duration = 4000) {
        if (!bgVideo) {
            console.warn('⚠️ Elemen video tidak ditemukan!');
            return;
        }

        if (currentTimeout) {
            clearTimeout(currentTimeout);
            currentTimeout = null;
        }

        const videoFile = getVideoFile(baseName);
        const isMobile = isMobileDevice();
        console.log(`📱 ${isMobile ? 'HP' : 'Desktop'} → 🎬 Memutar: ${videoFile}`);

        bgVideo.loop = false;
        bgVideo.pause();
        bgVideo.src = videoFile;
        bgVideo.load();
        bgVideo.muted = false;
        bgVideo.volume = 0.8;

        bgVideo.play()
            .then(() => {
                console.log(`✅ Video ${videoFile} berhasil diputar`);
            })
            .catch(e => {
                console.warn(`❌ Gagal memutar ${videoFile}:`, e.message);
                if (videoFile.includes('-hp.mp4')) {
                    const fallbackFile = `${baseName}.mp4`;
                    console.warn(`🔄 Fallback ke ${fallbackFile}`);
                    bgVideo.src = fallbackFile;
                    bgVideo.load();
                    bgVideo.play().catch(err => {
                        console.warn(`❌ Fallback gagal:`, err.message);
                    });
                }
            });

        currentTimeout = setTimeout(() => {
            console.log(`⏹️ Transisi selesai, kembali ke idle`);
            bgVideo.pause();
            const idleFile = getVideoFile('backdroputama');
            console.log(`📱 Kembali ke idle: ${idleFile}`);
            bgVideo.src = idleFile;
            bgVideo.load();
            bgVideo.loop = true;
            bgVideo.muted = true;
            bgVideo.volume = 0.5;
            bgVideo.play().catch(() => {});
            currentTimeout = null;
        }, duration);
    }

    function stopVideo() {
        if (currentTimeout) {
            clearTimeout(currentTimeout);
            currentTimeout = null;
        }
        if (!bgVideo) return;

        const idleFile = getVideoFile('backdroputama');
        console.log(`⏹️ Stop video, kembali ke idle: ${idleFile}`);
        bgVideo.pause();
        bgVideo.src = idleFile;
        bgVideo.load();
        bgVideo.loop = true;
        bgVideo.muted = true;
        bgVideo.volume = 0.5;
        bgVideo.play().catch(() => {});
    }

    function initBackgroundVideo() {
        if (!bgVideo) return;
        const idleFile = getVideoFile('backdroputama');
        const isMobile = isMobileDevice();
        console.log(`📱 ${isMobile ? 'HP' : 'Desktop'} → 🎬 Load backdrop: ${idleFile}`);
        
        bgVideo.src = idleFile;
        bgVideo.load();
        bgVideo.loop = true;
        bgVideo.muted = true;
        bgVideo.volume = 0.5;
        bgVideo.play().catch(e => {
            console.warn('❌ Video play error:', e);
            if (idleFile.includes('-hp.mp4')) {
                console.warn('🔄 Fallback ke backdroputama.mp4');
                bgVideo.src = 'backdroputama.mp4';
                bgVideo.load();
                bgVideo.play().catch(() => {});
            }
        });
    }

    // ================================================
    // LEVEL UP (TANPA CSS KEYFRAMES - PAKAI JS ANIMASI)
    // ================================================
    function showLevelUp(level) {
        // Cegah multiple call
        if (window._levelUpActive) return;
        window._levelUpActive = true;

        try {
            const isMobile = window.innerWidth < 768;
            
            // Buat overlay
            const overlay = document.createElement('div');
            overlay.id = 'levelUpOverlay';
            
            // Style overlay - tanpa animasi CSS
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 9999;
                background: rgba(0,0,0,0.3);
                display: flex;
                align-items: flex-start;
                justify-content: center;
                padding-top: ${isMobile ? '10vh' : '15vh'};
                opacity: 0;
                transition: opacity 0.3s ease;
            `;

            // Ukuran responsif
            const titleSize = isMobile ? '2.2rem' : '3.8rem';
            const subtitleSize = isMobile ? '1.2rem' : '2rem';
            const paddingBox = isMobile ? '18px 28px' : '35px 60px';
            const borderRadius = isMobile ? '50px 16px 50px 16px' : '120px 40px 120px 40px';

            // Box level up - tanpa animasi CSS
            overlay.innerHTML = `
                <div id="levelUpBox" style="
                    background: linear-gradient(145deg, #ffe485, #f5b64b);
                    padding: ${paddingBox};
                    border-radius: ${borderRadius};
                    box-shadow: 0 20px 40px rgba(0,0,0,0.5), 0 0 0 4px #fff3c0, 0 0 0 8px rgba(180,124,78,0.6);
                    text-align: center;
                    border: 3px solid #faeac9;
                    font-family: 'Luckiest Guy', 'Comic Sans MS', cursive;
                    transform: scale(0.3) rotate(-5deg);
                    opacity: 0;
                    transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                ">
                    <h1 style="
                        font-size: ${titleSize}; 
                        color: #2d1f0c; 
                        text-shadow: 0 3px 0 #b87d3a; 
                        letter-spacing: 2px; 
                        font-weight: 400; 
                        margin: 0;
                        line-height: 1.2;
                    ">🎉 LEVEL ${level} 🎉</h1>
                    <p style="
                        font-size: ${subtitleSize}; 
                        color: #3d2b12; 
                        font-weight: 400; 
                        margin-top: 4px; 
                        font-family: 'Segoe UI', 'Comic Sans MS', cursive;
                    ">✨ Kamu Hebat! ✨</p>
                </div>
            `;

            document.body.appendChild(overlay);

            // Animasi masuk (fade in + bounce) pakai JS
            requestAnimationFrame(() => {
                overlay.style.opacity = '1';
                const box = document.getElementById('levelUpBox');
                if (box) {
                    box.style.transform = 'scale(1) rotate(0deg)';
                    box.style.opacity = '1';
                }
            });

            // Confetti (dengan delay)
            setTimeout(() => {
                fireConfetti(40);
            }, 200);

            // Hapus setelah 2.5 detik
            setTimeout(function() {
                try {
                    // Animasi keluar
                    const box = document.getElementById('levelUpBox');
                    if (box) {
                        box.style.transform = 'scale(0.5) rotate(5deg)';
                        box.style.opacity = '0';
                    }
                    overlay.style.opacity = '0';
                    
                    setTimeout(() => {
                        if (overlay && overlay.parentNode) {
                            overlay.parentNode.removeChild(overlay);
                        }
                        window._levelUpActive = false;
                    }, 400);
                } catch(e) {
                    if (overlay && overlay.parentNode) {
                        overlay.parentNode.removeChild(overlay);
                    }
                    window._levelUpActive = false;
                }
            }, 2500);

        } catch(e) {
            console.warn('showLevelUp error:', e);
            window._levelUpActive = false;
        }
    }

    // ================================================
    // SPARKLE & CONFETTI
    // ================================================
    function createSparkles(x, y, count = 8) {
        const emojis = ['✨', '⭐', '🌟', '💫'];
        for (let i = 0; i < count; i++) {
            const el = document.createElement('div');
            el.className = 'sparkle';
            el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            el.style.left = (x + (Math.random() - 0.5) * 20) + 'px';
            el.style.top = (y + (Math.random() - 0.5) * 20) + 'px';
            el.style.setProperty('--tx', (Math.random() - 0.5) * 120 + 'px');
            el.style.setProperty('--ty', (Math.random() - 0.5) * 120 - 60 + 'px');
            el.style.fontSize = (0.8 + Math.random() * 0.8) + 'rem';
            el.style.animationDuration = (0.5 + Math.random() * 0.4) + 's';
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 1000);
        }
    }

    function fireConfetti(count = 30) {
        const colors = ['#f44336','#e91e63','#9c27b0','#3f51b5','#2196f3','#009688','#4caf50','#ffeb3b','#ff9800','#ff5722','#ffffff','#fdd835'];
        for (let i=0; i<count; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            const size = 6 + Math.random() * 10;
            piece.style.width = size + 'px';
            piece.style.height = size * (0.4 + Math.random() * 0.6) + 'px';
            piece.style.background = colors[Math.floor(Math.random() * colors.length)];
            piece.style.left = Math.random() * 100 + '%';
            piece.style.top = '-10%';
            piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
            piece.style.animationDuration = (2 + Math.random() * 3) + 's';
            piece.style.animationDelay = (Math.random() * 1.2) + 's';
            piece.style.transform = `rotate(${Math.random() * 360}deg)`;
            confettiContainer.appendChild(piece);
            setTimeout(() => piece.remove(), 5000);
        }
    }

    // ================================================
    // UPDATE GAMBAR
    // ================================================
    function updateObjectImage(word, emoji) {
        objectImage.innerHTML = `<span class="loading-placeholder">🔍 Mencari gambar...</span>`;
        fetchPixabayImage(word, emoji)
            .then(imageUrl => {
                objectImage.innerHTML = '';
                const img = document.createElement('img');
                img.src = imageUrl;
                img.alt = word;
                img.loading = 'lazy';
                img.onerror = function() {
                    this.style.display = 'none';
                    const span = document.createElement('span');
                    span.className = 'emoji-placeholder';
                    span.textContent = emoji;
                    objectImage.appendChild(span);
                };
                objectImage.appendChild(img);
            })
            .catch(() => {
                objectImage.innerHTML = '';
                const span = document.createElement('span');
                span.className = 'emoji-placeholder';
                span.textContent = emoji;
                objectImage.appendChild(span);
            });
    }

    // ================================================
    // FUNGSI GAME
    // ================================================
    function shuffleArray(arr) {
        for (let i=arr.length-1; i>0; i--) {
            const j = Math.floor(Math.random() * (i+1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function startFloating() {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        const tiles = document.querySelectorAll('.letter-tile');
        floatingTiles = [];
        tiles.forEach((tile, i) => {
            const delay = Math.random() * 3;
            const duration = 2.8 + Math.random() * 1.8;
            const offsetY = 6 + Math.random() * 8;
            const rotMin = -3 + Math.random() * 2;
            const rotMax = 3 + Math.random() * 2;
            floatingTiles.push({
                el: tile,
                delay, duration, offsetY, rotMin, rotMax,
                startTime: performance.now() + delay * 1000
            });
        });
        animateFloating();
    }

    function animateFloating() {
        const now = performance.now();
        floatingTiles.forEach(data => {
            const elapsed = (now - data.startTime) / 1000;
            if (elapsed < 0) return;
            const progress = (elapsed % data.duration) / data.duration;
            const angle = progress * Math.PI * 2;
            const yOffset = Math.sin(angle) * data.offsetY;
            const rot = data.rotMin + (Math.sin(angle + 0.5) * 0.5 + 0.5) * (data.rotMax - data.rotMin);
            data.el.style.transform = `rotateY(${2 + rot*0.2}deg) rotateX(${2 + rot*0.1}deg) translateY(${yOffset}px) translateZ(10px)`;
        });
        animationFrameId = requestAnimationFrame(animateFloating);
    }

    // ================================================
    // LOAD WORD
    // ================================================
    async function loadWord() {
        stopVideo();
        const levelData = LEVELS[currentLevel];
        if (currentWordIndex >= levelData.words.length) {
            if (currentLevel < maxLevel - 1) {
                currentLevel++;
                currentWordIndex = 0;
                showLevelUp(currentLevel + 1);
                messageBox.innerText = `🎉 Naik level! Level ${currentLevel+1}`;
                messageBox.className = 'message correct';
                setTimeout(() => messageBox.className = 'message', 1500);
            } else {
                messageBox.innerText = '🏆 Hore! Kamu sudah belajar banyak! 🎉';
                messageBox.className = 'message correct';
                fireConfetti(60);
                await updateRanking(currentPlayerName, score, currentLevel + 1);
                currentLevel = 0;
                currentWordIndex = 0;
                score = 0;
                updateScoreAndLevel();
                setTimeout(() => messageBox.className = 'message', 2000);
            }
            await updateRanking(currentPlayerName, score, currentLevel + 1);
        }
        const newData = LEVELS[currentLevel];
        currentWord = newData.words[currentWordIndex];
        currentEmoji = newData.emoji[currentWordIndex];
        updateObjectImage(currentWord, currentEmoji);
        resetGameState();
        render();
        updateScoreAndLevel();
        messageBox.innerText = `🔤 Susun: ${currentWord.length} huruf`;
        messageBox.className = 'message';
        isProcessing = false;
        setTimeout(startFloating, 50);
    }

    function resetGameState() {
        selectedIndices = [];
        answerSlots = [];
        shuffledLetters = shuffleArray(currentWord.split(''));
        render();
    }

    function render() {
        const remainingIndices = [];
        for (let i=0; i<shuffledLetters.length; i++) {
            if (!selectedIndices.includes(i)) remainingIndices.push(i);
        }
        letterGrid.innerHTML = '';
        remainingIndices.forEach(originalIndex => {
            const letter = shuffledLetters[originalIndex];
            const tile = document.createElement('div');
            tile.className = 'letter-tile';
            tile.textContent = letter.toUpperCase();
            tile.dataset.index = originalIndex;
            const shine = document.createElement('div');
            shine.className = 'shine';
            tile.appendChild(shine);
            tile.addEventListener('click', (e) => handleLetterClick(originalIndex, e));
            tile.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const touch = e.touches[0];
                handleLetterClick(originalIndex, { clientX: touch.clientX, clientY: touch.clientY });
            }, { passive: false });
            letterGrid.appendChild(tile);
        });

        answerZone.innerHTML = '';
        for (let i=0; i<currentWord.length; i++) {
            const slot = document.createElement('div');
            slot.className = 'answer-slot' + (i < answerSlots.length ? ' filled' : '');
            slot.textContent = i < answerSlots.length ? answerSlots[i].toUpperCase() : '⬜';
            answerZone.appendChild(slot);
        }

        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        setTimeout(startFloating, 50);
    }

    function handleLetterClick(index, event) {
        if (isProcessing) return;
        if (selectedIndices.includes(index) || answerSlots.length >= currentWord.length) return;

        if (event && event.clientX) {
            createSparkles(event.clientX, event.clientY, 6);
        } else {
            const rect = letterGrid.querySelector(`.letter-tile[data-index="${index}"]`)?.getBoundingClientRect();
            if (rect) {
                createSparkles(rect.left + rect.width/2, rect.top + rect.height/2, 6);
            }
        }

        const letter = shuffledLetters[index];
        answerSlots.push(letter);
        selectedIndices.push(index);
        render();

        if (answerSlots.length === currentWord.length) {
            checkAnswer();
        } else {
            messageBox.innerText = `📝 ${answerSlots.length}/${currentWord.length}`;
            messageBox.className = 'message';
        }
    }

    // ================================================
    // CEK JAWABAN
    // ================================================
    async function checkAnswer() {
        if (isProcessing) return;
        const userAnswer = answerSlots.join('');
        if (userAnswer === currentWord) {
            isProcessing = true;
            score += 10;
            updateScoreAndLevel();
            await updateRanking(currentPlayerName, score, currentLevel + 1);
            messageBox.innerText = `✅ Benar! +10 poin 🎉`;
            messageBox.className = 'message correct';
            fireConfetti(25);
            playVideo('backdropA', 4000);
            currentWordIndex++;
            setTimeout(() => loadWord(), 4000);
        } else {
            messageBox.innerText = `❌ Coba lagi! "${userAnswer.toUpperCase()}" bukan jawaban.`;
            messageBox.className = 'message wrong';
            playVideo('backdropB', 4000);
            setTimeout(() => {
                selectedIndices = [];
                answerSlots = [];
                render();
                messageBox.className = 'message';
                messageBox.innerText = `🔄 Coba susun ulang!`;
                stopVideo();
            }, 4000);
        }
    }

    function updateScoreAndLevel() {
        levelDisplay.textContent = currentLevel + 1;
        scoreDisplay.textContent = score;
    }

    function resetCurrentWord() {
        if (isProcessing) return;
        selectedIndices = [];
        answerSlots = [];
        render();
        messageBox.innerText = `🔄 Huruf diacak! Coba susun.`;
        messageBox.className = 'message';
        stopVideo();
    }

    // ================================================
    // INIT GAME
    // ================================================
    function initGameAfterStart() {
        initBackgroundVideo();
        
        currentLevel = 0;
        currentWordIndex = 0;
        score = 0;
        const first = LEVELS[0];
        currentWord = first.words[0];
        currentEmoji = first.emoji[0];
        updateObjectImage(currentWord, currentEmoji);
        resetGameState();
        updateScoreAndLevel();
        messageBox.innerText = '✨ Susun huruf jadi kata!';
        messageBox.className = 'message';
        isProcessing = false;
        setTimeout(startFloating, 100);
    }

    // ================================================
    // RESIZE HANDLER (UPDATE SAAT ROTASI HP)
    // ================================================
    window.addEventListener('resize', function() {
        const isMobile = window.innerWidth < 768;
        if (bgVideo) {
            const currentSrc = bgVideo.src || '';
            const expectedFile = isMobile ? 'backdroputama-hp.mp4' : 'backdroputama.mp4';
            if (!currentSrc.includes(expectedFile.replace('.mp4', ''))) {
                console.log('🔄 Orientasi berubah, ganti backdrop');
                initBackgroundVideo();
            }
        }
    });

    resetBtn.addEventListener('click', resetCurrentWord);

    window.addEventListener('beforeunload', () => {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        if (currentTimeout) clearTimeout(currentTimeout);
        if (window._levelUpTimeout) clearTimeout(window._levelUpTimeout);
    });

})();
