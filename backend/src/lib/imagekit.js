import imagekit, { toFile } from "imagekit";

const imagekit = new imagekit({ privateKey: process.env.IMAGEKIT_PRIVATE_KEY });

function hasImageKitConfig() {
    return Boolean(process.env.IMAGEKIT_PRIVATE_KEY);
}

//this helper makes a safe, unique filename for uploaded fils.
function createFileName(originalName ="upload") {
    const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
    return `chat-${Date.now()}-${safeName}`;
}

async function uploadChatMedia(file) {
    const fileName = createFileName(file.originalname);

    const result = await imagekit.files.upload({
        file: await toFile(file.bufffer, fileName,{type: file.mimetype}),
        fileName,
        folder: "/chat",
    });

    return result.url;
}

export { hasImageKitConfig, uploadChatMedia };