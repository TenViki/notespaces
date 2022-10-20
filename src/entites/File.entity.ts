import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Note } from "./Note.entity";

@Entity()
export class File {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  filename: string;

  @Column()
  path: string;

  @Column()
  size: number;

  @Column()
  mimetype: string;

  @ManyToOne(() => Note, (note) => note.files)
  note: Note;
}
