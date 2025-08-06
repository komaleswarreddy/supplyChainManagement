import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { db } from '../db';
import { 
  inventoryItems, 
  productCategories, 
  productAttributes, 
  productAttributeValues,
  productImages,
  productRelationships,
  productBundles,
  productReviews,
  productPriceHistory
} from '../db/schema/inventory';
import { eq, and, or, like, desc, asc, inArray } from 'drizzle-orm';
import { AppError } from '../utils/app-error';
import { authenticate, hasPermissions } from '../middleware/auth';

// Define route schemas
const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  parentId: z.string().uuid().optional(),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  imageUrl: z.string().url().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  urlKey: z.string().min(1, 'URL key is required'),
  displayMode: z.enum(['PRODUCTS', 'PAGE', 'BOTH']).default('PRODUCTS'),
  pageLayout: z.string().default('DEFAULT'),
  customDesign: z.record(z.any()).optional(),
});

const createAttributeSchema = z.object({
  name: z.string().min(1, 'Attribute name is required'),
  code: z.string().min(1, 'Attribute code is required'),
  type: z.enum(['TEXT', 'NUMBER', 'SELECT', 'MULTISELECT', 'BOOLEAN', 'DATE', 'FILE']),
  isRequired: z.boolean().default(false),
  isSearchable: z.boolean().default(false),
  isFilterable: z.boolean().default(false),
  isComparable: z.boolean().default(false),
  isVisible: z.boolean().default(true),
  isSystem: z.boolean().default(false),
  options: z.array(z.object({
    value: z.string(),
    label: z.string(),
    sortOrder: z.number().optional(),
    isDefault: z.boolean().optional(),
  })).optional(),
  validationRules: z.record(z.any()).optional(),
  defaultValue: z.string().optional(),
  inputType: z.enum(['TEXT', 'TEXTAREA', 'SELECT', 'MULTISELECT', 'CHECKBOX', 'RADIO', 'DATE', 'FILE']).default('TEXT'),
  frontendLabel: z.string().optional(),
  frontendInput: z.string().optional(),
  sortOrder: z.number().int().min(0).default(0),
});

