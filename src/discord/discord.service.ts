import { Injectable } from "@nestjs/common";
import {
  Client,
  GatewayIntentBits,
  REST,
  SlashCommandBuilder,
} from "discord.js";
import { Routes } from "discord-api-types/v9";
import { ClassService } from "src/class/class.service";

@Injectable()
export class DiscordService {
  bot: Client;
  rest: REST;

  constructor(private classService: ClassService) {
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

  private async onInteractionCreate(interaction) {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === "ping") {
      await interaction.reply("Pong!");
    }

    if (commandName === "setup") {
      const className = interaction.options.getString("class");
      const channel = interaction.options.getChannel("channel");
      const guild = interaction.guild;

      await this.classService.createClass(className, guild.id, channel.id);

      await interaction.reply(
        `Created class ${className} and set channel to ${channel} (guild id: ${guild.id})`,
      );
    }
  }
}
