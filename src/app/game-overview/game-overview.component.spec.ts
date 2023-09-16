import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameOverviewComponent } from './game-overview.component';

describe('GameOverviewComponent', () => {
  let component: GameOverviewComponent;
  let fixture: ComponentFixture<GameOverviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GameOverviewComponent]
    });
    fixture = TestBed.createComponent(GameOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
