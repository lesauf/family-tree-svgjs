import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CssFtComponent } from './css-ft.component';

describe('CssFtComponent', () => {
  let component: CssFtComponent;
  let fixture: ComponentFixture<CssFtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CssFtComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CssFtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
