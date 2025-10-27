import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAuth } from './user-auth';

describe('UserAuth', () => {
  let component: UserAuth;
  let fixture: ComponentFixture<UserAuth>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserAuth]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserAuth);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
