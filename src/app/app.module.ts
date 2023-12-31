import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { GridComponent } from './grid/grid.component';
import { GameControlsComponent } from './sidebar/game-controls/game-controls.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { FormsModule } from "@angular/forms";
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RulesComponent } from './sidebar/rules/rules.component';
import { MatDialogModule } from '@angular/material/dialog';
import {NgOptimizedImage} from "@angular/common";
import {MatCheckboxModule} from "@angular/material/checkbox";
import { EncyclopediaComponent } from './sidebar/encyclopedia/encyclopedia.component';
import { CanvasPanDirective } from './grid/directives/canvas-pan.directive';
import { CanvasZoomDirective } from './grid/directives/canvas-zoom.directive';
import { CanvasClickDirective } from './grid/directives/canvas-click.directive';
import { ContextMenuComponent } from './grid/context-menu/context-menu.component';
import { A11yModule } from '@angular/cdk/a11y';
import {MatTabsModule} from "@angular/material/tabs";
import { MiniGridComponent } from './grid/mini-grid/mini-grid.component';

@NgModule({
  declarations: [
    AppComponent,
    GridComponent,
    GameControlsComponent,
    SidebarComponent,
    RulesComponent,
    EncyclopediaComponent,
    CanvasPanDirective,
    CanvasZoomDirective,
    CanvasClickDirective,
    ContextMenuComponent,
    MiniGridComponent,
    MiniGridComponent
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
    A11yModule,
    MatTabsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
