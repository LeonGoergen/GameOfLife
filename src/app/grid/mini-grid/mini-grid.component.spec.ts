import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiniGridComponent } from './mini-grid.component';

describe('MiniGridComponent', () => {
  let component: MiniGridComponent;
  let fixture: ComponentFixture<MiniGridComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MiniGridComponent]
    });
    fixture = TestBed.createComponent(MiniGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
