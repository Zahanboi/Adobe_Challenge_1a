const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
const fs = require('fs');


function groupAndMergeWords(items) {
  const lines = [];
  let currentLine = [];
  let lastY = null;

  for (let item of items) {
    if (!item.str.trim()) continue;
    const y = item.transform[5];
    const height = item.height;
    const width = item.width;

    const word = {
      str: item.str,
      height,
      width,
      fontName: item.fontName,
      y
    };

    if (lastY !== null && Math.abs(lastY - y) > 2) {
      lines.push(currentLine);
      currentLine = [];
    }

    currentLine.push(word);
    lastY = y;
  }

  if (currentLine.length) lines.push(currentLine);

  return lines.map(line => {
    const text = line.map(w => w.str).join(' ').trim();
    const height = Math.max(...line.map(w => w.height));
    const width = line.reduce((sum, w) => sum + w.width, 0);
    return {
      text,
      height,
      width
    };
  });
}

async function extractTextFromPDF(filePath) {
    const loadingTask = pdfjsLib.getDocument({
    url: filePath,
    standardFontDataUrl: "./standard_fonts/"
  });
  const pdf = await loadingTask.promise;

  const allLines = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    // if (filePath === "app\\input\\file02.pdf") {
    //   console.log(content.items[4].transform);
    // }
    
    const lines = groupAndMergeWords(content.items);
    lines.forEach(line => line.page = pageNum);
    allLines.push(...lines);
  }

  return allLines;
}

function isValidLine(line) {
  const text = line.text?.trim();
  return (
    /^[A-Za-z]/.test(text) &&                              // Starts with alphabet
    !/(https?:\/\/|www\.|\.(com|org|net|in))/i.test(text) && // No URLs
    text.length > 2 &&
    /[A-Za-z]/.test(text)
  );
}
function detectTitle(lines) {

  const pageOneLines = lines.filter(line => line.page === 1 && isValidLine(line));
  if (!pageOneLines.length) return null;

  
  const candidates = pageOneLines
    .filter(line => line.height > 10 && line.width > 40 && line.text.length < 120)
    .map(line => ({
      ...line,
      score:
        line.height * 2 + 
        line.width * 0.5 - // width is helpful but less important
        line.text.length * 1.5 
    }))
    .sort((a, b) => b.score - a.score);

  if (!candidates.length) return null;

  // Remove repetition and extra whitespace
  const cleaned = removeRepetition(candidates[0].text.trim());

  
  if (/^(introduction|abstract|contents|table of contents)$/i.test(cleaned)) {
    if (candidates[1]) return removeRepetition(candidates[1].text.trim());
    return null;
  }

  return cleaned;
}

function removeRepetition(text) {
  const words = text.split(/\s+/);
  const result = [];
  let prev = null;

  for (let word of words) {
    const cleaned = word.replace(/[^A-Za-z]/g, "").toLowerCase();
    const compressed = cleaned.replace(/(.)\1+/g, "$1"); // aaa → a, eee → e

    if (compressed && compressed !== prev) {
      result.push(word);
      prev = compressed;
    }
  }

  return result.join(" ");
}


function detectHeadings(lines, titleText) {
  const validLines = lines.filter(isValidLine);

  if (!validLines.length) return [];

 
  const heights = validLines.map(l => l.height || 0);
  const maxHeight = Math.max(...heights);
  const minHeight = Math.min(...heights);
  const avgHeight = heights.reduce((a, b) => a + b, 0) / heights.length;

  
  return validLines
    .map(line => {
      const cleaned = removeRepetition(line.text.trim());
      if (
        titleText &&
        cleaned.toLowerCase().trim() === titleText.toLowerCase().trim()
      ) {
        return null;
      }

      const h = line.height;
      let level = null;

   
      if (h >= maxHeight - 1) level = 'H1';
      else if (h >= avgHeight + (maxHeight - avgHeight) * 0.5) level = 'H2';
      else if (h >= avgHeight + (maxHeight - avgHeight) * 0.2) level = 'H3';
      
      else if (h > avgHeight * 0.95 && line.text.length < 60) level = 'H4';

      
      if (!level && h > avgHeight * 1.05 && line.text.length < 40) level = 'H5';

     
      if (!level && line.text.length < 25 && h > minHeight + 2) level = 'H6';

      return level ? { level, text: cleaned, page: line.page } : null;
    })
    .filter(Boolean);
}

async function extractOutline(pdfPath) {
  const lines = await extractTextFromPDF(pdfPath);
  const title = detectTitle(lines);
  const outline = detectHeadings(lines, title);

  return { title, outline };
}


module.exports = extractOutline;
