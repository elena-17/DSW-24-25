export const getAdminBlocksColumns = () => [
  {
    columnDef: "user",
    header: "User",
    cell: (element: any) => element.user, // asumiendo que `user` es un string (nombre completo o email)
  },
  {
    columnDef: "blocked_user",
    header: "Blocked User",
    cell: (element: any) => element.blocked_user, // asumiendo que `blocked_user` es un string (nombre completo o email)
  },
  {
    columnDef: "created_at",
    header: "Created At",
    cell: (element: any) => new Date(element.created_at).toLocaleString(), // formatear la fecha
  },
];
