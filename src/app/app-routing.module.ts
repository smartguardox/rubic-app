import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IndexComponent } from './features/index-page/components/index/index.component';
import { StartFormResolver } from './features/index-page/components/start-form/start-form.component';

export const PROJECT_PARTS = {
  TEST: {
    '^/.+$': 'devswaps.mywish.io'
  },
  PROD: {
    '^/$': 'swaps.network',
    '^/.+$': 'trades.swaps.network',
    from: 'swaps.network'
  },
  LOCAL: {
    '^/.+$': 'local.devswaps.mywish.io'
  }
};

let currMode = 'PROD';
Object.entries(PROJECT_PARTS).forEach(([projectPartName, projectPartValue]: [string, any]) => {
  Object.entries(projectPartValue).forEach(([, hostName]: [string, string]) => {
    if (location.hostname === hostName) {
      currMode = projectPartName;
    }
  });
});

export const MODE = currMode;

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./features/index-page/index-page.module').then(m => m.IndexPageModule),
    resolve: {
      checkedTokens: StartFormResolver
    }
  },
  {
    path: 'bridge',
    loadChildren: () =>
      import('./features/bridge-page/bridge-page.module').then(m => m.BridgePageModule)
  },
  {
    path: 'about',
    loadChildren: () =>
      import('./features/features-page/features-page.module').then(m => m.FeaturesPageModule)
  },
  {
    path: 'team',
    loadChildren: () => import('./features/team-page/team-page.module').then(m => m.TeamPageModule)
  },
  {
    path: 'public-v3/:public_link',
    redirectTo: '/trades/public-v3/:public_link'
  },
  {
    path: 'contracts',
    redirectTo: '/trades/contracts'
  },
  {
    path: 'trades',
    loadChildren: () => import('./features/trades/trades.module').then(m => m.TradesModule)
  },
  {
    path: 'reset/:uid/:token',
    component: IndexComponent
  },
  {
    path: 'faq',
    loadChildren: () => import('./features/faq-page/faq-page.module').then(m => m.FaqPageModule)
  },
  {
    path: 'token-sale',
    loadChildren: () =>
      import('./features/token-sale-page/token-sale-page/token-sale-page.module').then(
        m => m.TokenSalePageModule
      )
  },
  {
    path: ':token',
    loadChildren: () =>
      import('./features/index-page/index-page.module').then(m => m.IndexPageModule),
    resolve: {
      checkedTokens: StartFormResolver
    }
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      anchorScrolling: 'enabled',
      onSameUrlNavigation: 'reload',
      scrollPositionRestoration: 'enabled',
      relativeLinkResolution: 'legacy'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
