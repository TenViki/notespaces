import { Module } from "@nestjs/common";
import { forwardRef } from "@nestjs/common/utils";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ClassModule } from "src/class/class.module";
import { DiscordModule } from "src/discord/discord.module";
import { File } from "src/entites/File.entity";
import { Note } from "src/entites/Note.entity";
import { FilesModule } from "src/files/files.module";
import { NotesService } from "./notes.service";

@Module({
  providers: [NotesService],
  exports: [NotesService],
  imports: [
    TypeOrmModule.forFeature([File, Note]),
    ClassModule,
    FilesModule,
    forwardRef(() => DiscordModule),
  ],
})
export class NotesModule {}
