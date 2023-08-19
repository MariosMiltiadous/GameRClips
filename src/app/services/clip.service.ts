import { Injectable } from '@angular/core';
import {
  AngularFirestore, AngularFirestoreCollection,
  DocumentReference, QuerySnapshot
} from '@angular/fire/compat/firestore'
import IClip from '../models/clip.model';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { switchMap, map } from 'rxjs/operators';
import { Observable, of, BehaviorSubject, combineLatest } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ClipService implements Resolve<IClip | null>{
  public clipsCollection: AngularFirestoreCollection<IClip>
  pageClips: IClip[] = []
  pendingReq = false

  constructor(
    private db: AngularFirestore,
    private auth: AngularFireAuth,
    private storage: AngularFireStorage,
    private router: Router
  ) {
    this.clipsCollection = db.collection('clips')
  }

  createClip(data: IClip): Promise<DocumentReference<IClip>> {
    return this.clipsCollection.add(data);
  }

  getUserClips(sort$: BehaviorSubject<string>) {
    return combineLatest([
      this.auth.user,
      sort$
    ]).pipe(
      switchMap(values => {
        const [user, sort] = values

        if (!user) {
          // return an observable using 'of' that push the value -> [] emtpy array if the user object is empty
          return of([])
        }

        // check if the user id is same with current user ID
        const querry = this.clipsCollection.ref.where(
          'uid', '==', user.uid
        ).orderBy(
          'timeStamp',
          sort === '1' ? "desc" : "asc"
        )

        return querry.get()
      }),
      map(snapShot => (snapShot as QuerySnapshot<IClip>).docs)
    )
  }

  updateClip(id: string, title: string) {
    return this.clipsCollection.doc(id).update({
      title
    })
  }

  async deleteClip(clip: IClip) {
    const clipRef = this.storage.ref(`clips/${clip.fileName}`)
    const screenshotRef = this.storage.ref(
      `screenshots/${clip.screenshotFileName}`
    )

    await screenshotRef.delete()
    await clipRef.delete()

    await this.clipsCollection.doc(clip.docID).delete()
  }

  async getClips() {
    if (this.pendingReq) {
      return
    }

    this.pendingReq = true

    // querry must use orderBy() in order for the solution to work and to use startAfter()
    let query = this.clipsCollection.ref.orderBy(
      'timeStamp', 'desc'
    ).limit(6)
    const { length } = this.pageClips

    if (length) {
      const lastDocID = this.pageClips[length - 1].docID
      const lastDoc = await this.clipsCollection.doc(lastDocID).get().toPromise()

      query = query.startAfter(lastDoc)// start a new quesrry from the last item in preview scroll
    }

    const snapshot = await query.get()

    snapshot.forEach(doc => {
      this.pageClips.push({
        docID: doc.id,
        ...doc.data()
      })
    })

    this.pendingReq = false
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    return this.clipsCollection.doc(route.params.id)
      .get().pipe(
        map(snapshot => {
          // unwraping the data of the snapshot
          const data = snapshot.data()
          if (!data) {
            this.router.navigate(['/'])
            return null
          }

          return data
        })
      )
  }
}