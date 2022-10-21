import { Injectable } from "@nestjs/common";
import { Attachment } from "discord.js";

@Injectable()
export class NotesService {
  addNote(
    subject: string,
    caption: string,
    date: string | undefined,
    guild: string,
    files: Attachment[],
  ) {
    let d = new Date();
    if (date) {
      const dateArray = date.split(".");
      const day = dateArray[0];
      const month = dateArray[1];
      const year = dateArray[2];

      d = new Date(+year, +month - 1, +day);
    }
    console.log(subject, caption, d);

    console.log(files);
  }
}
