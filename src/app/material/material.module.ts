import { NgModule } from '@angular/core';

import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatButtonModule} from '@angular/material/button';
import {MatRippleModule} from '@angular/material/core';
import {MatCardModule} from '@angular/material/card';


@NgModule({
  exports: [
    MatProgressBarModule,
    MatButtonToggleModule,
    MatButtonModule,
    MatRippleModule,
    MatCardModule
  ],
  declarations: []
})
export class MaterialModule { }