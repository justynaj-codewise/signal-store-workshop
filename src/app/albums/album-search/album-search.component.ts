import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import { ProgressBarComponent } from '@/shared/ui/progress-bar.component';
import { AlbumFilterComponent } from './album-filter/album-filter.component';
import { AlbumListComponent } from './album-list/album-list.component';
import {MatButton} from "@angular/material/button";
import {AlbumSearchStore} from "@/albums/album-search/album-search.store";

@Component({
  selector: 'ngrx-album-search',
  standalone: true,
  imports: [ProgressBarComponent, AlbumFilterComponent, AlbumListComponent, MatButton],
  template: `
    <ngrx-progress-bar [showProgress]="albumSearchStore.showProgress()" />

    <div class="container">
      <h1>Albums ({{ albumSearchStore.totalAlbums() }})</h1>

      <button mat-raised-button color="primary" (click)="albumSearchStore.refreshAlbums()">Refresh</button>

      <ngrx-album-filter
        [query]="albumSearchStore.query()"
        [order]="albumSearchStore.order()"
        (queryChange)="albumSearchStore.updateQuery($event)"
        (orderChange)="albumSearchStore.updateOrder($event)"
      />

      <ngrx-album-list [albums]="albumSearchStore.filteredAlbums()" [showSpinner]="albumSearchStore.showSpinner()" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AlbumSearchStore]
})
export default class AlbumSearchComponent  {
  readonly albumSearchStore: AlbumSearchStore = inject(AlbumSearchStore);
}

