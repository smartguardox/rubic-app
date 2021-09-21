import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';

@Component({
  selector: 'app-tokens-list-element',
  templateUrl: './tokens-list-element.component.html',
  styleUrls: ['./tokens-list-element.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokensListElementComponent {
  /**
   * Token element.
   */
  @Input() token: TokenAmount;

  public readonly defaultImage = 'assets/images/icons/coins/empty.svg';

  /**
   * Is iframe has horizontal view.
   */
  public readonly isHorizontalFrame$: Observable<boolean>;

  constructor(
    iframeService: IframeService,
    private readonly tokensService: TokensService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.isHorizontalFrame$ = iframeService.iframeAppearance$.pipe(
      map(appearance => appearance === 'horizontal')
    );
  }

  public onImageError($event: Event) {
    const target = $event.target as HTMLImageElement;
    if (target.src !== this.defaultImage) {
      target.src = this.defaultImage;
    }
  }

  /**
   * Makes token favorite or not favorite in the list.
   */
  public toggleFavorite(): void {
    this.token.favorite = !this.token.favorite;
    this.cdr.detectChanges();
    if (this.token.favorite) {
      this.tokensService.addFavoriteToken(this.token);
    } else {
      this.tokensService.removeFavoriteToken(this.token);
    }
  }
}
