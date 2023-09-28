import { z } from "zod"

export const productSchema = z.object({
    productName: z.string({required_error: "productName mark is required", }),
    quantity: z.number({required_error: "quantity is required", }),
    map: z.number({required_error: "map is required", }),
    discount: z.number({required_error: "discount is required", }),
    netRate: z.number({required_error: "netRate is required", }),
    add: z.number({required_error: "add is required", }),
    saleRate: z.number({required_error: "saleRate is required", }),
    category: z.string({required_error: "category is required", })
})

export const editProductSchema = z.object({
    productName: z.string({required_error: "productName mark is required", }).optional(),
    quantity: z.number({required_error: "quantity is required", }).optional(),
    map: z.number({required_error: "map is required", }).optional(),
    discount: z.number({required_error: "discount is required", }).optional(),
    netRate: z.number({required_error: "netRate is required", }).optional(),
    add: z.number({required_error: "add is required", }).optional(),
    saleRate: z.number({required_error: "saleRate is required", }).optional(),
    category: z.string({required_error: "category is required", }).optional()
})

export type productData = z.infer<typeof productSchema>
export type editProductData = z.infer<typeof editProductSchema>