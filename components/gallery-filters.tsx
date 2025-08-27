"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Star, Clock, TrendingUp, X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"

export default function GalleryFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")

  const currentSort = searchParams.get("sort") || "newest"
  const currentFeatured = searchParams.get("featured") === "true"

  const debouncedSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set("search", term)
    } else {
      params.delete("search")
    }
    router.push(`/gallery?${params.toString()}`)
  }, 300)

  useEffect(() => {
    debouncedSearch(searchTerm)
  }, [searchTerm, debouncedSearch])

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams)
    params.set("sort", sort)
    router.push(`/gallery?${params.toString()}`)
  }

  const handleFeaturedToggle = () => {
    const params = new URLSearchParams(searchParams)
    if (currentFeatured) {
      params.delete("featured")
    } else {
      params.set("featured", "true")
    }
    router.push(`/gallery?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearchTerm("")
    router.push("/gallery")
  }

  const hasActiveFilters = searchTerm || currentFeatured || currentSort !== "newest"

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search images by title or prompt..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Sort */}
        <Select value={currentSort} onValueChange={handleSortChange}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Newest First
              </div>
            </SelectItem>
            <SelectItem value="oldest">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Oldest First
              </div>
            </SelectItem>
            <SelectItem value="popular">
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Most Popular
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Featured Filter */}
        <Button
          variant={currentFeatured ? "default" : "outline"}
          onClick={handleFeaturedToggle}
          className={
            currentFeatured
              ? "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
              : "border-cyan-200 text-cyan-700 hover:bg-cyan-50 bg-transparent"
          }
        >
          <Star className="w-4 h-4 mr-2" />
          Featured Only
        </Button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters} className="text-gray-600 hover:text-gray-800">
            <X className="w-4 h-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <Badge variant="secondary" className="bg-cyan-100 text-cyan-800">
              Search: "{searchTerm}"
            </Badge>
          )}
          {currentFeatured && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              Featured Only
            </Badge>
          )}
          {currentSort !== "newest" && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Sort: {currentSort === "popular" ? "Most Popular" : "Oldest First"}
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
