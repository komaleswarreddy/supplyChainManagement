import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCatalog } from '@/hooks/useCatalog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Trash2, Edit, Eye, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 10;

const CatalogCategories: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const { useCategories, useDeleteCategory } = useCatalog();
  const { data, isLoading, isError, refetch } = useCategories({ page, pageSize: PAGE_SIZE, search });
  const deleteCategory = useDeleteCategory();

  const handleDelete = (id: string) => {
    setCategoryToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (categoryToDelete) {
      await deleteCategory.mutateAsync(categoryToDelete);
      setShowDeleteDialog(false);
      setCategoryToDelete(null);
      refetch();
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/catalog/categories/edit/${id}`);
  };

  const handleView = (id: string) => {
    setSelectedCategory(id);
  };

  const handleCreate = () => {
    navigate('/catalog/categories/create');
  };

  const categories = useMemo(() => data?.items || [], [data]);
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Catalog Categories</h1>
        <Button onClick={handleCreate} variant="primary" size="sm">
          <Plus className="w-4 h-4 mr-2" /> New Category
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search categories..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input input-bordered w-64"
        />
      </div>
      {isLoading ? (
        <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
      ) : isError ? (
        <div className="text-red-500">Failed to load categories.</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sort Order</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map(cat => (
              <TableRow key={cat.id}>
                <TableCell className="font-medium">{cat.name}</TableCell>
                <TableCell>{cat.description}</TableCell>
                <TableCell>
                  <Badge variant={cat.isActive ? 'success' : 'destructive'}>
                    {cat.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>{cat.sortOrder}</TableCell>
                <TableCell>{cat.productCount ?? 0}</TableCell>
                <TableCell>
                  <div className="text-xs text-muted-foreground">
                    {cat.createdBy?.name} <br />
                    {new Date(cat.createdAt).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button size="icon" variant="ghost" onClick={() => handleView(cat.id)} title="View">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(cat.id)} title="Edit">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(cat.id)} title="Delete">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogTitle>Delete Category</DialogTitle>
          <div>Are you sure you want to delete this category? This action cannot be undone.</div>
          <div className="flex gap-4 mt-6 justify-end">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteCategory.isLoading}>
              {deleteCategory.isLoading ? <LoadingSpinner size="sm" /> : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Pagination Controls */}
      {total > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((page - 1) * PAGE_SIZE) + 1} to {Math.min(page * PAGE_SIZE, total)} of {total} categories
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
              {totalPages > 5 && (
                <>
                  {page > 3 && <span className="px-2">...</span>}
                  {page > 3 && page < totalPages - 2 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  )}
                  {page < totalPages - 2 && <span className="px-2">...</span>}
                  {totalPages > 5 && (
                    <Button
                      variant={page === totalPages ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(totalPages)}
                      className="w-8 h-8 p-0"
                    >
                      {totalPages}
                    </Button>
                  )}
                </>
              )}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogCategories; 