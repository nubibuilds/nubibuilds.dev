---
title: "Satu garis miring, dua URL: saat canonical dan hreflang berbeda"
summary: "Pemeriksaan sebelum rilis menemukan link canonical saya berakhiran garis miring, sedangkan link hreflang tidak. Kenapa itu penting, dan satu aturan yang memperbaikinya."
date: 2026-11-22
tags: ["seo", "astro", "i18n"]
draft: false
---

Tepat sebelum situs ini online, semua pemeriksaan saya hijau: type-check bersih, semua test end-to-end lolos, dan skor SEO Lighthouse 100 di setiap halaman yang saya ukur. Lalu satu kali baca ulang HTML hasil build menemukan sesuatu yang tidak diperiksa oleh satu pun dari pemeriksaan itu. Halaman yang sama menyebut dua alamat berbeda untuk dirinya sendiri, dan bedanya cuma satu karakter di akhir.

## Apa kata HTML-nya

Ini `<head>` halaman `/work` seperti yang dihasilkan build:

```html title="dist/work/index.html"
<link rel="canonical" href="https://nubibuilds.dev/work/">
<link rel="alternate" hreflang="en" href="https://nubibuilds.dev/work">
<link rel="alternate" hreflang="id" href="https://nubibuilds.dev/id/work">
<link rel="alternate" hreflang="x-default" href="https://nubibuilds.dev/work">
```

Link canonical bilang alamat aslinya `/work/`, dengan garis miring. Link `hreflang`, yang memberi tahu mesin pencari mana versi bahasa Inggris dan mana versi bahasa Indonesia, bilang `/work`, tanpa garis miring. Sitemap memakai garis miring. Link navigasi tidak.

Bagi manusia, `/work` dan `/work/` adalah halaman yang sama. Bagi mesin pencari, itu dua URL. Tergantung host-nya, salah satunya jadi redirect atau jadi salinan kedua dari konten yang sama.

## Kenapa satu karakter itu penting

Setiap tag tadi adalah sinyal tentang URL mana yang asli. Panduan Google tentang URL duplikat tegas soal mencampur sinyal:[^1]

> Don't specify different URLs as canonical for the same page using different canonicalization techniques.

Artinya: jangan menyebut URL yang berbeda sebagai canonical untuk halaman yang sama lewat cara yang berbeda. Halaman yang sama juga meminta link internal mengarah ke URL canonical, bukan ke duplikatnya, dan `hreflang` menyebut halaman canonical. Panduan `hreflang`-nya menambahkan bahwa setiap versi bahasa harus mencantumkan dirinya sendiri dan semua versi lainnya.[^2] Halaman bahasa Inggris saya mencantumkan `/work` sebagai dirinya, padahal menyatakan `/work/` sebagai canonical. Pasangan itu tidak lagi saling menunjuk dengan bersih.

Tidak ada yang rusak bagi pengunjung, dan justru karena itu masalah ini lolos. Mesin pencari mungkin tetap bisa menebaknya. Tapi mengirim sinyal yang bercampur lalu berharap ditafsirkan sesuai maksud kita bukanlah rencana.

## Dari mana dua bentuk itu muncul

Build statis Astro menulis setiap halaman sebagai folder berisi `index.html`: `dist/work/index.html`. URL untuk file itu secara alami berakhiran garis miring, dan itulah yang dikembalikan `Astro.url.pathname` saat build. Link canonical dibuat dari situ, jadi ada garis miringnya.

Link `hreflang` datang dari tempat lain: helper kecil yang membuat URL untuk kedua bahasa, yang mengembalikan `/work` dan `/id/work`. Sitemap memakai helper ketiga yang menambahkan garis miring. Tiga potong kode, masing-masing masuk akal, dan hanya dua yang sepakat.

## Perbaikannya: satu aturan, ditulis sekali

Saya memilih bentuk yang memang sudah diterbitkan build, yaitu yang memakai garis miring, dan membuat semua URL mengikutinya:

```ts title="src/shared/lib/i18n.ts" {2}
export const sectionBase = (section: string, lang: Lang) =>
  lang === DEFAULT_LANG ? `/${section}/` : `/${lang}/${section}/`;
```

- **URL bagian dan entri** berakhiran `/`: `/work/`, `/id/writing/`, `/work/nubibuilds/`.
- **Canonical, `og:url`, dan `hreflang`** sekarang lewat helper `absoluteUrl` yang sama dengan sitemap, jadi tidak bisa berbeda lagi.
- **Link navigasi dan footer** juga memakai garis miring, jadi tidak ada klik yang mendarat di alamat kedua.
- **Halaman 404** tidak lagi menyatakan URL canonical sama sekali, karena memang tidak untuk diindeks.

Ada satu efek samping yang perlu diperhatikan. Header menandai tab aktif dengan membandingkan path saat ini dengan setiap link. Kalau satu sisi memakai garis miring dan sisi lain tidak, perbandingan itu gagal di dev server, yang melayani kedua bentuk. Solusinya: bandingkan keduanya tanpa garis miring di akhir.

## Test yang membandingkan sinyalnya

Skor 100 memberi tahu saya bahwa setiap tag ditulis dengan benar. Skor itu tidak memberi tahu apakah tag-tag itu saling sepakat. Jadi saya menambahkan test end-to-end yang memeriksa persis hal itu. Untuk setiap halaman daftar dwibahasa, test membaca URL canonical dan setiap URL `hreflang`. Lalu test memastikan semuanya ada di sitemap dan halaman itu mencantumkan dirinya sendiri di antara versi bahasanya. Test juga memeriksa bahwa setiap link halaman internal di beranda berakhiran garis miring.

Kalau perubahan di masa depan memunculkan lagi URL tanpa garis miring, test-nya sekarang gagal sebelum situsnya terbit.

## Yang saya pelajari

Pemeriksaan yang menilai setiap tag secara terpisah tidak akan menangkap tag yang saling bertentangan. Kalau beberapa bagian situs menjelaskan hal yang sama, dalam kasus ini alamat sebuah halaman, tentukan satu bentuk, hasilkan di satu tempat, lalu uji bahwa semua yang menyebutnya sepakat.

[^1]: Google Search Central, [How to specify a canonical URL](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), dibaca 22 November 2026.

[^2]: Google Search Central, [Tell Google about localized versions of your page](https://developers.google.com/search/docs/specialty/international/localized-versions), dibaca 22 November 2026.
