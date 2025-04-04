import { Routes } from "@angular/router";
import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";
import { HomepageComponent } from "./homepage/homepage/homepage.component";
import { FriendsComponent } from "./friends/friends.component";
import { SettingsComponent } from "./settings/settings.component";
import { HelppageComponent } from "./helppage/helppage.component";
import { TransactionsComponent } from "./transactions/transactions.component";
import { Error404Component } from "./error404/error404.component";
import { AdminHomepageComponent } from "./homepage/admin-homepage/admin-homepage.component";
import { AdminGuard } from "./guards/admin.guard";
import { AdminUsersComponent } from "./admin-users/admin-users.component";
import { ProfilePageComponent } from "./profile-page/profile-page.component";
import { ConfirmRegisterComponent } from "./register/confirm-register/confirm-register.component";

export const routes: Routes = [
  { path: "", component: LoginComponent },
  {
    path: "admin",
    component: AdminHomepageComponent,
    canActivate: [AdminGuard],
    data: { role: "admin" },
  },
  {
    path: "admin-users",
    component: AdminUsersComponent,
    canActivate: [AdminGuard],
    data: { role: "admin" },
  },
  { path: "register", component: RegisterComponent },
  { path: "confirm-register", component: ConfirmRegisterComponent },
  { path: "homepage", component: HomepageComponent },
  { path: "friends", component: FriendsComponent },
  { path: "profile", component: ProfilePageComponent },
  { path: "settings", component: SettingsComponent },
  { path: "help", component: HelppageComponent },
  { path: "transactions", component: TransactionsComponent },
  { path: "**", component: Error404Component },
];
