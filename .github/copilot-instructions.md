# AI Coding Guidelines for PDF Label Cutter

## Project Overview
This is a client-side web application for cropping labels from PDF files. It uses PDF.js to render PDFs and allows both automatic cropping with predefined coordinates and manual coordinate adjustment.

## Architecture
- **Frontend-only**: No backend; all processing happens in the browser
- **Core logic**: `src/main.ts` handles PDF loading, rendering, and cropping
- **Rendering**: PDFs are rendered to canvas at 1.5x scale for higher resolution output
- **Cropping**: Coordinates are specified in original PDF units, then scaled for canvas operations

## Key Workflows
- **Development**: `npm run dev` starts Vite dev server on port 5173 with auto-open
- **Build**: `npm run build` generates production bundle
- **Preview**: `npm run preview` serves built files locally

## Code Patterns
- **PDF Processing**: Always set worker source for PDF.js: `(pdfjsLib as any).GlobalWorkerOptions.workerSrc = "/node_modules/pdfjs-dist/build/pdf.worker.mjs"`
- **Canvas Scaling**: Render PDFs at 1.5x scale, but crop coordinates remain in 1x units
- **File Naming**: Downloads use format `elablecrop-FK-${timestamp}.png` with ISO timestamp (colons/dots replaced with dashes)
- **Error Handling**: Simple alerts for missing files; no advanced error recovery

## Dependencies
- **pdfjs-dist**: For PDF parsing and rendering (v4.2.67)
- **tesseract.js**: Included but not currently used (potential for OCR features)
- **Vite**: Build tool with TypeScript support

## Conventions
- **TypeScript**: Strict mode enabled, target ES2020
- **DOM Access**: Direct `document.getElementById` with type assertions (e.g., `as HTMLInputElement`)
- **Async Operations**: Use `async/await` for PDF processing
- **Styling**: External `style.css` with CSS variables for dark theme; semantic HTML structure with header, main, footer

## Integration Points
- **File Input**: Handles single PDF file uploads via `<input type="file" accept="application/pdf">`
- **Canvas Export**: Converts cropped canvas to PNG data URL for download
- **No External APIs**: Fully self-contained browser application

## Key Files
- `src/main.ts`: Main application logic and PDF processing
- `index.html`: UI structure with semantic HTML and linked CSS
- `style.css`: Dark theme styles with CSS variables
- `vite.config.ts`: Dev server configuration (port 5173, auto-open)