import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { File } from "src/entites/File.entity";
import { FilesService } from "./files.service";

@Module({
  providers: [FilesService],
  imports: [TypeOrmModule.forFeature([File])],
  exports: [FilesService],
})
export class FilesModule {}
