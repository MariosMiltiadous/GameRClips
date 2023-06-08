import { Injectable } from '@angular/core';

interface IModal {
  id: string;
  visible: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modals: IModal[] = [];

  constructor() { }

  register(id: string) {
    this.modals.push({
      id,
      visible: false
    })
  }

  unRegister(id: string) {
    this.modals = this.modals.filter(
      element => element.id !=id
    )
    //this.modals.pop()?.id;
  }

  isModalOpen(id: string): boolean {
    // !! double exclamation mark lets you convert a non-Boolean value to Boolean
    return !!this.modals.find(x => x.id === id)?.visible;
  }

  toggleModal(id: string) {
    //this.visible = !this.visible;
    const modal = this.modals.find(x => x.id === id);
    if (modal) {
      modal.visible = !modal.visible;
    }
  }

}
