import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicFamilyComponent } from './basic-family.component';

describe('BasicFamilyComponent', () => {
  let component: BasicFamilyComponent;
  let fixture: ComponentFixture<BasicFamilyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BasicFamilyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BasicFamilyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
