import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {GridProperties} from "../../models/grid-properties.model";

@Component({
  selector: 'app-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.css']
})
export class ContextMenuComponent {
  protected x: number;
  protected y: number;

  isValidInput: boolean = true;
  buttonPressed: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ContextMenuComponent>,
  ) {
    this.x = data.cellKey.split(',')[0] / data.gridProperties.cellSize;
    this.y = data.cellKey.split(',')[1] / data.gridProperties.cellSize;
  }

  async pasteRle (): Promise<void> {
    const rleString: string = await navigator.clipboard.readText();
    this.dialogRef.close({action: 'insert', rleString: rleString});
  };

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

  selectArea () {};
  onBrushSelect() {};
}
