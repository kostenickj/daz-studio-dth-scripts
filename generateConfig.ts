import fs from 'fs';
import seven from 'node-7z';
import sevenBin from '7zip-bin'

const morphsBaseDir = "E:\\DAZ\\DazContentLibrary\\data\\Daz 3D\\Genesis 9\\Base\\Morphs";
const morphsBaseDir2 = "E:\\DAZ\\CustomLibrary\\data\\DAZ 3D\\Genesis 9\\Base\\Morphs";

// TODO, refine this there is a lot of shit you dont actually need here
const ignoreMorphsPatterns = [
    // Add any morph names to ignore here
    'cbs',
    'clothbreasthelp',
];

interface MorphConfig  {
    type: "morph" | "modifier" | "pose",
    name: string,
    value: number,
    reset?: number  // Optional reset value, defaults to 0 if not specified
  }

const extract = async (filePath: string) => {
    return new Promise<string>((resolve, reject) => {
        const stream = seven.extractFull(filePath, './tempMorphsExtractDir', {
            $bin: sevenBin.path7za
        });
        stream.on('data', function (data: any) {
            const newFilePath = `./tempMorphsExtractDir\\${data.file}`;
            const fileContent = fs.readFileSync(newFilePath, 'utf-8');
            fs.rmSync(newFilePath); // delete the extracted file
            return resolve(fileContent)
        });
    });
};

(async () => {

    console.log("Generating config...");

    // get a list of all files in the base dir that end with .dsf
    const filesList: string[] = [];
    for (const baseDir of [morphsBaseDir, morphsBaseDir2]) {
        const files = fs.readdirSync(baseDir, { recursive: true, encoding: 'utf-8' }).filter(file => file.endsWith('.dsf'));
        filesList.push(...files.map(file => `${baseDir}\\${file}`));
    }

    console.log(`Found ${filesList.length} morph files.`);

    const morphConfigs: MorphConfig[] = [];

    for (const file of filesList) {

        if (ignoreMorphsPatterns.some(pattern => file.toLowerCase().includes(pattern.toLowerCase()))) {
            console.log(`Skipping file: ${file}.`);
            continue;
        }

        const stringContent = fs.readFileSync(file, 'utf-8');

        let json: any;
        try {
            json = JSON.parse(stringContent);
        } catch (error) {
            // its compressed, try to extract it with 7zip
            try {
                console.log(`Extracting compressed file: ${file}`);
                const stringContent = await extract(file);
                json = JSON.parse(stringContent);
            } catch (extractError) {
                console.error(`Error extracting and parsing JSON in compressed file: ${file}`, extractError);
                continue;
            }
        }

        if (json.modifier_library) {
            if (!Array.isArray(json.modifier_library)) {
                throw new Error(`modifier_library is not an array in file: ${file}`);
            }
            if (json.modifier_library.length > 1) {
                throw new Error(`modifier_library has more than one entry in file: ${file}`);
            }

            const modifier = json.modifier_library[0];
            const morphName = modifier.name;
            console.log(`Morph Name: ${morphName}`);

            const config: MorphConfig = {
                type: "morph",
                name: morphName,
                value: 1,
            };
            morphConfigs.push(config);
        }
    }

    fs.writeFileSync('./morphConfigs.json', JSON.stringify(morphConfigs, null, 2), 'utf-8');
    console.log("Config generation complete. Output written to morphConfigs.json. Total morphs:", morphConfigs.length);

})();