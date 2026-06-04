const picker = document.getElementById("folderPicker");
const addAlbum = document.getElementById("addAlbum");
const randomAlbumBtn = document.getElementById("randomAlbum");
const albumList = document.getElementById("albumList");
const songGrid = document.getElementById("songGrid");
const audio = document.getElementById("audio");
const playBtn = document.getElementById("play");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const shuffleBtn = document.getElementById("shuffle");
const cover = document.getElementById("cover");
const disc = document.getElementById("discPlaceholder");
const songTitle = document.getElementById("songTitle");
const artist = document.getElementById("artist");
const albumTitle = document.getElementById("albumTitle");
const progress = document.getElementById("progress");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");
const volumeSlider = document.getElementById("volume");

let albums = {};
let currentAlbum = [];
let currentIndex = 0;
let shuffle = false;

// VARIABLES DE COLA E HISTORIAL
let playbackHistory = [];
let playQueue = [];

/* ADD MUSIC */
addAlbum.onclick = () => picker.click();
picker.onchange = e => {
  [...e.target.files].filter(f => f.type.startsWith("audio")).forEach(file => {
    const album = file.webkitRelativePath.split("/").slice(-2, -1)[0] || "Varios";
    if (!albums[album]) albums[album] = [];
    albums[album].push(file);
  });
  renderAlbums();
};

function renderAlbums() {
  albumList.innerHTML = "";
  Object.keys(albums).forEach(name => {
    const card = document.createElement("div");
    card.className = "album-card";
    card.innerHTML = `<div style="font-size:24px">📁</div><span>${name}</span>`;
    card.onclick = () => loadAlbum(name);
    albumList.appendChild(card);
  });
}

function loadAlbum(name) {
  currentAlbum = albums[name];
  albumTitle.textContent = name;
  playbackHistory = []; // Reset historial al cambiar album
  renderSongList(currentAlbum);
}

function renderSongList(list) {
  songGrid.innerHTML = "";
  list.forEach((song, i) => {
    const card = document.createElement("div");
    card.className = "songCard";
    card.style.position = "relative";

    const img = document.createElement("div");
    img.textContent = "♪";
    img.className = "songPlaceholder";

    const p = document.createElement("p");
    p.textContent = song.name;

    // BOTÓN DE COLA (+)
    const qBtn = document.createElement("button");
    qBtn.textContent = "➕";
    qBtn.style.cssText = "position:absolute; top:5px; right:5px; background:var(--accent); border:none; border-radius:4px; color:white; cursor:pointer; font-size:10px; padding:2px 5px; z-index:10;";
    qBtn.onclick = (e) => {
        e.stopPropagation();
        playQueue.push(song);
        alert(`Añadida a la cola: ${song.name}`);
    };

    card.onclick = () => playSong(currentAlbum.indexOf(song));
    card.appendChild(qBtn);
    card.appendChild(img);
    card.appendChild(p);
    songGrid.appendChild(card);
  });
}

function renderAlbumFiltered(list) {
    renderSongList(list);
}

/* PLAY */
function playSong(i, isRemote = false) {
  currentIndex = i;
  const file = currentAlbum[i];
  if (!file && !isRemote) return;

  if (!isRemote) {
    audio.src = URL.createObjectURL(file);
    songTitle.textContent = file.name;
    artist.textContent = albumTitle.textContent;
    
    // Guardar en historial para el botón anterior
    if (playbackHistory[playbackHistory.length - 1] !== i) {
        playbackHistory.push(i);
    }

    if (connection) {
        connection.send({ type: 'TRANSFER', file: file, name: file.name });
    }
  }

  audio.play();
  cover.style.display = "none";
  disc.style.display = "flex";
  playBtn.textContent = "⏸";
}

/* CONTROLS */
playBtn.onclick = () => {
  if (audio.paused) {
    audio.play();
    if (connection) connection.send({ type: 'RESUME' });
  } else {
    audio.pause();
    if (connection) connection.send({ type: 'PAUSE' });
  }
  playBtn.textContent = audio.paused ? "▶" : "⏸";
};

