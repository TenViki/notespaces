import { Injectable, Inject, forwardRef } from "@nestjs/common";
import {
  Attachment,
  CacheType,
  Channel,
  ChannelType,
  Client,
  CommandInteractionOptionResolver,
  GatewayIntentBits,
  Interaction,
  REST,
  SlashCommandBuilder,
} from "discord.js";
import { Routes } from "discord-api-types/v9";
import { ClassService } from "src/class/class.service";
import { NotesService } from "src/notes/notes.service";

@Injectable()
export class DiscordService {
  bot: Client;
  rest: REST;

  constructor(
    @Inject(forwardRef(() => ClassService)) private classService: ClassService,
    private noteService: NotesService,
  ) {
    this.bot = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
      ],
    });

    this.bot.login(process.env.DISCORD_BOT_TOKEN);
    this.bot.on("ready", this.onReady.bind(this));
    this.bot.on("interactionCreate", this.onInteractionCreate.bind(this));

    this.rest = new REST({ version: "9" }).setToken(
      process.env.DISCORD_BOT_TOKEN,
    );
  }

  async getThread(threadId: string) {
    const thread = await this.bot.channels.fetch(threadId);
    if (!thread.isTextBased()) throw new Error("Thread is not text based");
    return thread;
  }

  private async onReady() {
    const pingCommand = new SlashCommandBuilder()
      .setName("ping")
      .setDescription("Hello, world!");

    const setupCommand = new SlashCommandBuilder()
      .setName("setup")
      .setDescription("Setup the bot for your server")
      .addStringOption((option) =>
        option
          .setName("class")
          .setDescription("Name of the class")
          .setRequired(true),
      )
      .addChannelOption((option) =>
        option
          .setName("channel")
          .setDescription("Channel to send notes to")
          .setRequired(true),
      );

    const subjectCommand = new SlashCommandBuilder()
      .setName("subject")
      .setDescription("Add a subject to your class")
      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription("Name of the subject")
          .setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName("shorthand")
          .setDescription("Shorthand of the subject")
          .setRequired(true),
      );

    // register slash commands
    await this.rest.put(
      Routes.applicationCommands(process.env.DISCORD_APP_ID),
      {
        body: [pingCommand, setupCommand, subjectCommand],
      },
    );

    console.log("Registered slash commands");
  }

  private async onInteractionCreate(interaction: Interaction<CacheType>) {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    try {
      if (commandName === "ping") {
        await interaction.reply("Pong!");
      }

      const interactionOptions =
        interaction.options as CommandInteractionOptionResolver;

      if (commandName === "setup") {
        const className = interactionOptions.getString("class");
        const channel = interactionOptions.getChannel("channel");
        const guild = interaction.guild;

        if (channel.type !== ChannelType.GuildText) {
          await interaction.reply("Please select a text channel");
          return;
        }

        await this.classService.createClass(className, guild.id, channel.id);

        await interaction.reply(
          `Created class ${className} and set channel to ${channel} (guild id: ${guild.id})`,
        );
      }

      if (commandName === "subject") {
        const name = interactionOptions.getString("name");
        const shorthand = interactionOptions.getString("shorthand");

        await this.classService.addSubject(
          name,
          shorthand,
          interaction.guild.id,
        );

        await interaction.reply(`Added subject ${name} (${shorthand}) `);
      }

      if (commandName === "note") {
        interaction.deferReply();
        const subject = interactionOptions.getString("subject");
        const caption = interactionOptions.getString("caption");
        const date = interactionOptions.getString("date");
        const file1 = interactionOptions.getAttachment("file1") as Attachment;
        const file2 = interactionOptions.getAttachment("file2") as
          | Attachment
          | undefined;
        const file3 = interactionOptions.getAttachment("file3") as
          | Attachment
          | undefined;

        await this.noteService.addNote(
          subject,
          caption,
          date,
          interaction.guild.id,
          [file1, file2, file3],
        );

        await interaction.followUp(`Added note ${caption} to ${subject}`);
      }
    } catch (error) {
      console.error(error);
      if (interaction.deferred) {
        await interaction.followUp("An error occurred: " + error.message);
      } else {
        await interaction.reply("An error occurred: " + error.message);
      }
    }
  }
}
