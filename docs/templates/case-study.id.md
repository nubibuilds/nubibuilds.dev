---
# Template studi kasus (Bahasa Indonesia). Panduan: docs/writing-case-studies.md
# Salin ke src/content/work/id/<slug-proyek>.md dengan nama file yang SAMA dengan versi en/
# (URL: /id/work/<slug-proyek>), ganti setiap [[TODO: …]] dan hapus yang tidak dipakai, termasuk baris komentar ini.
# Build menolak menerbitkan (draft: false) selama masih ada [[TODO: …]].
# Samakan dengan versi en/: order, stack, year, repo, demo, youtube, dan path gambar.

title: "[[TODO: nama proyek]]"
summary: "[[TODO: satu kalimat: produk apa ini dan hasil yang dicapai]]"
year: "[[TODO: tahun proyek rilis, mis. 2026]]"
role: "[[TODO: peran Anda, mis. Lead engineer (full-stack)]]"
timeline: "[[TODO: mulai → selesai, mis. Mar 2026 → Jul 2026]]"
status: "[[TODO: Live, Diarsipkan, Berjalan …]]"
stack: ["[[TODO: teknologi]]", "[[TODO: teknologi]]"]
order: 0
draft: true
# featured: true                 # tampilkan di beranda
# publishedAt: 2026-07-01        # YYYY-MM-DD; yang lebih baru tampil dulu jika `order` sama

highlights:
  problem: "[[TODO: satu kalimat: siapa yang punya masalah dan berapa kerugiannya]]"
  architecture: "[[TODO: satu kalimat: keputusan utama dan kompromi yang diterima]]"
  implementation: "[[TODO: satu kalimat: bagaimana bagian tersulit dibangun]]"
  result: "[[TODO: satu kalimat: hasil yang terukur]]"

metrics:
  - value: "[[TODO: angka, mis. 28% → 9%]]"
    label: "[[TODO: apa yang diukur angka ini]]"
  - value: "[[TODO: angka]]"
    label: "[[TODO: apa yang diukur angka ini]]"

# repo: "https://github.com/<user>/<repo>"
# demo: "https://<situs-live>"

# cover: "../assets/<slug-proyek>/cover.png"
# coverAlt: "Apa yang terlihat di tangkapan layar"
# gallery:
#   - src: "../assets/<slug-proyek>/screen-1.png"
#     alt: "Apa yang terlihat di tangkapan layar"
#     caption: "Keterangan singkat"

# youtube: "<id video 11 karakter>"
# youtubeTitle: "Judul video"
---

## Masalah

[[TODO: kondisi sebelum proyek ini: siapa penggunanya, apa yang mereka lakukan, dan berapa biayanya (waktu, uang, kesalahan). Gunakan angka nyata jika ada.]]

[[TODO: mengapa alat yang ada atau cara sebelumnya tidak cukup.]]

**Batasan**

- [[TODO: ukuran tim dan waktu]]
- [[TODO: anggaran, skala, atau target performa]]
- [[TODO: syarat hukum, keamanan, atau platform (hapus baris ini jika tidak ada)]]

## Arsitektur

[[TODO: bentuk sistem dalam dua atau tiga kalimat, dan prinsip di baliknya.]]

```text
[[TODO: diagram ASCII komponen utama dan aliran datanya]]
```

### [[TODO: keputusan arsitektur, sebagai pernyataan singkat, mis. Satu database bersama yang diisolasi dengan row-level security]]

[[TODO: konteks yang memaksa adanya pilihan.]]

- **Alasan:** [[TODO: mengapa opsi ini cocok]]
- **Konsekuensi:** [[TODO: kompromi yang diterima, dan cara membatasinya]]

## Implementasi

[[TODO: bagian tersulit dari pembangunan: apa yang dicoba pertama, apa yang gagal, dan apa yang diubah.]]

```[[TODO: bahasa]] title="[[TODO: path/ke/file]]"
[[TODO: potongan kode terkecil yang menunjukkan ide utamanya]]
```

**Tahapan**

1. [[TODO: tahap pertama dan hasilnya]]
2. [[TODO: tahap berikutnya]]
3. [[TODO: peluncuran]]

## Hasil

[[TODO: apa yang berubah bagi pengguna dan bisnis, dengan angka yang sama seperti di `metrics`, dan cara mengukurnya.]]

**Yang akan saya lakukan berikutnya**

- [[TODO: perbaikan yang akan dibuat jika ada waktu lebih]]
- [[TODO: keterbatasan yang masih ada]]
