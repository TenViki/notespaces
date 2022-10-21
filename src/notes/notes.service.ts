import { Injectable } from "@nestjs/common";
import { Inject } from "@nestjs/common/decorators";
import { forwardRef } from "@nestjs/common/utils";
import { InjectRepository } from "@nestjs/typeorm";
import { Attachment } from "discord.js";
import { ClassService } from "src/class/class.service";
import { DiscordService } from "src/discord/discord.service";
import { File } from "src/entites/File.entity";
import { Note } from "src/entites/Note.entity";
import { FilesService } from "src/files/files.service";
import { Repository } from "typeorm";

@Injectable()
export class NotesService {
  constructor(
    private filesService: FilesService,
    @Inject(forwardRef(() => DiscordService))
    private discordService: DiscordService,
    @InjectRepository(Note) private noteRepo: Repository<Note>,
    @Inject(forwardRef(() => ClassService)) private classService: ClassService,
  ) {}

  async create(
    subject: string,
    caption: string,
    date: Date,
    guild: string,
    files: File[],
  ) {
    const clazz = await this.classService.getClass(guild);
    const subjectEntity = await this.classService.getSubjectByShorthand(
      subject,
      guild,
    );

    if (!clazz || !subjectEntity) {
      throw new Error("No class or subject found");
    }

    // fetch thread
    const thread = await this.discordService.getThread(
      subjectEntity.discordChannelId,
    );

    const message = await thread.send({
      content: `**${date.getDate()}. ${
        date.getMonth() + 1
      }.** ${date.getFullYear()} - **${subjectEntity.name}**, ${caption}`,
      files: await Promise.all(
        files.map(async (f) => ({
          attachment: await this.filesService.getFileBuffer(f),
          name: f.orginalname,
        })),
      ),
    });

    const note = this.noteRepo.create({
      caption,
      date,
      subject: subjectEntity,
      files,
      message: message.id,
    });

    return this.noteRepo.save(note);
  }

  formatDateString(date: string) {
    const dateArray = date.split(".");
    const day = dateArray[0];
    const month = dateArray[1];
    const year = dateArray[2];

    return new Date(+year, +month - 1, +day);
  }

  async addNote(
    subject: string,
    caption: string,
    date: string | undefined,
    guild: string,
    files: (Attachment | null)[],
  ) {
    let d = new Date();
    d.setHours(0, 0, 0, 0);
    if (date) d = this.formatDateString(date);

    const fileEntities = await Promise.all(
      files
        .filter((f) => f !== null)
        .map((f) => (f ? this.filesService.downloadFile(f) : null)),
    );

    const sub = await this.classService.getSubjectByShorthand(subject, guild);

    if (!sub) {
      throw new Error("No subject found");
    }

    return this.create(subject, caption, d, guild, fileEntities);
  }

  async getNotesByDate(date: string | Date, guild: string) {
    const s = await this.noteRepo.find({
      where: {
        date: typeof date === "string" ? this.formatDateString(date) : date,
        subject: {
          clazz: {
            discordGuildId: guild,
          },
        },
      },
      relations: ["files", "subject"],
    });

    console.log(s);

    return s;
  }
}
