#!/usr/bin/env python3
"""
Turn a photo of a person into the ASCII portrait shown on the About page.

    python3 scripts/ascii-portrait.py path/to/photo.jpg

The background is removed, so only the person is drawn. Full guide: docs/ascii-portrait.md.

Needs Python 3 with Pillow and NumPy:   pip install pillow numpy
Optional, for busy backgrounds:         pip install rembg

Writes three files into src/features/about/assets/ (the photo itself is never published):

    portrait.txt          the characters: denser glyphs where the photo is darker
    portrait-dark.webp    the tones the characters are coloured with in the dark theme
    portrait-light.webp   the same for the light theme
"""
import argparse
import io
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter, ImageOps

CELL = 0.6  # width / height of one character cell: JetBrains Mono at line-height 1
PIXELS_PER_CELL = 3  # AsciiPortrait.astro reads the column count from the image width: keep the two in step
RAMP = "@@##%%&&88WWMMBB00QQOOZZUUXXCCYY"  # dark tone → light tone; all fairly dense on purpose

# Tone → colour, from the site palette (see docs/colour-palette.md).
DARK = [(0, "#1a4429"), (0.2, "#226037"), (0.4, "#2f8f55"), (0.6, "#4fd47c"), (0.78, "#7af5a0"), (0.92, "#c9fad6"), (1, "#f2fbf4")]
LIGHT = [(0, "#0a0e0b"), (0.25, "#0b3d22"), (0.5, "#0b7039"), (0.7, "#4f9a70"), (0.88, "#a9cdb6"), (1, "#dfeae2")]

OUT = Path(__file__).resolve().parent.parent / "src" / "features" / "about" / "assets"


def note(message):
    print(message, file=sys.stderr)


def to_image(values):
    return Image.fromarray((np.clip(values, 0, 1) * 255).astype("uint8"))


# ---------------------------------------------------------------- finding the person


def subject_from_alpha(photo):
    """A cut-out (PNG or WebP with a transparent background): the alpha channel is the answer."""
    return np.asarray(photo.getchannel("A")).astype(float) / 255


def subject_from_rembg(photo):
    """Machine-learning cut-out. Works on any background; needs `pip install rembg`."""
    from rembg import remove  # imported here so the script runs without it

    return np.asarray(remove(photo.convert("RGB")).getchannel("A")).astype(float) / 255


