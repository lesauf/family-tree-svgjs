import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DlacremeComponent } from './dlacreme.component';

describe('DlacremeComponent', () => {
  let component: DlacremeComponent;
  let fixture: ComponentFixture<DlacremeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DlacremeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DlacremeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
