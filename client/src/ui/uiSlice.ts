import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

type StatusFilter = "ALL" | "TODO" | "DOING" | "DONE";
type PriorityFilter = "ALL" | "LOW" | "MEDIUM" | "HIGH";
type DueFilter = "ALL" | "OVERDUE" | "UPCOMING";
type ToastPayload = { message: string; variant: "success" | "error" | "info" };

const initialState = {
  status: "ALL" as StatusFilter,
  priority: "ALL" as PriorityFilter,
  due: "ALL" as DueFilter,
  searchText: "",
  isTaskModalOpen: false,
  editingTaskId: null as string | null,
  toast: null as ToastPayload | null,
};

const slice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setStatusFilter(state, action: PayloadAction<StatusFilter>) {
      state.status = action.payload;
    },
    setPriorityFilter(state, action: PayloadAction<PriorityFilter>) {
      state.priority = action.payload;
    },
    setDueFilter(state, action: PayloadAction<DueFilter>) {
      state.due = action.payload;
    },
    setSearchText(state, action: PayloadAction<string>) {
      state.searchText = action.payload;
    },
    openTaskModal(state, action: PayloadAction<string | undefined>) {
      state.isTaskModalOpen = true;
      state.editingTaskId = action.payload ?? null;
    },
    closeTaskModal(state) {
      state.isTaskModalOpen = false;
      state.editingTaskId = null;
    },
    showToast(state, action: PayloadAction<ToastPayload>) {
      state.toast = action.payload;
    },
    clearToast(state) {
      state.toast = null;
    },
  },
});

export const {
  setStatusFilter,
  setPriorityFilter,
  setDueFilter,
  setSearchText,
  openTaskModal,
  closeTaskModal,
  showToast,
  clearToast,
} = slice.actions;

export default slice.reducer;
