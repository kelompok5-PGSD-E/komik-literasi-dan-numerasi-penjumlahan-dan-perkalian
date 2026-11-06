/* ==========================================================================
   PETUALANGAN BIMA & LALA — KOMIK FLIPBOOK INTERAKTIF
   Core Interactive Engine: Audio, Hotspots, Book Flipping, State
   Media Pembelajaran Literasi & Numerasi Kelas 4 SD
   ========================================================================== */

(function () {
  'use strict';

  // ========== AUDIO SYNTHESIZER (WEB AUDIO API) ==========
  let audioCtx = null;
  let isSoundEnabled = true;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, duration, type = 'sine', gainVal = 0.15) {
    if (!isSoundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  function playPageFlipSound() {
    if (!isSoundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    try {
      const bufferSize = audioCtx.sampleRate * 0.15;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, audioCtx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.15);

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      noise.start();
    } catch (e) {
      console.warn('Flip sound error:', e);
    }
  }

  function playCorrectSound() {
    if (!isSoundEnabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        playTone(freq, 0.28, 'triangle', 0.2);
      }, idx * 70);
    });
  }

  function playWrongSound() {
    if (!isSoundEnabled) return;
    playTone(220, 0.25, 'sawtooth', 0.12);
    setTimeout(() => {
      playTone(180, 0.3, 'sawtooth', 0.1);
    }, 120);
  }

  function playVictorySound() {
    if (!isSoundEnabled) return;
    const fanfare = [392, 523.25, 659.25, 783.99];
    fanfare.forEach((freq, idx) => {
      setTimeout(() => {
        playTone(freq, 0.4, 'triangle', 0.22);
      }, idx * 120);
    });
  }

  // ========== DATA SLIDE BUKU (15 HALAMAN) ==========
  const slides = [
    // 1 — Cover
    {
      type: 'cover',
      chapter: 'Sampul Depan',
      image: 'gambar/cover.jpeg',
      hint: 'Tekan tombol "Selanjutnya ▶" di sebelah kanan untuk mulai membaca!',
    },
    // 2 — Petunjuk Penggunaan
    {
      type: 'comic',
      chapter: 'Petunjuk Penggunaan',
      image: 'gambar/PETUNJUK.jpeg',
      hint: '📖 Pelajari petunjuk di atas, lalu tekan "Selanjutnya ▶" untuk mulai petualangan!',
    },
    // 3 — Awal Petualangan (di sekolah)
    {
      type: 'comic',
      chapter: 'Awal Petualangan',
      image: 'gambar/hal-2.jpeg',
      hint: 'Bima dan Lala bersiap pergi ke Pasar Ceria untuk belajar berhitung!',
    },
    // 4 — Di Pasar Ceria (bertemu penjual buah)
    {
      type: 'comic',
      chapter: 'Di Pasar Ceria',
      image: 'gambar/hal-3.jpeg',
      hint: 'Bima dan Lala melihat apel segar di pasar. Berapa banyak ya?',
    },
    // 5 — Misi di Pasar Ceria (soal 125 + 135)
    {
      type: 'comic',
      chapter: 'Misi di Pasar Ceria',
      image: 'gambar/hal-4.jpeg',
      hint: 'Ibu penjual buah minta tolong menghitung 125 + 135 apel. Ayo bantu!',
    },
    // 6 — Belajar Menjumlahkan (penjelasan 125+135=260)
    {
      type: 'comic',
      chapter: 'Belajar Menjumlahkan',
      image: 'gambar/hal-5.jpeg',
      hint: 'Pisahkan ratusan, puluhan, satuan: 125 + 135 = 260 apel! 🍎',
    },
    // 7 — QUIZ 1: Tantangan Penjumlahan 347 + 189 = ? (hal-6.jpeg)
    {
      type: 'hotspot-quiz',
      chapter: 'Tantangan Penjumlahan 1',
      image: 'gambar/hal-6.jpeg',
      hint: '👉 Tekan langsung kotak jawaban (A, B, atau C) di dalam gambar papan tulis!',
      quizId: 'q1-penjumlahan',
      hotspots: [
        {
          id: 'q1-a',
          label: 'A. 536',
          left: 43.17,
          top: 31.51,
          width: 19.48,
          height: 12.5,
          isCorrect: true,
          explain: 'Jawaban Benar! 347 + 189 = 536! Hebat sekali! 🎉',
          wrongExplain: '',
        },
        {
          id: 'q1-b',
          label: 'B. 526',
          left: 43.31,
          top: 47.4,
          width: 19.33,
          height: 12.76,
          isCorrect: false,
          explain: '',
          wrongExplain: 'Coba perhatikan langkah penjumlahan bersusun ya:\n\n1. Jumlahkan Satuan:\n   7 + 9 = 16 (tulis angka 6 pada satuan, dan simpan 1 puluhan di atas).\n\n2. Jumlahkan Puluhan:\n   4 + 8 + 1 (simpanan) = 13 (tulis angka 3 pada puluhan, simpan 1 ratusan di atas).\n\n3. Jumlahkan Ratusan:\n   3 + 1 + 1 (simpanan) = ?\n\nGabungkan ratusan, puluhan, dan satuan. Coba hitung lagi dan pilih kembali ya!',
        },
        {
          id: 'q1-c',
          label: 'C. 436',
          left: 43.02,
          top: 63.93,
          width: 19.48,
          height: 12.76,
          isCorrect: false,
          explain: '',
          wrongExplain: 'Perhatikan angka ratusannya dengan teliti ya:\n\n1. Satuan: 7 + 9 = 16 (tulis 6, simpan 1 ke puluhan).\n2. Puluhan: 4 + 8 + 1 (simpanan) = 13 (tulis 3, simpan 1 ke ratusan).\n3. Ratusan: 3 + 1 ditambah 1 simpanan, hasilnya tentu lebih dari 4!\n\nAyo hitung kembali ratusannya dan tentukan jawabanmu!',
        },
      ],
    },
    // 8 — QUIZ 2: Challenge Problem 43 + 28 = ? (hal-7.jpeg)
    {
      type: 'hotspot-quiz',
      chapter: 'Tantangan Penjumlahan 2',
      image: 'gambar/hal-7.jpeg',
      hint: '👉 Tekan langsung kotak jawaban (A, B, C, atau D) di dalam gambar papan!',
      quizId: 'q2-penjumlahan',
      hotspots: [
        {
          id: 'q2-a',
          label: 'A. 61',
          left: 52.33,
          top: 42.97,
          width: 10.17,
          height: 16.93,
          isCorrect: false,
          explain: '',
          wrongExplain: 'Hampir tepat! Jangan lupa tambahkan angka simpanannya ya:\n\n1. Satuan: 3 + 8 = 11 (tulis angka 1, lalu simpan 1 di atas puluhan).\n2. Puluhan: 4 + 2 = 6, lalu tambahkan 1 simpanan tadi: 6 + 1 = ?\n\nGabungkan hasilnya dan coba pilih lagi!',
        },
        {
          id: 'q2-b',
          label: 'B. 71',
          left: 62.5,
          top: 42.97,
          width: 9.3,
          height: 16.93,
          isCorrect: true,
          explain: 'Jawaban Benar! 43 + 28 = 71! Luar biasa! 🎉',
          wrongExplain: '',
        },
        {
          id: 'q2-c',
          label: 'C. 72',
          left: 52.33,
          top: 60.55,
          width: 10.17,
          height: 17.45,
          isCorrect: false,
          explain: '',
          wrongExplain: 'Coba perhatikan penjumlahan satuannya:\n\n3 + 8 hasilnya adalah 11, bukan 12.\nJadi angka satuan di belakang haruslah 1.\n\nCoba periksa lagi pilihan jawabanmu!',
        },
        {
          id: 'q2-d',
          label: 'D. 81',
          left: 62.5,
          top: 60.55,
          width: 10.17,
          height: 17.45,
          isCorrect: false,
          explain: '',
          wrongExplain: 'Penjumlahan puluhannya sedikit berlebih nih:\n\n1. Satuan: 3 + 8 = 11 (simpan 1 ke puluhan).\n2. Puluhan: 4 + 2 + 1 simpanan = 7, bukan 8!\n\nAyo hitung kembali dengan cermat!',
        },
      ],
    },
    // 9 — Toko Alat Tulis (transisi cerita)
    {
      type: 'comic',
      chapter: 'Toko Alat Tulis',
      image: 'gambar/hal-8.jpeg',
      hint: 'Bima dan Lala pergi ke Toko Alat Tulis Pelajar Pandai!',
    },
    // 10 — Tantangan Perkalian (4 kelompok × 3 penggaris)
    {
      type: 'comic',
      chapter: 'Tantangan Perkalian',
      image: 'gambar/hal-9.jpeg',
      hint: 'Ada 4 kelompok penggaris, masing-masing berisi 3. Bagaimana menghitungnya?',
    },
    // 11 — Belajar Perkalian (penjelasan 4×3=12)
    {
      type: 'comic',
      chapter: 'Belajar Perkalian',
      image: 'gambar/hal-10.jpeg',
      hint: 'Perkalian = penjumlahan berulang! 3+3+3+3 = 4×3 = 12! 📐',
    },
    // 12 — QUIZ 3: Dua Tantangan Perkalian (hal-11.jpeg)
    {
      type: 'hotspot-quiz',
      chapter: 'Tantangan Perkalian',
      image: 'gambar/hal-11.jpeg',
      hint: '👉 Tekan kotak jawaban di papan kiri (7×9) dan papan kanan (6×8)!',
      groups: [
        {
          quizId: 'q3-perkalian-1',
          name: '7 × 9',
          hotspots: [
            {
              id: 'q3-1a',
              label: 'A. 63',
              left: 34.0,
              top: 39.8,
              width: 7.5,
              height: 8.0,
              isCorrect: true,
              explain: 'Benar sekali! 7 × 9 = 63! Mantap! 🌟',
              wrongExplain: '',
            },
            {
              id: 'q3-1b',
              label: 'B. 72',
              left: 42.3,
              top: 39.8,
              width: 7.5,
              height: 8.0,
              isCorrect: false,
              explain: '',
              wrongExplain: 'Angka 72 adalah hasil dari 8 × 9.\nSoal ini menanyakan 7 × 9 (ada 7 kelompok angka 9):\n\nCara mudah: (7 × 10) dikurangi 7\n= 70 - 7 = ?\n\nAyo coba hitung pengurangannya dan pilih kembali!',
            },
            {
              id: 'q3-1c',
              label: 'C. 54',
              left: 34.0,
              top: 48.2,
              width: 7.5,
              height: 8.0,
              isCorrect: false,
              explain: '',
              wrongExplain: 'Angka 54 adalah hasil dari 6 × 9.\nKarena ini 7 × 9, kamu tinggal menambahkan 9 lagi dari 54:\n\n54 + 9 = ?\n\nCoba hitung penjumlahan tersebut!',
            },
            {
              id: 'q3-1d',
              label: 'D. 81',
              left: 42.3,
              top: 48.2,
              width: 7.5,
              height: 8.0,
              isCorrect: false,
              explain: '',
              wrongExplain: 'Angka 81 adalah hasil dari 9 × 9.\nUntuk menghitung 7 × 9, kamu bisa menghitung secara berulang:\n9 + 9 = 18\n18 + 9 = 27\n27 + 9 = 36\n36 + 9 = 45\n45 + 9 = 54\n54 + 9 = ?\n\nCari tahu hasil akhirnya!',
            },
          ],
        },
        {
          quizId: 'q3-perkalian-2',
          name: '6 × 8',
          hotspots: [
            {
              id: 'q3-2a',
              label: 'A. 42',
              left: 56.2,
              top: 39.8,
              width: 7.5,
              height: 8.0,
              isCorrect: false,
              explain: '',
              wrongExplain: 'Angka 42 adalah hasil dari 6 × 7.\nKarena soal ini 6 × 8, tambahkan satu kali angka 6 lagi ke 42:\n\n42 + 6 = ?\n\nCoba hitung dan pilih lagi!',
            },
            {
              id: 'q3-2b',
              label: 'B. 48',
              left: 64.5,
              top: 39.8,
              width: 7.5,
              height: 8.0,
              isCorrect: true,
              explain: 'Luar biasa! 6 × 8 = 48! Tepat sekali! 🌟',
              wrongExplain: '',
            },
            {
              id: 'q3-2c',
              label: 'C. 36',
              left: 56.2,
              top: 48.2,
              width: 7.5,
              height: 8.0,
              isCorrect: false,
              explain: '',
              wrongExplain: 'Angka 36 adalah hasil dari 6 × 6.\nUntuk 6 × 8, ada dua kelompok 6 lagi yang perlu ditambahkan:\n\n36 + 12 = ?\n\nAtau jumlahkan: 8 + 8 + 8 + 8 + 8 + 8 = ?\nAyo coba lagi!',
            },
            {
              id: 'q3-2d',
              label: 'D. 54',
              left: 64.5,
              top: 48.2,
              width: 7.5,
              height: 8.0,
              isCorrect: false,
              explain: '',
              wrongExplain: 'Angka 54 adalah hasil dari 6 × 9 (kelebihan 1 kelompok).\nUntuk mencari 6 × 8, kamu cukup kurangi 6 dari 54:\n\n54 - 6 = ?\n\nAyo hitung kembali!',
            },
          ],
        },
      ],
    },
    // 13 — Ayo Waktunya Latihan (transisi)
    {
      type: 'comic',
      chapter: 'Waktunya Latihan',
      image: 'gambar/hal-12.jpeg',
      hint: 'Ayo, waktunya latihan! Siap selesaikan tantangan akhir di papan kelas! 📝',
    },
    // 14 — QUIZ 4: Tantangan Matematika Kelas 4 (hal-13.jpeg)
    {
      type: 'hotspot-board-quiz',
      chapter: 'Tantangan Matematika Kelas 4',
      image: 'gambar/hal-13.jpeg',
      hint: '👉 Tekan kotak angka berwarna di bawah papan untuk mengisi jawaban soal di papan tulis!',
      boardBoxes: [
        { quizId: 'q4-p1', label: '37', left: 45.78, top: 27.34, width: 5.09, height: 7.94 },
        { quizId: 'q4-p2', label: '84', left: 45.78, top: 35.16, width: 5.09, height: 7.16 },
        { quizId: 'q4-m1', label: '42', left: 61.77, top: 27.34, width: 4.65, height: 7.94 },
        { quizId: 'q4-m2', label: '36', left: 61.77, top: 35.16, width: 4.72, height: 7.16 },
      ],
      chips: [
        // Baris 1 (Kotak Jawaban Benar)
        {
          id: 'chip-37',
          quizId: 'q4-p1',
          label: '37 (23 + 14)',
          left: 38.66,
          top: 46.61,
          width: 5.96,
          height: 5.21,
          isCorrect: true,
          explain: 'Tepat sekali! 23 + 14 = 37! Kotak kosong di papan sudah terisi! 🎉',
          wrongExplain: '',
        },
        {
          id: 'chip-42',
          quizId: 'q4-m1',
          label: '42 (6 × 7)',
          left: 45.64,
          top: 46.61,
          width: 5.96,
          height: 5.21,
          isCorrect: true,
          explain: 'Benar! 6 × 7 = 42! Soal perkalian pertama terselesaikan! 🎉',
          wrongExplain: '',
        },
        {
          id: 'chip-84',
          quizId: 'q4-p2',
          label: '84 (56 + 28)',
          left: 52.54,
          top: 46.61,
          width: 5.96,
          height: 5.21,
          isCorrect: true,
          explain: 'Hebat! 56 + 28 = 84! Kotak penjumlahan kedua berhasil! 🎉',
          wrongExplain: '',
        },
        {
          id: 'chip-36',
          quizId: 'q4-m2',
          label: '36 (4 × 9)',
          left: 59.45,
          top: 46.61,
          width: 5.96,
          height: 5.21,
          isCorrect: true,
          explain: 'Luar biasa! 4 × 9 = 36! Semua soal di papan sukses diselesaikan! 🌟',
          wrongExplain: '',
        },
        // Baris 2 (Kotak Pengecoh / Distraktor)
        {
          id: 'chip-78',
          quizId: null,
          label: '78',
          left: 37.79,
          top: 53.65,
          width: 6.83,
          height: 7.55,
          isCorrect: false,
          explain: '',
          wrongExplain: 'Angka 78 bukan jawaban dari soal-soal di papan ini.\n\nCoba kita cek soal 23 + 14:\n1. Satuan: 3 + 4 = 7.\n2. Puluhan: 2 + 1 = 3.\n\nJadi hasilnya berkepala 3, bukan kepala 7 ya! Cari kotak yang angkanya sesuai!',
        },
        {
          id: 'chip-27',
          quizId: null,
          label: '27',
          left: 45.64,
          top: 53.65,
          width: 5.96,
          height: 5.21,
          isCorrect: false,
          explain: '',
          wrongExplain: 'Angka 27 belum tepat.\n\nUntuk perkalian 6 × 7, artinya angka 7 dijumlahkan sebanyak 6 kali:\n7 + 7 = 14\n14 + 7 = 21\n21 + 7 = 28\n28 + 7 = 35\n35 + 7 = ?\n\nHasilnya lebih besar dari 40 lho! Coba cari kotak warna hijau!',
        },
        {
          id: 'chip-54',
          quizId: null,
          label: '54',
          left: 52.54,
          top: 53.65,
          width: 5.96,
          height: 5.21,
          isCorrect: false,
          explain: '',
          wrongExplain: 'Angka 54 belum tepat untuk soal di papan ini.\n\nCoba hitung penjumlahan 56 + 28:\n1. Satuan: 6 + 8 = 14 (tulis angka 4, simpan 1 di puluhan).\n2. Puluhan: 5 + 2 + 1 (simpanan) = 8.\n\nJadi hasilnya berkepala 8 dan berakhiran 4. Coba temukan kotaknya!',
        },
        {
          id: 'chip-63',
          quizId: null,
          label: '63',
          left: 59.45,
          top: 53.65,
          width: 6.54,
          height: 7.55,
          isCorrect: false,
          explain: '',
          wrongExplain: 'Angka 63 adalah hasil dari 7 × 9.\nSedangkan soal di papan sebelah kanan adalah 4 × 9:\n\nHitung penjumlahan angka 9 sebanyak 4 kali:\n9 + 9 = 18\n18 + 9 = 27\n27 + 9 = ?\n\nAyo hitung kembali dan temukan kotaknya di baris atas!',
        },
      ],
    },
    // 15 — Penutup & Rekap Nilai (hal-14.jpeg)
    {
      type: 'final',
      chapter: 'Penutup & Rekap Nilai',
      image: 'gambar/hal-14.jpeg',
      hint: '🎉 Kamu telah menyelesaikan petualangan literasi & numerasi Bima dan Lala!',
    },
  ];

  // ========== APPLICATION STATE ==========
  let currentSlide = 0;
  let quizAnswers = {}; // { quizId: { selectedId, isCorrect } }
  let toastTimer = null;

  // DOM Elements
  const appEl = document.getElementById('app');
  const splashEl = document.getElementById('splash');
  const pageViewportEl = document.getElementById('pageViewport');
  const bookPageEl = document.getElementById('bookPage');
  const pageChapterEl = document.getElementById('pageChapter');
  const pageCounterBadgeEl = document.getElementById('pageCounterBadge');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const hintTextEl = document.getElementById('hintText');
  const progressLabelEl = document.getElementById('progressLabel');
  const progressFillEl = document.getElementById('progressFill');
  const thumbnailStripEl = document.getElementById('thumbnailStrip');
  const soundBtn = document.getElementById('soundBtn');
  const soundIcon = document.getElementById('soundIcon');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const toastNotificationEl = document.getElementById('toastNotification');
  const toastIconEl = document.getElementById('toastIcon');
  const toastTitleEl = document.getElementById('toastTitle');
  const toastMsgEl = document.getElementById('toastMsg');
  const explanationOverlay = document.getElementById('explanationOverlay');
  const explanationText = document.getElementById('explanationText');
  const explanationClose = document.getElementById('explanationClose');
  const explanationCloseIcon = document.getElementById('explanationCloseIcon');

  // Total Quizzes in this book:
  // Quiz 1 (hal-6: 347+189): 1
  // Quiz 2 (hal-7: 43+28): 1
  // Quiz 3 (hal-11: 7×9 & 6×8): 2
  // Quiz 4 (hal-13: 23+14, 56+28, 6×7, 4×9): 4
  // Total = 8 questions
  const TOTAL_QUIZZES = 8;

  function countCorrectQuizzes() {
    return Object.values(quizAnswers).filter((a) => a.isCorrect).length;
  }

  // ========== TOAST FEEDBACK ==========
  function showToast(title, msg, isSuccess = true) {
    if (toastTimer) clearTimeout(toastTimer);

    toastIconEl.textContent = isSuccess ? '🎉' : '💡';
    toastTitleEl.textContent = title;
    toastMsgEl.textContent = msg;

    toastNotificationEl.className = `toast-notification ${isSuccess ? 'success' : 'wrong'}`;
    toastNotificationEl.classList.remove('hidden');

    toastTimer = setTimeout(() => {
      toastNotificationEl.classList.add('hidden');
    }, 3500);
  }

  // ========== EXPLANATION OVERLAY (GUIDANCE ON WRONG ANSWER) ==========
  function showExplanation(text) {
    if (!explanationOverlay || !explanationText) return;
    explanationText.textContent = text;
    explanationOverlay.classList.remove('hidden');
    explanationOverlay.style.display = 'flex';
    void explanationOverlay.offsetWidth;
    explanationOverlay.classList.add('visible');
  }

  function hideExplanation() {
    if (!explanationOverlay) return;
    explanationOverlay.classList.remove('visible');
    setTimeout(() => {
      if (!explanationOverlay.classList.contains('visible')) {
        explanationOverlay.classList.add('hidden');
        explanationOverlay.style.display = 'none';
      }
    }, 280);
  }

  if (explanationClose) {
    explanationClose.addEventListener('click', hideExplanation);
  }
  if (explanationCloseIcon) {
    explanationCloseIcon.addEventListener('click', hideExplanation);
  }
  if (explanationOverlay) {
    explanationOverlay.addEventListener('click', function (e) {
      if (e.target === explanationOverlay) hideExplanation();
    });
  }

  // ========== RENDER PAGE ==========
  function renderSlide(direction = 'next') {
    const slide = slides[currentSlide];

    // Trigger 3D turn animation
    bookPageEl.classList.remove('page-flip-forward', 'page-flip-backward');
    void bookPageEl.offsetWidth; // Force reflow
    if (direction !== 'stay') {
      bookPageEl.classList.add(direction === 'next' ? 'page-flip-forward' : 'page-flip-backward');
    }

    // Update Ribbon & Meta
    pageChapterEl.textContent = slide.chapter;
    pageCounterBadgeEl.textContent = `Hal. ${currentSlide + 1} / ${slides.length}`;
    hintTextEl.textContent = slide.hint || 'Gunakan panah di samping untuk membalik halaman.';
    progressLabelEl.textContent = `Halaman ${currentSlide + 1} dari ${slides.length}`;
    progressFillEl.style.width = `${((currentSlide + 1) / slides.length) * 100}%`;

    // Arrows state
    prevBtn.disabled = currentSlide === 0;
    nextBtn.disabled = currentSlide === slides.length - 1;

    // Render viewport content
    let html = '';
    switch (slide.type) {
      case 'cover':
      case 'comic':
        html = renderComicSlide(slide);
        break;
      case 'hotspot-quiz':
        html = renderHotspotQuizSlide(slide);
        break;
      case 'hotspot-board-quiz':
        html = renderHotspotBoardSlide(slide);
        break;
      case 'final':
        html = renderFinalSlide(slide);
        break;
    }

    pageViewportEl.innerHTML = html;

    // Update thumbnail highlights
    updateThumbnails();

    // If final slide, play victory sound
    if (slide.type === 'final') {
      playVictorySound();
    }
  }

  // ========== TEMPLATES ==========

  // 1. Comic Picture Template
  function renderComicSlide(slide) {
    return `
      <div class="comic-slide-wrap">
        <img class="comic-picture" src="${slide.image}" alt="${escapeHtml(slide.chapter)}">
      </div>
    `;
  }

  // 2. Hotspot Quiz (Hal 7 & Hal 8 & Hal 12)
  function renderHotspotQuizSlide(slide) {
    let hotspotsHtml = '';

    if (slide.hotspots) {
      // Single question (Hal 7: 347+189, Hal 8: 43+28)
      const state = quizAnswers[slide.quizId];
      slide.hotspots.forEach((h) => {
        let cls = 'hotspot box';
        let disabled = false;
        if (state && state.isCorrect) {
          cls += ' answered';
          if (h.isCorrect) cls += ' correct';
          disabled = true;
        }
        hotspotsHtml += `
          <button class="${cls}"
            data-id="${h.id}"
            style="left:${h.left}%; top:${h.top}%; width:${h.width}%; height:${h.height}%;"
            onclick="window.onHotspotSelect('${h.id}')"
            title="${h.label || 'Pilih jawaban ini'}"
            aria-label="${h.label || 'Opsi'}"
            ${disabled ? 'disabled' : ''}>
          </button>
        `;
      });
    } else if (slide.groups) {
      // Multiple question groups on one slide (Hal 12: 7×9 and 6×8)
      slide.groups.forEach((g) => {
        const state = quizAnswers[g.quizId];
        g.hotspots.forEach((h) => {
          let cls = 'hotspot box';
          let disabled = false;
          if (state && state.isCorrect) {
            cls += ' answered';
            if (h.isCorrect) cls += ' correct';
            disabled = true;
          }
          hotspotsHtml += `
            <button class="${cls}"
              data-id="${h.id}"
              style="left:${h.left}%; top:${h.top}%; width:${h.width}%; height:${h.height}%;"
              onclick="window.onHotspotSelect('${h.id}')"
              title="${h.label || 'Pilih jawaban ini'}"
              aria-label="${h.label || 'Opsi'}"
              ${disabled ? 'disabled' : ''}>
            </button>
          `;
        });
      });
    }

    return `
      <div class="comic-slide-wrap">
        <img class="comic-picture" src="${slide.image}" alt="${escapeHtml(slide.chapter)}">
        <div class="hotspot-overlay-layer">
          ${hotspotsHtml}
        </div>
      </div>
    `;
  }

  // 3. Hotspot Board Slide (Hal 14: Tantangan Matematika Kelas 4)
  function renderHotspotBoardSlide(slide) {
    let hotspotsHtml = '';

    // Render Answer Badges inside the chalkboard empty boxes when solved!
    if (slide.boardBoxes) {
      slide.boardBoxes.forEach((b) => {
        const state = quizAnswers[b.quizId];
        if (state && state.isCorrect) {
          hotspotsHtml += `
            <div class="board-filled-badge"
              style="left:${b.left}%; top:${b.top}%; width:${b.width}%; height:${b.height}%;"
              title="Jawaban: ${b.label}">
              <span>${b.label}</span>
            </div>
          `;
        }
      });
    }

    // Render 8 colored answer chips
    if (slide.chips) {
      slide.chips.forEach((c) => {
        let cls = 'hotspot box';
        let disabled = false;
        if (c.quizId && quizAnswers[c.quizId] && quizAnswers[c.quizId].isCorrect) {
          cls += ' answered correct';
          disabled = true;
        }
        hotspotsHtml += `
          <button class="${cls}"
            data-id="${c.id}"
            style="left:${c.left}%; top:${c.top}%; width:${c.width}%; height:${c.height}%;"
            onclick="window.onHotspotSelect('${c.id}')"
            title="${c.label || 'Pilih kotak ini'}"
            aria-label="${c.label || 'Opsi'}"
            ${disabled ? 'disabled' : ''}>
          </button>
        `;
      });
    }

    return `
      <div class="comic-slide-wrap">
        <img class="comic-picture" src="${slide.image}" alt="${escapeHtml(slide.chapter)}">
        <div class="hotspot-overlay-layer">
          ${hotspotsHtml}
        </div>
      </div>
    `;
  }

  // 4. Final Slide (Hal 15: Rekap Skor & Penutup)
  let isScoreVisible = true;
  function renderFinalSlide(slide) {
    const correctCount = countCorrectQuizzes();
    const scorePct = Math.round((correctCount / TOTAL_QUIZZES) * 100);

    let praise = 'Semangat Terus Berlatih!';
    let emoji = '💪';
    if (correctCount === TOTAL_QUIZZES) {
      praise = 'Luar Biasa Sempurna!';
      emoji = '🌟🌟🌟';
    } else if (correctCount >= 6) {
      praise = 'Sangat Pintar & Teliti!';
      emoji = '⭐⭐';
    } else if (correctCount >= 4) {
      praise = 'Hebat Sekali!';
      emoji = '⭐';
    }

    return `
      <div class="comic-slide-wrap final-slide-wrap">
        <img class="comic-picture" src="${slide.image}" alt="Selamat Tinggal">
        <!-- Floating score card positioned at top sky area so bottom banner is 100% visible -->
        <div class="final-score-overlay ${isScoreVisible ? '' : 'minimized'}" id="finalScoreCard">
          <div class="final-score-text">
            <h3>🏆 ${praise} ${emoji}</h3>
            <p>Kamu berhasil menjawab <b>${correctCount} dari ${TOTAL_QUIZZES}</b> soal tantangan berhitung dengan benar!</p>
            <p class="score-percent">Nilai Literasi & Numerasi: <b>${scorePct} / 100</b></p>
          </div>
          <div class="final-score-badge">
            <div class="score-num-box">
              <strong>${correctCount}/${TOTAL_QUIZZES}</strong>
              <small>Benar</small>
            </div>
            <button class="btn-retry" onclick="window.resetAllQuizzes()" title="Ulangi Kuis">
              🔄 Ulangi Kuis
            </button>
            <button class="btn-toggle-score" onclick="window.toggleFinalScore()" title="Sembunyikan kartu nilai">
              ▲ Sembunyikan
            </button>
          </div>
        </div>
        <!-- Re-open button if minimized -->
        <button class="btn-show-score ${isScoreVisible ? 'hidden' : ''}" id="btnShowScore" onclick="window.toggleFinalScore()">
          🏆 Rekap Nilai
        </button>
      </div>
    `;
  }

  window.toggleFinalScore = function () {
    isScoreVisible = !isScoreVisible;
    const card = document.getElementById('finalScoreCard');
    const showBtn = document.getElementById('btnShowScore');
    if (card) card.classList.toggle('minimized', !isScoreVisible);
    if (showBtn) showBtn.classList.toggle('hidden', isScoreVisible);
  };

  // ========== HOTSPOT CLICK HANDLER & SELECTION ==========
  function findHotspotData(hotspotId) {
    const slide = slides[currentSlide];
    if (!slide) return null;

    if (slide.hotspots) {
      const h = slide.hotspots.find((x) => x.id === hotspotId);
      if (h) return { quizId: slide.quizId, ...h };
    }
    if (slide.groups) {
      for (const g of slide.groups) {
        const h = g.hotspots.find((x) => x.id === hotspotId);
        if (h) return { quizId: g.quizId, ...h };
      }
    }
    if (slide.chips) {
      const h = slide.chips.find((x) => x.id === hotspotId);
      if (h) return { quizId: h.quizId || 'distractor', ...h };
    }
    return null;
  }

  window.onHotspotSelect = function (hotspotId) {
    const data = findHotspotData(hotspotId);
    if (!data) return;

    const quizId = data.quizId;

    // If already correctly answered, notify
    if (quizId !== 'distractor' && quizAnswers[quizId] && quizAnswers[quizId].isCorrect) {
      showToast('Sudah Benar!', 'Soal ini sudah berhasil kamu selesaikan! ✅', true);
      return;
    }

    if (data.isCorrect) {
      // Correct!
      if (quizId && quizId !== 'distractor') {
        quizAnswers[quizId] = {
          selectedId: hotspotId,
          isCorrect: true,
        };
      }
      playCorrectSound();
      showToast('🎉 Benar Sekali!', data.explain || 'Jawabanmu sangat tepat! Hebat!', true);
      renderSlide('stay');
    } else {
      // WRONG ANSWER!
      playWrongSound();

      // Show temporary red border wobble on the clicked button
      const clickedBtn = document.querySelector(`[data-id="${hotspotId}"]`);
      if (clickedBtn) {
        clickedBtn.classList.remove('wrong');
        void clickedBtn.offsetWidth; // re-trigger animation
        clickedBtn.classList.add('wrong');
        setTimeout(() => {
          clickedBtn.classList.remove('wrong');
        }, 1200);
      }

      // Show step-by-step guidance notification modal WITHOUT revealing answer
      const explanation = data.wrongExplain || 'Coba perhatikan langkah-langkah pengerjaannya ya!';
      showExplanation(explanation);

      // Also trigger a toast notification
      showToast('💡 Belum Tepat', 'Yuk simak petunjuk cara pengerjaannya di layar!', false);
    }
  };

  // Backward-compatibility alias
  window.handleHotspotClick = function (quizId, hotspotId) {
    window.onHotspotSelect(hotspotId);
  };

  // Reset Quizzes
  window.resetAllQuizzes = function () {
    quizAnswers = {};
    showToast('Kuis Direset', 'Ayo coba selesaikan semua tantangan lagi! 🚀', true);
    goToSlide(6); // Jump to first quiz slide (Hal 7)
  };

  // ========== NAVIGATION ==========
  function goToSlide(targetIndex) {
    if (targetIndex < 0 || targetIndex >= slides.length || targetIndex === currentSlide) return;

    const direction = targetIndex > currentSlide ? 'next' : 'prev';
    currentSlide = targetIndex;
    playPageFlipSound();
    renderSlide(direction);

    // Scroll smoothly to book on mobile
    const bookCont = document.getElementById('bookContainer');
    if (bookCont) {
      bookCont.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  window.goToSlide = goToSlide;

  prevBtn.addEventListener('click', () => {
    if (currentSlide > 0) goToSlide(currentSlide - 1);
  });

  nextBtn.addEventListener('click', () => {
    if (currentSlide < slides.length - 1) goToSlide(currentSlide + 1);
  });

  // Keyboard Navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'PageDown') {
      if (currentSlide < slides.length - 1) goToSlide(currentSlide + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      if (currentSlide > 0) goToSlide(currentSlide - 1);
    } else if (e.key === 'Escape') {
      hideExplanation();
    }
  });

  // Touch Swipe Support
  let touchStartX = 0;
  let touchEndX = 0;
  const bookContainer = document.getElementById('bookContainer');

  if (bookContainer) {
    bookContainer.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    bookContainer.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0 && currentSlide < slides.length - 1) {
          goToSlide(currentSlide + 1);
        } else if (diff < 0 && currentSlide > 0) {
          goToSlide(currentSlide - 1);
        }
      }
    }, { passive: true });
  }

  // ========== THUMBNAILS ==========
  function buildThumbnails() {
    let html = '';
    slides.forEach((s, idx) => {
      const hasQuiz = s.type.includes('quiz');
      html += `
        <button class="thumb-item ${idx === 0 ? 'active' : ''} ${hasQuiz ? 'has-quiz' : ''}"
          onclick="window.goToSlide(${idx})"
          title="${escapeHtml(s.chapter)} (Hal. ${idx + 1})"
          aria-label="Halaman ${idx + 1}">
          ${idx + 1}
        </button>
      `;
    });
    thumbnailStripEl.innerHTML = html;
  }

  function updateThumbnails() {
    const thumbs = thumbnailStripEl.querySelectorAll('.thumb-item');
    thumbs.forEach((t, i) => {
      t.classList.toggle('active', i === currentSlide);
    });
  }

  // ========== TOOLBAR BUTTONS ==========
  // Sound Toggle
  soundBtn.addEventListener('click', () => {
    isSoundEnabled = !isSoundEnabled;
    soundIcon.textContent = isSoundEnabled ? '🔊' : '🔇';
    soundBtn.querySelector('.tool-label').textContent = isSoundEnabled ? 'Suara' : 'Mati';
    if (isSoundEnabled) {
      initAudio();
      playTone(523.25, 0.15);
    }
  });

  // Fullscreen Toggle
  fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Error enabling fullscreen:', err);
      });
      fullscreenBtn.querySelector('.tool-label').textContent = 'Kecilkan';
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        fullscreenBtn.querySelector('.tool-label').textContent = 'Layar Penuh';
      }
    }
  });

  document.addEventListener('fullscreenchange', () => {
    const isFs = !!document.fullscreenElement;
    fullscreenBtn.querySelector('.tool-label').textContent = isFs ? 'Kecilkan' : 'Layar Penuh';
  });

  // ========== ESCAPING UTILS ==========
  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[c]));
  }

  function escapeJs(str) {
    if (!str) return '';
    return String(str).replace(/'/g, "\\'").replace(/"/g, '&quot;');
  }

  // ========== INITIALIZATION ==========
  function init() {
    buildThumbnails();
    renderSlide('next');

    // Hide Splash after 1.8 seconds
    setTimeout(() => {
      splashEl.classList.add('hide');
      appEl.classList.remove('hidden');
      setTimeout(() => {
        splashEl.style.display = 'none';
      }, 600);
    }, 1800);
  }

  init();
})();
