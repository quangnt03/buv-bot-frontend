"use client"

import {
  Pagination as ShadcnPagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface PaginationProps {
  currentPage: number
  totalPages: number
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  // If there are no pages or only one page, don't render pagination
  if (totalPages <= 1) {
    return null
  }

  return (
    <ShadcnPagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>

        <PaginationItem>
          <PaginationLink href="#" isActive={currentPage === 1}>
            1
          </PaginationLink>
        </PaginationItem>

        {currentPage > 3 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {currentPage > 2 && (
          <PaginationItem>
            <PaginationLink href="#">{currentPage - 1}</PaginationLink>
          </PaginationItem>
        )}

        {currentPage !== 1 && currentPage !== totalPages && (
          <PaginationItem>
            <PaginationLink href="#" isActive>
              {currentPage}
            </PaginationLink>
          </PaginationItem>
        )}

        {currentPage < totalPages - 1 && (
          <PaginationItem>
            <PaginationLink href="#">{currentPage + 1}</PaginationLink>
          </PaginationItem>
        )}

        {currentPage < totalPages - 2 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {totalPages > 1 && (
          <PaginationItem>
            <PaginationLink href="#" isActive={currentPage === totalPages}>
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        )}

        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </ShadcnPagination>
  )
}
