import { Injectable, NotFoundException } from "@nestjs/common";
import { v4 as uuid } from "uuid";
import path from "path";
import fs from "fs";
import sharp from "sharp";

interface UploadFile {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
}

@Injectable()
export class PhotosService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || path.resolve(process.cwd(), "uploads");
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(file: UploadFile) {
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const dir = path.join(this.uploadDir, year, month);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const id = uuid();
    const ext = path.extname(file.originalname) || ".jpg";
    const filename = `${id}${ext}`;
    const filepath = path.join(dir, filename);

    // Save original
    fs.writeFileSync(filepath, file.buffer);

    // Generate thumbnail
    const thumbFilename = `${id}_thumb${ext}`;
    const thumbPath = path.join(dir, thumbFilename);
    await sharp(file.buffer).resize(640).jpeg({ quality: 80 }).toFile(thumbPath);

    const relativePath = `/${year}/${month}/${filename}`;
    const thumbRelativePath = `/${year}/${month}/${thumbFilename}`;

    return { id, url: relativePath, thumbUrl: thumbRelativePath };
  }

  getFilePath(relativePath: string) {
    const fullPath = path.join(this.uploadDir, relativePath);
    if (!fs.existsSync(fullPath)) throw new NotFoundException("图片不存在");
    return fullPath;
  }

  delete(relativePath: string) {
    const fullPath = path.join(this.uploadDir, relativePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
    const thumbPath = fullPath.replace(/\.\w+$/, "_thumb$&");
    if (fs.existsSync(thumbPath)) {
      fs.unlinkSync(thumbPath);
    }
    return { deleted: true };
  }
}
