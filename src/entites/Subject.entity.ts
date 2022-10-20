import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Clazz } from "./Class.entity";
import { Note } from "./Note.entity";

@Entity()
export class Subject {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  shorthand: string;

  @Column()
  discordChannelId: string;

  @OneToMany(() => Note, (note) => note.subject)
  notes: Note[];

  @ManyToOne(() => Clazz, (clazz) => clazz.subjects)
  clazz: Clazz;
}
