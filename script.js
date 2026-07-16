(function() {
    // ================================================
    // API KEY PIXABAY
    // ================================================
    const PIXABAY_API_KEY = '56708277-1122a65ab11fe5066b2a03f65';

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
    // MUSIK (sudah diperbaiki dengan error detail)
    // ================================================
    const bgMusic = document.getElementById('bgMusic');
    const musicControl = document.getElementById('musicControl');
    let musicPlaying = false;

    if (bgMusic) {
        bgMusic.volume = 0.3;
        bgMusic.loop = true;

        // Fungsi play dengan error detail
        function playMusic() {
            return bgMusic.play().then(() => {
                musicPlaying = true;
                if (musicControl) musicControl.textContent = '🔊';
                console.log('✅ Musik berhasil diputar');
            }).catch(err => {
                console.warn('❌ Gagal memutar musik:', err.message);
                // Jika file tidak ditemukan, coba reload sumber audio
                if (err.name === 'NotSupportedError' || err.message.includes('404') || err.message.includes('Failed to load')) {
                    console.warn('🔄 Coba reload audio source...');
                    bgMusic.load(); // reload src
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

        // Coba autoplay
        playMusic().catch(() => {
            musicPlaying = false;
            if (musicControl) musicControl.textContent = '🔇';
            console.log('🔇 Autoplay diblokir, tunggu klik user');
        });

        // Tombol kontrol musik
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

        // Jika user klik di mana saja dan musik masih pause, mulai musik
        let musicStarted = false;
        document.addEventListener('click', function startMusicOnClick() {
            if (!musicStarted && bgMusic.paused) {
                musicStarted = true;
                playMusic().catch(() => {
                    musicStarted = false; // jika gagal, coba lagi nanti
                });
                document.removeEventListener('click', startMusicOnClick);
            }
        });

        // Retry jika ada klik lain (hanya sekali)
        document.addEventListener('click', function retryMusic() {
            if (bgMusic.paused && !musicPlaying) {
                playMusic().catch(() => {});
            }
        }, { once: true });

    } else {
        console.warn('⚠️ Elemen audio #bgMusic tidak ditemukan!');
    }

    // ================================================
    // LEADERBOARD & USER
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

    function getRanking() {
        try {
            const data = localStorage.getItem(RANKING_KEY);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }

    function saveRanking(ranking) {
        localStorage.setItem(RANKING_KEY, JSON.stringify(ranking));
    }

    function updateRanking(name, score, level) {
        let ranking = getRanking();
        const existing = ranking.find(item => item.name.toLowerCase() === name.toLowerCase());
        if (existing) {
            if (score > existing.score) {
                existing.score = score;
                existing.level = level;
                existing.date = new Date().toISOString();
            }
        } else {
            ranking.push({ name, score, level, date: new Date().toISOString() });
        }
        ranking.sort((a, b) => b.score - a.score);
        saveRanking(ranking);
    }

    function renderLeaderboard() {
        const ranking = getRanking();
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

    // Export XLS
    function exportLeaderboardToXLS() {
        const password = prompt('Masukkan password untuk ekspor data:');
        if (password !== 'katakatasule') {
            if (password !== null) alert('❌ Password salah! Ekspor dibatalkan.');
            return;
        }
        const ranking = getRanking();
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

    // Leaderboard modal
    function openLeaderboard() {
        renderLeaderboard();
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

    // Hapus data
    deleteDataBtn.addEventListener('click', function() {
        const password = prompt('Masukkan password untuk menghapus semua data peringkat:');
        if (password === 'katakatasule') {
            if (confirm('Yakin ingin menghapus semua data peringkat?')) {
                saveRanking([]);
                renderLeaderboard();
                alert('✅ Semua data peringkat telah dihapus!');
            }
        } else if (password !== null) {
            alert('❌ Password salah! Data tidak dihapus.');
        }
    });

    deleteRankingBtn.addEventListener('click', function() {
        const password = prompt('Masukkan password untuk menghapus semua data peringkat:');
        if (password === 'katakatasule') {
            if (confirm('Yakin ingin menghapus semua data peringkat?')) {
                saveRanking([]);
                renderLeaderboard();
                alert('✅ Semua data peringkat telah dihapus!');
            }
        } else if (password !== null) {
            alert('❌ Password salah! Data tidak dihapus.');
        }
    });

    exportLeaderboardBtn.addEventListener('click', exportLeaderboardToXLS);
    exportModalBtn.addEventListener('click', exportLeaderboardToXLS);

    // ===== START GAME =====
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

    // Video functions
    function playVideo(src, duration = 4000) {
        if (currentTimeout) clearTimeout(currentTimeout);
        bgVideo.loop = false;
        bgVideo.pause();
        bgVideo.src = src;
        bgVideo.load();
        bgVideo.muted = false;
        bgVideo.volume = 0.8;
        bgVideo.play().catch(e => console.warn('Video play error:', e));
        currentTimeout = setTimeout(() => {
            bgVideo.pause();
            bgVideo.src = 'backdroputama.mp4';
            bgVideo.load();
            bgVideo.loop = true;
            bgVideo.muted = true;
            bgVideo.play().catch(e => console.warn('Idle video play error:', e));
            currentTimeout = null;
        }, duration);
    }

    function stopVideo() {
        if (currentTimeout) clearTimeout(currentTimeout);
        bgVideo.pause();
        bgVideo.src = 'backdroputama.mp4';
        bgVideo.load();
        bgVideo.loop = true;
        bgVideo.muted = true;
        bgVideo.play().catch(e => console.warn('Idle video play error:', e));
    }

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

    function showLevelUp(level) {
        const overlay = document.createElement('div');
        overlay.className = 'level-up-overlay';
        overlay.innerHTML = `<div class="level-up-box"><h1>🎉 LEVEL ${level} 🎉</h1><p>✨ Kamu Hebat! ✨</p></div>`;
        document.body.appendChild(overlay);
        fireConfetti(50);
        setTimeout(() => overlay.remove(), 2000);
    }

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

    function loadWord() {
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
                updateRanking(currentPlayerName, score, currentLevel + 1);
                currentLevel = 0;
                currentWordIndex = 0;
                score = 0;
                updateScoreAndLevel();
                setTimeout(() => messageBox.className = 'message', 2000);
            }
            updateRanking(currentPlayerName, score, currentLevel + 1);
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

    function checkAnswer() {
        if (isProcessing) return;
        const userAnswer = answerSlots.join('');
        if (userAnswer === currentWord) {
            isProcessing = true;
            score += 10;
            updateScoreAndLevel();
            updateRanking(currentPlayerName, score, currentLevel + 1);
            messageBox.innerText = `✅ Benar! +10 poin 🎉`;
            messageBox.className = 'message correct';
            fireConfetti(25);
            playVideo('backdropA.mp4', 4000);
            currentWordIndex++;
            setTimeout(() => loadWord(), 4000);
        } else {
            messageBox.innerText = `❌ Coba lagi! "${userAnswer.toUpperCase()}" bukan jawaban.`;
            messageBox.className = 'message wrong';
            playVideo('backdropB.mp4', 4000);
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

    function initGameAfterStart() {
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

    resetBtn.addEventListener('click', resetCurrentWord);

    window.addEventListener('beforeunload', () => {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        if (currentTimeout) clearTimeout(currentTimeout);
    });

})();
