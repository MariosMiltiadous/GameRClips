import firebase from 'firebase/compat/app'

export interface IClip {
    docID?: string;
    uid: string
    displayName: string
    title: string
    fileName: string
    url: string,
    timeStamp:firebase.firestore.FieldValue
}