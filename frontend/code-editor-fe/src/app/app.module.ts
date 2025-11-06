import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { MonacoEditorModule } from 'ngx-monaco-editor';
import { AppComponent } from './app.component';
import { EditorComponent } from './editor/editor.component';
import { JwtInterceptor } from './jwt.interceptor';
import { SigninComponent } from './signin/signin.component';
import { SignupComponent } from './signup/signup.component';
import { AuthGuard } from './auth.guard';


const routes: Routes = [
    { path: 'signin', component: SigninComponent },
  { path: 'signup', component: SignupComponent },
  { path: '', component: EditorComponent, canActivate: [AuthGuard] },
  { path: ':roomId', component: EditorComponent,  canActivate: [AuthGuard] }
];

@NgModule({
  declarations: [
    AppComponent,
    EditorComponent,
    SigninComponent,
    SignupComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    MonacoEditorModule.forRoot({
      baseUrl: 'assets',
    })
  ],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule { }
