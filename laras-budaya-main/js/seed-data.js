/* =========================================================
   LARAS BUDAYA — Initial Seed Data
   Default catalog products, categories, demo users, banners, vouchers, etc.
   ========================================================= */

const SEED_CATEGORIES = [
  {id:'cat-kain', nama:'Kain Lurik', icon:'🧵'},
  {id:'cat-blangkon', nama:'Blangkon', icon:'👳'},
  {id:'cat-sampur', nama:'Sampur Tari', icon:'💃'},
  {id:'cat-beskap', nama:'Beskap', icon:'🎽'},
  {id:'cat-kebaya', nama:'Kebaya', icon:'👘'},
  {id:'cat-aksesoris', nama:'Aksesoris Tari', icon:'✨'},
];

const SEED_PRODUCTS = [
  {id:'p001', nama:'Selendang Kebaya Chiffon Polos Murah Ecer Dan Grosir Ukuran 2 Meter Warna Warni Panjang Sifon Polos untuk Dewasa', kategori:'cat-sampur',
    harga:35000, hargaAsli:45000, stok:50, terjual:210, rating:4.8, jumlahReview:45,
    badge:['best','promo'], warna:['Merah','Kuning','Hijau','Biru','Pink'], ukuran:['2 Meter'], model:['Chiffon Polos'],
    deskripsi:'Selendang kebaya chiffon polos ukuran 2 meter dengan bahan sifon yang jatuh, ringan, dan warna-warni cantik. Cocok untuk pelengkap kebaya dewasa maupun pentas seni.',
    spesifikasi:{Bahan:'Chiffon / Sifon', Panjang:'2 Meter', Perawatan:'Cuci tangan secara lembut'},
    foto:['assets/img/1.jpeg']},
  {id:'p002', nama:'Selendang Tari Ronce Anak Kecil TK / PAUD Sampor Tari Anak Selendang Tari Anak Sampur Murah PAYET 150 X 20', kategori:'cat-sampur',
    harga:28000, hargaAsli:35000, stok:40, terjual:180, rating:4.9, jumlahReview:38,
    badge:['terlaris'], warna:['Merah Payet','Kuning Payet','Hijau Payet'], ukuran:['150 x 20 cm'], model:['Payet Ronce'],
    deskripsi:'Selendang tari ronce khusus untuk anak TK/PAUD dengan aksen payet yang menarik. Ringan dan pas di bahu anak-anak saat menari.',
    spesifikasi:{Bahan:'Sintetis & Payet', Ukuran:'150 x 20 cm', Perawatan:'Jangan disikat'},
    foto:['assets/img/2.jpeg']},
  {id:'p003', nama:'Setelan Baju Adat Jawa - Surjan Kembang Pria Dewasa – Baju Adat Jawa Beskap Motif Bunga | Size S-XXL, 4L & 5L Jumbo Blangkon, Jarik dan Baju', kategori:'cat-beskap',
    harga:285000, hargaAsli:320000, stok:15, terjual:95, rating:4.8, jumlahReview:29,
    badge:['best','promo'], warna:['Motif Bunga Coklat','Motif Bunga Hitam'], ukuran:['S','M','L','XL','XXL','4L','5L'], model:['Surjan Kembang Setelan'],
    deskripsi:'Setelan baju adat Jawa surjan motif kembang/bunga lengkap dengan baju, blangkon, dan jarik. Tersedia hingga ukuran jumbo 5L.',
    spesifikasi:{Bahan:'Katun Tenun Motif Bunga', Isi:'Baju + Jarik + Blangkon', Asal:'Surakarta'},
    foto:['assets/img/3.jpeg']},
  {id:'p004', nama:'Setelan Baju Adat Jawa 3 in 1 Blangkon Hitam Model Jogja Sliwir, Baju Surjan Lurik Coklat, Jarik Sembong Instan Perekat Tinggal Pakai', kategori:'cat-beskap',
    harga:265000, hargaAsli:290000, stok:20, terjual:112, rating:4.9, jumlahReview:34,
    badge:['best'], warna:['Coklat Lurik'], ukuran:['M','L','XL','XXL'], model:['3 in 1 Jogja Sliwir'],
    deskripsi:'Setelan komplit 3 in 1 terdiri dari Blangkon Jogja Sliwir, Baju Surjan Lurik Coklat, dan Jarik Sembong Instan pakai perekat praktis.',
    spesifikasi:{Bahan:'Tenun Lurik & Katun Batik', Isi:'Surjan + Blangkon Sliwir + Sembong Instan', Perawatan:'Cuci biasa / tangan'},
    foto:['assets/img/4.jpeg']},
  {id:'p005', nama:'Blangkon Jogja Kagok Sliwir Dewasa Jogja Samurai Hitam Putih Coklat Dewasa Polos Hitam Sliwir Jogja', kategori:'cat-blangkon',
    harga:95000, hargaAsli:110000, stok:30, terjual:145, rating:4.7, jumlahReview:22,
    badge:['new'], warna:['Hitam Polos','Coklat','Hitam Putih'], ukuran:['55','56','57','58','59'], model:['Kagok Sliwir Jogja'],
    deskripsi:'Blangkon gaya Jogja Kagok Sliwir dewasa dengan ekor sliwir di belakang. Sangat pas digunakan pada pentas tari maupun upacara adat.',
    spesifikasi:{Bahan:'Batik Katun', Bentuk:'Jogja Sliwir', Asal:'Yogyakarta'},
    foto:['assets/img/5.jpeg']},
  {id:'p006', nama:'Udeng cak surabaya / blangkon surabaya / udeng tari remo Ikat Kepala Khas Adat Indonesia', kategori:'cat-blangkon',
    harga:75000, hargaAsli:85000, stok:25, terjual:88, rating:4.6, jumlahReview:18,
    badge:['promo'], warna:['Merah Hitam','Batik Etnik'], ukuran:['All Size Dewasa'], model:['Udeng Remo / Surabaya'],
    deskripsi:'Udeng khas Surabaya / Jawatimuran cocok untuk tarian Remo maupun busana adat khas Jawa Timur. Nyaman dan praktis dipakai.',
    spesifikasi:{Bahan:'Katun Batik', Jenis:'Udeng Cak / Tari Remo', Asal:'Jawa Timur'},
    foto:['assets/img/6.jpeg']},
  {id:'p007', nama:'Surjan Lurik Jawa Pria Abu Hitam Hitam Putih Baju adat surjan lurik S M L XL XXL 4L 5L Jumbo', kategori:'cat-kain',
    harga:135000, hargaAsli:150000, stok:35, terjual:160, rating:4.8, jumlahReview:40,
    badge:['best'], warna:['Abu-Hitam','Hitam-Putih'], ukuran:['S','M','L','XL','XXL','4L','5L'], model:['Surjan Lurik Pria'],
    deskripsi:'Baju Surjan Lurik tradisional Jawa untuk pria dengan variasi warna abu-hitam dan hitam-putih. Bahan tenun adem dan halus.',
    spesifikasi:{Bahan:'Tenun Katun Lurik', Ukuran:'S hingga 5L Jumbo', Asal:'Klaten / Solo'},
    foto:['assets/img/7.jpeg']},
  {id:'p008', nama:'Kebaya Lurik Wanita Model Kutubaru – Baju Adat Jawa Surjan Lurik Jogja Solo | Bahan Tenun Tebal | Size S–4L -', kategori:'cat-kebaya',
    harga:145000, hargaAsli:165000, stok:22, terjual:130, rating:4.8, jumlahReview:31,
    badge:['promo'], warna:['Coklat Classic','Hitam Garis','Marun Lurik'], ukuran:['S','M','L','XL','XXL','3L','4L'], model:['Kutubaru Lurik'],
    deskripsi:'Kebaya lurik wanita model Kutubaru dari bahan tenun tebal berkualitas tinggi. Anggun dan tradisional khas Jogja-Solo.',
    spesifikasi:{Bahan:'Tenun Lurik Tebal', Model:'Kutubaru', Asal:'Solo / Jogja'},
    foto:['assets/img/8.jpeg']},
  {id:'p009', nama:'kebaya lurik anak perempuan pakaian adat anak perempuan baju adat jawa anak', kategori:'cat-kebaya',
    harga:85000, hargaAsli:95000, stok:30, terjual:92, rating:4.7, jumlahReview:20,
    badge:['new'], warna:['Coklat Lurik','Merah Lurik'], ukuran:['S (Anak)','M (Anak)','L (Anak)','XL (Anak)'], model:['Kebaya Anak Traditional'],
    deskripsi:'Kebaya lurik untuk anak perempuan, cocok untuk Hari Kartini, festival budaya, maupun pentas sekolah. Bahan adem dan halus.',
    spesifikasi:{Bahan:'Katun Tenun Halus', Usia:'2 - 10 Tahun', Perawatan:'Cuci biasa'},
    foto:['assets/img/9.jpeg']},
  {id:'p010', nama:'Baju lurik wanita abu hitam / hitam putih Baju kebaya adat jawa Baju surjan lurik wanita Kebaya lurik jogja solo Surjan', kategori:'cat-kebaya',
    harga:140000, hargaAsli:160000, stok:18, terjual:74, rating:4.6, jumlahReview:15,
    badge:['best'], warna:['Abu-Hitam','Hitam-Putih'], ukuran:['S','M','L','XL','XXL'], model:['Surjan Lurik Wanita'],
    deskripsi:'Baju kebaya surjan lurik wanita bernuansa abu-hitam dan hitam-putih. Potongan rapi dan nyaman untuk pemakaian seharian.',
    spesifikasi:{Bahan:'Katun Tenun', Asal:'Jawa Tengah', Model:'Kebaya Surjan'},
    foto:['assets/img/10.jpeg']},
  {id:'p011', nama:'Baju Lurik Anak Laki-laki Surjan Anak Murah Baju Adat Anak', kategori:'cat-beskap',
    harga:75000, hargaAsli:85000, stok:40, terjual:115, rating:4.8, jumlahReview:28,
    badge:['promo'], warna:['Coklat Lurik','Hijau Lurik'], ukuran:['S (TK)','M (SD)','L (SD)','XL (Anak)'], model:['Surjan Anak'],
    deskripsi:'Baju surjan lurik anak laki-laki dengan harga terjangkau. Cocok untuk acara adat sekolah, pawai budaya, dan foto keluarga.',
    spesifikasi:{Bahan:'Katun Tenun', Perawatan:'Bisa dicuci mesin', Asal:'Solo'},
    foto:['assets/img/11.jpeg']},
  {id:'p012', nama:'Setelan Baju Surjan Lurik Dewasa + Jarik Tapih Sembongan + Blangkon Busana Adat Jawa Elegan & Berkelas', kategori:'cat-beskap',
    harga:295000, hargaAsli:340000, stok:12, terjual:68, rating:4.9, jumlahReview:21,
    badge:['best','new'], warna:['Lurik Coklat Klasik'], ukuran:['M','L','XL','XXL'], model:['Setelan Full Adat'],
    deskripsi:'Setelan busana adat Jawa dewasa super elegan, terdiri dari baju surjan lurik, jarik tapih sembongan, dan blangkon serasi.',
    spesifikasi:{Bahan:'Tenun Premium & Batik', Isi:'Surjan + Jarik Tapih + Blangkon', Perawatan:'Dry clean / Cuci tangan'},
    foto:['assets/img/12.jpeg']},
  {id:'p013', nama:'Baju Surjan Lurik PRIA Dewasa Size S M L XL XXL 4L dan 5L Baju Tenun Lurik Jumbo Murah Tenun Ready', kategori:'cat-beskap',
    harga:130000, hargaAsli:145000, stok:30, terjual:150, rating:4.7, jumlahReview:36,
    badge:['terlaris'], warna:['Coklat Hitam','Hijau Lurik','Marun Lurik'], ukuran:['S','M','L','XL','XXL','4L','5L'], model:['Surjan Lurik Pria'],
    deskripsi:'Baju Surjan Lurik Pria Dewasa ready stock berbagai ukuran hingga jumbo 5L. Kain tenun tidak panas dan nyaman dipadukan dengan sarung atau jarik.',
    spesifikasi:{Bahan:'Tenun Katun', Ukuran:'Standard & Jumbo', Asal:'Jawa Tengah'},
    foto:['assets/img/13.jpeg']},
  {id:'p014', nama:'Blangkon Solo Batik Dewasa Murah Grosir dan Ecer Pakaian Adat Ikat Kepala Adat Jawa Topi Jawa', kategori:'cat-blangkon',
    harga:85000, hargaAsli:95000, stok:28, terjual:105, rating:4.8, jumlahReview:27,
    badge:['promo'], warna:['Coklat Sogan','Hitam Batik'], ukuran:['56','57','58','59'], model:['Solo Batik'],
    deskripsi:'Blangkon Solo khas Surakarta berbahan kain batik bermotif tradisional. Pilihan tepat untuk melengkapi busana beskap atau surjan.',
    spesifikasi:{Bahan:'Batik Katun', Bentuk:'Solo (Mondolan Belakang)', Asal:'Surakarta'},
    foto:['assets/img/14.jpeg']},
];

