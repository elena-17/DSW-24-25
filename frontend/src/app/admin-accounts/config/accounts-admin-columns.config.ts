import { DatePipe } from "@angular/common";

export const getAccountsAdminColumns = (datePipe: DatePipe) => [
  {
    columnDef: "user",
    header: "User",
    cell: (element: any) => element.user, // asumiendo que `user` es un string (nombre completo o email)
  },
  {
    columnDef: "balance",
    header: "Balance (€)",
    cell: (element: any) => `${element.balance} €`,
  },
];
