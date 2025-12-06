import fs from 'fs';

import csv from 'csvtojson';

interface MorphConfig {
    type: "morph" | "modifier" | "pose",
    name: string,
    value: number,
    reset?: number  // Optional reset value, defaults to 0 if not specified
}

const exampleCsvLocation = `G:\\UE_Projects\\VGame\\Daz\\Staging\\G9_F\\Roms.csv`;


(async () => {

    // first read in the morph config json
    const morphConfigJson = fs.readFileSync('./morphConfigs.json', 'utf-8');
    const morphConfigs: MorphConfig[] = JSON.parse(morphConfigJson);
    console.log(`Loaded ${morphConfigs.length} morph configs from morphConfig.json`);

    // then read in the example csv, it doesnt have headers so we define them here
    const csvData = await csv({headers: ['type', 'frame', 'name']}).fromFile(exampleCsvLocation, {  });
    console.log(`Loaded ${csvData.length} rows from example CSV at ${exampleCsvLocation}`);
    // find the highest frame number
    let highestFrame = 0;
    for (const row of csvData) {
        const frameNum = parseInt(row.frame);
        if (frameNum > highestFrame) {
            highestFrame = frameNum;
        }
    }
    console.log(`Highest frame number in CSV: ${highestFrame}`);

})();