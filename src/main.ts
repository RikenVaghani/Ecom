import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.mjs";

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = "/node_modules/pdfjs-dist/build/pdf.worker.mjs";

const fileInput = document.getElementById("pdfFile") as HTMLInputElement;
const cropBtn = document.getElementById("cropBtn") as HTMLButtonElement;
const manualBtn = document.getElementById("manualBtn") as HTMLButtonElement;
const manualControls = document.getElementById("manualControls") as HTMLElement;
const tlxInput = document.getElementById("tlx") as HTMLInputElement;
const tlyInput = document.getElementById("tly") as HTMLInputElement;
const brxInput = document.getElementById("brx") as HTMLInputElement;
const bryInput = document.getElementById("bry") as HTMLInputElement;
const processBtn = document.getElementById("processBtn") as HTMLButtonElement;
const output = document.getElementById("output") as HTMLElement;
const downloadBtn = document.getElementById("downloadBtn") as HTMLButtonElement;
const dropZone = document.getElementById("dropZone") as HTMLElement;

let selectedFile: File | null = null;
let lastCropped: HTMLCanvasElement | null = null;

// Update drop zone text
function updateDropZoneText(fileName: string) {
  const p = dropZone.querySelector('p');
  if (p) p.textContent = `Selected: ${fileName}`;
}

// Drag and drop functionality
dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const files = e.dataTransfer?.files;
  if (files && files.length > 0 && files[0].type === 'application/pdf') {
    selectedFile = files[0];
    updateDropZoneText(selectedFile.name);
  } else {
    alert('Please drop a valid PDF file.');
  }
});

// Save chosen file
fileInput.onchange = () => {
  if (!fileInput.files || !fileInput.files[0]) return;
  selectedFile = fileInput.files[0];
  updateDropZoneText(selectedFile.name);
};

// Auto crop button
cropBtn.onclick = async () => {
  if (!selectedFile) {
    alert("Please choose a PDF file first.");
    return;
  }
  await processPDF(selectedFile, 190, 28, 407, 382, true);
};

// Manual mode toggle
manualBtn.onclick = () => {
  manualControls.style.display = manualControls.style.display === "none" ? "block" : "none";
};

// Manual process
processBtn.onclick = async () => {
  if (!selectedFile) {
    alert("Please choose a PDF file first.");
    return;
  }
  const tlx = parseFloat(tlxInput.value);
  const tly = parseFloat(tlyInput.value);
  const brx = parseFloat(brxInput.value);
  const bry = parseFloat(bryInput.value);
  await processPDF(selectedFile, tlx, tly, brx, bry, false);
};

async function processPDF(file: File, tlx: number, tly: number, brx: number, bry: number, autoDownload: boolean) {
  output.innerHTML = "";
  lastCropped = null;

  const arrayBuf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuf }).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 1.5 });

  const pageCanvas = document.createElement("canvas");
  const ctx = pageCanvas.getContext("2d")!;
  pageCanvas.width = viewport.width;
  pageCanvas.height = viewport.height;
  await page.render({ canvasContext: ctx, viewport }).promise;

  const sx = tlx * 1.5;
  const sy = tly * 1.5;
  const sw = (brx - tlx) * 1.5;
  const sh = (bry - tly) * 1.5;

  const cropped = cropCanvas(pageCanvas, sx, sy, sw, sh);
  lastCropped = cropped;

  if (autoDownload) {
    autoDownloadCanvas(cropped);
  } else {
    output.appendChild(cropped);
    downloadBtn.style.display = "inline-block";
  }
}

function cropCanvas(src: HTMLCanvasElement, x: number, y: number, w: number, h: number): HTMLCanvasElement {
  const out = document.createElement("canvas");
  const ctx = out.getContext("2d")!;
  out.width = Math.floor(w);
  out.height = Math.floor(h);
  ctx.drawImage(src, x, y, w, h, 0, 0, out.width, out.height);
  return out;
}

function autoDownloadCanvas(c: HTMLCanvasElement) {
  const link = document.createElement("a");
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, "-");
  link.download = `elablecrop-FK-${timestamp}.png`;
  link.href = c.toDataURL("image/png");
  link.click();
}

downloadBtn.onclick = () => {
  if (!lastCropped) return;
  autoDownloadCanvas(lastCropped);
};
