// Типы соответствуют схемам Mongoose в api/src/models/

export interface ISize {
  label: string
  desc:  string
  price: number
}

export interface IAddon {
  name:    string
  price:   number
  display: string
}

export interface ICompositionItem {
  name: string
  qty:  string
}

export interface Product {
  _id:              string
  name:             string
  slug:             string
  meta:             string
  description:      string
  price:            number
  bloom:            string
  tag?:             string
  oldPrice?:        number
  images:           string[]
  sizes:            ISize[]
  composition:      ICompositionItem[]
  careInstructions: string
  addons:           IAddon[]
  catalogAddonIds?: string[]
  rating:           number
  reviewCount:      number
  inStock:          boolean
  featured:         boolean
}

export interface Review {
  _id:         string
  productSlug: string
  name:        string
  rating:      number
  text:        string
  status:      'pending' | 'approved' | 'rejected'
  createdAt:   string
}

export interface Category {
  _id:   string
  name:  string
  slug:  string
  count: string
  bloom: string
  image: string
}

export interface BannerFeature {
  title: string
  text:  string
}

export interface Banner {
  _id:         string
  position:    'hero' | 'promo' | 'editorial' | 'popup'
  title:       string
  subtitle?:   string
  eyebrow?:    string
  imageUrl?:   string
  buttonText?: string
  buttonLink?: string
  promoCode?:  string
  bloomKind?:  string
  bloomTag?:   string
  features?:   BannerFeature[]
  active:      boolean
  sortOrder?:  number
}
