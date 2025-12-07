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

    const headerFormat = ['type', 'frame', 'name'];

    const rows: string[] = [];

    // start at 1 since 0 is rest pose
    let currentFrame = 1;
    for (const morphConfig of morphConfigs) {
        // can contain only letters, numbers, underscores. No spaces or special characters
        let cleanedName = morphConfig.name.replace(/[^a-zA-Z0-9_]/g, '_');
        cleanedName = cleanedName.replace(/_+/g, '_'); // replace multiple underscores with single underscore
        console.log(`Processing morph: ${morphConfig.name} as ${cleanedName} at frame ${currentFrame}`);
        rows.push(`MIS,${currentFrame},${cleanedName}`);
        currentFrame++;
    }

    // write out the csv, no headers
    const csvContent = rows.join('\n');
    fs.writeFileSync('./GeneratedMorphs.csv', csvContent, 'utf-8');
    console.log(`Wrote ${morphConfigs.length} morph configs to GeneratedMorphs.csv`);

    // then read in the example csv, it doesnt have headers so we define them here
    // const csvData = await csv({headers: ['type', 'frame', 'name']}).fromFile(exampleCsvLocation, {  });
    // console.log(`Loaded ${csvData.length} rows from example CSV at ${exampleCsvLocation}`);
    // // find the highest frame number
    // let highestFrame = 0;
    // for (const row of csvData) {
    //     const frameNum = parseInt(row.frame);
    //     if (frameNum > highestFrame) {
    //         highestFrame = frameNum;
    //     }
    // }
    // console.log(`Highest frame number in CSV: ${highestFrame}`);

})();