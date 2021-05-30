import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicD3Component } from './basic-d3.component';

describe('BasicD3Component', () => {
  let component: BasicD3Component;
  let fixture: ComponentFixture<BasicD3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BasicD3Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BasicD3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
