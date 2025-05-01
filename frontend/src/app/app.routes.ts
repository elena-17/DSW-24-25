import { Routes } from "@angular/router";
import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";
import { HomepageComponent } from "./homepage/homepage/homepage.component";
import { FriendsComponent } from "./friends/friends.component";
import { HelppageComponent } from "./helppage/helppage.component";
import { TransactionsComponent } from "./transactions/transactions.component";
import { Error404Component } from "./error404/error404.component";
import { AdminHomepageComponent } from "./homepage/admin-homepage/admin-homepage.component";
import { AdminGuard } from "./guards/admin.guard";
import { AdminUsersComponent } from "./admin-users/admin-users.component";
import { ProfilePageComponent } from "./profile-page/profile-page.component";
import { AuthGuard } from "./guards/auth.guard";
import { ConfirmRegisterComponent } from "./register/confirm-register/confirm-register.component";
import { ForgotPasswordComponent } from "./login/forgot-password/forgot-password.component";
import { AdminAccountsComponent } from "./admin-accounts/admin-accounts.component";
import { AdminTransactionsComponent } from "./transactions/admin-transactions/admin-transactions.component";
import { AdminFriendsComponent } from "./friends/admin-friends/admin-friends.component";
import { LoginPaymentComponent } from "./login-payment/login-payment.component";
import { ConfirmPaymentComponent } from "./confirm-payment/confirm-payment.component";

export const routes: Routes = [
  { path: "", component: LoginComponent },
  { path: "forgot-password", component: ForgotPasswordComponent },
  { path: "register", component: RegisterComponent },
  { path: "confirm-register", component: ConfirmRegisterComponent },
  { path: "loginPayment", component: LoginPaymentComponent },
  {
    path: "admin",
    canActivate: [AdminGuard],
    children: [
      {
        path: "home",
        component: AdminHomepageComponent,
        data: { role: "admin" },
      },
      {
        path: "users",
        component: AdminUsersComponent,
        data: { role: "admin" },
      },
      {
        path: "accounts",
        component: AdminAccountsComponent,
        data: { role: "admin" },
      },
      {
        path: "transactions",
        component: AdminTransactionsComponent,
        data: { role: "admin" },
      },
      {
        path: "friends",
        component: AdminFriendsComponent,
        data: { role: "admin" },
      },
    ],
  },

  {
    path: "",
    canActivate: [AuthGuard],
    children: [
      { path: "homepage", component: HomepageComponent },
      { path: "friends", component: FriendsComponent, canActivate: [AuthGuard], data: { roles: ["user"] } },
      { path: "profile", component: ProfilePageComponent },
      { path: "help", component: HelppageComponent },
      { path: "transactions", component: TransactionsComponent },
      { path: "confirm-payment", component: ConfirmPaymentComponent },
    ],
  },
  { path: "**", component: Error404Component },
];
