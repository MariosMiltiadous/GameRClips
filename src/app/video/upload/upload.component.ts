import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { v4 as uuid } from 'uuid';
import { last, switchMap } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { ClipService } from 'src/app/services/clip.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnDestroy {

  isDragover = false;
  file: File | null = null;
  nextStep = false;
  showAlert = false;
  alertColor = 'blue';
  alertMsg = 'Please wait! Your clip is being uploaded.'
  isSubmission = false;
  percentage = 0;
  showPercentage = true;
  user: firebase.User | null = null;
  task?: AngularFireUploadTask

  // form controls
  title = new FormControl('',
    {
      validators: [
        Validators.required,
        Validators.minLength(3)],
      nonNullable: true
    })

  uplaodForm = new FormGroup({
    title: this.title
  })

  constructor
    (
      private storage: AngularFireStorage,
      private auth: AngularFireAuth,
      private clipService: ClipService,
      private router: Router
    ) {
    auth.user.subscribe(user => this.user = user)
  }

  ngOnDestroy(): void {
    this.task?.cancel();
  }

  public storeFile($event: Event) {
    this.isDragover = false;
    // if there is dataTransfer object,
    // 1) then get ($event as DragEvent).dataTransfer?.files.item(0) ?? null
    // else 2) ($event.target as HTMLInputElement).files?.item(0) ?? null
    this.file = ($event as DragEvent).dataTransfer ?
      ($event as DragEvent).dataTransfer?.files.item(0) ?? null :
      ($event.target as HTMLInputElement).files?.item(0) ?? null;

    if (!this.file || this.file.type !== 'video/mp4') {
      return
    }

    this.title.setValue(this.file.name.replace(/\.[^/.]+$/, ''));
    this.nextStep = true;
  }

  uploadFile() {
    this.uplaodForm.disable();

    this.showAlert = true;
    this.alertColor = 'blue';
    this.alertMsg = 'Please wait! Your clip is being uploaded.';
    this.isSubmission = true;

    const clipFileName = uuid();
    const clipPath = `clips/${clipFileName}.mp4`;

    this.task = this.storage.upload(clipPath, this.file);
    const clipReference = this.storage.ref(clipPath);

    this.task.percentageChanges().subscribe((progress) => {
      this.percentage = progress as number / 100
    })

    this.task.snapshotChanges().pipe(
      last(),
      switchMap(() => clipReference.getDownloadURL())
    ).subscribe(
      {
        next: async (url) => {
          const clip = {
            uid: this.user?.uid as string,
            displayName: this.user?.displayName as string,
            title: this.title.value,
            fileName: `${clipFileName}.mp4`,
            url,
            timeStamp: firebase.firestore.FieldValue.serverTimestamp()
          }
          // user is authenticated because of the route guards - an unathenticated user will not see this component
          const clipDocRef = await this.clipService.createClip(clip);

          this.alertColor = 'green'
          this.alertMsg = 'Success! Your clip is now ready to share with with the world.'
          this.showPercentage = false

          setTimeout(() => {
            this.router.navigate([
              'clip', clipDocRef.id
            ]);
          }, 1000);
        },
        error: (err) => {
          this.uplaodForm.enable();

          this.alertColor = 'red'
          this.alertMsg = 'Upload failed! Please try again later.'
          this.isSubmission = true
          this.showPercentage = false
          console.error(err)
        }
      }
    )
  }
}
