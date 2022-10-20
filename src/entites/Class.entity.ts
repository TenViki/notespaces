import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Subject } from "./Subject.entity";

@Entity()
export class Clazz {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  discordGuildId: string;

  @Column()
  discordChannelId: string;

  @OneToMany(() => Subject, (subject) => subject.clazz)
  subjects: Subject[];
}
