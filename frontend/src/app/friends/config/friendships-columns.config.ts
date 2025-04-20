export const getFriendshipsColumns = () => [
  {
    columnDef: "user",
    header: "User",
    cell: (element: any) => element.user, // asumiendo que `user` es un string (nombre completo o email)
  },
];
