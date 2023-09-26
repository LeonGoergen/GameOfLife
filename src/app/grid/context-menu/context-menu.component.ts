import { Component } from '@angular/core';
import {Cell} from "../cell/cell";

@Component({
  selector: 'app-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.css']
})
export class ContextMenuComponent {

  pasteRle () {};
  insertRle () {};
  selectArea () {};
  onBrushSelect() {};
}