const createProductSchema = z.object({
  itemCode: z.string().min(1, 'Item code is required'),
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  status: z.enum(['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'DISCONTINUED']),
  minQuantity: z.number().int().min(0),
  maxQuantity: z.number().int().optional(),
  reorderPoint: z.number().int().optional(),
  currentQuantity: z.number().int().min(0),
  unitCost: z.number().min(0).optional(),
  currency: z.string().default('USD'),
  location: z.object({
    warehouse: z.string(),
    zone: z.string(),
    bin: z.string(),
  }),
  specifications: z.record(z.any()).optional(),
  dimensions: z.object({
    length: z.number(),
    width: z.number(),
    height: z.number(),
    weight: z.number(),
    uom: z.string(),
  }).optional(),
  supplierId: z.string().uuid().optional(),
  // Catalog fields
  sku: z.string().optional(),
  barcode: z.string().optional(),
  productType: z.enum(['SIMPLE', 'CONFIGURABLE', 'BUNDLE', 'VIRTUAL']).default('SIMPLE'),
  parentItemId: z.string().uuid().optional(),
  attributes: z.record(z.any()).optional(),
  catalogStatus: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT', 'DISCONTINUED']).default('ACTIVE'),
  catalogCategoryId: z.string().uuid().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  urlKey: z.string().optional(),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
});

const updateProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  category: z.string().min(1, 'Category is required').optional(),
  status: z.enum(['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'DISCONTINUED']).optional(),
  minQuantity: z.number().int().min(0).optional(),
  maxQuantity: z.number().int().optional(),
  reorderPoint: z.number().int().optional(),
  unitCost: z.number().min(0).optional(),
  currency: z.string().optional(),
  location: z.object({
    warehouse: z.string(),
    zone: z.string(),
    bin: z.string(),
  }).optional(),
  specifications: z.record(z.any()).optional(),
  dimensions: z.object({
    length: z.number(),
    width: z.number(),
    height: z.number(),
    weight: z.number(),
    uom: z.string(),
  }).optional(),
  supplierId: z.string().uuid().optional(),
  // Catalog fields
  sku: z.string().optional(),
  barcode: z.string().optional(),
  productType: z.enum(['SIMPLE', 'CONFIGURABLE', 'BUNDLE', 'VIRTUAL']).optional(),
  parentItemId: z.string().uuid().optional(),
  attributes: z.record(z.any()).optional(),
  catalogStatus: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT', 'DISCONTINUED']).optional(),
  catalogCategoryId: z.string().uuid().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  urlKey: z.string().optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export default async function catalogRoutes(fastify: FastifyInstance) {
  // Get product categories
  fastify.get('/categories', {
    preHandler: hasPermissions(['view_catalog']),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          pageSize: { type: 'number', default: 10 },
          parentId: { type: 'string', format: 'uuid' },
          isActive: { type: 'boolean' },
          search: { type: 'string' },
          sortBy: { type: 'string', enum: ['name', 'sortOrder', 'createdAt'] },
          sortOrder: { type: 'string', enum: ['asc', 'desc'] },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  description: { type: 'string' },
                  parentId: { type: 'string' },
                  level: { type: 'number' },
                  sortOrder: { type: 'number' },
                  isActive: { type: 'boolean' },
                  urlKey: { type: 'string' },
                  productCount: { type: 'number' },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
            total: { type: 'number' },
            page: { type: 'number' },
            pageSize: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { 
      page = 1, 
      pageSize = 10, 
      parentId, 
      isActive, 
      search, 
      sortBy = 'name', 
      sortOrder = 'asc' 
    } = request.query as any;
    
    // Build query
    let query = db.select().from(productCategories);
    
    // Apply filters
    if (parentId) {
      query = query.where(eq(productCategories.parentId, parentId));
    }
    if (isActive !== undefined) {
      query = query.where(eq(productCategories.isActive, isActive));
    }
    if (search) {
      query = query.where(
        or(
          like(productCategories.name, `%${search}%`),
          like(productCategories.description || '', `%${search}%`)
        )
      );
    }
    
    // Get total count for pagination
    const totalQuery = db.select({ count: db.fn.count() }).from(productCategories);
    const [{ count }] = await totalQuery.execute();
    const total = Number(count);
    
    // Apply sorting
    const sortColumn = sortBy === 'name' ? productCategories.name :
                      sortBy === 'sortOrder' ? productCategories.sortOrder :
                      productCategories.createdAt;
    const sortDirection = sortOrder === 'desc' ? desc : asc;
    query = query.orderBy(sortDirection(sortColumn));
    
    // Apply pagination
    query = query.limit(pageSize).offset((page - 1) * pageSize);
    
    // Execute query
    const items = await query.execute();
    
    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  });

  // Get category by ID
  fastify.get('/categories/:id', {
    preHandler: hasPermissions(['view_catalog']),
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    
    const category = await db.select().from(productCategories).where(eq(productCategories.id, id)).limit(1);
    
    if (!category.length) {
      throw new AppError('Category not found', 404);
    }
    
    return category[0];
  });

  // Create category
  fastify.post('/categories', {
    preHandler: hasPermissions(['manage_catalog']),
    schema: {
      body: createCategorySchema,
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const categoryData = request.body as z.infer<typeof createCategorySchema>;
    
    // Check if URL key is unique
    const existingCategory = await db.select()
      .from(productCategories)
      .where(eq(productCategories.urlKey, categoryData.urlKey))
      .limit(1);
    
    if (existingCategory.length > 0) {
      throw new AppError('URL key must be unique', 400);
    }
    
    // Calculate level if parent is provided
    let level = 1;
    if (categoryData.parentId) {
      const parentCategory = await db.select()
        .from(productCategories)
        .where(eq(productCategories.id, categoryData.parentId))
        .limit(1);
      
      if (!parentCategory.length) {
        throw new AppError('Parent category not found', 404);
      }
      
      level = parentCategory[0].level + 1;
    }
    
    const [category] = await db.insert(productCategories).values({
      ...categoryData,
      level,
      createdBy: request.user.id,
    }).returning();
    
    reply.status(201);
    return {
      id: category.id,
      name: category.name,
      message: 'Category created successfully',
    };
  });

  // Update category
  fastify.put('/categories/:id', {
    preHandler: hasPermissions(['manage_catalog']),
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      body: createCategorySchema.partial(),
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const updateData = request.body as Partial<z.infer<typeof createCategorySchema>>;
    
    const [category] = await db.update(productCategories)
      .set({
        ...updateData,
        updatedBy: request.user.id,
        updatedAt: new Date(),
      })
      .where(eq(productCategories.id, id))
      .returning();
    
    if (!category) {
      throw new AppError('Category not found', 404);
    }
    
    return {
      id: category.id,
      message: 'Category updated successfully',
    };
  });

  // Delete category
  fastify.delete('/categories/:id', {
    preHandler: hasPermissions(['manage_catalog']),
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    
    // Check if category has children
    const children = await db.select()
      .from(productCategories)
      .where(eq(productCategories.parentId, id));
    
    if (children.length > 0) {
      throw new AppError('Cannot delete category with subcategories', 400);
    }
    
    // Check if category has products
    const products = await db.select()
      .from(inventoryItems)
      .where(eq(inventoryItems.catalogCategoryId, id));
    
    if (products.length > 0) {
      throw new AppError('Cannot delete category with products', 400);
    }
    
    const deleted = await db.delete(productCategories)
      .where(eq(productCategories.id, id))
      .returning();
    
    if (!deleted.length) {
      throw new AppError('Category not found', 404);
    }
    
    return {
      message: 'Category deleted successfully',
    };
  });

  // Get product attributes
  fastify.get('/attributes', {
    preHandler: hasPermissions(['view_catalog']),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          pageSize: { type: 'number', default: 10 },
          type: { type: 'string' },
          isSystem: { type: 'boolean' },
          isSearchable: { type: 'boolean' },
          isFilterable: { type: 'boolean' },
          search: { type: 'string' },
          sortBy: { type: 'string', enum: ['name', 'code', 'sortOrder'] },
          sortOrder: { type: 'string', enum: ['asc', 'desc'] },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { 
      page = 1, 
      pageSize = 10, 
      type, 
      isSystem, 
      isSearchable, 
      isFilterable, 
      search, 
      sortBy = 'name', 
      sortOrder = 'asc' 
    } = request.query as any;
    
    // Build query
    let query = db.select().from(productAttributes);
    
    // Apply filters
    if (type) {
      query = query.where(eq(productAttributes.type, type));
    }
    if (isSystem !== undefined) {
      query = query.where(eq(productAttributes.isSystem, isSystem));
    }
    if (isSearchable !== undefined) {
      query = query.where(eq(productAttributes.isSearchable, isSearchable));
    }
    if (isFilterable !== undefined) {
      query = query.where(eq(productAttributes.isFilterable, isFilterable));
    }
    if (search) {
      query = query.where(
        or(
          like(productAttributes.name, `%${search}%`),
          like(productAttributes.code, `%${search}%`)
        )
      );
    }
    
    // Get total count for pagination
    const totalQuery = db.select({ count: db.fn.count() }).from(productAttributes);
    const [{ count }] = await totalQuery.execute();
    const total = Number(count);
    
    // Apply sorting
    const sortColumn = sortBy === 'name' ? productAttributes.name :
                      sortBy === 'code' ? productAttributes.code :
                      productAttributes.sortOrder;
    const sortDirection = sortOrder === 'desc' ? desc : asc;
    query = query.orderBy(sortDirection(sortColumn));
    
    // Apply pagination
    query = query.limit(pageSize).offset((page - 1) * pageSize);
    
    // Execute query
    const items = await query.execute();
    
    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  });

  // Create attribute
  fastify.post('/attributes', {
    preHandler: hasPermissions(['manage_catalog']),
    schema: {
      body: createAttributeSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const attributeData = request.body as z.infer<typeof createAttributeSchema>;
    
    // Check if code is unique
    const existingAttribute = await db.select()
      .from(productAttributes)
      .where(eq(productAttributes.code, attributeData.code))
      .limit(1);
    
    if (existingAttribute.length > 0) {
      throw new AppError('Attribute code must be unique', 400);
    }
    
    const [attribute] = await db.insert(productAttributes).values({
      ...attributeData,
      createdBy: request.user.id,
    }).returning();
    
    reply.status(201);
    return {
      id: attribute.id,
      code: attribute.code,
      message: 'Attribute created successfully',
    };
  });

  // Get catalog products
  fastify.get('/products', {
    preHandler: hasPermissions(['view_catalog']),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          pageSize: { type: 'number', default: 10 },
          categoryId: { type: 'string', format: 'uuid' },
          brand: { type: 'string' },
          productType: { type: 'string' },
          catalogStatus: { type: 'string' },
          isFeatured: { type: 'boolean' },
          priceMin: { type: 'number' },
          priceMax: { type: 'number' },
          search: { type: 'string' },
          sortBy: { type: 'string', enum: ['name', 'price', 'createdAt', 'sortOrder'] },
          sortOrder: { type: 'string', enum: ['asc', 'desc'] },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { 
      page = 1, 
      pageSize = 10, 
      categoryId, 
      brand, 
      productType, 
      catalogStatus, 
      isFeatured, 
      priceMin, 
      priceMax, 
      search, 
      sortBy = 'name', 
      sortOrder = 'asc' 
    } = request.query as any;
    
    // Build query
    let query = db.select().from(inventoryItems);
    
    // Apply filters
    if (categoryId) {
      query = query.where(eq(inventoryItems.catalogCategoryId, categoryId));
    }
    if (brand) {
      query = query.where(like(inventoryItems.brand || '', `%${brand}%`));
    }
    if (productType) {
      query = query.where(eq(inventoryItems.productType, productType));
    }
    if (catalogStatus) {
      query = query.where(eq(inventoryItems.catalogStatus, catalogStatus));
    }
    if (isFeatured !== undefined) {
      query = query.where(eq(inventoryItems.isFeatured, isFeatured));
    }
    if (priceMin !== undefined) {
      query = query.where(db.sql`${inventoryItems.unitCost} >= ${priceMin}`);
    }
    if (priceMax !== undefined) {
      query = query.where(db.sql`${inventoryItems.unitCost} <= ${priceMax}`);
    }
    if (search) {
      query = query.where(
        or(
          like(inventoryItems.name, `%${search}%`),
          like(inventoryItems.description, `%${search}%`),
          like(inventoryItems.sku || '', `%${search}%`),
          like(inventoryItems.brand || '', `%${search}%`)
        )
      );
    }
    
    // Get total count for pagination
    const totalQuery = db.select({ count: db.fn.count() }).from(inventoryItems);
    const [{ count }] = await totalQuery.execute();
    const total = Number(count);
    
    // Apply sorting
    const sortColumn = sortBy === 'name' ? inventoryItems.name :
                      sortBy === 'price' ? inventoryItems.unitCost :
                      sortBy === 'createdAt' ? inventoryItems.createdAt :
                      inventoryItems.sortOrder;
    const sortDirection = sortOrder === 'desc' ? desc : asc;
    query = query.orderBy(sortDirection(sortColumn));
    
    // Apply pagination
    query = query.limit(pageSize).offset((page - 1) * pageSize);
    
    // Execute query
    const items = await query.execute();
    
    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  });

  // Create product
  fastify.post('/products', {
    preHandler: hasPermissions(['manage_catalog']),
    schema: {
      body: createProductSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const productData = request.body as z.infer<typeof createProductSchema>;
    
    // Check if item code is unique
    const existingProduct = await db.select()
      .from(inventoryItems)
      .where(eq(inventoryItems.itemCode, productData.itemCode))
      .limit(1);
    
    if (existingProduct.length > 0) {
      throw new AppError('Item code must be unique', 400);
    }
    
    // Generate SKU if not provided
    if (!productData.sku) {
      productData.sku = await generateSKU(productData);
    }
    
    const [product] = await db.insert(inventoryItems).values({
      ...productData,
      createdBy: request.user.id,
    }).returning();
    
    reply.status(201);
    return {
      id: product.id,
      itemCode: product.itemCode,
      sku: product.sku,
      message: 'Product created successfully',
    };
  });

  // Update product
  fastify.put('/products/:id', {
    preHandler: hasPermissions(['manage_catalog']),
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      body: updateProductSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const updateData = request.body as z.infer<typeof updateProductSchema>;
    
    const [product] = await db.update(inventoryItems)
      .set({
        ...updateData,
        updatedBy: request.user.id,
        updatedAt: new Date(),
      })
      .where(eq(inventoryItems.id, id))
      .returning();
    
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    
    return {
      id: product.id,
      message: 'Product updated successfully',
    };
  });

  // Generate SKU
  fastify.post('/products/:id/generate-sku', {
    preHandler: hasPermissions(['manage_catalog']),
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
        properties: {
          rule: {
            type: 'object',
            properties: {
              prefix: { type: 'string' },
              includeCategory: { type: 'boolean' },
              includeBrand: { type: 'boolean' },
              includeAttributes: { type: 'array', items: { type: 'string' } },
              separator: { type: 'string' },
              length: { type: 'number' },
              suffix: { type: 'string' },
            },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { rule } = request.body as { rule: any };
    
    const product = await db.select()
      .from(inventoryItems)
      .where(eq(inventoryItems.id, id))
      .limit(1);
    
    if (!product.length) {
      throw new AppError('Product not found', 404);
    }
    
    const sku = await generateSKU(product[0], rule);
    
    await db.update(inventoryItems)
      .set({ sku, updatedBy: request.user.id, updatedAt: new Date() })
      .where(eq(inventoryItems.id, id));
    
    return {
      sku,
      message: 'SKU generated successfully',
    };
  });

  // Get product variants
  fastify.get('/products/:id/variants', {
    preHandler: hasPermissions(['view_catalog']),
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    
    const variants = await db.select()
      .from(inventoryItems)
      .where(eq(inventoryItems.parentItemId, id));
    
    return {
      variants,
    };
  });

  // Create product variant
  fastify.post('/products/:id/variants', {
    preHandler: hasPermissions(['manage_catalog']),
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
        required: ['attributes'],
        properties: {
          attributes: { type: 'object' },
          generateSKU: { type: 'boolean', default: true },
          skuRule: { type: 'object' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { attributes, generateSKU, skuRule } = request.body as any;
    
    const parentProduct = await db.select()
      .from(inventoryItems)
      .where(eq(inventoryItems.id, id))
      .limit(1);
    
    if (!parentProduct.length) {
      throw new AppError('Parent product not found', 404);
    }
    
    if (parentProduct[0].productType !== 'CONFIGURABLE') {
      throw new AppError('Parent product must be configurable', 400);
    }
    
    // Create variant
    const variantData = {
      ...parentProduct[0],
      id: undefined,
      parentItemId: id,
      productType: 'SIMPLE' as const,
      attributes,
      itemCode: `${parentProduct[0].itemCode}-${Date.now()}`,
      name: `${parentProduct[0].name} - ${Object.values(attributes).join(' ')}`,
    };
    
    if (generateSKU) {
      variantData.sku = await generateSKU(variantData, skuRule);
    }
    
    const [variant] = await db.insert(inventoryItems).values({
      ...variantData,
      createdBy: request.user.id,
    }).returning();
    
    reply.status(201);
    return {
      id: variant.id,
      sku: variant.sku,
      message: 'Variant created successfully',
    };
  });
}

// Helper function to generate SKU
async function generateSKU(product: any, rule?: any): Promise<string> {
  const defaultRule = {
    prefix: 'SKU',
    includeCategory: true,
    includeBrand: false,
    includeAttributes: [],
    separator: '-',
    length: 8,
    suffix: '',
  };
  
  const finalRule = { ...defaultRule, ...rule };
  let sku = finalRule.prefix;
  
  if (finalRule.includeCategory && product.category) {
    sku += finalRule.separator + product.category.substring(0, 3).toUpperCase();
  }
  
  if (finalRule.includeBrand && product.brand) {
    sku += finalRule.separator + product.brand.substring(0, 3).toUpperCase();
  }
  
  if (finalRule.includeAttributes.length > 0 && product.attributes) {
    for (const attr of finalRule.includeAttributes) {
      if (product.attributes[attr]) {
        sku += finalRule.separator + product.attributes[attr].substring(0, 2).toUpperCase();
      }
    }
  }
  
  // Add random string
  const randomStr = Math.random().toString(36).substring(2, 2 + finalRule.length);
  sku += finalRule.separator + randomStr.toUpperCase();
  
  if (finalRule.suffix) {
    sku += finalRule.separator + finalRule.suffix;
  }
  
  // Check if SKU is unique
  const existingProduct = await db.select()
    .from(inventoryItems)
    .where(eq(inventoryItems.sku, sku))
    .limit(1);
  
  if (existingProduct.length > 0) {
    // If not unique, try again
    return generateSKU(product, rule);
  }
  
  return sku;
} 