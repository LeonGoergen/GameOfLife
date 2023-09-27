import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {GRID_CONSTANTS} from "../../app.constants";

@Component({
  selector: 'app-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.css']
})
export class ContextMenuComponent {
  protected x: number;
  protected y: number;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ContextMenuComponent>
  ) {
    console.log(data)
    this.x = data.cellKey.split(',')[0] / GRID_CONSTANTS.CELL_SIZE;
    this.y = data.cellKey.split(',')[1] / GRID_CONSTANTS.CELL_SIZE;
  }

  async pasteRle (): Promise<void> {
    const rleString: string = await navigator.clipboard.readText();
    this.dialogRef.close({action: 'insert', rleString: rleString});
  };
  insertRle(rleString: string): void {
    this.dialogRef.close({action: 'insert', rleString: rleString});
  }
  selectArea () {};
  onBrushSelect() {};
}
