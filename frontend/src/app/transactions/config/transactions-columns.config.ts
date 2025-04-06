import { DatePipe } from "@angular/common";

export const getTransactionColumns = (datePipe: DatePipe) => [
  {
    columnDef: "title",
    header: "Title",
    cell: (element: any) => element.title,
    component: "text-icon",
    getComponentProps: (element: any) => ({
      text: element.title,
      icon:
        element.sender === sessionStorage.getItem("userEmail")
          ? "call_made"
          : "call_received",
      color:
        element.sender === sessionStorage.getItem("userEmail")
          ? "green"
          : "red",
    }),
  },
  {
    columnDef: "user",
    header: "User",
    cell: (element: any) =>
      element.sender === sessionStorage.getItem("userEmail")
        ? element.receiver
        : element.sender,
  },
  {
    columnDef: "amount",
    header: "Amount",
    cell: (element: any) => `${element.amount}`,
  },
  {
    columnDef: "date",
    header: "Date",
    cell: (element: any) =>
      datePipe.transform(new Date(element.created_at), "dd/MM/yyyy") || "",
  },
  {
    columnDef: "status",
    header: "Status",
    cell: (element: any) => element.status,
    component: "badge",
    getComponentProps: (element: any) => ({
      text: element.status,
      icon: getStatusIcon(element.status),
      class: element.status.toLowerCase(),
    }),
  },
];

const getStatusIcon = (status: string): string => {
  switch (status.toLowerCase()) {
    case "approved":
      return "task_alt";
    case "pending":
      return "hourglass_empty";
    case "rejected":
      return "block";
    default:
      return "help_outline";
  }
};
