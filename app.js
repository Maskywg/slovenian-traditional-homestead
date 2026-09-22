/**
 * 斯洛維尼亞傳統農家：三大文明洗禮的風土史詩 | DIGITAL CURATION JAVASCRIPT
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initTriadTabs();
  initLeafletMap();
  initGalleryFilter();
  initAudioSynthesizer();
});

/* ==========================================================================
   1. NAVBAR & SCROLL BEHAVIOR
   ========================================================================== */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navToggleBtn = document.getElementById('nav-toggle-btn');
  const navLinks = document.getElementById('nav-links');

  // Scroll effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  if (navToggleBtn && navLinks) {
    navToggleBtn.addEventListener('click', () => {
      navLinks.classList.toggle('show');
    });

    // Close mobile menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('show');
      });
    });
  }
}

/* ==========================================================================
   2. TRIAD CIVILIZATION TABS
   ========================================================================== */
function initTriadTabs() {
  const tabs = document.querySelectorAll('.triad-tab');
  const panels = document.querySelectorAll('.triad-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');

      // Update tab active state
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Update panel active state
      panels.forEach(panel => {
        if (panel.id === `panel-${target}`) {
          panel.classList.add('active');
        } else {
          panel.classList.remove('active');
        }
      });
    });
  });
}

/* ==========================================================================
   3. INTERACTIVE LEAFLET MAP
   ========================================================================== */
const TERROIR_STATIONS = [
  {
    id: 'studor',
    title: 'Studor v Bohinju（博欣乾草架聚落）',
    category: '斯拉夫木構聚落',
    lat: 46.2917,
    lng: 13.9167,
    image: 'images/hero_kozolec.jpg',
    desc: '座落於特里格拉夫國家公園腳下，保存了斯洛維尼亞最壯觀的乾草架（Kozolci）群落，展現百年精湛的木工榫卯與通風風乾智慧。',
    tag: '木構國寶'
  },
  {
    id: 'velika-planina',
    title: 'Velika Planina（威利卡大高原）',
    category: '阿爾卑斯高山牧業',
    lat: 46.2980,
    lng: 14.6540,
    image: 'images/velika_planina.jpg',
    desc: '全歐現存最古老、最大規模的卵形雲杉木瓦高山牧民木屋群。在此傳承數百年的高山夏季輪牧與「愛情起司 Trnič」雕花模具工藝。',
    tag: '高山牧業'
  },
  {
    id: 'stanjel',
    title: 'Štanjel & Kras（喀斯特石造城堡村）',
    category: '拉丁石造風土',
    lat: 45.8239,
    lng: 13.8447,
    image: 'images/stanjel_stone_village.jpg',
    desc: '典型的喀斯特防風石屋聚落。以厚重石灰岩構築封閉式合院、雕花拱門（Porton）與集雨石井，抵禦強勁的東北布拉強風（Bora）。',
    tag: '防風石造'
  },
  {
    id: 'brda',
    title: 'Goriška Brda & Collio（布達丘陵）',
    category: '跨國界風土葡萄酒',
    lat: 45.9980,
    lng: 13.5350,
    image: 'images/goriska_brda_vineyard.jpg',
    desc: '橫跨斯洛維尼亞與義大利東北的「地中海陽光階梯」。以梯田葡萄園、橄欖樹與古法陶甕（Amphora）浸皮橙酒（Orange Wine）聞名世界。',
    tag: '自然橘酒'
  },
  {
    id: 'ptuj',
    title: 'Ptuj & Haloze（普圖伊古城與丘陵）',
    category: '斯拉夫春耕民俗',
    lat: 46.4200,
    lng: 15.8700,
    image: 'images/kurent_festival.jpg',
    desc: '斯洛維尼亞最古老城鎮與丘陵農村，被列入聯合國非物質文化遺產的「庫倫特（Kurent）」祭典在此發源，象徵驅逐冬魔、祈求農田大地豐饒。',
    tag: '非遺民俗'
  },
  {
    id: 'ribnica',
    title: 'Ribnica & Rogatec（木器工藝與露天農莊）',
    category: '傳統農具工藝',
    lat: 45.7400,
    lng: 14.7300,
    image: 'images/woodcraft_carving.jpg',
    desc: '擁有數百年皇家特許專利的「木器工藝（Suha roba）」發源地，農民世代雕琢木匙、木耙與起司印模；周邊設有完整露天農家生態博物館。',
    tag: '木器手工'
  }
];

let mapInstance = null;
let markersMap = {};

