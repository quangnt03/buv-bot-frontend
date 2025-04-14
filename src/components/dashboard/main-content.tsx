"use client"

import { X, Filter, Plus, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StorageItem } from "./storage-item"
import { Pagination } from "./pagination"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface MainContentProps {
  searchValue: string
  setSearchValue: (value: string) => void
  selectedFilter: string
  setSelectedFilter: (filter: string) => void
}

export function MainContent({ searchValue, setSearchValue, selectedFilter, setSelectedFilter }: MainContentProps) {
  const filters = ["All", "Google Drive", "DropBox"]

  const storageItems = [
    { id: 1, name: "Google Drive 1", type: "google-drive" },
    { id: 2, name: "Google Drive 2", type: "google-drive" },
    { id: 3, name: "DropBox 1", type: "dropbox" },
    { id: 4, name: "S3 Bucket", type: "s3" },
    { id: 5, name: "Google Drive 1", type: "google-drive" },
    { id: 6, name: "Google Drive 2", type: "google-drive" },
    { id: 7, name: "DropBox 1", type: "dropbox" },
    { id: 8, name: "S3 Bucket", type: "s3" },
    { id: 9, name: "DropBox 1", type: "dropbox" },
    { id: 10, name: "S3 Bucket", type: "s3" },
  ]

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      <Card className="rounded-none border-0 border-b shadow-none">
        <CardHeader>
          <CardTitle className="text-2xl">CloudChat</CardTitle>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search..."
                className="pr-10"
              />
              {searchValue && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setSearchValue("")}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Clear search</span>
                </Button>
              )}
            </div>

            <Button variant="outline" size="icon" className="rounded-full">
              <Filter className="h-4 w-4" />
              <span className="sr-only">Filter</span>
            </Button>

            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
            <Button variant="secondary">
              <MessageSquare className="mr-2 h-4 w-4" />
              Chat
            </Button>
          </div>

          <div className="flex gap-2 mb-6">
            {filters.map((filter) => (
              <Button
                key={filter}
                variant={selectedFilter === filter ? "default" : "outline"}
                onClick={() => setSelectedFilter(filter)}
                className="rounded-full"
                size="sm"
              >
                {filter}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-4">
          {storageItems.map((item) => (
            <StorageItem key={item.id} name={item.name} type={item.type} />
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 flex justify-center border-t">
        <Pagination currentPage={1} totalPages={68} />
      </div>
    </div>
  )
}
