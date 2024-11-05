import {ChangeDetectionStrategy, Component, computed, inject, OnInit} from '@angular/core';
import { ProgressBarComponent } from '@/shared/ui/progress-bar.component';
import { SortOrder } from '@/shared/models/sort-order.model';
import {Album, searchAlbums, sortAlbums} from '@/albums/album.model';
import { AlbumFilterComponent } from './album-filter/album-filter.component';
import { AlbumListComponent } from './album-list/album-list.component';
import {patchState, signalState} from "@ngrx/signals";
import {AlbumsService} from "@/albums/albums.service";
import { MatSnackBar } from '@angular/material/snack-bar';
import {MatButton} from "@angular/material/button";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import { exhaustMap, pipe, tap} from "rxjs";
import {tapResponse} from "@ngrx/operators";

@Component({
  selector: 'ngrx-album-search',
  standalone: true,
  imports: [ProgressBarComponent, AlbumFilterComponent, AlbumListComponent, MatButton],
  template: `
    <ngrx-progress-bar [showProgress]="searchState.showProgress()" />

    <div class="container">
      <h1>Albums ({{ totalAlbums() }})</h1>

      <button mat-raised-button color="primary" (click)="refreshAlbums()">Refresh</button>

      <ngrx-album-filter
        [query]="searchState.query()"
        [order]="searchState.order()"
        (queryChange)="updateQuery($event)"
        (orderChange)="updateOrder($event)"
      />

      <ngrx-album-list [albums]="filteredAlbums()" [showSpinner]="showSpinner()" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AlbumSearchComponent implements OnInit {
  private readonly albumsService = inject(AlbumsService);
  private readonly snackBar = inject(MatSnackBar);

  readonly searchState = signalState<SearchState>({
    albums: [],
    showProgress: false,
    query: '',
    order: 'asc',
  });

  filteredAlbums = computed(() => sortAlbums(searchAlbums(this.searchState.albums(), this.searchState.query()), this.searchState.order()));
  totalAlbums = computed(() => this.filteredAlbums().length);
  showSpinner = computed(() => this.searchState.showProgress() && this.searchState.albums().length === 0);

  ngOnInit() {
    this.loadAllAlbums();
  }

  refreshAlbums(): void {
    this.loadAllAlbums();
  }

  updateQuery(query: string): void {
    // console.log('updateQuery', query);
    patchState(this.searchState, {query});
  }

  updateOrder(order: SortOrder): void {
    // console.log('updateOrder', order);
    patchState(this.searchState, {order});
  }

  // readonly logDoubledNumber = rxMethod<number>(
  //   pipe(
  //     map((num) => num * 2),
  //     tap((doubledNum) => console.log(doubledNum)),
  //   ),
  // );

  // readonly loadAllAlbums = rxMethod<void>(
  //   pipe(
  //     tap(() => patchState(this.searchState, {showProgress: true})),
  //     exhaustMap(() =>
  //       this.albumsService.getAll().pipe(
  //         tap((albums) => {
  //           patchState(this.searchState, {albums, showProgress: false});
  //         }),
  //         catchError((error: { message: string }) => {
  //           patchState(this.searchState, {showProgress: false});
  //           this.snackBar.open(error.message, 'Close', {duration: 5_000});
  //           return EMPTY;
  //         }),
  //       )
  //     ),
  //   ),
  // );


  readonly loadAllAlbums = rxMethod<void>(
    pipe(
      tap(() => patchState(this.searchState, {showProgress: true})),
      exhaustMap(() => {
        return this.albumsService.getAll().pipe(
          tapResponse({
            next: (albums) => {
              patchState(this.searchState, {albums, showProgress: false});
            },
            error: (error: { message: string }) => {
              this.snackBar.open(error.message, 'Close', {duration: 5_000});
              patchState(this.searchState, {showProgress: false});
            },
          }),
        );
      }),
    ),
  );


}

type SearchState = {
  albums: Album[];
  showProgress: boolean;
  query: string;
  order: SortOrder
};


// Milestone 01: SignalState
// Use `signalState` to manage the state of the `AlbumSearchComponent`.
// 💡 State properties: `albums`, `showProgress`, `query`, `order`.
// Create computed signal `filteredAlbums` that filters `albums` by `query` and sorts them by `order`.
// 💡 Utilities `searchAlbums` and `sortAlbums` are exported from the `album.model.ts` file.
//   Create computed signal `totalAlbums` that should calculate the length of `filteredAlbums`.
//   Create computed signal `showSpinner` that should be true when `showProgress` is true and `albums` length is 0.
// Adjust the template to consume created signals.
//   Implement `updateQuery` and `updateOrder` methods by using the `patchState` function.
// Inject `AlbumsService` and use the `getAll` method to fetch all albums from the API when `AlbumSearchComponent` is initialized.
// 💡 Set `showProgress` to false when the request succeeds or fails.
// 💡 Use `MatSnackBar` to show an error when the request fails.

// Milestone 02: RxMethod
// Create reactive method `loadAllAlbums` by using the `rxMethod` function that fetches all albums from the API.
// 💡 Use `exhaustMap` to prevent parallel calls when the reactive method is called multiple times.
// 💡 Use the `tapResponse` operator from the `@ngrx/operators` package to keep the reactive method subscription alive if the request fails.
//   Invoke the `loadAllAlbums` method when `AlbumSearchComponent` is initialized.

