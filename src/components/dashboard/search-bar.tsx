"use client"

import { useState, useEffect } from "react"
import { X, Filter, Search, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSearchItems } from "@/hooks/use-items"
import { toast } from "sonner"
import { useConversationStore } from "@/store/conversation-store"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface SearchBarProps {
  searchValue: string;
  setSearchValue: (value: string) => void;
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
  filters: string[];
  onSearchResults?: (results: any[]) => void;
}

export function SearchBar({ 
  searchValue, 
  setSearchValue, 
  onSearchResults
}: SearchBarProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [activeOnly, setActiveOnly] = useState(false);
  const [rawSearchResults, setRawSearchResults] = useState<any[]>([]);
  const searchItemsMutation = useSearchItems();
  const { selectedConversationId } = useConversationStore();

  // Function to apply the active filter and update parent component
  const applyActiveFilter = (results: any[]) => {
    // Apply active filter if enabled
    const filteredResults = activeOnly 
      ? results.filter(item => item.active === true)
      : results;
    
    // Update parent component with filtered results
    if (onSearchResults) {
      onSearchResults(filteredResults);
    }
    
    return filteredResults;
  };

  const handleSearch = async () => {
    if (!searchValue.trim()) return;
    if (!selectedConversationId) {
      toast.error("Please select a folder first");
      return;
    }

    try {
      setIsSearching(true);
      
      // Search items by title in the selected conversation
      const results = await searchItemsMutation.mutateAsync(searchValue);
      
      // Filter results to only include items from the selected conversation
      const conversationResults = Array.isArray(results) 
        ? results.filter(item => item.conversation_id === selectedConversationId)
        : [];
      
      // Store raw search results
      setRawSearchResults(conversationResults);
      
      // Apply active filter and update parent
      const filteredResults = applyActiveFilter(conversationResults);
      
      // Show appropriate toast message
      if (conversationResults.length === 0) {
        toast.info("No items found matching your search");
      } else if (activeOnly) {
        const activeCount = filteredResults.length;
        const totalCount = conversationResults.length;
        if (activeCount === 0) {
          toast.info(`No active items found (${totalCount} inactive items hidden)`);
        } else {
          toast.success(`Found ${activeCount} active items out of ${totalCount} total results`);
        }
      } else {
        toast.success(`Found ${conversationResults.length} items matching your search`);
      }
    } catch (error) {
      toast.error("Error searching items");
      setRawSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Toggle active filter and apply to existing results
  const toggleActiveFilter = () => {
    // Toggle the filter state
    setActiveOnly(prevState => {
      const newState = !prevState;
      
      // Apply the new filter state to existing results
      if (rawSearchResults.length > 0) {
        const filteredResults = newState 
          ? rawSearchResults.filter(item => item.active === true)
          : rawSearchResults;
        
        // Update parent component
        if (onSearchResults) {
          onSearchResults(filteredResults);
        }
        
        // Show toast about the filter change
        const activeCount = rawSearchResults.filter(item => item.active === true).length;
        const totalCount = rawSearchResults.length;
        
        if (newState) {
          if (activeCount === 0) {
            toast.info(`No active items found (${totalCount} inactive items hidden)`);
          } else {
            toast.info(`Showing ${activeCount} active items (${totalCount - activeCount} inactive items hidden)`);
          }
        } else {
          toast.info(`Showing all ${totalCount} items`);
        }
      }
      
      return newState;
    });
  };

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Clear search and reset
  const clearSearch = () => {
    setSearchValue("");
    setRawSearchResults([]);
    if (onSearchResults) onSearchResults([]);
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-1">
        <div className="relative flex items-center">
          {!isSearching ? (
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          ) : (
            <div className="absolute left-3">
              <LoadingSpinner className="h-4 w-4" />
            </div>
          )}
          <Input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search items by title..."
            className="pl-10 pr-10"
            onKeyDown={handleKeyDown}
          />
          {searchValue && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>
      </div>

      <Button 
        variant="default" 
        size="sm"
        onClick={handleSearch}
        disabled={isSearching || !searchValue.trim() || !selectedConversationId}
      >
        {isSearching ? <LoadingSpinner className="h-4 w-4 mr-2" /> : <Search className="h-4 w-4" />}
      </Button>

      {/* <Button 
        variant={activeOnly ? "default" : "outline"} 
        size="sm"
        className={`${activeOnly ? 'bg-primary text-primary-foreground' : ''}`}
        onClick={toggleActiveFilter}
        disabled={rawSearchResults.length === 0}
        title={activeOnly ? "Showing active items only" : "Showing all items"}
      >
        {activeOnly ? "Active Only" : "All Items"}
      </Button> */}
    </div>
  )
} 