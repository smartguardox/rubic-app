import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  TuiButtonModule,
  TuiHintModule,
  TuiLoaderModule,
  TuiManualHintModule,
  TuiScrollbarModule,
  TuiSvgModule,
  TuiTextfieldControllerModule
} from '@taiga-ui/core';
import { TuiInputModule } from '@taiga-ui/kit';
import { FormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { TokensSelectorComponent } from '@features/swaps/shared/components/tokens-selector/components/tokens-selector/tokens-selector.component';
import { TokensSelectorModalService } from '@features/swaps/shared/components/tokens-selector/services/tokens-selector-modal.service';
import { BlockchainsAsideComponent } from '@features/swaps/shared/components/tokens-selector/components/blockchains-aside/blockchains-aside.component';
import { SearchBarComponent } from '@features/swaps/shared/components/tokens-selector/components/search-bar/search-bar.component';
import { TokensListComponent } from '@features/swaps/shared/components/tokens-selector/components/tokens-list/tokens-list.component';
import { TokensListElementComponent } from '@features/swaps/shared/components/tokens-selector/components/tokens-list/components/tokens-list-element/tokens-list-element.component';
import { SharedModule } from '@shared/shared.module';
import { CustomTokenComponent } from '@features/swaps/shared/components/tokens-selector/components/tokens-list/components/custom-token/custom-token.component';
import { CustomTokenWarningModalComponent } from '@features/swaps/shared/components/tokens-selector/components/tokens-list/components/custom-token-warning-modal/custom-token-warning-modal.component';
import { TuiAutoFocusModule } from '@taiga-ui/cdk';
import { BlockchainsListComponent } from 'src/app/features/swaps/shared/components/tokens-selector/components/blockchains-list/blockchains-list.component';
import { SwitchTokensListTypeButtonComponent } from 'src/app/features/swaps/shared/components/tokens-selector/components/switch-tokens-list-type-button/switch-tokens-list-type-button.component';
import { EmptyListComponent } from './components/tokens-list/components/empty-list/empty-list.component';

@NgModule({
  declarations: [
    TokensSelectorComponent,
    BlockchainsAsideComponent,
    SearchBarComponent,
    TokensListComponent,
    TokensListElementComponent,
    CustomTokenComponent,
    CustomTokenWarningModalComponent,
    BlockchainsListComponent,
    SwitchTokensListTypeButtonComponent,
    EmptyListComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    TuiScrollbarModule,
    TuiInputModule,
    FormsModule,
    TuiTextfieldControllerModule,
    TuiSvgModule,
    TuiButtonModule,
    ScrollingModule,
    TuiHintModule,
    TuiManualHintModule,
    TuiLoaderModule,
    InlineSVGModule,
    TuiAutoFocusModule
  ],
  providers: [TokensSelectorModalService]
})
export class TokensSelectorModule {}
