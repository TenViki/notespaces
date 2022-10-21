import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ConfigService } from "@nestjs/config/dist";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DiscordModule } from "./discord/discord.module";
import { ClassModule } from "./class/class.module";
import { NotesModule } from "./notes/notes.module";
import { FilesService } from './files/files.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get("DB_HOST"),
        port: configService.get("DB_PORT"),
        username: configService.get("DB_USER"),
        password: configService.get("DB_PASSWORD"),
        database: configService.get("DB_NAME"),
        entities: [__dirname + "/**/*.entity{.ts,.js}"],
        synchronize: true,
      }),
    }),
    DiscordModule,
    ClassModule,
    NotesModule,
  ],
  providers: [FilesService],
})
export class AppModule {}