def subject_from_border(photo, tolerance):
    """
    Plain backdrops of any colour, including ones with a lighting gradient.

    The colours along the top and the upper sides of the photo are taken as "background".
    Every pixel close to one of those colours AND connected to the border is background;
    everything else is the person. Returns the mask and how uniform the border was.
    """
    work = photo.convert("RGB")
    scale = 360 / max(work.size)
    small = work.resize((max(1, round(work.width * scale)), max(1, round(work.height * scale))), Image.LANCZOS)
    pixels = np.asarray(small.filter(ImageFilter.GaussianBlur(1))).astype(float)
    h, w = pixels.shape[:2]

    # Border samples: the whole top edge and the upper 60% of both sides (the body usually reaches the bottom).
    band = max(2, round(min(h, w) * 0.02))
    side = round(h * 0.6)
    samples = np.concatenate([pixels[:band].reshape(-1, 3), pixels[:side, :band].reshape(-1, 3), pixels[:side, -band:].reshape(-1, 3)])
    spread = float(samples.std(axis=0).mean())
    samples = samples[:: max(1, len(samples) // 96)]
    if tolerance is None:
        # A flat backdrop can be matched loosely. A graded one is covered by many samples,
        # so each match must be tighter or skin tones start to count as background.
        tolerance = 38 if spread < 10 else 24

    # Distance from every pixel to the nearest border colour.
    nearest = np.full((h, w), np.inf)
    for colour in samples:
        nearest = np.minimum(nearest, np.sqrt(((pixels - colour) ** 2).sum(axis=2)))
    candidate = nearest < tolerance

    # Flood from the border through candidate pixels only, so background-coloured areas
    # inside the person (a white shirt on a white backdrop) are kept.
    background = np.zeros((h, w), bool)
    background[:band], background[:side, :band], background[:side, -band:] = True, True, True
    background &= candidate
    while True:
        grown = background.copy()
        grown[1:] |= background[:-1]
        grown[:-1] |= background[1:]
        grown[:, 1:] |= background[:, :-1]
        grown[:, :-1] |= background[:, 1:]
        grown &= candidate
        if (grown == background).all():
            break
        background = grown

    mask = Image.fromarray((~background * 255).astype("uint8")).filter(ImageFilter.MedianFilter(5))
    mask = mask.resize(photo.size, Image.LANCZOS).filter(ImageFilter.GaussianBlur(max(1, round(1 / scale))))
    return np.asarray(mask).astype(float) / 255, spread


def find_subject(photo, method, tolerance):
    has_alpha = photo.mode in ("RGBA", "LA") and np.asarray(photo.getchannel("A")).min() < 250
    if method == "auto":
        if has_alpha:
            method = "alpha"
        else:
            try:
                import rembg  # noqa: F401

                method = "rembg"
            except ImportError:
                method = "border"

    if method == "none":
        return np.ones((photo.height, photo.width)), method
    if method == "alpha":
        if not has_alpha:
            sys.exit("--background alpha needs a picture with a transparent background (PNG or WebP).")
        return subject_from_alpha(photo), method
    if method == "rembg":
        try:
            return subject_from_rembg(photo), method
        except ImportError:
            sys.exit("--background rembg needs the rembg package:  pip install rembg")

    subject, spread = subject_from_border(photo, tolerance)
    if spread > 28:
        note("! The edges of this photo are not a plain backdrop, so the cut-out may be rough.")
        note("  For busy backgrounds install rembg (pip install rembg) or pass a cut-out PNG.")
    return subject, method


# ---------------------------------------------------------------- drawing


def masked_blur(values, mask, radius):
    """Blur that ignores everything outside the mask, so the backdrop does not bleed in."""
    top = np.asarray(to_image(values * mask).filter(ImageFilter.GaussianBlur(radius))).astype(float)
    bottom = np.asarray(to_image(mask).filter(ImageFilter.GaussianBlur(radius))).astype(float) + 1e-3
    return np.clip(top / bottom, 0, 1)


def gradient(stops, tone):
    xs = [stop[0] for stop in stops]
    rgb = [[int(stop[1][i : i + 2], 16) for i in (1, 3, 5)] for stop in stops]
    return np.dstack([np.interp(tone, xs, [colour[c] for colour in rgb]) for c in range(3)])


def auto_crop(subject):
    """The person's bounding box with a little air, as fractions of the photo."""
    rows, cols = np.where(subject > 0.5)
    if len(rows) == 0:
        sys.exit("No person found: everything was treated as background. Try a lower --tolerance.")
    h, w = subject.shape
    pad_x, pad_y = 0.02 * w, 0.02 * h
    return (max(0, cols.min() - pad_x) / w, max(0, rows.min() - pad_y) / h, min(w, cols.max() + pad_x) / w, min(h, rows.max() + pad_y) / h)


def main():
    parser = argparse.ArgumentParser(description="Photo of a person → ASCII portrait for the About page.", epilog="Guide: docs/ascii-portrait.md")
    parser.add_argument("photo", help="JPG, PNG or WebP; a PNG with a transparent background is used as a ready-made cut-out")
    parser.add_argument("--cols", type=int, default=92, help="characters per line (default 92); more = finer detail")
    parser.add_argument("--crop", help="part of the photo to draw: left,top,right,bottom as fractions, e.g. 0.14,0.03,0.86,0.82 (default: the person's outline)")
    parser.add_argument("--background", choices=["auto", "border", "rembg", "alpha", "none"], default="auto", help="how the background is removed (default auto: alpha → rembg if installed → border)")
    parser.add_argument("--tolerance", type=float, help="border method: how different a colour may be and still count as background (default: 38 for a flat backdrop, 24 for a graded one; raise if backdrop remains, lower if parts of the person vanish)")
    parser.add_argument("--contrast", type=float, default=2.2, help="local contrast of facial features (default 2.2)")
    parser.add_argument("--check", metavar="FILE.png", help="also save the cut-out on a magenta backdrop, to judge the background removal")
    parser.add_argument("--dry-run", action="store_true", help="print the portrait but do not write the site files")
    args = parser.parse_args()

    photo = ImageOps.exif_transpose(Image.open(args.photo))  # honour the camera's rotation flag
    if photo.mode not in ("RGB", "RGBA", "LA"):
        photo = photo.convert("RGBA" if "transparency" in photo.info else "RGB")

    subject, method = find_subject(photo, args.background, args.tolerance)
    note(f"background: {method}")
    share = float((subject > 0.5).mean())
    if method != "none" and not 0.12 < share < 0.9:
        note(f"! The person covers {share:.0%} of the photo, which is unusual: check the cut-out with --check FILE.png.")
    photo = photo.convert("RGB")

    if args.check:
        pixels = np.asarray(photo).astype(float)
        shown = pixels * subject[..., None] + np.array([255.0, 0, 255.0]) * (1 - subject[..., None])
        Image.fromarray(shown.astype("uint8")).save(args.check)
        note(f"cut-out check saved to {args.check}")

    crop = tuple(float(part) for part in args.crop.split(",")) if args.crop else auto_crop(subject)
    if len(crop) != 4 or not (0 <= crop[0] < crop[2] <= 1 and 0 <= crop[1] < crop[3] <= 1):
        sys.exit("--crop needs four fractions: left,top,right,bottom with left < right and top < bottom.")
    box = (int(crop[0] * photo.width), int(crop[1] * photo.height), int(crop[2] * photo.width), int(crop[3] * photo.height))
    photo = photo.crop(box)
    subject = subject[box[1] : box[3], box[0] : box[2]]

    # Tone: local contrast (so eyes, nose and mouth read) on top of a softened overall brightness.
    grey = np.asarray(ImageOps.grayscale(photo)).astype(float) / 255
    radius = max(4, round(photo.width * 0.027))
    base = masked_blur(grey, subject, radius)
    tone = np.clip(0.5 + (grey - base) * args.contrast + (base - 0.45) * 0.8, 0, 1) ** 0.85

    h, w = tone.shape
    cols = args.cols
    rows = max(1, round(cols * CELL * h / w))

    # Characters: one per cell, chosen by the cell's average tone; background cells stay empty.
    cell_tone = np.asarray(to_image(tone).resize((cols * 3, rows * 3), Image.LANCZOS)).astype(float)
    cell_tone = cell_tone.reshape(rows, 3, cols, 3).mean(axis=(1, 3)) / 255
    cell_subject = np.asarray(to_image(subject).resize((cols, rows), Image.BOX)).astype(float) / 255
    lines = ["".join(RAMP[int(min(0.999, cell_tone[y, x]) * len(RAMP))] if cell_subject[y, x] >= 0.5 else " " for x in range(cols)).rstrip() for y in range(rows)]

    # Drop empty rows above the head, and the matching strip of the tone image.
    empty = next((i for i, line in enumerate(lines) if line), 0)
    lines = lines[empty:]
    top = round(h * empty / rows)
    rows -= empty

    # Tone images: the person's tones, extended outwards so glyphs on the outline keep their colour.
    filled = np.where(subject > 0.5, tone, masked_blur(tone, subject, max(2, round(photo.width * 0.011))))[top:]
    size = (cols * PIXELS_PER_CELL, round(rows * PIXELS_PER_CELL / CELL))
    small = np.asarray(to_image(filled).resize(size, Image.LANCZOS)).astype(float) / 255

    print("\n".join(lines))
    note(f"\n{cols} columns x {rows} rows")
    if args.dry_run:
        note("dry run: nothing written")
        return

    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "portrait.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")
    for name, stops in (("portrait-dark.webp", DARK), ("portrait-light.webp", LIGHT)):
        buffer = io.BytesIO()
        Image.fromarray(gradient(stops, small).clip(0, 255).astype("uint8"), "RGB").save(buffer, "WEBP", quality=80, method=6)
        (OUT / name).write_bytes(buffer.getvalue())
        note(f"{name}: {len(buffer.getvalue())} bytes")
    note(f"written to {OUT}")


if __name__ == "__main__":
    main()
