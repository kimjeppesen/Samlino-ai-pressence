import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Trash2, Play, Save, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  loadQueries,
  addQuery,
  updateQuery,
  deleteQuery,
  deleteQueries,
  loadCategories,
  addCategory,
  loadIntents,
  addIntent,
  type StoredQuery,
} from '@/lib/services/queryStorage';
import { useQueryProcessor } from '@/hooks/useQueryProcessor';
import type { Query } from '@/lib/types';

export function QueryManager() {
  const [queries, setQueries] = useState<StoredQuery[]>([]);
  const [categories, setCategories] = useState(loadCategories());
  const [intents, setIntents] = useState(loadIntents());
  const [selectedQueries, setSelectedQueries] = useState<Set<string>>(new Set());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newQueryText, setNewQueryText] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newIntentName, setNewIntentName] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [showNewIntentInput, setShowNewIntentInput] = useState(false);
  const [creatingCategoryForQuery, setCreatingCategoryForQuery] = useState<string | null>(null);
  const [creatingIntentForQuery, setCreatingIntentForQuery] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { processQueries, isProcessing, progress, error } = useQueryProcessor();
  
  const ITEMS_PER_PAGE = 20;

  const refreshQueries = useCallback(() => {
    const loaded = loadQueries();
    // Sort alphabetically by query text
    loaded.sort((a, b) => a.query.localeCompare(b.query, undefined, { sensitivity: 'base' }));
    setQueries(loaded);
    // Reset to first page when queries change
    setCurrentPage(1);
  }, []);

  const refreshCategories = useCallback(() => {
    setCategories(loadCategories());
  }, []);

  const refreshIntents = useCallback(() => {
    setIntents(loadIntents());
  }, []);

  useEffect(() => {
    refreshQueries();
    refreshCategories();
    refreshIntents();

    const handleUpdate = () => {
      refreshQueries();
      refreshCategories();
      refreshIntents();
    };

    window.addEventListener('queriesUpdated', handleUpdate);
    window.addEventListener('categoriesUpdated', handleUpdate);
    window.addEventListener('intentsUpdated', handleUpdate);

    return () => {
      window.removeEventListener('queriesUpdated', handleUpdate);
      window.removeEventListener('categoriesUpdated', handleUpdate);
      window.removeEventListener('intentsUpdated', handleUpdate);
    };
  }, [refreshQueries, refreshCategories, refreshIntents]);

  const handleAddQuery = () => {
    if (!newQueryText.trim()) return;

    addQuery({
      query: newQueryText.trim(),
      category: undefined,
      intent: undefined,
    });

    setNewQueryText('');
    setIsAddDialogOpen(false);
    refreshQueries();
  };

  const handleUpdateQuery = (queryId: string, field: keyof StoredQuery, value: any) => {
    updateQuery(queryId, { [field]: value });
    refreshQueries();
  };

  const handleDeleteQuery = (queryId: string) => {
    if (confirm('Are you sure you want to delete this query?')) {
      deleteQuery(queryId);
      refreshQueries();
      setSelectedQueries(prev => {
        const next = new Set(prev);
        next.delete(queryId);
        return next;
      });
    }
  };

  const handleDeleteSelected = () => {
    if (selectedQueries.size === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedQueries.size} query(ies)?`)) {
      deleteQueries(Array.from(selectedQueries));
      refreshQueries();
      setSelectedQueries(new Set());
    }
  };

  const handleCreateCategory = (queryId: string) => {
    if (!newCategoryName.trim()) {
      setShowNewCategoryInput(false);
      setCreatingCategoryForQuery(null);
      return;
    }
    const newCat = addCategory(newCategoryName.trim());
    handleUpdateQuery(queryId, 'category', newCat.id);
    setNewCategoryName('');
    setShowNewCategoryInput(false);
    setCreatingCategoryForQuery(null);
    refreshCategories();
  };

  const handleCreateIntent = (queryId: string) => {
    if (!newIntentName.trim()) {
      setShowNewIntentInput(false);
      setCreatingIntentForQuery(null);
      return;
    }
    const newIntent = addIntent(newIntentName.trim());
    handleUpdateQuery(queryId, 'intent', newIntent.id);
    setNewIntentName('');
    setShowNewIntentInput(false);
    setCreatingIntentForQuery(null);
    refreshIntents();
  };

  const toggleQuerySelection = (queryId: string) => {
    setSelectedQueries(prev => {
      const next = new Set(prev);
      if (next.has(queryId)) {
        next.delete(queryId);
      } else {
        next.add(queryId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedQueries.size === paginatedQueries.length) {
      setSelectedQueries(new Set());
    } else {
      setSelectedQueries(new Set(paginatedQueries.map(q => q.id)));
    }
  };

  // Filter and sort queries
  const filteredAndSortedQueries = useMemo(() => {
    let filtered = queries;
    
    // Apply search filter
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase().trim();
      filtered = queries.filter(q => 
        q.query.toLowerCase().includes(searchLower) ||
        (q.category && categories.find(c => c.id === q.category)?.name.toLowerCase().includes(searchLower)) ||
        (q.intent && intents.find(i => i.id === q.intent)?.name.toLowerCase().includes(searchLower))
      );
    }
    
    // Already sorted alphabetically in refreshQueries, but ensure it's maintained
    return [...filtered].sort((a, b) => a.query.localeCompare(b.query, undefined, { sensitivity: 'base' }));
  }, [queries, searchQuery, categories, intents]);
  
  // Paginate queries
  const paginatedQueries = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredAndSortedQueries.slice(startIndex, endIndex);
  }, [filteredAndSortedQueries, currentPage]);
  
  const totalPages = Math.ceil(filteredAndSortedQueries.length / ITEMS_PER_PAGE);
  
  // Update selected queries when filtering changes
  useEffect(() => {
    // Remove selections that are no longer in filtered results
    setSelectedQueries(prev => {
      const filteredIds = new Set(filteredAndSortedQueries.map(q => q.id));
      return new Set(Array.from(prev).filter(id => filteredIds.has(id)));
    });
  }, [filteredAndSortedQueries]);
  
  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleRunQueries = useCallback(async () => {
    const queriesToRun = selectedQueries.size > 0
      ? filteredAndSortedQueries.filter(q => selectedQueries.has(q.id))
      : filteredAndSortedQueries;

    if (queriesToRun.length === 0) {
      alert('No queries selected. Please select queries to run or run all queries.');
      return;
    }

    // Convert StoredQuery to Query format
    const queriesToProcess: Query[] = queriesToRun.map(q => ({
      id: q.id,
      query: q.query,
      category: q.category,
      intent: q.intent,
    }));

    try {
      await processQueries(queriesToProcess, { batchSize: 3 });
      // Wait for storage to be updated
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Trigger update event
      window.dispatchEvent(new Event('queryDataUpdated'));
    } catch (err) {
      console.error('[QueryManager] Failed to process queries:', err);
    }
  }, [queries, selectedQueries, processQueries]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Query Management</CardTitle>
            <CardDescription>
              Manage your queries, categories, and intents. Select queries and click "Run" to process them.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Query
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Query</DialogTitle>
                  <DialogDescription>
                    Enter a new query to add to your collection
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-query">Query Text</Label>
                    <Input
                      id="new-query"
                      value={newQueryText}
                      onChange={(e) => setNewQueryText(e.target.value)}
                      placeholder="Enter your query..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAddQuery();
                        }
                      }}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddQuery} disabled={!newQueryText.trim()}>
                    <Save className="w-4 h-4 mr-2" />
                    Add Query
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {selectedQueries.size > 0 && (
              <Button variant="destructive" onClick={handleDeleteSelected}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected ({selectedQueries.size})
              </Button>
            )}
            <Button onClick={handleRunQueries} disabled={filteredAndSortedQueries.length === 0 || isProcessing}>
              <Play className="w-4 h-4 mr-2" />
              {isProcessing ? `Processing... (${progress.current}/${progress.total})` : `Run ${selectedQueries.size > 0 ? `Selected (${selectedQueries.size})` : `All (${filteredAndSortedQueries.length})`}`}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {queries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No queries yet. Add your first query to get started.</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Query
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search queries, categories, or intents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Results count and pagination info */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div>
                {searchQuery ? (
                  <span>Found {filteredAndSortedQueries.length} of {queries.length} queries</span>
                ) : (
                  <span>Showing {paginatedQueries.length} of {queries.length} queries</span>
                )}
              </div>
              {totalPages > 1 && (
                <span>Page {currentPage} of {totalPages}</span>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedQueries.size === paginatedQueries.length && paginatedQueries.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
                <Label className="text-sm">
                  {selectedQueries.size > 0
                    ? `${selectedQueries.size} of ${filteredAndSortedQueries.length} selected`
                    : `Select all on page (${paginatedQueries.length} queries)`}
                </Label>
              </div>
            </div>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Query</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Intent</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedQueries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                        {searchQuery ? 'No queries match your search' : 'No queries to display'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedQueries.map((query) => (
                    <TableRow key={query.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedQueries.has(query.id)}
                          onCheckedChange={() => toggleQuerySelection(query.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{query.query}</div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={query.category || '__none__'}
                          onValueChange={(value) => {
                            if (value === '__create_new__') {
                              setCreatingCategoryForQuery(query.id);
                              setShowNewCategoryInput(true);
                              return; // Don't update the query value
                            }
                            handleUpdateQuery(query.id, 'category', value === '__none__' ? undefined : value);
                          }}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="No category">
                              {query.category ? categories.find(c => c.id === query.category)?.name || 'Unknown' : 'No category'}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">No category</SelectItem>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                            <SelectItem value="__create_new__">
                              <div className="flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Create new category
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {showNewCategoryInput && creatingCategoryForQuery === query.id && (
                          <div className="mt-2 flex gap-2">
                            <Input
                              placeholder="Category name"
                              value={newCategoryName}
                              onChange={(e) => setNewCategoryName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleCreateCategory(query.id);
                                } else if (e.key === 'Escape') {
                                  setShowNewCategoryInput(false);
                                  setNewCategoryName('');
                                  setCreatingCategoryForQuery(null);
                                }
                              }}
                              autoFocus
                            />
                            <Button size="sm" onClick={() => handleCreateCategory(query.id)}>
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => {
                              setShowNewCategoryInput(false);
                              setNewCategoryName('');
                              setCreatingCategoryForQuery(null);
                            }}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={query.intent || '__none__'}
                          onValueChange={(value) => {
                            if (value === '__create_new__') {
                              setCreatingIntentForQuery(query.id);
                              setShowNewIntentInput(true);
                              return; // Don't update the query value
                            }
                            handleUpdateQuery(query.id, 'intent', value === '__none__' ? undefined : value);
                          }}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="No intent">
                              {query.intent ? intents.find(i => i.id === query.intent)?.name || 'Unknown' : 'No intent'}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">No intent</SelectItem>
                            {intents.map((intent) => (
                              <SelectItem key={intent.id} value={intent.id}>
                                {intent.name}
                              </SelectItem>
                            ))}
                            <SelectItem value="__create_new__">
                              <div className="flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Create new intent
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {showNewIntentInput && creatingIntentForQuery === query.id && (
                          <div className="mt-2 flex gap-2">
                            <Input
                              placeholder="Intent name"
                              value={newIntentName}
                              onChange={(e) => setNewIntentName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleCreateIntent(query.id);
                                } else if (e.key === 'Escape') {
                                  setShowNewIntentInput(false);
                                  setNewIntentName('');
                                  setCreatingIntentForQuery(null);
                                }
                              }}
                              autoFocus
                            />
                            <Button size="sm" onClick={() => handleCreateIntent(query.id)}>
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => {
                              setShowNewIntentInput(false);
                              setNewIntentName('');
                              setCreatingIntentForQuery(null);
                            }}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteQuery(query.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {(() => {
                    const pages: (number | 'ellipsis')[] = [];
                    const showEllipsis = totalPages > 7;
                    
                    if (!showEllipsis) {
                      // Show all pages if 7 or fewer
                      for (let i = 1; i <= totalPages; i++) {
                        pages.push(i);
                      }
                    } else {
                      // Always show first page
                      pages.push(1);
                      
                      if (currentPage <= 4) {
                        // Near the start
                        for (let i = 2; i <= 5; i++) {
                          pages.push(i);
                        }
                        pages.push('ellipsis');
                        pages.push(totalPages);
                      } else if (currentPage >= totalPages - 3) {
                        // Near the end
                        pages.push('ellipsis');
                        for (let i = totalPages - 4; i <= totalPages; i++) {
                          pages.push(i);
                        }
                      } else {
                        // In the middle
                        pages.push('ellipsis');
                        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                          pages.push(i);
                        }
                        pages.push('ellipsis');
                        pages.push(totalPages);
                      }
                    }
                    
                    return pages.map((page, index) => {
                      if (page === 'ellipsis') {
                        return (
                          <PaginationItem key={`ellipsis-${index}`}>
                            <span className="px-2">...</span>
                          </PaginationItem>
                        );
                      }
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    });
                  })()}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
            {isProcessing && (
              <Alert className="mt-4">
                <AlertDescription>
                  Processing {progress.current} of {progress.total} queries...
                </AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
