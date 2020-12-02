import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import firebase from "firebase/app";
import "firebase/firestore";
import { Observable } from 'rxjs';
import { map } from "rxjs/operators";

function snapshotToData(snapshotObservable: Observable<any>) {
  return snapshotObservable.pipe(map(actions => actions.map((a) =>({
    id: a.payload.doc.id,
    data: a.payload.doc.data(),
  }))));
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  email: string = "";
  password: string = "";

  venue: string = "";
  date: string;
  time: string;
  
  payment: number;
  payer: string = "";

  games;

  constructor(public auth: AngularFireAuth, private firestore: AngularFirestore) { 
    this.games = snapshotToData(firestore.collection("games", ref => ref.where("payment", "==", 0)).snapshotChanges());
  }

  async registerWithEmailAndPassword() {
    let register =  await this.auth.createUserWithEmailAndPassword(this.email, this.password);
    await this.createUser(register.user.uid, register.user.email);
  }

  async loginWithEmailAndPassword() {
    await this.auth.signInWithEmailAndPassword(this.email, this.password);
  }

  async loginWithGoogle() {
    let login = await this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    await this.createUser(login.user.uid, login.user.email);
  }

  async createUser(uid, email) {
    if (!(await this.firestore.collection("users").doc(uid).get().toPromise()).data()) {
      this.firestore.collection("users").doc(uid).set({
        email: email,
        total: 0,
        state: 'pending',
      })
    }
  }

  logout() {
    this.auth.signOut();
  }

  createGame() {
    this.firestore.collection("games").add({
      venue: this.venue,
      payment: 0,
      date: this.date,
      time: this.time,
    })
  }

  deleteGame(id) {
    this.firestore.collection("games").doc(id).delete();
  }

  payForGame(id) {
    this.firestore.collection("games").doc(id).update({
      payment: this.payment,
      payer: this.payer,
    })
  }

}