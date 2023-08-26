import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CircleCollapsibleTreeComponent } from './circle-collapsible-tree.component';

describe('CircleCollapsibleTreeComponent', () => {
  let component: CircleCollapsibleTreeComponent;
  let fixture: ComponentFixture<CircleCollapsibleTreeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CircleCollapsibleTreeComponent]
    });
    fixture = TestBed.createComponent(CircleCollapsibleTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
