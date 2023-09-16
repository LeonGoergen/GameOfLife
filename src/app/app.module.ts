import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { GridComponent } from './game-overview/grid/grid.component';
import { GameOverviewComponent } from './game-overview/game-overview.component';
import { GameControlsComponent } from './game-overview/sidebar/game-controls/game-controls.component';
import { SidebarComponent } from './game-overview/sidebar/sidebar.component';

@NgModule({
  declarations: [
    AppComponent,
    GridComponent,
    GameOverviewComponent,
    GameControlsComponent,
    SidebarComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
