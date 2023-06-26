import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import IUser from '../models/user.model'
import { Observable } from 'rxjs';
import { delay, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private usersCollection: AngularFirestoreCollection<IUser>;
  public isAuthenticated$: Observable<boolean>; //$ show that this an observable
  public isAuthenticatedWithDelay$: Observable<boolean>; 

  constructor(private auth: AngularFireAuth,
    private db: AngularFirestore) {
    this.usersCollection = db.collection("users");
    this.isAuthenticated$ = auth.user.pipe(
      map(user => !!user) //typecast to boolean
    )
    this.isAuthenticatedWithDelay$ = this.isAuthenticated$.pipe(
      delay(1000)
    );
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
}
