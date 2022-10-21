import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DiscordModule } from "src/discord/discord.module";
import { Clazz } from "src/entites/Class.entity";
import { Subject } from "src/entites/Subject.entity";
import { ClassService } from "./class.service";

@Module({
  providers: [ClassService],
  imports: [
    TypeOrmModule.forFeature([Clazz, Subject]),
    forwardRef(() => DiscordModule),
  ],
  exports: [ClassService],
})
export class ClassModule {}
