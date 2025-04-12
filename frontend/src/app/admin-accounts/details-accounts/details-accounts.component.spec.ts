import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsAccountsComponent } from './details-accounts.component';

describe('DetailsAccountsComponent', () => {
  let component: DetailsAccountsComponent;
  let fixture: ComponentFixture<DetailsAccountsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsAccountsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
