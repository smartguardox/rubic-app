import { NgModule } from '@angular/core';
import { TradeViewContainerComponent } from '@features/trade/components/trade-view-container/trade-view-container.component';
import { TradeRoutingModule } from '@features/trade/trade-routing.module';
import { SwapsStateService } from '@features/trade/services/swaps-state/swaps-state.service';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { SwapsControllerService } from '@features/trade/services/swaps-controller/swaps-controller.service';
import { SharedModule } from '@shared/shared.module';
import { CommonModule } from '@angular/common';
import { ProvidersListComponent } from './components/providers-list/providers-list.component';
import { ProviderElementComponent } from './components/provider-element/provider-element.component';
import { SwapFormQueryService } from '@features/trade/services/swap-form-query/swap-form-query.service';
import { CrossChainService } from '@features/trade/services/cross-chain/cross-chain.service';
import { OnChainService } from '@features/trade/services/on-chain/on-chain.service';
import { CrossChainApiService } from '@features/trade/services/cross-chain-routing-api/cross-chain-api.service';
import {
  TuiButtonModule,
  TuiExpandModule,
  TuiHintModule,
  TuiHostedDropdownModule,
  TuiScrollbarModule,
  TuiTextfieldControllerModule
} from '@taiga-ui/core';
import {
  TuiInputModule,
  TuiInputNumberModule,
  TuiProgressModule,
  TuiTagModule,
  TuiToggleModule
} from '@taiga-ui/kit';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { PreviewSwapComponent } from './components/preview-swap/preview-swap.component';
import { SwapsModule } from '@features/swaps/swaps.module';
import { AssetsSelectorModule } from '@features/swaps/shared/components/assets-selector/assets-selector.module';
import { ActionButtonComponent } from './components/action-button/action-button.component';
import { ReceiverAddressButtonComponent } from './components/receiver-address-button/receiver-address-button.component';
import { SwapDataElementComponent } from './components/swap-data-element/swap-data-element.component';
import { TransactionDetailsComponent } from './components/transaction-details/transaction-details.component';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { RouteElementComponent } from './components/route-element/route-element.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SwapsSharedModule } from '@features/swaps/shared/swaps-shared.module';
import { SettingsService } from '@features/trade/services/settings-service/settings.service';
import { SettingsItComponent } from '@features/trade/components/settings-it/settings-it.component';
import { SettingsCcrComponent } from '@features/trade/components/settings-ccr/settings-ccr.component';
import { SettingsContainerComponent } from '@features/trade/components/settings-container/settings-container.component';
import { TargetNetworkAddressService } from '@features/trade/services/target-network-address-service/target-network-address.service';
import { TokenSelectorPageComponent } from './components/token-selector-page/token-selector-page.component';
import { SwapFormPageComponent } from './components/swap-form-page/swap-form-page.component';
import { PreviewSwapService } from '@features/trade/services/preview-swap/preview-swap.service';
import { TransactionStateComponent } from './components/transaction-state/transaction-state.component';
import { OnChainApiService } from '@features/trade/services/on-chain-api/on-chain-api.service';
import { SuccessSwapInfoComponent } from './components/success-swap-info/success-swap-info.component';
import { RefreshService } from '@features/trade/services/refresh-service/refresh.service';
import { SwapTokensUpdaterService } from '@core/services/swaps/swap-tokens-updater.service';

@NgModule({
  declarations: [
    TradeViewContainerComponent,
    ProvidersListComponent,
    ProviderElementComponent,
    PreviewSwapComponent,
    ActionButtonComponent,
    ReceiverAddressButtonComponent,
    SwapDataElementComponent,
    TransactionDetailsComponent,
    RouteElementComponent,
    SettingsContainerComponent,
    SettingsItComponent,
    SettingsCcrComponent,
    TokenSelectorPageComponent,
    SwapFormPageComponent,
    TransactionStateComponent,
    SuccessSwapInfoComponent
  ],
  exports: [],
  imports: [
    TradeRoutingModule,
    CommonModule,
    SharedModule,
    TuiExpandModule,
    TuiScrollbarModule,
    TuiTagModule,
    InlineSVGModule,
    SwapsModule,
    AssetsSelectorModule,
    TuiButtonModule,
    ClipboardModule,
    ReactiveFormsModule,
    TuiHintModule,
    FormsModule,
    TuiTextfieldControllerModule,
    TuiInputNumberModule,
    TuiToggleModule,
    TuiHostedDropdownModule,
    TuiInputModule,
    SwapsSharedModule,
    TuiProgressModule
    // SwapsRoutingModule,
    // SwapsSharedModule,
    // InstantTradeModule,
    // CrossChainModule,
    // OnramperExchangerModule,
    // LimitOrderModule,
    // TuiHostedDropdownModule,
    // TuiDataListModule,
    // TuiSvgModule,
    // TuiDropdownModule,
    // ReactiveFormsModule,
    // TuiInputModule,
    // TuiSliderModule,
    // TuiToggleModule,
    // TuiInputNumberModule,
    // TuiTextfieldControllerModule,
    // InlineSVGModule,
    // TuiHintModule,
    // AssetsSelectorModule,
    // FormsModule,
    // TuiLoaderModule,
    // ClipboardModule,
    // TuiAccordionModule,
    // TuiHintModule
  ],
  providers: [
    SwapsStateService,
    SwapsFormService,
    SwapsControllerService,
    SwapFormQueryService,
    CrossChainService,
    OnChainService,
    CrossChainApiService,
    SettingsService,
    TargetNetworkAddressService,
    RefreshService,
    PreviewSwapService,
    OnChainApiService,
    SwapTokensUpdaterService
    // SettingsService,
    // RefreshService,
    // TradeService,
    // TargetNetworkAddressService,
    // TonPromoService
  ]
})
export class TradeModule {}
