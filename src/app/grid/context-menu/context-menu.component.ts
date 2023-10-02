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

  selectArea () {};
  onBrushSelect() {};
}
