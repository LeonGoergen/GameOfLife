import { Component } from '@angular/core';

@Component({
  selector: 'app-edit-tools',
  templateUrl: './edit-tools.component.html',
  styleUrls: ['./edit-tools.component.css']
})
export class EditToolsComponent {

  onCopyClick() {
    console.log('copy');
  }

  onResetClick() {
    console.log('reset');
  }

}
