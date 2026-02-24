import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useOne, useCreate, useUpdate } from '@refinedev/core';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProductSchema, type CreateProductInput } from '@amira/shared/schemas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useList } from '@refinedev/core';
import { Upload, X } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
}

export function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();

  const { data: productData, isLoading: productLoading } = useOne({
    resource: 'products',
    id: id || '',
    queryOptions: { enabled: isEdit },
  });

  const { data: categoriesData } = useList<Category>({
    resource: 'categories',
    pagination: { current: 1, pageSize: 100 },
  });

  const { mutate: createProduct, isLoading: isCreating } = useCreate();
  const { mutate: updateProduct, isLoading: isUpdating } = useUpdate();

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const product = productData?.data as Record<string, unknown> | undefined;
  const categories = categoriesData?.data || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    values: isEdit && product
      ? {
          name: product.name as string,
          description: product.description as string,
          price: product.price as number,
          stock: product.stock as number,
          categoryId: (product.category as { _id: string })?._id || (product.categoryId as string) || (product.category as string),
        }
      : undefined,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imageFiles.length > 5) return;
    setImageFiles((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreviews((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: CreateProductInput) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('price', String(data.price));
    formData.append('stock', String(data.stock));
    formData.append('categoryId', data.categoryId);
    imageFiles.forEach((file) => formData.append('images', file));

    if (isEdit) {
      updateProduct(
        { resource: 'products', id: id!, values: formData as unknown as Record<string, unknown> },
        { onSuccess: () => navigate('/products') }
      );
    } else {
      createProduct(
        { resource: 'products', values: formData as unknown as Record<string, unknown> },
        { onSuccess: () => navigate('/products') }
      );
    }
  };

  if (isEdit && productLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-700" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        {isEdit ? 'Edit Product' : 'Create Product'}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Product Name"
              error={errors.name?.message}
              {...register('name')}
            />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows={4}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                {...register('description')}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Price (Rs.)"
                type="number"
                error={errors.price?.message}
                {...register('price', { valueAsNumber: true })}
              />
              <Input
                label="Stock"
                type="number"
                error={errors.stock?.message}
                {...register('stock', { valueAsNumber: true })}
              />
            </div>

            <Select
              label="Category"
              options={categories.map((c) => ({ value: (c as unknown as Category)._id, label: (c as unknown as Category).name }))}
              placeholder="Select a category"
              error={errors.categoryId?.message}
              {...register('categoryId')}
            />

            {/* Image upload */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Images (max 5)
              </label>
              <div className="flex flex-wrap gap-3">
                {/* Existing images (edit mode) */}
                {isEdit &&
                  (product?.images as string[])?.map((url, i) => (
                    <div key={`existing-${i}`} className="relative h-20 w-20 overflow-hidden rounded-lg bg-gray-100">
                      <img src={url} alt="" className="h-full w-full object-cover" />
                    </div>
                  ))}
                {/* New previews */}
                {imagePreviews.map((src, i) => (
                  <div key={`new-${i}`} className="relative h-20 w-20 overflow-hidden rounded-lg bg-gray-100">
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute right-1 top-1 rounded-full bg-black/50 p-0.5 text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {imageFiles.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-primary-500 hover:text-primary-600"
                  >
                    <Upload className="h-5 w-5" />
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" isLoading={isCreating || isUpdating}>
                {isEdit ? 'Update' : 'Create'} Product
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/products')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
