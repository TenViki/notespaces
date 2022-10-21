import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Clazz } from "src/entites/Class.entity";
import { Repository } from "typeorm";
import { Subject } from "src/entites/Subject.entity";
import { DiscordService } from "src/discord/discord.service";
import { ChannelType, Routes, SlashCommandBuilder } from "discord.js";

@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(Clazz) private classRepo: Repository<Clazz>,
    @InjectRepository(Subject) private subjectRepo: Repository<Subject>,
    @Inject(forwardRef(() => DiscordService))
    private discordService: DiscordService,
  ) {}

  async createClass(name: string, guildid: string, channelid: string) {
    const existingClass = await this.classRepo.findOne({ where: { name } });

    if (existingClass) {
      return this.classRepo.update(existingClass.id, {
        discordGuildId: guildid,
        discordChannelId: channelid,
      });
    }

    const clazz = this.classRepo.create({
      name,
      discordGuildId: guildid,
      discordChannelId: channelid,
    });
    return this.classRepo.save(clazz);
  }

  async updateNoteCommand(id: string) {
    const subjects = await this.subjectRepo.find({
      relations: ["clazz"],
      where: {
        clazz: {
          discordGuildId: id,
        },
      },
    });

    console.log(subjects);

    const updatedCommand = new SlashCommandBuilder()
      .setName("note")
      .setDescription("Create a note")
      .addStringOption((option) =>
        option
          .setName("subject")
          .setDescription("The subject of the note")
          .setRequired(true)
          .setChoices(
            ...subjects.map((s) => ({
              name: s.name,
              value: s.shorthand,
            })),
          ),
      )
      .addStringOption((option) =>
        option
          .setName("caption")
          .setDescription("The caption of the note")
          .setRequired(true),
      )
      .addAttachmentOption((option) =>
        option
          .setName("file1")
          .setDescription("The file to upload")
          .setRequired(true),
      )
      .addAttachmentOption((option) =>
        option.setName("file2").setDescription("The file to upload"),
      )
      .addAttachmentOption((option) =>
        option.setName("file3").setDescription("The file to upload"),
      )
      .addStringOption((option) =>
        option.setName("date").setDescription("Date (DD.MM.YYYY)"),
      );

    console.log(id, updatedCommand.toJSON());
    this.discordService.rest.put(
      Routes.applicationGuildCommands(process.env.DISCORD_APP_ID, id),
      { body: [updatedCommand.toJSON()] },
    );
  }

  async addSubject(name: string, shorthand: string, guild: string) {
    const clazz = await this.classRepo.findOne({
      where: { discordGuildId: guild },
    });

    // create thread in discord channel
    const channel = await this.discordService.bot.channels.fetch(
      clazz.discordChannelId,
    );

    if (channel.type !== ChannelType.GuildText)
      throw new Error("Channel is not a text channel");

    const thread = await channel.threads.create({
      name: name,
      autoArchiveDuration: 10080,
      type: ChannelType.PublicThread,
    });

    const subject = this.subjectRepo.create({
      clazz,
      name: name,
      shorthand: shorthand,
      discordChannelId: thread.id,
    });
    await this.subjectRepo.save(subject);

    await this.updateNoteCommand(guild);
  }
}
