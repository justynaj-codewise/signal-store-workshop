import {ChangeDetectionStrategy, Component, computed, inject, OnInit} from '@angular/core';
import { ProgressBarComponent } from '@/shared/ui/progress-bar.component';
import { SortOrder } from '@/shared/models/sort-order.model';
import {Album, searchAlbums, sortAlbums} from '@/albums/album.model';
import { AlbumFilterComponent } from './album-filter/album-filter.component';
import { AlbumListComponent } from './album-list/album-list.component';
import {patchState, signalState} from "@ngrx/signals";
import {AlbumsService} from "@/albums/albums.service";
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'ngrx-album-search',
  standalone: true,
  imports: [ProgressBarComponent, AlbumFilterComponent, AlbumListComponent],
  template: `
    <ngrx-progress-bar [showProgress]="searchState.showProgress()" />

    <div class="container">
      <h1>Albums ({{ totalAlbums() }})</h1>

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
    patchState(this.searchState, { showProgress: true });
    this.albumsService.getAll().subscribe({
      next: (albums) => {
        patchState(this.searchState, { albums, showProgress: false });
      },
      error: (error) => {
        console.error('Error loading albums:', error);
        patchState(this.searchState, { showProgress: false });

        this.snackBar.open(error.message, 'Close', {
          duration: 5000,
        });
      },
    });
  }

  updateQuery(query: string): void {
    // console.log('updateQuery', query);
    patchState(this.searchState, { query });
  }

  updateOrder(order: SortOrder): void {
    // console.log('updateOrder', order);
    patchState(this.searchState, { order });
  }
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
