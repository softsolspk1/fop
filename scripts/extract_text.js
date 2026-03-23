const fs = require('fs');
const pdf = require('pdf-parse');

async function extractPdfs() {
    try {
        console.log("Reading c1.pdf...");
        const dataBufferC1 = fs.readFileSync('../c1.pdf');
        const parseFunction = typeof pdf === 'function' ? pdf : pdf.default;
        const dataC1 = await parseFunction(dataBufferC1);
        fs.writeFileSync('c1_extracted.txt', dataC1.text);
        
        console.log("Reading ph1.pdf (pages 33-237)...");
        const dataBufferPh1 = fs.readFileSync('../ph1.pdf');
        const dataPh1 = await parseFunction(dataBufferPh1, { max: 237 });
        fs.writeFileSync('ph1_extracted.txt', dataPh1.text);
        
        console.log("Done extracting.");
    } catch (e) {
        console.error(e);
    }
}

extractPdfs();
