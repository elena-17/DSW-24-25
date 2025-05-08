import { Routes } from "@angular/router";
import { AdminGuard } from "./guards/admin.guard";
import { AuthGuard } from "./guards/auth.guard";

export const routes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./login/login.component").then((m) => m.LoginComponent),
  },
  {
    path: "forgot-password",
    loadComponent: () =>
      import("./login/forgot-password/forgot-password.component").then(
        (m) => m.ForgotPasswordComponent
      ),
  },
  {
    path: "register",
    loadComponent: () =>
      import("./register/register.component").then((m) => m.RegisterComponent),
  },
  {
    path: "confirm-register",
    loadComponent: () =>
      import("./register/confirm-register/confirm-register.component").then(
        (m) => m.ConfirmRegisterComponent
      ),
  },
  {
    path: "loginPayment",
    loadComponent: () =>
      import("./login-payment/login-payment.component").then(
        (m) => m.LoginPaymentComponent
      ),
  },
  {
    path: "admin",
    canActivate: [AdminGuard],
    children: [
      {
        path: "home",
        loadComponent: () =>
          import("./homepage/admin-homepage/admin-homepage.component").then(
            (m) => m.AdminHomepageComponent
          ),
        data: { role: "admin" },
      },
      {
        path: "users",
        loadComponent: () =>
          import("./admin-users/admin-users.component").then(
            (m) => m.AdminUsersComponent
          ),
        data: { role: "admin" },
      },
      {
        path: "accounts",
        loadComponent: () =>
          import("./admin-accounts/admin-accounts.component").then(
            (m) => m.AdminAccountsComponent
          ),
        data: { role: "admin" },
      },
      {
        path: "transactions",
        loadComponent: () =>
          import("./transactions/admin-transactions/admin-transactions.component").then(
            (m) => m.AdminTransactionsComponent
          ),
        data: { role: "admin" },
      },
      {
        path: "friends",
        loadComponent: () =>
          import("./friends/admin-friends/admin-friends.component").then(
            (m) => m.AdminFriendsComponent
          ),
        data: { role: "admin" },
      },
    ],
  },
  {
    path: "",
    canActivate: [AuthGuard],
    children: [
      {
        path: "homepage",
        loadComponent: () =>
          import("./homepage/homepage/homepage.component").then(
            (m) => m.HomepageComponent
          ),
      },
      {
        path: "friends",
        loadComponent: () =>
          import("./friends/friends.component").then((m) => m.FriendsComponent),
        canActivate: [AuthGuard],
        data: { roles: ["user"] },
      },
      {
        path: "profile",
        loadComponent: () =>
          import("./profile-page/profile-page.component").then(
            (m) => m.ProfilePageComponent
          ),
      },
      {
        path: "help",
        loadComponent: () =>
          import("./helppage/helppage.component").then(
            (m) => m.HelppageComponent
          ),
      },
      {
        path: "transactions",
        loadComponent: () =>
          import("./transactions/transactions.component").then(
            (m) => m.TransactionsComponent
          ),
      },
      {
        path: "confirm-payment",
        loadComponent: () =>
          import("./confirm-payment/confirm-payment.component").then(
            (m) => m.ConfirmPaymentComponent
          ),
      },
    ],
  },
  {
    path: "**",
    loadComponent: () =>
      import("./error404/error404.component").then(
        (m) => m.Error404Component
      ),
  },
];
