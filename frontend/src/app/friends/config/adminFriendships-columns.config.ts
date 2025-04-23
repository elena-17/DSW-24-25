export const getAdminFriendshipsColumns = () => [
  {
    columnDef: "user",
    header: "User",
    cell: (element: any) => element.user, // asumiendo que `user` es un string (nombre completo o email)
  },
  {
    columnDef: "favorite_user",
    header: "Favorite User",
    cell: (element: any) => element.favorite_user, // asumiendo que `favorite_user` es un string (nombre completo o email)
  },
  {
    columnDef: "created_at",
    header: "Created At",
    cell: (element: any) => new Date(element.created_at).toLocaleString(), // formatear la fecha
  },
];
