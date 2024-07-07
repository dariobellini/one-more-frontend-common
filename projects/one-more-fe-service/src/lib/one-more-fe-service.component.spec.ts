import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OneMoreFeServiceComponent } from './one-more-fe-service.component';

describe('OneMoreFeServiceComponent', () => {
  let component: OneMoreFeServiceComponent;
  let fixture: ComponentFixture<OneMoreFeServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OneMoreFeServiceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OneMoreFeServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
