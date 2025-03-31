import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  AfterViewInit,
  OnInit,
} from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { SelectionModel } from "@angular/cdk/collections";
import { MaterialModule } from "../../material.module";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-table",
  templateUrl: "./table.component.html",
  styleUrls: ["./table.component.scss"],
  imports: [MaterialModule, CommonModule],
})
export class TableComponent<T> implements AfterViewInit, OnInit {
  @Input() columns: {
    columnDef: string;
    header: string;
    cell: (element: T) => string;
  }[] = [];
  @Input() data: T[] = [];
  @Input() enableSelection: boolean = false;
  @Input() enableActions: boolean = false;

  @Output() edit = new EventEmitter<T>();
  @Output() delete = new EventEmitter<T>();

  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<T>([]);
  selection = new SelectionModel<T>(true, []);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.displayedColumns = [
      ...(this.enableSelection ? ["select"] : []),
      ...this.columns.map((c) => c.columnDef),
      ...(this.enableActions ? ["actions"] : []),
    ];
    this.dataSource.data = this.data;
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  isAllSelected(): boolean {
    return this.selection.selected.length === this.dataSource.data.length;
  }

  toggleAllRows(): void {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row) => this.selection.select(row));
  }

  editRow(row: T): void {
    this.edit.emit(row);
  }

  deleteRow(row: T): void {
    this.delete.emit(row);
  }
}
