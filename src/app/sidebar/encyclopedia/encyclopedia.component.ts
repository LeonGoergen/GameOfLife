import {Component} from '@angular/core';
import { categories } from '../../../assets/patterns';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-encyclopedia',
  templateUrl: './encyclopedia.component.html',
  styleUrls: ['./encyclopedia.component.css']
})
export class EncyclopediaComponent {
  categories = categories;
  isValidInput: boolean = true;
  buttonPressed: boolean = false;

  constructor(private dialogRef: MatDialogRef<EncyclopediaComponent>) { }

  copyToClipboard(rle: string): void {
    navigator.clipboard.writeText(rle).then((): void => {
      this.dialogRef.close();
    }).catch(err => {
      console.error('Could not copy text: ', err);
    });
  }

  insertRle(rleString: string): void {
    rleString = rleString.replace(/\s+/g, '');

    if (this.isValidRle(rleString)) {
      this.dialogRef.close({ action: 'insert', rleString: rleString });
      this.isValidInput = true;
    } else {
      this.isValidInput = false;
      this.buttonPressed = true;
    }
  }

  isValidRle(rleString: string): boolean {
    const pattern = /^[ob$0-9]+!$/;
    return pattern.test(rleString);
  }

  onInput(): void {
    this.isValidInput = true; // Reset input validity
    this.buttonPressed = false; // Reset button press flag
  }
}
