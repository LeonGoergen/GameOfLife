import {Component} from '@angular/core';
import { categories } from '../../../../assets/patterns';
import {RleService} from "../../services/rle.service";
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-encyclopedia',
  templateUrl: './encyclopedia.component.html',
  styleUrls: ['./encyclopedia.component.css']
})
export class EncyclopediaComponent {
  categories = categories;

  constructor(private dialogRef: MatDialogRef<EncyclopediaComponent>) { }

  copyToClipboard(rle: string): void {
    navigator.clipboard.writeText(rle).then(() => {
      this.dialogRef.close();
    }).catch(err => {
      console.error('Could not copy text: ', err);
    });

  }
}
