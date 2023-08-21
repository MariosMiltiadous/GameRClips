import {
  Component, Input, OnDestroy, OnInit, OnChanges, Output, EventEmitter
} from '@angular/core';
import { ModalService } from 'src/app/services/modal.service';
import IClip from 'src/app/models/clip.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ClipService } from 'src/app/services/clip.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit, OnDestroy, OnChanges {

  @Input() activeClip: IClip | null = null;
  inSubmission = false;
  showAlert = false;
  alertColor = 'blue';
  alertMsg = 'Please wait! Your clip is being updated.'
  @Output() update = new EventEmitter()

  // form controls
  clipID = new FormControl('', {
    nonNullable: true
  });

  title = new FormControl('',
    {
      validators: [
        Validators.required,
        Validators.minLength(3)],
      nonNullable: true
    })

  editForm = new FormGroup({
    title: this.title,
    id: this.clipID
  })

  constructor(
    private modal: ModalService,
    private clipService: ClipService
  ) {

  }

  ngOnInit(): void {
    this.modal.register('editClip')
  }

  ngOnDestroy(): void {
    this.modal.unRegister('editClip')
  }

  ngOnChanges() {
    if (!this.activeClip) {
      return
    }
    this.inSubmission = false;
    this.showAlert = false;
    
    this.clipID.setValue(this.activeClip.docID ? this.activeClip.docID : "");
    this.title.setValue(this.activeClip.title);
  }

  async submit() {
    if (!this.activeClip) {
      return
    }

    this.inSubmission = true;
    this.showAlert = true;
    this.alertColor = 'blue';
    this.alertMsg = 'Please wait! Uploading clip.'

    try {
      await this.clipService.updateClip(
        this.clipID.value,
        this.title.value)
    } catch (e) {
      this.inSubmission = false;
      this.alertColor = 'red';
      this.alertMsg = 'Something went wrong! Please try again later.'
      return
    }

    this.activeClip.title = this.title.value;
    this.update.emit(this.activeClip);

    this.inSubmission = false;
    this.alertColor = 'green';
    this.alertMsg = 'Success!'
  }
}
