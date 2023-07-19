import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import IUser from '../models/user.model'
import { Observable, of } from 'rxjs';
import { delay, filter, map, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ActivatedRoute, NavigationEnd } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private usersCollection: AngularFirestoreCollection<IUser>;
  public isAuthenticated$: Observable<boolean>; //$ show that this an observable
  public isAuthenticatedWithDelay$: Observable<boolean>;
  public redirect = false;

  constructor(
    private auth: AngularFireAuth,
    private db: AngularFirestore,
    public router: Router,
    public route: ActivatedRoute) {
    this.usersCollection = db.collection("users");
    this.isAuthenticated$ = auth.user.pipe(
      map(user => !!user) //typecast to boolean
    )
    this.isAuthenticatedWithDelay$ = this.isAuthenticated$.pipe(
      delay(1000)
    );
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(e => this.route.firstChild),
      switchMap(route => route?.data ?? of({ authOnly: false }))
    )
      .subscribe((data) => {
        this.redirect = data.authOnly ?? false;
      })
  }

  public async createUser(userData: IUser) {

    // password check
    if (!userData.password) {
      throw new Error("Password not provided");
    }

    const userCredential = await this.auth.createUserWithEmailAndPassword(userData.email, userData.password)

    if (!userCredential.user) {
      throw new Error("User can't found");
    }
    await this.usersCollection.doc(userCredential.user.uid).set({
      name: userData.name,
      email: userData.email,
      age: userData.age,
      phoneNumber: userData.phoneNumber
    })

    await userCredential.user.updateProfile({
      displayName: userData.name
    })
  }

  public async logout($event?: Event) {
    if ($event) {
      $event.preventDefault();
    }

    await this.auth.signOut();

    if (this.redirect) {
      await this.router.navigateByUrl('/');
    }
  }
}
