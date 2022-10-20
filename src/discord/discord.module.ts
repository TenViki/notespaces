import { Module } from "@nestjs/common";
import { ClassModule } from "src/class/class.module";
import { DiscordService } from "./discord.service";

@Module({
  providers: [DiscordService],
  imports: [ClassModule],
})
export class DiscordModule {}
