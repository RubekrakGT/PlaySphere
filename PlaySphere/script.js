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

/* ADD MUSIC */
addAlbum.onclick = () => picker.click();
picker.onchange = e => {
  [...e.target.files].filter(f => f.type.startsWith("audio")).forEach(file => {
    const album = file.webkitRelativePath.split("/").slice(-2, -1)[0];
    if (!albums[album]) albums[album] = [];
    albums[album].push(file);
  });
  renderAlbums();
};

/* ALBUM LIST */
function renderAlbums() {
  albumList.innerHTML = "";
  Object.keys(albums).forEach(name => {
    const card = document.createElement("div");
    card.className = "album-card";

    const img = document.createElement("div");
    img.textContent = "📁"; // <- emoji de carpeta
    img.style.fontSize = "28px";

    const span = document.createElement("span");
    span.textContent = name;

    card.onclick = () => loadAlbum(name);

    card.appendChild(img);
    card.appendChild(span);
    albumList.appendChild(card);
  });
}

/* LOAD ALBUM */
function loadAlbum(name) {
  currentAlbum = albums[name];
  albumTitle.textContent = name;
  songGrid.innerHTML = "";

  currentAlbum.forEach((song, i) => {
    const card = document.createElement("div");
    card.className = "songCard";

    const img = document.createElement("div");
    img.textContent = "♪"; // <- nota musical negra
    img.style.fontSize = "32px";
    img.style.display = "flex";
    img.style.justifyContent = "center";
    img.style.alignItems = "center";
    img.style.height = "120px";

    const p = document.createElement("p");
    p.textContent = song.name;

    card.onclick = () => playSong(i);

    card.appendChild(img);
    card.appendChild(p);
    songGrid.appendChild(card);
  });
}

/* PLAY */
function playSong(i) {
  currentIndex = i;
  audio.src = URL.createObjectURL(currentAlbum[i]);
  audio.play();
  songTitle.textContent = currentAlbum[i].name;
  artist.textContent = albumTitle.textContent;
  cover.style.display = "none";
  disc.style.display = "flex";
  playBtn.textContent = "⏸";
}

/* CONTROLS */
playBtn.onclick = () => {
  audio.paused ? audio.play() : audio.pause();
  playBtn.textContent = audio.paused ? "▶" : "⏸";
};

nextBtn.onclick = () => {
  if (shuffle) {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * currentAlbum.length);
    } while (currentAlbum.length > 1 && nextIndex === currentIndex);
    currentIndex = nextIndex;
  } else {
    currentIndex = (currentIndex + 1) % currentAlbum.length;
  }
  playSong(currentIndex);
};

prevBtn.onclick = () => {
  currentIndex = (currentIndex - 1 + currentAlbum.length) % currentAlbum.length;
  playSong(currentIndex);
};

shuffleBtn.onclick = () => {
  shuffle = !shuffle;
  shuffleBtn.classList.toggle("active", shuffle);
};

randomAlbumBtn.onclick = () => {
  const keys = Object.keys(albums);
  if (keys.length === 0) return;
  loadAlbum(keys[Math.floor(Math.random() * keys.length)]);
};

/* TIME */
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

/* VOLUME */
audio.volume = volumeSlider.value / 100;
volumeSlider.oninput = () => {
  audio.volume = volumeSlider.value / 100;
  const perc = volumeSlider.value;
  volumeSlider.style.background = `linear-gradient(to right, red 0%, red ${perc}%, green ${perc}%, green 100%)`;
};
volumeSlider.dispatchEvent(new Event("input"));

/* SONG END */
audio.onended = () => {
  if (shuffle) {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * currentAlbum.length);
    } while (currentAlbum.length > 1 && nextIndex === currentIndex);
    currentIndex = nextIndex;
  } else {
    currentIndex = (currentIndex + 1) % currentAlbum.length;
    }
    playSong(currentIndex);
};

/* MODALS */

const openInfo=document.getElementById("openInfo");
const openHow=document.getElementById("openHow");
const infoModal=document.getElementById("infoModal");
const howModal=document.getElementById("howModal");

openInfo.onclick=()=>infoModal.style.display="flex";
openHow.onclick=()=>howModal.style.display="flex";

function closeModals(){
infoModal.style.display="none";
howModal.style.display="none";
}
