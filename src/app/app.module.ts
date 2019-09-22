import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import {APP_BASE_HREF} from '@angular/common';
import {LayoutModule} from '@angular/cdk/layout';

import { AppRoutesModule } from './app-routes/app-routes.module';
import { MaterialModule } from './material/material.module';

import { AppComponent } from './app.component';
import { HelloComponent } from './hello.component';
import { MinigameComponent } from './minigame/minigame.component';

@NgModule({
  imports:      [ 
    BrowserModule, 
    LayoutModule,
    AppRoutesModule,
    MaterialModule,
    FormsModule 
  ],
  providers: [{provide: APP_BASE_HREF, useValue : '/' }],
  declarations: [ AppComponent, HelloComponent, MinigameComponent ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
