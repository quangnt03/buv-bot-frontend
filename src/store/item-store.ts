import { create } from "zustand"

export type ItemType = "google-drive" | "dropbox" | "s3"

export interface Item {
  id: string
  name: string
  type: ItemType
  isSelected?: boolean
}

interface ItemsState {
  items: Item[]
  searchValue: string
  selectedFilter: string
  isLoading: boolean
  error: string | null
  refreshTrigger: number

  // Actions
  setItems: (items: Item[]) => void
  setSearchValue: (value: string) => void
  setSelectedFilter: (filter: string) => void
  toggleItemSelection: (id: string) => void
  selectAllItems: (selected: boolean) => void
  deleteItem: (id: string) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  setRefreshTrigger: (timestamp: number) => void
}

export const useItemsStore = create<ItemsState>((set) => ({
  items: [
    { id: "1", name: "Google Drive 1", type: "google-drive" },
    { id: "2", name: "Google Drive 2", type: "google-drive" },
    { id: "3", name: "DropBox 1", type: "dropbox" },
    { id: "4", name: "S3 Bucket", type: "s3" },
    { id: "5", name: "Google Drive 3", type: "google-drive" },
    { id: "6", name: "Google Drive 4", type: "google-drive" },
    { id: "7", name: "DropBox 2", type: "dropbox" },
    { id: "8", name: "S3 Bucket 2", type: "s3" },
    { id: "9", name: "DropBox 3", type: "dropbox" },
    { id: "10", name: "S3 Bucket 3", type: "s3" },
  ],
  searchValue: "",
  selectedFilter: "All",
  isLoading: false,
  error: null,
  refreshTrigger: Date.now(),

  // Actions
  setItems: (items) => set({ items }),
  setSearchValue: (searchValue) => set({ searchValue }),
  setSelectedFilter: (selectedFilter) => set({ selectedFilter }),
  toggleItemSelection: (id) =>
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? { ...item, isSelected: !item.isSelected } : item)),
    })),
  selectAllItems: (selected) =>
    set((state) => ({
      items: state.items.map((item) => ({ ...item, isSelected: selected })),
    })),
  deleteItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setRefreshTrigger: (timestamp) => set({ refreshTrigger: timestamp }),
}))
