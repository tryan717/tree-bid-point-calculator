# Sticks 'N Stones Point System Tree Bid Calculator

This is a simple static web app for a point-based tree removal estimate calculator.

## Latest requested point updates

- Tree size:
  - Small: 6 points
  - Medium: 10 points
  - Large: 16 points
  - XL: 23 points
- Canopy:
  - Small: 1 point
  - Medium: 3 points
  - Large: 4 points
  - XL: 6 points
- XL logs add-on: 3 points
- Default tree selection starts blank.

## How to use

Open `index.html` in a browser, or upload this folder to GitHub/Vercel as a static site.

## Saved jobs

Saved jobs are stored in the browser on the device being used through localStorage. They are not stored online unless you add a backend/database later.

## PDF / Email

The app can create a downloadable PDF. On supported mobile browsers, it can use the native share sheet with the PDF attached. On other browsers, it downloads the PDF and opens an email draft with the estimate summary.
