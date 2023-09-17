import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { GridComponent } from './game-overview/grid/grid.component';
import { GameOverviewComponent } from './game-overview/game-overview.component';
import { GameControlsComponent } from './game-overview/sidebar/game-controls/game-controls.component';
import { SidebarComponent } from './game-overview/sidebar/sidebar.component';
import { FormsModule } from "@angular/forms";
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RulesComponent } from './game-overview/sidebar/rules/rules.component';
import { MatDialogModule } from '@angular/material/dialog';
import {NgOptimizedImage} from "@angular/common";
import {MatCheckboxModule} from "@angular/material/checkbox";
import { EditToolsComponent } from './game-overview/sidebar/edit-tools/edit-tools.component';

@NgModule({
  declarations: [
    AppComponent,
    GridComponent,
    GameOverviewComponent,
    GameControlsComponent,
    SidebarComponent,
    RulesComponent,
    EditToolsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    MatIconModule,
    MatDividerModule,
    BrowserAnimationsModule,
    MatDialogModule,
    NgOptimizedImage,
    MatCheckboxModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
