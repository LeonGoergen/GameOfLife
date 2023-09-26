import { Component } from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {RulesComponent} from "./rules/rules.component";
import {EncyclopediaComponent} from "./encyclopedia/encyclopedia.component";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  protected isSidebarMinimized = false;

  constructor(public dialog: MatDialog) {}

  protected toggleSidebar(): void {
    this.isSidebarMinimized = !this.isSidebarMinimized;
  }

  protected openRulesDialog(): void {
    this.dialog.open(RulesComponent);
  }

  protected openEncyclopediaDialog(): void {
    this.dialog.open(EncyclopediaComponent);
  }
}
