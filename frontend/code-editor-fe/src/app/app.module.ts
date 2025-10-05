import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MonacoEditorModule } from 'ngx-monaco-editor';

import { AppComponent } from './app.component';
import { EditorComponent } from './editor/editor.component';

@NgModule({
  declarations: [
    AppComponent,
    EditorComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot([]),
    MonacoEditorModule.forRoot({
      baseUrl: 'assets',
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
