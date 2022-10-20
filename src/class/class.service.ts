import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Clazz } from "src/entites/Class.entity";
import { Repository } from "typeorm";

@Injectable()
export class ClassService {
  constructor(@InjectRepository(Clazz) private classRepo: Repository<Clazz>) {}

  async createClass(name: string, guildid: string, channelid: string) {
    const existingClass = await this.classRepo.findOne({ where: { name } });

    if (existingClass) {
      return this.classRepo.update(existingClass.id, {
        discordGuildId: guildid,
        discordChannelId: channelid,
      });
    }

    const clazz = this.classRepo.create({
      name,
      discordGuildId: guildid,
      discordChannelId: channelid,
    });
    return this.classRepo.save(clazz);
  }
}
