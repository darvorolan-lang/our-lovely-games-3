# Our Little World

Game platformer berdua. Satu orang buat room, dia gabung pakai kode atau link.

## Struktur folder

```
our-little-world/
├── index.html
├── manifest.json
├── README.md
├── css/
│   └── style.css
├── js/
│   └── game.js
└── assets/
    ├── images/
    │   ├── backgrounds/   main-bg.png, game-bg.png, letter-bg.png, easteregg-bg.png
    │   ├── characters/    boy.png, boy_walk1.png, boy_walk2.png, girl.png, girl_walk1.png, girl_walk2.png
    │   ├── items/         heart.png, heart1.png..heart5.png (koin berputar), pet.png
    │   └── ui/            dialogue-box.png, arrow-left.png, arrow-right.png, pause.png
    ├── sounds/            bgm.mp3, click.mp3, heart.mp3, win.mp3
    └── fonts/             PressStart2P.ttf, PixelifySans.ttf
```

## Catatan

- Kalau sebuah file belum ada, game tetap jalan dan memakai gambar cadangan dari kode.
- Ukuran karakter diatur di `CHAR_H` di bagian atas `js/game.js`.
- Nama file harus persis sama, termasuk huruf kecil dan garis bawah.
