import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { ClipComponent } from './clip/clip.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { ClipService } from './services/clip.service';

const routes: Routes = [
  {
    path: '', component: HomeComponent,
  },
  {
    path: 'about', component: AboutComponent
  },
  {
    path: 'clip/:id', component: ClipComponent,
    // whenever the user acces this path, then the resolver of the ClipService will be called
    resolve: {
      clip: ClipService
    }
  },
  {
    // dashboard/manage, dashboard/upload 
    path: '',
    loadChildren: async () => (await import('./video/video.module')).VideoModule
  },
  {
    path: '**', component: NotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
