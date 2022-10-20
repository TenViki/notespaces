import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Clazz } from "src/entites/Class.entity";
import { ClassService } from "./class.service";

@Module({
  providers: [ClassService],
  imports: [TypeOrmModule.forFeature([Clazz])],
  exports: [ClassService],
})
export class ClassModule {}
