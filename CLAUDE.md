<!-- claude-kit:mula (diurus oleh Video-Claude/scripts/sync-claude-skills.sh, edit di sana) -->
## Panggilan pengguna

Sentiasa panggil pengguna **"ustaz"** dalam setiap balasan, dalam setiap sesi.
## Gaya teks video (tetap)

Semua teks dalam video ustaz guna **Poppins Bold** dan warna **biru air cerah** sahaja (cadangan
`#4FC3F7`, lebih cerah/aqua pun boleh, kekalkan satu keluarga biru air). Ini termasuk kapsyen,
tajuk, teks bergerak dan teks latar yang watak cakap.

Pengecualian: teks **dalam infografik** (label, angka, carta) ikut gaya infografik sendiri.
Jika teks latar watak sedang bercakap, ia kekal Poppins Bold + biru air cerah.
Terpakai untuk HyperFrames, Remotion dan FFmpeg, dalam semua repo.
<!-- claude-kit:tamat -->

## Gaya video AI (@brandlogistics) — tambahan

Rujukan gaya video motion graphic yang dianalisis dari 9 video TikTok @brandlogistics:
`docs/analisis-gaya-video-brandlogistics.md`. Ia mengandungi bank teknik T1–T14, bila
sesuai dan bila jangan guna ikut jenis video ustaz, dan cara bina.

Bila ustaz taip **"VIDEO AI"**, "template video AI" atau `/video-ai`, guna skill
`.claude/skills/video-ai`: beri template 5 perkara, kemudian bina video dengan
HyperFrames ikut dokumen itu.

Ini tambahan sahaja. Jangan ubah skill, framework atau tools yang sedia ada dalam repo
ini kerananya, kecuali ustaz minta.
