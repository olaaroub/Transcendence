import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const __dirname = import.meta.dirname;

async function DownoladImageFromUrl(url, provider, logger) {

    const AvatarData = await fetch(url);

    if (!AvatarData.ok) {
        throw new Error('Network response was not ok when downloading avatar');
    }

    const contentType = AvatarData.headers.get('content-type');
    const mimType = {
        'image/jpeg': '.jpg',
        'image/jpg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif'
    };

    if (!mimType[contentType]) {
        logger.warn({ contentType }, "Unsupported image type from provider, using default");
        return {
            file_name: 'Default_pfp.jpg',
            avatar_path: '/public/Default_pfp.jpg'
        };
    }

    const ext = mimType[contentType];

    const arrayBuffer = await AvatarData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const file_name = uuidv4() + provider + ext;
    const file_path = path.join(__dirname, 'static', file_name);

    logger.debug({ filePath: file_path }, "Saving avatar to disk");

    await fs.promises.writeFile(file_path, buffer);
    return {
        file_name,
        avatar_path: `/public/${file_name}`,
        file_path: file_path 
    };
}

export default DownoladImageFromUrl;