nextBtn.onclick = () => {
  // 1. Prioridad a la cola
  if (playQueue.length > 0) {
      const nextInQueue = playQueue.shift();
      const qIndex = currentAlbum.indexOf(nextInQueue);
      if (qIndex !== -1) {
          playSong(qIndex);
      } else {
          audio.src = URL.createObjectURL(nextInQueue);
          songTitle.textContent = nextInQueue.name + " (Cola)";
          audio.play();
      }
      return;
  }

  // 2. Aleatorio inteligente o normal
  if (shuffle) {
    currentIndex = Math.floor(Math.random() * currentAlbum.length);
  } else {
    currentIndex = (currentIndex + 1) % currentAlbum.length;
  }
  playSong(currentIndex);
};

prevBtn.onclick = () => {
  if (playbackHistory.length > 1) {
    playbackHistory.pop(); // Actual
    const lastIndex = playbackHistory.pop(); // Anterior
    playSong(lastIndex);
  } else {
    currentIndex = (currentIndex - 1 + currentAlbum.length) % currentAlbum.length;
    playSong(currentIndex);
  }
};

shuffleBtn.onclick = () => {
  shuffle = !shuffle;
  shuffleBtn.classList.toggle("active", shuffle);
};

randomAlbumBtn.onclick = () => {
  const keys = Object.keys(albums);
  if (keys.length > 0) loadAlbum(keys[Math.floor(Math.random() * keys.length)]);
};

/* AUDIO EVENTS */
audio.ontimeupdate = () => {
  progress.value = (audio.currentTime / audio.duration) * 100 || 0;
  currentTimeEl.textContent = format(audio.currentTime);
  durationEl.textContent = format(audio.duration);
};
progress.oninput = () => {
  audio.currentTime = (progress.value / 100) * audio.duration;
};
function format(sec) {
  if (!sec) return "0:00";
  return `${Math.floor(sec / 60)}:${Math.floor(sec % 60).toString().padStart(2, "0")}`;
}

audio.volume = volumeSlider.value / 100;
volumeSlider.oninput = () => {
  audio.volume = volumeSlider.value / 100;
  volumeSlider.style.background = `linear-gradient(to right, red 0%, red ${volumeSlider.value}%, green ${volumeSlider.value}%, green 100%)`;
};

audio.onended = () => {
  nextBtn.click();
};

/* MODALS */
const infoModal = document.getElementById("infoModal");
const howModal = document.getElementById("howModal");
document.getElementById("openInfo").onclick = () => infoModal.style.display = "flex";
document.getElementById("openHow").onclick = () => howModal.style.display = "flex";
function closeModals() { 
    infoModal.style.display = "none"; 
    howModal.style.display = "none"; 
}

/* SEARCH & SORT */
const searchSong = document.getElementById("searchSong");
const sortSong = document.getElementById("sortSong");

searchSong.oninput = () => {
    let filtered = currentAlbum.filter(s => s.name.toLowerCase().includes(searchSong.value.toLowerCase()));
    const order = sortSong.value;
    if(order === "asc") filtered.sort((a,b) => a.name.localeCompare(b.name));
    if(order === "desc") filtered.sort((a,b) => b.name.localeCompare(a.name));
    renderAlbumFiltered(filtered);
};

sortSong.onchange = () => {
    searchSong.dispatchEvent(new Event('input'));
};

/* JAM LOGIC */
let peer = null;
let connection = null;

function setupJam() {
    peer.on('open', id => {
        document.getElementById('myIdDisplay').textContent = id;
        document.getElementById('jam-setup').style.display = 'none';
        document.getElementById('jam-info').style.display = 'block';
    });
    peer.on('connection', conn => {
        connection = conn;
        listenData();
    });
}

function listenData() {
    connection.on('data', data => {
        if (data.type === 'TRANSFER') {
            const blob = new Blob([data.file]);
            audio.src = URL.createObjectURL(blob);
            audio.play();
            songTitle.textContent = data.name + " (Remoto)";
            artist.textContent = "Jam Session";
            playSong(0, true);
        } else if (data.type === 'PAUSE') {
            audio.pause();
            playBtn.textContent = "▶";
        } else if (data.type === 'RESUME') {
            audio.play();
            playBtn.textContent = "⏸";
        }
    });
}

document.getElementById('createJam').onclick = () => {
    peer = new Peer(undefined, { config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }] } });
    setupJam();
};

document.getElementById('joinJam').onclick = () => {
    const id = document.getElementById('joinId').value;
    if(!id) return;
    peer = new Peer(undefined, { config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }] } });
    peer.on('open', () => {
        connection = peer.connect(id);
        setupJam();
        listenData();
    });
};