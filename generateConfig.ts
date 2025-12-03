import fs from 'fs';
import seven from 'node-7z';
import sevenBin from '7zip-bin'

const morphsBaseDir = "E:\\DAZ\\DazContentLibrary\\data\\Daz 3D\\Genesis 9\\Base\\Morphs";

const extract = async (filePath: string) => {
    return new Promise<void>((resolve, reject) => {
        const stream = seven.extractFull(filePath, './tempMorphsExtractDir', {
            $bin: sevenBin.path7za
        });
        stream.on('data', function (data: any) {
            console.log(data)

            // TODO, read the file in from tempMorphsExtractDir as string, then delete the file and return the string content

            return resolve(data)
        });
    });
};

(async () => {

    console.log("Generating config...");

    // get a list of all files in the base dir that end with .dsf
    const files = fs.readdirSync(morphsBaseDir, { recursive: true, encoding: 'utf-8' }).filter(file => file.endsWith('.dsf'));

    console.log(`Found ${files.length} morph files.`);

    for (const file of files) {
        const fullPath = `${morphsBaseDir}\\${file}`;
        const stringContent = fs.readFileSync(fullPath, 'utf-8');

        let json: any;
        try {
            json = JSON.parse(stringContent);
        } catch (error) {
            console.error(`Error parsing JSON in file: ${fullPath}`);
            // TODO, if its binary we need to extract it with 7zip or similar
            const x = await extract(fullPath);
            console.log(x);
            continue;
        }
        //console.log(json);

        if (json.modifier_library) {
            if (!Array.isArray(json.modifier_library)) {
                throw new Error(`modifier_library is not an array in file: ${fullPath}`);
            }
            if (json.modifier_library.length > 1) {
                throw new Error(`modifier_library has more than one entry in file: ${fullPath}`);
            }

            const modifier = json.modifier_library[0];
            const morphName = modifier.name;
            console.log(`Morph Name: ${morphName}`);
        }
    }
})();