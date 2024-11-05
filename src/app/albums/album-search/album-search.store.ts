import {patchState, signalStore, withComputed, withHooks, withMethods, withState} from "@ngrx/signals";
import {Album, searchAlbums, sortAlbums} from "@/albums/album.model";
import {SortOrder} from "@/shared/models/sort-order.model";
import {computed, inject} from "@angular/core";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {exhaustMap, pipe, tap} from "rxjs";
import {tapResponse} from "@ngrx/operators";
import {AlbumsService} from "@/albums/albums.service";
import {MatSnackBar} from "@angular/material/snack-bar";

type SearchState = {
  albums: Album[];
  showProgress: boolean;
  query: string;
  order: SortOrder
};

const initialState: SearchState = {
  albums: [],
  showProgress: false,
  query: '',
  order: 'asc',
};

export const AlbumSearchStore = signalStore(
  withState(initialState),

  withComputed((store) => {
    const filteredAlbums = computed(() => sortAlbums(searchAlbums(store.albums(), store.query()), store.order()));
    const totalAlbums = computed(() => filteredAlbums().length);
    const showSpinner = computed(() => store.showProgress() && store.albums().length === 0);

    return {
      filteredAlbums,
      totalAlbums,
      showSpinner
    };
  }),

  withMethods((store, albumsService = inject(AlbumsService), snackBar = inject(MatSnackBar)) => {
    function updateQuery(query: string): void {
      // console.log('updateQuery', query);
      patchState(store, {query});
    }

    function updateOrder(order: SortOrder): void {
      // console.log('updateOrder', order);
      patchState(store, {order});
    }

    function refreshAlbums(): void {
      loadAllAlbums();
    }

    const loadAllAlbums = rxMethod<void>(
      pipe(
        tap(() => patchState(store, {showProgress: true})),
        exhaustMap(() => {
          return albumsService.getAll().pipe(
            tapResponse({
              next: (albums) => {
                patchState(store, {albums, showProgress: false});
              },
              error: (error: { message: string }) => {
                snackBar.open(error.message, 'Close', {duration: 5_000});
                patchState(store, {showProgress: false});
              },
            }),
          );
        }),
      ),
    );

    return {
      updateQuery,
      updateOrder,
      refreshAlbums,
      loadAllAlbums
    }
  }),

  withHooks({
    onInit({ loadAllAlbums }) {
      loadAllAlbums();
    },
  })
);

export type AlbumSearchStore = InstanceType<typeof AlbumSearchStore>;

// Milestone 03: SignalStore
//
// Create the `album-search.store.ts` file and initialize `AlbumSearchStore` by using the `signalStore` function.
// Remove `signalState` from `AlbumSearchComponent` and move the state to `AlbumSearchStore` using the `withState` feature.
//   Move all computed signals to the `AlbumSearchStore` using the `withComputed` feature.
// 💡 Computed signals: `filteredAlbums`, `totalAlbums`, `showSpinner`.
//   Move all methods to the `AlbumSearchStore` using the `withMethods` feature.
// 💡 Methods: `updateQuery`, `updateOrder`, `loadAllAlbums`.
// 💡 `AlbumsService` and `MatSnackBar` can be injected within the `withMethods` factory function.
// Remove the `ngOnInit` method from `AlbumSearchComponent` and invoke the `loadAllAlbums` method when `AlbumSearchStore` is initialized using the `withHooks` feature.
//   Provide `AlbumSearchStore` at the `AlbumSearchComponent` level and inject it into the component.
//   Adjust the template to consume signals and methods from the injected store.
