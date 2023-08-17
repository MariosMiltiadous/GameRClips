import { Injectable } from '@angular/core';
import {
  AngularFirestore, AngularFirestoreCollection,
  DocumentReference, QuerySnapshot
} from '@angular/fire/compat/firestore'
import { IClip } from '../models/clip.model';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { switchMap, map } from 'rxjs/operators';
import { Observable, of, BehaviorSubject, combineLatest } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Injectable({
  providedIn: 'root'
})
export class ClipService {
  public clipsCollection: AngularFirestoreCollection<IClip>

  constructor(
    private db: AngularFirestore,
    private auth: AngularFireAuth,
    private storage: AngularFireStorage
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
}
