import { Module } from "@nestjs/common";
import { ClassModule } from "src/class/class.module";
import { NotesModule } from "src/notes/notes.module";
import { DiscordService } from "./discord.service";

@Module({
  providers: [DiscordService],
  imports: [ClassModule, NotesModule],
  exports: [DiscordService],
})
export class DiscordModule {}
