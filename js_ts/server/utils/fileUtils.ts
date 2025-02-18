import { FastifyRequest } from 'fastify';
import * as fs from 'fs';
import { existsSync, unlink } from "fs";
import mime from 'mime';
import path from "path";
import sanitize from "sanitize-filename";
import config from '../../config.js';
import { decodeToken } from './authUtils.js';
import { getInnerError } from "./errorUtils.js";

export const getUploadPath = ({ user, blob, filename }) => {
    if (!user) throw "User not given for uploadPath().";
    if (!filename) throw "Filename not given for uploadPath().";
    let p = `${process.env.FILE_UPLOAD_PATH || "/uploads"}/users/${user}`;
    if (blob) p += `/blobs/${blob}`;
    p += `/files/${sanitize(filename)}`;
    return p;
}

export const getFilePathFromUrl = (url) => {
    return getUploadDir() + url.replace(`${process.env.API_URL}${process.env.FILE_ENDPOINT}`, '');
}

export const getUploadDir = (relpath?) => {
    return path.resolve(`.${process.env.FILE_UPLOAD_PATH || "/uploads"}${relpath}` + relpath ? `${relpath}` : ``);
}

// generated the relative view url for a local network File
export const getFileUrl = ({ user, blob, filename }) => {
    if (!user) throw "User not given for uploadPath().";
    if (!filename) throw "Filename not given for uploadPath().";
    let p = `${process.env.FILE_ENDPOINT}/users/${user}`;
    if (blob) p += `/blobs/${blob}`;
    p += `/files/${sanitize(filename)}`;
    return p;
}

export const streamFileUpload = async (req: FastifyRequest, user, token: string) => {
    return new Promise(async (resolve, reject) => {
        try {
            let payload: any = decodeToken(token, true);
            //console.log(`decoded upload token:`, payload)
            if (payload?.user != user.id) throw "Invalid token.";
            let relpath = getUploadPath({ user: user.id, blob: payload.blob, filename: payload.filename });
            const fullpath = path.resolve(path.join(config.appDir, relpath));
            // ensure directory
            //console.log(`filepath`, fullpath)
            fs.mkdirSync(path.dirname(fullpath), { recursive: true });

            const readStream = req.raw;
            const writeStream = fs.createWriteStream(fullpath);
            readStream.pipe(writeStream);

            writeStream.on('finish', () => {
                //console.log(`write stream finished.`)
                writeStream.end();
                resolve(relpath);
            });

            // writeStream.on('drain', () => {
            //     // Calculate how much data has been piped yet
            //     const written = writeStream.bytesWritten;
            //     const total = parseInt(req.headers['content-length']);
            //     const pWritten = (written / total * 100).toFixed(2)
            //     console.log(`Processing  ...  ${pWritten}% done`);
            // });

            writeStream.on('error', err => {
                // Send an error message to the client
                console.error('write stream error:', err);
                reject('File upload error: ' + err);
            });

        } catch (e) {
            return reject(getInnerError(e));
        }
    });
}

export const streamFileDownload = (res, urlPath: string) => {
    return new Promise((resolve, reject) => {
        try {
            if (urlPath.startsWith("/files")) urlPath = urlPath.replace("/files", "");
            console.log(`urlPath`, urlPath);

            const fullpath = path.resolve(path.join(config.appDir, "uploads", urlPath));
            if (!fs.existsSync(fullpath)) throw `File not found: ${fullpath}`;
            //const stats = fs.statSync(fullpath);
            const mimeType = mime.getType(fullpath);

            const stream = fs.createReadStream(fullpath, {
                highWaterMark: 128 * 1024 // 128KB buffer size
            });
            res.header('Content-Type', mimeType)
            return resolve(res.send(stream));
        } catch (e) {
            return reject(e);
        }
    });
}

export const deleteFile = async (file) => {
    return new Promise((resolve, reject) => {
        console.log(`deleteFile`, file);
        let filePath = file.url; //getUploadPath(`${entryId}/${file.key}`);
        console.log(`deleteFile path`, filePath);
        unlink(filePath, (err) => {
            if (err) return reject(err);
            return resolve(filePath);
        });
    });
}

export const deleteDir = async (path) => {
    return new Promise((resolve, reject) => {
        unlink(path, (err) => {
            if (err) return reject(err);
            return resolve(path);
        });
    });
}

export const mkDirSync = (dir) => {
    console.log(`mkDirSync`, dir);
    if (existsSync(dir)) return;
    return fs.mkdirSync(dir, { recursive: true });
}