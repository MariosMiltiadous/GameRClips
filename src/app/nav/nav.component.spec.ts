import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { NavComponent } from './nav.component';
import { AuthService } from '../services/auth.service';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

describe('NavComponent', () => {
  let component: NavComponent;
  let fixture: ComponentFixture<NavComponent>;
  // Spy will count the number a method has beem called
  const mockedAuthService = jasmine.createSpyObj('AuthService', [
    'createUser', 'logout'
  ], {
    // instead of connect to firebase and get authentication we force the authentication to true
    // means that the user is logged in 
    isAuthenticated$: of(true)
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NavComponent],
      imports: [RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: mockedAuthService }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(NavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should log out', () => {
    const logoutLink = fixture.debugElement.query(By.css('li:nth-child(3) a'));

    expect(logoutLink).withContext('Not logged in').toBeTruthy();

    //trigger the click for logout
    logoutLink.triggerEventHandler('click');
    const service = TestBed.inject(AuthService);
    expect(service.logout).withContext('Could not click logout link').toHaveBeenCalledTimes(1);
  })
});
