import fs from 'fs';
import seven from 'node-7z';
import sevenBin from '7zip-bin'

const morphsBaseDir = "E:\\DAZ\\DazContentLibrary\\data\\Daz 3D\\Genesis 9\\Base\\Morphs";
const morphsBaseDir2 = "E:\\DAZ\\CustomLibrary\\data\\DAZ 3D\\Genesis 9\\Base\\Morphs";
import Decimal from 'decimal.js';

// TODO, refine this there is a lot of shit you dont actually need here
// ALSO, make sure u are getting the clone morphs for previous gens
const ignoreMorphsPatterns = [
    // Add any morph names to ignore here
    'cbs',
    'clothbreasthelp',
    'pants',
    'straps',
    'outfit',
    'CTRLMD',
    'Pupil',
    'jcm',
    'facs',
    'LoadUVPrepPose',
    'powerpose',
    'Base Correctives',
    'Base Pose',
    'Utilities',
    'dth',
    'Size Finger',
    'Size Toe',
    'Side Outer',
    'Side Inner',
    'OOTG9Intimates',
    'MCM_',
    '_Cor',
    'ToonShellOffset',
    'FlexionAutoStrength',
    'Iris',
    'Piercing',
    'TESTMORPH2',
    'TBD_TEST',
    'Fingers Distance',
    'Toes Distance',
    'TM Philtrum Depth',
    'body_bs_Navel_HD',
    'head_bs_MouthRealism_HD'
];

interface MorphConfig {
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

        let shouldIgnore = false;
        for (const pattern of ignoreMorphsPatterns) {
            if (file.toLowerCase().includes(pattern.toLowerCase())) {
                console.log(`Skipping file: ${file}. Matched ignore pattern: ${pattern}`);
                shouldIgnore = true;
                break;
            }
        }
        if (shouldIgnore) {
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

 //   console.log("Generating DUF animation file...");

    // const timePerFrame = 1/30;
    // const one = new Decimal(1);
    // const thirty = new Decimal(30);
    // const timePerFrameDecimal = one.dividedBy(thirty);

    // const animations = morphConfigs.map((morph, frameIndex) => {
    //     // round to max 8 decimal places to avoid floating point precision issues
    //     const decimalStartTime = (frameIndex+1)/30/// timePerFrameDecimal.mul(new Decimal(frameIndex + 1));
    //     const decimalPrevTime =  frameIndex/30//timePerFrameDecimal.mul(new Decimal(frameIndex));
    //     const decimalNextTime =  (frameIndex+2)/30;//timePerFrameDecimal.mul(new Decimal(frameIndex + 2));
    //     // const startTime = Number(((frameIndex + 1) * timePerFrame).toFixed(8));
    //     // const prevTime = Number((frameIndex * timePerFrame).toFixed(8));
    //     // const nextTime = Number(((frameIndex + 2) * timePerFrame).toFixed(8));

    //     return {
    //         url: `name://@selection#${morph.name}:?value/value`,
    //         keys: [
    //             [Number(decimalPrevTime.toFixed(6)), 0, [ "LINEAR" ]],
    //             [Number(decimalStartTime.toFixed(6)), 1, [ "LINEAR" ]],
    //             [Number(decimalNextTime.toFixed(6)), 0, [ "LINEAR" ]]
    //         ]
    //     };
    // });

    // // unfortunately this doesnt work due to some floating point bullshit that i cant seem to figure out
    // const dufContent = {
    //     file_version: "1.6.0.0",
    //     asset_info: {
    //         id: "/Animations/Generated/AllMorphsROM.duf",
    //         type: "preset_pose",
    //         contributor: {
    //             author: "generateConfig.ts",
    //             email: "",
    //             website: ""
    //         },
    //         revision: "1.0",
    //         modified: new Date().toISOString()
    //     },
    //     scene: {
    //         animations: animations
    //     }
    // };

    // fs.writeFileSync('./AllMorphsROM.duf', JSON.stringify(dufContent, null, 2), 'utf-8');
    // console.log(`DUF animation file generated at AllMorphsROM.duf with ${morphConfigs.length} morphs.`);

})();