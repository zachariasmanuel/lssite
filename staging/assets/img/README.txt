lakshmi.jpg      1200 × 1500 (4:5)  — the opening portrait (.shot), and the
                                      JSON-LD image
lakshmi@600.jpg   600 ×  750        — the small srcset entry, and the source for
                                      the WhatsApp-thread avatar in section 01
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
at roughly a third down, and stops short of x=2036 in the original, which is
where the out-of-focus head in the foreground begins.

The opening frame is 4:5 like the source, so it shows the whole photograph —
books, desk and all. The 36px thread avatar in section 01 cannot, so
.thread__avatar img in style.css scales about her face; recut the source and
that transform-origin needs checking again.

If the file is missing, index.html drops the <img> and shows a designed "LS"
monogram fallback, so the layout never breaks.

Note: og:image / twitter:image and the JSON-LD "image" in index.html point at
https://www.lakshmisreedhar.com/staging/assets/img/… — publish.sh rewrites
those to the bare /assets/… paths when copying this build to the site root.
