import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { File } from "src/entites/File.entity";
import { Note } from "src/entites/Note.entity";
import { NotesService } from "./notes.service";

@Module({
  providers: [NotesService],
  exports: [NotesService],
  imports: [TypeOrmModule.forFeature([File, Note])],
})
export class NotesModule {}
