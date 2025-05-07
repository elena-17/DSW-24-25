export const getFriendshipsColumns = () => [
  {
    columnDef: "user",
    header: "User",
    cell: (element: any) => element.email, // asumiendo que `user` es un string (nombre completo o email)
  },
];
