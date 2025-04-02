import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  AfterViewInit,
  OnChanges,
  OnInit,
  SimpleChanges,
} from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { SelectionModel } from "@angular/cdk/collections";
import { MaterialModule } from "../../material.module";
import { CommonModule } from "@angular/common";
import { BadgeComponent } from "../badge/badge.component";
import { TableColumn } from "./table-column.model";

@Component({
  selector: "app-table",
  templateUrl: "./table.component.html",
  styleUrls: ["./table.component.scss"],
  imports: [MaterialModule, CommonModule, BadgeComponent],
})
export class TableComponent<T> implements AfterViewInit, OnInit, OnChanges {
  @Input() columns: TableColumn<T>[] = [];

  @Input() data: T[] = [];
  @Input() enableSelection: boolean = false;
  @Input() enableActions: boolean = false;
  @Input() action1Icon: string = "edit";
  @Input() action2Icon: string = "delete";

  @Output() action1 = new EventEmitter<T>();
  @Output() action2 = new EventEmitter<T>();

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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["data"]) {
      this.dataSource.data = this.data;
    }
  }

  isAllSelected(): boolean {
    return this.selection.selected.length === this.dataSource.data.length;
  }

  toggleAllRows(): void {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row) => this.selection.select(row));
  }

  action1Row(row: T): void {
    this.action1.emit(row);
  }

  action2Row(row: T): void {
    this.action2.emit(row);
  }
}
