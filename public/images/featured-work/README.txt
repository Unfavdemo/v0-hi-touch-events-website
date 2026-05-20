Featured work — event photo galleries
=====================================

For each case study, put EXACTLY six files in the folder named after the URL slug
(same slug as in lib/site/featured-projects.js). The site only shows a gallery when all six exist.

Naming (required)
-----------------
  01.jpg   02.jpg   03.jpg   04.jpg   05.jpg   06.jpg

  Or use .webp / .jpeg / .png (same numbering). If both 01.webp and 01.jpg exist,
  .webp is used for that slot.

Do not use spaces in folder or file names. Use lowercase extensions when possible.

Folder names (one folder per project)
-------------------------------------
  juneteenth-parade-festival-2025
  urban-affairs-coalition-56th-anniversary
  wadsworth-day
  vow-renewal-hughes-ralph
  odaat-community-events
  vestedin-symposium-breakfast
  national-convening-black-mayors
  black-brain-green-tie-gala
  uplift-hardship-to-hope-gala-2025
  transforming-justice-2025
  community-heros-brunch-2025
  fathers-day-rally-fatherhood-ceremony-2025
  welcome-america-grove-mayors-vip
  celebration-of-freedom-2025
  tree-lighting-mayors-vip
  philadelphia-award-103
  free-library-community-impact-week
  frankford-cdc-fall-fest

After you add 01–06, run `npm run build` (or refresh dev) so Next picks up new files.

For new projects without a full gallery yet, add at least `01.jpg` in the slug folder
so portfolio cards and case-study heroes display (six files enable the carousel).

To see which projects still need correctly named files, run:

  npm run galleries:check

If you drop six images with arbitrary names into a folder, normalize them to 01–06 with:

  npm run galleries:rename

(Only when there are exactly six non-slot images and no 01–06 yet.)

Optional: `npm run images:optimize-events` optimizes files under `public/Hitouch Pictures/`
only; for these galleries you can run Sharp or export web-ready sizes from Lightroom.
