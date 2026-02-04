/**
 * CategoryManage.tsx
 * 
 * Admin interface for managing event categories.
 * Allows Adding, Editing, and Deleting categories.
 */

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { categoryApi } from "@/lib/api";

interface Category {
    id: number;
    name: string;
    description: string;
    active: boolean;
}

export default function CategoryManage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const [isAdding, setIsAdding] = useState(false);
    const [newCategory, setNewCategory] = useState({ name: "", description: "" });
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({ name: "", description: "" });

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const data = await categoryApi.getAll();
            setCategories(data);
        } catch (error) {
            toast.error("Failed to load categories");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAdd = async () => {
        if (!newCategory.name) {
            toast.error("Category name is required");
            return;
        }
        try {
            await categoryApi.create(newCategory);
            toast.success("Category added successfully");
            setNewCategory({ name: "", description: "" });
            setIsAdding(false);
            fetchCategories();
        } catch (error) {
            toast.error("Failed to add category");
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
            try {
                await categoryApi.delete(id);
                toast.success("Category deleted");
                fetchCategories();
            } catch (error) {
                toast.error("Failed to delete category");
            }
        }
    };

    const startEdit = (category: Category) => {
        setEditingId(category.id);
        setEditForm({ name: category.name, description: category.description });
    };

    const saveEdit = async () => {
        if (!editingId) return;
        try {
            await categoryApi.update(editingId, editForm);
            toast.success("Category updated");
            setEditingId(null);
            fetchCategories();
        } catch (error) {
            toast.error("Failed to update category");
        }
    };

    return (
        <div className="min-h-screen bg-background py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold">
                        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            Manage Categories
                        </span>
                    </h1>
                    <Button onClick={() => setIsAdding(!isAdding)}>
                        {isAdding ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                        {isAdding ? "Cancel" : "Add Category"}
                    </Button>
                </div>

                {isAdding && (
                    <Card className="mb-8 animate-fade-in border-primary/20">
                        <CardHeader>
                            <CardTitle>Add New Category</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4 items-end">
                                <div className="space-y-2 flex-1">
                                    <label className="text-sm font-medium">Name</label>
                                    <Input
                                        value={newCategory.name}
                                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                        placeholder="e.g. Workshops"
                                    />
                                </div>
                                <div className="space-y-2 flex-[2]">
                                    <label className="text-sm font-medium">Description</label>
                                    <Input
                                        value={newCategory.description}
                                        onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                                        placeholder="Brief description"
                                    />
                                </div>
                                <Button onClick={handleAdd}>Save</Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Existing Categories</CardTitle>
                        <CardDescription>Manage all event categories available on the platform</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {/* ID Column Removed */}
                                    <TableHead>Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center h-24">Loading categories...</TableCell>
                                    </TableRow>
                                ) : categories.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center h-24">No categories found.</TableCell>
                                    </TableRow>
                                ) : (
                                    categories.map((category) => (
                                        <TableRow key={category.id}>
                                            <TableCell className="font-medium">
                                                {editingId === category.id ? (
                                                    <Input
                                                        value={editForm.name}
                                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                    />
                                                ) : (
                                                    category.name
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {editingId === category.id ? (
                                                    <Input
                                                        value={editForm.description}
                                                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                                    />
                                                ) : (
                                                    category.description
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {editingId === category.id ? (
                                                        <>
                                                            <Button size="icon" variant="ghost" onClick={saveEdit}>
                                                                <Save className="h-4 w-4 text-green-500" />
                                                            </Button>
                                                            <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}>
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Button size="icon" variant="ghost" onClick={() => startEdit(category)}>
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button size="icon" variant="ghost" onClick={() => handleDelete(category.id)}>
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
