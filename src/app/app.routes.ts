import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { RegisterComponent } from './core/pages/register/register.component';
import { LoginComponent } from './core/pages/login/login.component';
import { ForgetPasswordComponent } from './core/pages/forget-password/forget-password.component';
import { RecipesComponent } from './pages/recipes/recipes.component';
import { ResturantComponent } from './pages/resturant/resturant.component';
import { RecipeDetailsComponent } from './pages/recipe-details/recipe-details.component';
import { guestGuard } from './shared/guard/guest-guard.guard';
import { authGuard } from './core/guard/auth.guard';
import { UserSettingComponent } from './pages/user-setting/user-setting.component';
import { ReportComponent } from './pages/report/report.component';

export const routes: Routes = [
    { path: '', redirectTo: "login", pathMatch: "full" },
    { path: 'home', component: HomeComponent, canActivate: [authGuard] },
    { path: 'recipes', component: RecipesComponent },
    { path: 'resturant', component: ResturantComponent },
    { path: 'recipe-details', component: RecipeDetailsComponent },
    { path: 'user-setting', component: UserSettingComponent, canActivate: [authGuard] },
    { path: 'report', component: ReportComponent },
    { path: "notFound", component: NotFoundComponent },
    { path: "register", component: RegisterComponent, canActivate: [guestGuard] },
    { path: "login", component: LoginComponent, canActivate: [guestGuard] },
    { path: "forget_pass", component: ForgetPasswordComponent },


    { path: "**", component: NotFoundComponent },
];