const SEED_USERS = [{
  id:'u-demo', nama:'Djati Nugroho', email:'djati@example.com', whatsapp:'081234567890',
  alamat:'Jl. Mertoyudan No. 12, Magelang, Jawa Tengah', password:'demo123', foto:''
}];

const SEED_REVIEWS = [
  {id:'rv_demo1', productId:'p003', userId:'u-demo', userName:'Ratri A.', rating:5, comment:'Bahan lembut dan warnanya cantik sekali, sesuai untuk pentas tari sekolah anak saya.', photo:'', verified:true, createdAt:new Date().toISOString()},
  {id:'rv_demo2', productId:'p003', userId:'u-demo', userName:'Budi S.', rating:5, comment:'Pengiriman cepat, jahitannya sangat rapi.', photo:'', verified:true, createdAt:new Date().toISOString()},
  {id:'rv_demo3', productId:'p005', userId:'u-demo', userName:'Wulan K.', rating:4, comment:'Blangkon bagus, ukuran pas dan presisi.', photo:'', verified:true, createdAt:new Date().toISOString()},
];

const SEED_CHATS = [{
  id:'chat-demo', userId:'u-demo', productId:'p003',
  messages:[
    {from:'user', text:'Halo kak, produk ini masih ready ya?', time:new Date().toISOString(), read:true},
    {from:'admin', text:'Halo kak Djati, masih ready kak, stok tersedia 🙏', time:new Date().toISOString(), read:true},
  ]
}];

const SEED_NOTIFICATIONS = [
  {id:'nt_demo1', userId:'u-demo', text:'Selamat datang di Laras Budaya! Jelajahi koleksi busana tradisional kami.', type:'info', read:false, createdAt:new Date().toISOString()},
  {id:'nt_demo2', userId:'u-demo', text:'Voucher baru LARAS10 tersedia, diskon 10% untuk semua produk.', type:'voucher', read:false, createdAt:new Date().toISOString()},
];

const SEED_VOUCHERS = [
  {code:'LARAS10', type:'percent', value:10, minPurchase:100000, active:true},
  {code:'ONGKIR20', type:'fixed', value:20000, minPurchase:150000, active:true},
  {code:'BUDAYA50', type:'fixed', value:50000, minPurchase:400000, active:true},
];

const SEED_BANNERS = [
  {id:'bn_demo1', title:'Koleksi Kain Lurik Tenun Tangan', subtitle:'Diskon hingga 25% minggu ini', image:'assets/img/4.jpeg', link:'produk.html?kategori=cat-kain'},
];
