import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { v4 as uuid } from 'uuid';
import { switchMap } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { ClipService } from 'src/app/services/clip.service';
import { Router } from '@angular/router';
import { FfmpegService } from '../../services/ffmpeg.service';
import { combineLatest, forkJoin } from 'rxjs';

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
  screenshots: string[] = []
  selectedScreenshot = ''
  screenshotTask?: AngularFireUploadTask

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
      private router: Router,
      public ffmpegService: FfmpegService
    ) {
    auth.user.subscribe(user => this.user = user)
    this.ffmpegService.init()
  }

  ngOnDestroy(): void {
    this.task?.cancel();
  }

  public async storeFile($event: Event) {

    if (this.ffmpegService.isRunning) {
      return
    }

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

    this.screenshots = await this.ffmpegService.getScreenshots(this.file)

    this.selectedScreenshot = this.screenshots[0]

    this.title.setValue(this.file.name.replace(/\.[^/.]+$/, ''));
    this.nextStep = true;
  }

  async uploadFile() {
    this.uplaodForm.disable();

    this.showAlert = true;
    this.alertColor = 'blue';
    this.alertMsg = 'Please wait! Your clip is being uploaded.';
    this.isSubmission = true;

    const clipFileName = uuid();
    const clipPath = `clips/${clipFileName}.mp4`;

    const screenshotBlob = await this.ffmpegService.blobFromURL(
      this.selectedScreenshot
    )
    const screenshotPath = `screenshots/${clipFileName}.png`

    this.task = this.storage.upload(clipPath, this.file);
    const clipReference = this.storage.ref(clipPath);

    this.screenshotTask = this.storage.upload(screenshotPath, screenshotBlob)
    const screenshotRef = this.storage.ref(screenshotPath)

    combineLatest(
      [
        this.task.percentageChanges(),
        this.screenshotTask.percentageChanges()
      ]).subscribe((progress) => {
        const [clipProgress, screenshotProgress] = progress

        if (!clipProgress || !screenshotProgress) {
          return
        }

        const total = clipProgress + screenshotProgress
        this.percentage = total as number / 200
      })


    forkJoin([
      this.task.snapshotChanges(),
      this.screenshotTask.snapshotChanges()
    ]).pipe(
      switchMap(() => forkJoin([
        clipReference.getDownloadURL(),
        screenshotRef.getDownloadURL()
      ]))
    ).subscribe(
      {
        next: async (urls) => {
          const [clipUrl, screenshotUrl] = urls

          const clip = {
            uid: this.user?.uid as string,
            displayName: this.user?.displayName as string,
            title: this.title.value,
            fileName: `${clipFileName}.mp4`,
            url: clipUrl,
            screenshotUrl,
            screenshotFileName: `${clipFileName}.png`,
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
