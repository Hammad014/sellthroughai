/**
 * Google Sheets "Make a copy" links, one per spreadsheet product.
 *
 * Optional, but it's the smoothest way in for Google Sheets buyers: one click
 * and they have their own copy. To create one (once per product):
 *   1. Upload scripts/sheets/out/<file>.xlsx to your Google Drive and open it.
 *   2. File → Save as Google Sheets.
 *   3. Share → General access → "Anyone with the link" → Viewer.
 *   4. Copy the link and change the ending "/edit?usp=sharing" to "/copy".
 *   5. Paste it below and rebuild the Etsy files (npm run etsy:build).
 * Buyers then get a "Make a copy" button; your master copy stays untouched.
 */
export const SHEET_LINKS = {
  budget: "",
  student: "",
  adhd: "",
  life: "",
  reading: "",
  meal: "",
};
