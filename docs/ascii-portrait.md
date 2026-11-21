# ASCII portrait

The portrait on the About page is drawn with characters, generated from a photo by `scripts/ascii-portrait.py`. The script removes the background, so only the person is drawn. Run it again whenever you want a different photo.

## What you need

- Python 3 with Pillow and NumPy:

  ```sh
  pip install pillow numpy
  ```

- A photo of one person (JPG, PNG or WebP). It can live anywhere on your computer; it does not need to be in the project, and it is never published.

## Changing the photo

```sh
python3 scripts/ascii-portrait.py ~/Pictures/me.jpg
pnpm dev
```

Then open `/about`. The script prints the portrait in the terminal and writes three files:

| File (in `src/features/about/assets/`) | What it is |
| --- | --- |
| `portrait.txt` | The characters: denser glyphs where the photo is darker |
| `portrait-dark.webp` | The tones the characters are coloured with in the dark theme |
| `portrait-light.webp` | The same for the light theme |

Commit all three. Nothing else needs changing: the component reads the size from the files.

To try settings without touching the site, add `--dry-run`: the portrait is printed and nothing is written.

## Choosing a photo

| Works well | Works badly |
| --- | --- |
| Head and shoulders, facing the camera | Full-body shots: the face becomes a few characters |
| Even light on the face | Hard side light or a face in shadow |
| A backdrop that differs from hair, skin and clothes | Dark hair on a dark wall, a white shirt on a white wall |
| At least 600px on the short side | Small or heavily compressed pictures |

## How the background is removed

The script picks the first method that applies. `--background` forces one.

| Method | When it is used | Good for |
| --- | --- | --- |
| `alpha` | The picture already has a transparent background | A cut-out you made elsewhere (for example with the "remove background" tool on a phone or in an image editor). The most reliable route. |
| `rembg` | The `rembg` package is installed | Any background, including rooms and outdoor scenes. Install with `pip install rembg`; the first run downloads its model. |
| `border` | Otherwise | Plain backdrops of any colour, with or without a lighting gradient. No extra install. |
| `none` | Only when asked for | Keeping the whole picture, background included |

The `border` method treats the colours along the top and upper sides of the photo as background and removes everything of those colours that is connected to the edge. So it needs the person not to touch the top or the upper sides, and a backdrop that is clearly different from the person. If the edges are not a plain backdrop, the script says so and suggests `rembg` or a cut-out.

**Check the cut-out before judging the portrait:**

```sh
python3 scripts/ascii-portrait.py ~/Pictures/me.jpg --dry-run --check /tmp/cutout.png
```

`/tmp/cutout.png` shows the person on magenta: anything magenta is treated as background.

| What you see | What to do |
| --- | --- |
| Backdrop left around the person | Raise `--tolerance` (try 50) |
| Parts of the person missing (hair, a shoulder) | Lower `--tolerance` (try 20). If that is not enough, the backdrop is too close to the person's colours: use `rembg` or a cut-out PNG. |
| A busy background that will not come off | `pip install rembg`, or pass a cut-out PNG |

## Options

| Option | Default | Effect |
| --- | --- | --- |
| `--crop left,top,right,bottom` | The person's outline | The part of the photo to draw, as fractions of its width and height. A tighter crop makes the face larger and more detailed. |
| `--cols N` | `92` | Characters per line. More gives finer detail and smaller characters; the portrait always fills the card's width. |
| `--contrast N` | `2.2` | How strongly eyes, nose and mouth stand out. Lower (1.5) is softer; higher (3) is harsher. |
| `--background METHOD` | `auto` | `auto`, `alpha`, `rembg`, `border` or `none` |
| `--tolerance N` | `38` flat, `24` graded | `border` method only: how different a colour may be and still count as background |
| `--check FILE.png` | off | Also save the cut-out on a magenta backdrop |
| `--dry-run` | off | Print only; write nothing |

The current portrait was made with a crop that leaves out the shoulders' outer edges:

```sh
python3 scripts/ascii-portrait.py path/to/photo.jpg --crop 0.14,0.03,0.86,0.82
```

### Working out a crop

The four numbers are left, top, right and bottom, each from 0 to 1. `0.14,0.03,0.86,0.82` means: start 14% in from the left and 3% down from the top; stop 86% across and 82% down. For a head-and-shoulders portrait, aim for the face to take up about a third of the cropped width.

## Colours and characters

Both are constants at the top of the script:

- `DARK` and `LIGHT` map tone (0 = darkest part of the photo, 1 = lightest) to colours from the site palette. If you change the palette in `src/shared/styles/tokens.css`, update these and run the script again.
- `RAMP` is the set of characters, from the one used for the darkest tones to the one for the lightest. They are all fairly dense on purpose: the picture is carried by colour, and sparse characters would leave holes in it.

## Showing a photo instead, or nothing

In `src/shared/config/site.ts`:

```ts
owner: {
  portrait: 'ascii',   // 'ascii' | 'photo' | 'none'
  photo: '/photo.jpg', // only used when portrait is 'photo'; a file in public/
}
```

A file in `public/` is published as it is. If you use the ASCII portrait and do not want the original photo to be reachable at `/photo.jpg`, keep it outside `public/`.

## How it is displayed

`src/features/about/components/AsciiPortrait.astro` puts the characters in a `<pre>` and paints them with the tone image through `background-clip: text`, switching image with the theme. Details worth knowing:

- The block is announced to screen readers as one image, "ASCII portrait of *name*"; the characters themselves are hidden from them.
- The type is scaled so one line always equals the card's width, and the height is reserved before the font loads, so the layout does not shift.
- Without `background-clip: text`, and in high-contrast modes, the characters are drawn in a single colour.
- `src/features/about/components/ProfileCard.astro` frames it as a `whoami --verbose` window: corner brackets on a dot grid, the portrait printing itself line by line on load, and a scan line sweeping over it. With reduced motion the portrait is simply shown, without the printing or the sweep.

## Limits

- The `border` method cannot separate a person from a backdrop of the same colour (dark hair on black, for example). That is what `rembg` and cut-out PNGs are for.
- The `rembg` route has not been run as part of this project's checks; it relies on that package's documented behaviour.
- One person per photo. With several people, crop to one first.
