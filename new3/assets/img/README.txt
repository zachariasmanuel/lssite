lakshmi.jpg      1200 × 1500 (4:5)  — the portrait used in section 02
lakshmi@600.jpg   600 ×  750        — the srcset entry for small screens
lakshmi-og.jpg   1200 ×  630        — landscape card for og:image / twitter:image
                                      (a 4:5 image gets badly centre-cropped by
                                       WhatsApp and Twitter link previews)

  ffmpeg -i ../../../7A50325A-A61A-4903-A7D8-CD186C3F18E6.JPG \
    -vf "crop=2268:1191:0:1180,scale=1200:630:flags=lanczos" -q:v 4 lakshmi-og.jpg


Both are cropped from the original phone photo kept at the repo root
(7A50325A-A61A-4903-A7D8-CD186C3F18E6.JPG, 2268 × 4032). To recut from it:

  ffmpeg -i ../../../7A50325A-A61A-4903-A7D8-CD186C3F18E6.JPG \
    -vf "crop=1616:2020:420:1180,scale=1200:1500:flags=lanczos" -q:v 4 lakshmi.jpg
  ffmpeg -i lakshmi.jpg -vf "scale=600:750:flags=lanczos" -q:v 4 lakshmi@600.jpg

The crop window (w:h:x:y) keeps the law-book shelf at top-left, places the face
at roughly a third down — the frame wipes open top-to-bottom on scroll — and
stops short of x=2036 in the original, which is where the out-of-focus head in
the foreground begins.

If the file is missing, index.html drops the <img> and shows a designed "LS"
monogram fallback, so the layout never breaks.

Note: og:image / twitter:image in index.html point at
https://www.lakshmisreedhar.com/new3/assets/img/lakshmi.jpg — update that path
if new3/ is promoted to the site root.
