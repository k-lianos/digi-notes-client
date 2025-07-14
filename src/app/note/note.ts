import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import {FormsModule} from '@angular/forms';

interface INote {
  id: string;
  title: string;
  text: string;
}

@Component({
  selector: 'app-note',
  imports: [FormsModule],
  template: `
    <div class="row justify-content-center g-4">
      @for (note of notes(); track note.id) {
      <div class="col-sm-6 col-md-4 col-lg-3">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">{{ note.title }}</h5>
            <p class="card-text">
              {{ note.text }}
            </p>
            <button type="button" class="text-danger text-decoration-none" (click)="onDelete(note.id)">
              Delete
            </button>
          </div>
        </div>
      </div>
      } @empty {
        <p>No notes found.</p>
      }
    </div>

    <!-- Floating "Create" Button -->

    <form class="position-fixed bottom-0 end-0 m-4 p-4 shadow"   (ngSubmit)="createNote()">
      <!-- First Input -->
      <div class="mb-3">
        <label for="noteTitle" class="form-label">Note Title</label>
        <input type="text" class="form-control" id="noteTitle" name="title"
               [(ngModel)]="note.title"
               required>
      </div>

      <!-- Second Input -->
      <div class="mb-3">
        <label for="noteText" class="form-label">Note Text</label>
        <input
          type="text"
          class="form-control" id="noteText"       name="text" [(ngModel)]="note.text"
               required>
      </div>

      <!-- Submit Button -->
      <button type="submit" class="btn btn-primary">Create</button>
    </form>
  `,
})
export class Note {
  readonly notes = signal<INote[]>([]);

  private http = inject(HttpClient);

  note = {
    title: '',
    text: ''
  };

  constructor() {
    this.fetch();
  }


  createNote() {
    if (!this.note.title || !this.note.text) return;

    this.http.post('http://localhost:3000/api/note', this.note).subscribe({
      next: () => {
        this.fetch();
        this.note = { title: '', text: '' }; // reset form
      },
      error: err => {
        console.error('Failed to create note:', err);
      }
    });
  }

  onDelete(id:INote['id']){
    this.http.delete(`http://localhost:3000/api/note/${id}`).subscribe(() => this.fetch());
  }

  private fetch() {
    this.http
      .get<{ data: INote[] }>('http://localhost:3000/api/note')
      .subscribe(({ data }) => this.notes.set(data));
  }
}
