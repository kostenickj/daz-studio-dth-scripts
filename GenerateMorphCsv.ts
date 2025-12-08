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

    // start at frame 4 since first 3 are retarget poses and the rest pose, frame 3 is fence
    let startFrame = 4;
    for (const morphConfig of morphConfigs) {
        // can contain only letters, numbers, underscores. No spaces or special characters
        let cleanedName = morphConfig.name.replace(/[^a-zA-Z0-9_]/g, '_');
        cleanedName = cleanedName.replace(/_+/g, '_'); // replace multiple underscores with single underscore
        console.log(`Processing morph: ${morphConfig.name} as ${cleanedName} at frame ${startFrame}`);
        rows.push(`MIS,${startFrame},${cleanedName}`);
        startFrame++;
    }

    // now de-duplicate the rows by cleaned name, keeping the original currentFrame
    const uniqueRowsMap: { [key: string]: string } = {};
    for (const row of rows) {
        const parts = row.split(',');
        const name = parts[2];
        if (!uniqueRowsMap[name]) {
            uniqueRowsMap[name] = row;
        }
        else{
            console.log(`Duplicate morph name found: ${name}. Skipping duplicate.`);
        }
    }

    // write out the csv, no headers
    const csvContent = Object.values(uniqueRowsMap).join('\n');
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