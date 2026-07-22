/**
 * Supplier adapter contract for catalog sync + dropship.
 * Implementations: mock | http (stub) | csv_feed
 */

/**
 * @typedef {object} ProductDraft
 * @property {string} [id] slug id if known
 * @property {string} name
 * @property {string} [category]
 * @property {string} [size]
 * @property {number} wholesale_price
 * @property {number} [retail_price]
 * @property {string} skin_script_sku
 * @property {string} [description_short]
 * @property {string} [how_to_use]
 * @property {Array} [key_actives]
 * @property {string[]} [skin_types]
 * @property {string[]} [conditions_addressed]
 * @property {'in_stock'|'out_of_stock'|'discontinued'} [stock_status]
 * @property {boolean} [active]
 * @property {string[]} [images]
 * @property {Array|null} [variants]
 * @property {boolean} [ai_assisted]
 */

/**
 * @typedef {object} InventoryRow
 * @property {string} sku
 * @property {'in_stock'|'out_of_stock'|'discontinued'} stock_status
 * @property {number} [quantity]
 */

/**
 * @typedef {object} DropshipLine
 * @property {string} skin_script_sku
 * @property {string} [product_id]
 * @property {string} [name]
 * @property {number} quantity
 * @property {string|null} [variant]
 * @property {number} [unit_wholesale]
 */

/**
 * @typedef {object} DropshipPayload
 * @property {string} order_id
 * @property {string} idempotency_key
 * @property {{ name: string, email: string, phone?: string }} customer
 * @property {object} shipping_address
 * @property {DropshipLine[]} lines
 */

/**
 * @typedef {object} DropshipResult
 * @property {string} external_id
 * @property {string} status
 * @property {object} [raw]
 */

/**
 * @typedef {object} SupplierOrderStatus
 * @property {string} status
 * @property {string} [tracking_number]
 * @property {string} [carrier]
 */

/**
 * @typedef {object} SupplierAdapter
 * @property {string} name
 * @property {{ catalog: boolean, inventory: boolean, dropship: boolean, orderStatus: boolean }} capabilities
 * @property {(opts?: { since?: string|null }) => Promise<ProductDraft[]>} listCatalog
 * @property {(skus: string[]) => Promise<InventoryRow[]>} getInventory
 * @property {(payload: DropshipPayload) => Promise<DropshipResult>} createDropshipOrder
 * @property {(externalId: string) => Promise<SupplierOrderStatus>} getOrderStatus
 */

export const SUPPLIER_MODES = ['mock', 'http', 'csv_feed'];

export function isSupplierMode(v) {
  return SUPPLIER_MODES.includes(String(v || '').toLowerCase());
}
