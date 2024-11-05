import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {delay, Observable, throwError} from 'rxjs';
import { Album } from './album.model';

const API_URL = 'http://localhost:3000/albums';

@Injectable({ providedIn: 'root' })
export class AlbumsService {
  readonly #http = inject(HttpClient);

  getAll(): Observable<Album[]> {
    // Simulate a network error
    return throwError(() => new Error('Simulated network error')).pipe(
      delay(3000) // Add delay to simulate network latency
    );
    // return this.#http.get<Album[]>(API_URL);
  }

  getById(id: number): Observable<Album> {
    return this.#http.get<Album>(`${API_URL}/${id}`);
  }
}