function initLeafletMap() {
  const mapElement = document.getElementById('terroir-map');
  if (!mapElement) return;

  // Initialize Leaflet Map centered on Slovenia
  mapInstance = L.map('terroir-map', {
    center: [46.12, 14.65],
    zoom: 8,
    scrollWheelZoom: false
  });

  // Warm CartoDB / Esri Topo Layer for Terroir aesthetic
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
    maxZoom: 18,
    subdomains: 'abcd'
  }).addTo(mapInstance);

  const trailListContainer = document.getElementById('trail-list');
  trailListContainer.innerHTML = '';

  // Custom Gold Pin Icon
  const createCustomIcon = (active = false) => {
    return L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="
          width: ${active ? '36px' : '28px'};
          height: ${active ? '36px' : '28px'};
          background: ${active ? '#d4af37' : '#181d1b'};
          border: 2px solid ${active ? '#ffffff' : '#d4af37'};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${active ? '#111' : '#d4af37'};
          font-size: ${active ? '14px' : '11px'};
          box-shadow: 0 4px 14px rgba(0,0,0,0.6);
          transition: all 0.3s ease;
        ">
          <i class="fa-solid fa-wheat-awn"></i>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -18]
    });
  };

  // Add Markers and build Sidebar
  TERROIR_STATIONS.forEach((station, index) => {
    // Leaflet Marker
    const marker = L.marker([station.lat, station.lng], {
      icon: createCustomIcon(false)
    }).addTo(mapInstance);

    const popupHtml = `
      <div style="font-family: 'Noto Serif TC', serif; max-width: 240px; padding: 4px;">
        <img src="${station.image}" style="width: 100%; height: 110px; object-fit: cover; border-radius: 6px; margin-bottom: 8px;">
        <span style="font-size: 11px; background: rgba(212,175,55,0.2); color: #aa8c2c; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${station.category}</span>
        <h4 style="font-size: 14px; margin: 6px 0 4px; color: #111; font-weight: bold;">${station.title}</h4>
        <p style="font-size: 12px; line-height: 1.5; color: #444; margin: 0;">${station.desc}</p>
      </div>
    `;
    marker.bindPopup(popupHtml);

    markersMap[station.id] = marker;

    // Sidebar Item
    const itemEl = document.createElement('div');
    itemEl.className = `trail-item ${index === 0 ? 'active' : ''}`;
    itemEl.id = `trail-item-${station.id}`;
    itemEl.innerHTML = `
      <div class="trail-item-header">
        <h4 class="trail-item-title">${station.title}</h4>
        <span class="trail-item-tag">${station.tag}</span>
      </div>
      <p class="trail-item-desc">${station.desc}</p>
    `;

    itemEl.addEventListener('click', () => {
      selectStation(station.id);
    });

    trailListContainer.appendChild(itemEl);

    marker.on('click', () => {
      highlightSidebarItem(station.id);
    });
  });

  // Default focus on first station
  if (TERROIR_STATIONS.length > 0) {
    selectStation(TERROIR_STATIONS[0].id, false);
  }
}

function selectStation(stationId, openPopup = true) {
  const station = TERROIR_STATIONS.find(s => s.id === stationId);
  const marker = markersMap[stationId];
  if (!station || !marker || !mapInstance) return;

  mapInstance.flyTo([station.lat, station.lng], 10, {
    duration: 1.2
  });

  if (openPopup) {
    marker.openPopup();
  }

  highlightSidebarItem(stationId);
}

function highlightSidebarItem(stationId) {
  document.querySelectorAll('.trail-item').forEach(item => {
    item.classList.remove('active');
  });
  const currentItem = document.getElementById(`trail-item-${stationId}`);
  if (currentItem) {
    currentItem.classList.add('active');
    currentItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

/* ==========================================================================
   4. GALLERY FILTER & LIGHTBOX MODAL
   ========================================================================== */
function initGalleryFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      galleryItems.forEach(item => {
        const cat = item.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

// Lightbox Modal Controls (Global functions for inline onclick)
window.openLightbox = function(imgSrc, title, desc) {
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightbox-img');
  const lbTitle = document.getElementById('lightbox-title');
  const lbDesc = document.getElementById('lightbox-desc');

  if (lightbox && lbImg && lbTitle && lbDesc) {
    lbImg.src = imgSrc;
    lbTitle.textContent = title;
    lbDesc.textContent = desc;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
};

window.closeLightbox = function(event) {
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }
};

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    window.closeLightbox();
  }
});

/* ==========================================================================
   5. WEB AUDIO SYNTHESIZER: ALPINE FIELD SOUNDSCAPE
   ========================================================================== */
let audioCtx = null;
let isPlayingSound = false;
let soundIntervals = [];

function initAudioSynthesizer() {
  const soundBtn = document.getElementById('sound-toggle-btn');
  const soundLabel = document.getElementById('sound-label');

  if (!soundBtn) return;

  soundBtn.addEventListener('click', () => {
    if (!isPlayingSound) {
      startAmbientSound();
      soundBtn.classList.add('playing');
      soundBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i> <span id="sound-label">田野環境原音（播放中）</span>';
      isPlayingSound = true;
    } else {
      stopAmbientSound();
      soundBtn.classList.remove('playing');
      soundBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i> <span id="sound-label">田野環境原音</span>';
      isPlayingSound = false;
    }
  });
}

function startAmbientSound() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  // 1. Alpine Mountain Wind Generator (Pink noise filter)
  const bufferSize = audioCtx.sampleRate * 2;
  const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    output[i] = (b0 + b1 + b2) * 0.04;
  }

  const whiteNoise = audioCtx.createBufferSource();
  whiteNoise.buffer = noiseBuffer;
  whiteNoise.loop = true;

  const bandpass = audioCtx.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.value = 320;
  bandpass.Q.value = 1.8;

  const gainNode = audioCtx.createGain();
  gainNode.gain.setValueAtTime(0.35, audioCtx.currentTime);

  whiteNoise.connect(bandpass);
  bandpass.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  whiteNoise.start();

  // 2. Periodic Distant Cowbell Chimes (Harmonic metallic synthesizer)
  const chimeInterval = setInterval(() => {
    if (!isPlayingSound || !audioCtx) return;
    playCowbellChime();
  }, 4500);

  soundIntervals.push({ stop: () => whiteNoise.stop(), interval: chimeInterval });
}

function playCowbellChime() {
  if (!audioCtx) return;
  const fundamental = 540 + Math.random() * 120; // 540Hz ~ 660Hz typical brass cowbell
  const harmonics = [1, 1.48, 2.08, 2.76];

  harmonics.forEach(ratio => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(fundamental * ratio, audioCtx.currentTime);

    const now = audioCtx.currentTime;
    gain.gain.setValueAtTime(0.04 / ratio, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 1.25);
  });
}

function stopAmbientSound() {
  soundIntervals.forEach(item => {
    if (item.stop) item.stop();
    if (item.interval) clearInterval(item.interval);
  });
  soundIntervals = [];
}
