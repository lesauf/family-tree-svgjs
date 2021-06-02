import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DlacremeSvgComponent } from './dlacreme-svg.component';

describe('DlacremeComponent', () => {
  let component: DlacremeSvgComponent;
  let fixture: ComponentFixture<DlacremeSvgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DlacremeSvgComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DlacremeSvgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
