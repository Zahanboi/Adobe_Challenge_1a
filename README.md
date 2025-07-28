# Connecting the Dots Challenge

This project extracts a structural outline from PDF documents, including:
- **Title Detection**
- **Headings Extraction** (H1, H2, H3, etc.)
- **Page Number Annotation**

It is designed to run **fully offline**, using only Node.js and the `pdfjs-dist` library (no network or Docker dependencies). The output is a JSON structure that identifies the document's title and hierarchical headings with their levels and page numbers.

---

## 🧠 Approach

1. **Text Extraction**:
    - The script uses `pdfjs-dist` (legacy build) to extract raw text content from each page of the PDF.
    - Each text item includes `transform`, `height`, `width`, and font metadata.

2. **Line Formation**:
    - Words on the same horizontal line are grouped together based on Y-position.
    - Words are merged intelligently to reconstruct broken sentences or headings.

3. **Title Detection**:
    - Runs on **Page 1 only**.
    - Uses heuristics: large height, width, short text length, and alphabetical start.
    - Avoids common headings like "Introduction" or "Abstract".

4. **Heading Classification**:
    - Applies adaptive thresholds using average and max font height.
    - Classifies headings into H1–H6 levels based on size, boldness, and conciseness.
    - Ensures title is not duplicated as a heading.

5. **Output**:
    - JSON format with keys: `title` and `outline`.
    - Each heading includes its `level`, `text`, and `page`.

---

## 📦 Libraries Used

- [`pdfjs-dist`](https://www.npmjs.com/package/pdfjs-dist): For extracting PDF content.
- `fs`: To handle file reading.

No ML models or web dependencies are used — this is a heuristics-based system.

---

## ⚙️ Running the Project

### 🖥 Requirements

- Node.js 18+ installed
- All dependencies installed offline via a `.setup.js` or `node_modules` copy which will be done automatically by docker command


## 🚀 Expected Execution

The main script is located at `app/main.js`.

### 1. Build the Docker Image

**Linux/macOS (bash):**
```bash
docker build --platform linux/amd64 -t mysolutionname:round1aSolution .
```

**Windows (CMD):**
```cmd
docker build --platform linux/amd64 -t mysolutionname:round1aSolution .
```

**Windows (PowerShell):**
```powershell
docker build --platform linux/amd64 -t mysolutionname:round1aSolution .
```

### 2. Run the Docker Container

**Linux/macOS (bash):**
```bash
docker run --rm -v $(pwd)/input:/app/input -v $(pwd)/output:/app/output --network none mysolutionname:round1aSolution
```


**Windows (CMD):**
```cmd
docker run --rm -v %cd%\input:/app/input -v %cd%\output:/app/output --network none mysolutionname:round1aSolution
```

**Windows (PowerShell):**
```powershell
docker run --rm -v "${PWD}/input:/app/input" -v "${PWD}/output:/app/output" --network none mysolutionname:round1aSolution
```

This will write all the files in /output folder if you want to write it in /app/outut use:
```powershell
docker run --rm -v "${PWD}/app/input:/app/input" -v "${PWD}/app/output:/app/output" --network none mysolutionname:round1aSolution
```

---

### 📝 Container Behavior

- The container will **automatically process all PDFs** in the `/app/input` directory.
- For each `filename.pdf`, it will generate a corresponding `filename.json` in `/app/output`.
- All output files will be placed in the `/app/output` directory.

---
