import { Routes } from "@angular/router";
import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";
import { HomepageComponent } from "./homepage/homepage.component";
import { FriendsComponent } from "./friends/friends.component";
import { SettingsComponent } from "./settings/settings.component";
import { HelppageComponent } from "./helppage/helppage.component";
import { TransactionsComponent } from "./transactions/transactions.component";
import { Error404Component } from "./error404/error404.component";

import { ProfilePageComponent } from "./profile-page/profile-page.component";
import { AuthGuard } from "./guards/auth.guard";

export const routes: Routes = [
  { path: "", component: LoginComponent },
  { path: "register", component: RegisterComponent },
  {
    path: "**",
    canActivate: [AuthGuard], // Aplica el guard a todas las rutas
    children: [
      { path: "homepage", component: HomepageComponent },
      { path: "friends", component: FriendsComponent },
      { path: "profile", component: ProfilePageComponent },
      { path: "settings", component: SettingsComponent },
      { path: "help", component: HelppageComponent },
      { path: "transactions", component: TransactionsComponent },
      { path: "**", component: Error404Component },
    ],
  },
];
