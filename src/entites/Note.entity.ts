import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { File } from "./File.entity";
import { Subject } from "./Subject.entity";

@Entity()
export class Note {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  caption: string;

  @Column()
  date: Date;

  @ManyToOne(() => Subject, (subject) => subject.notes)
  subject: Subject;

  @OneToMany(() => File, (file) => file.note)
  files: File[];
}
