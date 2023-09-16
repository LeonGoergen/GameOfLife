import { Component } from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {RulesComponent} from "./rules/rules.component";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  isSidebarMinimized = false;

  constructor(public dialog: MatDialog) {}

  toggleSidebar() {
    this.isSidebarMinimized = !this.isSidebarMinimized;
  }

  openRulesDialog(): void {
    this.dialog.open(RulesComponent);
  }
}
