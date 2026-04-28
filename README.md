# Liverpool Fan Shop — Meta Pixel Demo Store

A lightweight, static e-commerce demo site purpose-built for **Meta Pixel setup training and demos**.

## Pages

| Page | File | Pixel events to implement |
|---|---|---|
| Home | `index.html` | `PageView`, `ViewContent` (per product), `AddToCart` |
| Products | `products.html` | `PageView`, `ViewContent` (per product), `AddToCart` |
| Cart | `cart.html` | `PageView`, `InitiateCheckout` |
| Checkout | `checkout.html` | `PageView`, `Purchase` |
| Confirmation | `purchase-confirmation.html` | `PageView`, `Purchase` (if not fired on checkout) |

## Getting started

1. Open any `.html` file directly in a browser, or serve the `public/` folder with any static server:

   ```bash
   npx serve public
   ```

2. Replace every instance of `YOUR_PIXEL_ID` with your actual Meta Pixel ID across all HTML files.

3. Add your standard event `fbq('track', ...)` calls in `script.js` where the `TODO` comments indicate.

## Structure

```
public/
├── index.html                  # Home / featured products
├── products.html               # Full product catalogue
├── cart.html                   # Shopping cart
├── checkout.html               # Shipping form + order summary
├── purchase-confirmation.html  # Order confirmed page
├── script.js                   # Cart logic + addEventListener hooks (Pixel TODOs inside)
├── styles.css                  # Full site stylesheet
└── Liverpool-FC-80s-icon.png   # Brand logo / favicon
```

## Pixel integration points in script.js

All `Add to Cart` buttons use `addEventListener` (no inline `onclick`). The hooks are already wired — just uncomment the `fbq` calls inside each listener:

- **AddToCart** — inside the `.add-to-cart-btn` click listener
- **InitiateCheckout** — inside the `#checkout-btn` click listener
- **Purchase** — inside the `#purchase-btn` click listener

The `PageView` event is fired from the Pixel base code in each page's `<head>`.

## Notes

- No server-side code, no build step, no dependencies.
- `window.userEmail`, `window.userName`, `window.userCity`, and `window.userZip` are populated from the checkout form and available for use in Pixel advanced matching (`fbq('init', 'YOUR_PIXEL_ID', { em: ..., ct: ..., zp: ... })`).
