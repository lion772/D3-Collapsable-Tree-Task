import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CollapsibleTreeComponent } from './components/collapsible-tree/collapsible-tree.component';
import { CircleCollapsibleTreeComponent } from './components/circle-collapsible-tree/circle-collapsible-tree.component';

@NgModule({
  declarations: [AppComponent, CollapsibleTreeComponent, CircleCollapsibleTreeComponent],
  imports: [BrowserModule, NgbModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
