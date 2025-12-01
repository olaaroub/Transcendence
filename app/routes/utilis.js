const path   = require('path');
const fs     = require('fs');
const { v4: uuidv4 } = require('uuid');

async function DownoladImageFromUrl(url, provider)
{

    const AvatarData = await fetch(url);

    if (!AvatarData.ok)
        throw ({error: 'Network response was not ok'});
    // get extention
    const contentType =  AvatarData.headers.get('content-type');
    const mimType = {
        'image/jpeg': '.jpg',
        'image/jpg':  '.jpg',
        'image/png':  '.png',
        'image/gif':  '.gif'
    }
    if (!mimType[contentType])
        return '/public/Default_pfp.jpg'

    const ext = mimType[contentType];
    // convert the data stream to array of buffer to convert it after to buffer type
    const arrayBuffer = await AvatarData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const file_name = uuidv4() + provider + ext;
    const file_path = path.join(__dirname, '../static', file_name);

    await fs.promises.writeFile(file_path, buffer);
    return `/public/${file_name}`;
}

module.exports = DownoladImageFromUrl;