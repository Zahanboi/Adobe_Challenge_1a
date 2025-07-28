const fs = require("fs");
const path = require("path");
const extractOutline = require("./extract");

const INPUT_DIR = "./input";
const OUTPUT_DIR = "./output";


(async () => {
  console.time("processing");
  const files = fs.readdirSync(INPUT_DIR);
  for (const file of files) {
    
    if (!file.endsWith(".pdf")) continue;

    const inputPath = path.join(INPUT_DIR, file);
    const outputPath = path.join(OUTPUT_DIR, file.replace(".pdf", ".json"));

    try {
      const result = await extractOutline(inputPath);
      // console.log(result)
      if (result) {
        fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
        
      }else {
        console.warn(`No outline found for ${file}`);
      }
      
      console.log(` Processed: ${file}`);
    } catch (err) {
      console.error(`Failed to process ${file}:`, err);
    }
  }
  console.timeEnd("processing");
})();

