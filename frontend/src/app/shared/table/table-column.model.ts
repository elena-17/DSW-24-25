export interface TableColumn<T> {
  columnDef: string;
  header: string;
  cell: (element: T) => string;
  component?: string;
  getComponentProps?: (element: T) => any;
}
