export interface Platform {
  id: string
  name: string
  slug: string
  description: string
  logo: string
  apiEndpoint: string
  supported: boolean
  discoverable: boolean
}

export interface SellOrder {
  id: string
  platformId: string
  platformName: string
  sellerKey: string
  totalCredits: number
  availableCredits: number
  pricePerCredit: number
  type: "limit" | "market"
  status: "active" | "filled" | "cancelled"
  createdAt: string
}

export interface BuyOrder {
  id: string
  platformId: string
  platformName: string
  buyerId: string
  amount: number
  pricePerCredit: number
  totalPrice: number
  fee: number
  feePercentage: number
  type: "market" | "limit"
  status: "pending" | "completed" | "cancelled"
  proxyKey: string
  createdAt: string
}

export interface Deal {
  id: string
  platformId: string
  platformSlug: string
  platformName: string
  ratio: string
  availableCredits: number
  pricePerCredit: number
  sellerCount: number
}

export interface User {
  id: string
  email: string
  name: string
}

export interface APIKey {
  id: string
  key: string
  userId: string
  platformId: string
  platformSlug: string
  demandRate: number
  remainingCredits: number
  totalCredits: number
  status: "active" | "exhausted" | "revoked"
  createdAt: string
}

export interface KeyValidation {
  valid: boolean
  key: string
  userId: string
  platformSlug: string
  remainingCredits: number
  demandRate: number
}
