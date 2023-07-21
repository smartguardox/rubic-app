import { BrowserModule } from '@angular/platform-browser';
import { NgModule, isDevMode } from '@angular/core';
import { HttpClientModule, HttpClientXsrfModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TuiDialogModule, TuiRootModule, TuiAlertModule } from '@taiga-ui/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { NavigationEnd, Router, Scroll } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { filter, pairwise } from 'rxjs/operators';
import { CoreModule } from '@core/core.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GoogleTagManagerModule } from 'angular-google-tag-manager';
import { MOBILE_NATIVE_MODAL_PROVIDER } from '@core/modals/mobile-native-modal-provider';
import { ServiceWorkerModule } from '@angular/service-worker';

@NgModule({
  declarations: [AppComponent],
  imports: [
    CoreModule,
    SharedModule,
    TuiRootModule,
    TuiAlertModule,
    TuiDialogModule,
    HttpClientXsrfModule.withOptions({
      cookieName: 'csrftoken',
      headerName: 'X-CSRFToken'
    }),
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    GoogleTagManagerModule.forRoot({
      id: 'GTM-PZ8NH4J'
    }),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [MOBILE_NATIVE_MODAL_PROVIDER],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(
    private readonly router: Router,
    private readonly viewportScroller: ViewportScroller
  ) {
    this.setScrollStrategy();
  }

  /**
   * Defines scroll strategy, when page url is changed.
   * Doesn't scroll if only query parameters are changed.
   */
  private setScrollStrategy(): void {
    this.router.events
      .pipe(
        filter((e): e is Scroll => e instanceof Scroll),
        pairwise()
      )
      .subscribe(([prevEvent, event]: [Scroll, Scroll]) => {
        if (event.position) {
          // backward navigation
          this.viewportScroller.scrollToPosition(event.position);
        } else if (event.anchor) {
          // anchor navigation
          this.viewportScroller.scrollToAnchor(event.anchor);
        } else if (
          prevEvent.routerEvent instanceof NavigationEnd &&
          event.routerEvent instanceof NavigationEnd &&
          prevEvent.routerEvent.urlAfterRedirects.split('?')[0] !==
            event.routerEvent.urlAfterRedirects.split('?')[0]
        ) {
          // forward navigation
          this.viewportScroller.scrollToPosition([0, 0]);
        }
      });
  }
}
