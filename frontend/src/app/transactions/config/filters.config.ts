import { FormBuilder, FormGroup } from "@angular/forms";

export function createFilters(formBuilder: FormBuilder): FormGroup {
  return formBuilder.group({
    title: [""],
    user: [""],
    dateRange: formBuilder.group({
      start: [null],
      end: [null],
    }),
    status: formBuilder.group({
      pending: [true],
      approved: [true],
      rejected: [true],
      processing: [true],
    }),
    amount: formBuilder.group({
      min: [0],
      max: [500],
    }),
  });
}

export function resetFilters(form: FormGroup): void {
  form.reset({
    title: "",
    user: "",
    dateRange: {
      start: null,
      end: null,
    },
    status: {
      pending: true,
      approved: true,
      rejected: true,
    },
    amount: {
      min: 0,
      max: 500,
    },
  });
}

export function applyFilterFn(filters: any, item: any): boolean {
  const matchesStatus =
    (filters.status.pending && item.status === "pending") ||
    (filters.status.approved && item.status === "approved") ||
    (filters.status.rejected && item.status === "rejected");

  const matchesUser =
    !filters.user ||
    item.sender.toLowerCase().includes(filters.user.toLowerCase()) ||
    item.receiver.toLowerCase().includes(filters.user.toLowerCase());

  const matchesAmount =
    item.amount >= filters.amount.min && item.amount <= filters.amount.max;

  const matchesDateRange =
    (!filters.dateRange.start ||
      new Date(item.created_at) >= new Date(filters.dateRange.start)) &&
    (!filters.dateRange.end ||
      new Date(item.created_at) <= new Date(filters.dateRange.end));

  const matchesTitle =
    !filters.title ||
    item.title.toLowerCase().includes(filters.title.toLowerCase());

  return (
    matchesStatus &&
    matchesUser &&
    matchesAmount &&
    matchesDateRange &&
    matchesTitle
  );
}

export function hasActiveFilters(filtersForm: FormGroup): boolean {
  const filters = filtersForm.value;
  const isTextSearchApplied =
    filters.title.trim() !== "" || filters.user.trim() !== "";

  const isDateRangeApplied =
    filters.dateRange.start !== null || filters.dateRange.end !== null;

  const isStatusFiltered =
    !filters.status.pending ||
    !filters.status.approved ||
    !filters.status.rejected;

  const isAmountFiltered =
    filters.amount.min !== 0 || filters.amount.max !== 500;

  return (
    isTextSearchApplied ||
    isDateRangeApplied ||
    isStatusFiltered ||
    isAmountFiltered
  );
}
