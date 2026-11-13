# TechZone Final Project

## Project

TechZone is a responsive electronics store website continued from the midterm and endterm projects. It keeps the original five pages and adds a live product catalog, a saved cart, a shopping list, and a small catalog dashboard. API prices are sample data for a student project, not store offers.

## Group members and contributions

- **Niyalov Yerkebulan** — explain and demonstrate the product API, `Product` class, browser storage, cart, and shopping-list features.
- **Other group members:** add each member's name and the part they are responsible for explaining before submission. The supplied files only identified Niyalov Yerkebulan.

## Pages

- `index.html` — home page and popular products
- `about.html` — store information and services
- `products.html` — API catalog, dashboard, search and filters, favorites, cart, and shopping list
- `gallery.html` — store photo gallery
- `contact.html` — contact form with field-by-field validation and help

## Final-stage features

1. **Product API:** `js/app.js` uses `fetch` and `async/await` to request electronics from DummyJSON. The page shows loading, success, empty, and error/fallback messages. No API key is required. DummyJSON returns sample product data; its API documentation is at [dummyjson.com/docs/products](https://dummyjson.com/docs/products).
2. **Object-oriented JavaScript:** `js/models.js` defines the `Product` class. Its constructor stores product properties, `getFormattedPrice()` formats a price, and `fromApi()` converts API data into a `Product`. The catalog creates many `Product` objects from the response.
3. **Persistent browser data:** `js/storage.js` defines `BrowserStore` to read and save JSON safely. Cart, favorites, shopping list, and theme are restored from `localStorage`. The cart and shopping list can be cleared from the page.
4. **Shopping-list CRUD:** On the Products page, add a reminder, read saved items, update quantities, and delete one or clear all items.
5. **Catalog dashboard:** Product count, visible count, category count, and average price update from the currently loaded data.

## Features carried forward from the endterm

- Five connected pages with responsive Bootstrap layout and the original comparison table and gallery.
- Search, category filter, price sorting, and favorites.
- Add/remove cart items, quantity totals, and a saved light/dark theme preference.
- Contact form checks name length, email format, topic selection, and message length. It displays specific errors and a local success message; it does not send data to a server.
- jQuery help panel and live character counter use event handling and DOM traversal. The panel uses `slideToggle()` and the success message uses `fadeIn()`.

## Run the project locally

The API works best from a local web server rather than opening the HTML file directly. From the project folder, run:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000` in a browser. An internet connection is needed for the API, Bootstrap, jQuery, and hosted product images. If the API is unavailable, the catalog displays the included demo products and an explanatory message.

## Try the final features

1. Open **Products**. Wait for the catalog status to show whether API data or demo data loaded.
2. Search for a product, change the category, sort by price, and save a favorite.
3. Add a product to the cart, reload the page, and confirm the cart remains. Remove items or clear the cart.
4. Add an item to **My shopping list**, update its quantity, reload the page, then delete the item or clear the list.
5. Review the four dashboard values and change a search or category to see the visible-product count update.
6. Toggle the theme, reload a page, and confirm the preference is remembered.
7. On **Contact**, submit an empty form to see validation. Then enter a name of at least 2 characters, a valid email, a topic, and a message of at least 20 characters to see the success message.

## Code map for the defence

- `js/models.js` — the `Product` class and API-to-product conversion.
- `js/storage.js` — safe JSON reads and writes through `BrowserStore`.
- `js/app.js` — `loadProducts()` fetches remote data; `renderProducts()`, `renderCart()`, and `renderShoppingList()` update the page; `setupCatalog()` and `setupShoppingList()` handle user actions; `validateContactForm()` checks the contact form.
- `css/style.css` — responsive layout and component styles.

## Hosting and submission links

This is a static site. To publish on GitHub Pages, push this folder to the group's repository, then select **Settings → Pages → Deploy from a branch** and choose the project branch and root folder. For Netlify, import the repository, leave the build command empty, and set the publish directory to `.`.

- **Published website:** add the final hosting URL here.
- **Source repository:** add the group's repository URL here.

The published URL, repository URL, and any additional group-member contributions were not present in the supplied project files, so add the group's actual details before submitting.

## Technologies

HTML5, CSS3, Bootstrap 5, JavaScript, jQuery 3.7.1, DummyJSON Products API, and browser `localStorage`.
