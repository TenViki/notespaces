import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import axios from "axios";
import { Attachment } from "discord.js";
import { writeFile } from "fs/promises";
import { File } from "src/entites/File.entity";
import { Repository } from "typeorm";
import { v4 } from "uuid";

@Injectable()
export class FilesService {
  constructor(@InjectRepository(File) private fileRepo: Repository<File>) {}

  async saveFile(buffer: Buffer, filename: string, mimetype: string) {
    // generate filename and save file
    const fileName = v4();
    await writeFile(`./files/${fileName}`, buffer);

    const file = this.fileRepo.create({
      filename: fileName,
      mimetype: mimetype,
      orginalname: filename,
      path: `./files/${fileName}`,
      size: buffer.byteLength,
    });

    return this.fileRepo.save(file);
  }

  async downloadFile(fileInfo: Attachment) {
    const data = await axios.get(fileInfo.url, {
      responseType: "arraybuffer",
    });

    return this.saveFile(data.data, fileInfo.name, fileInfo.contentType);
  }
}
