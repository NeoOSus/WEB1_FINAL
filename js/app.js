// The product list is filled from the API when the products page opens.
let products = [];
const favorites = new Set(readNumberList("techzone-favorites"));
const cart = readSavedCart();
const shoppingList = readShoppingList();
const API_URL = "https://dummyjson.com/products?limit=0&select=id,title,description,category,price,thumbnail,discountPercentage,rating";

function readNumberList(key) {
    const saved = BrowserStore.get(key, []);
    return Array.isArray(saved) ? saved.map(Number).filter(Number.isFinite) : [];
}

function readSavedCart() {
    const saved = BrowserStore.get("techzone-cart", []);
    if (!Array.isArray(saved)) return [];
    return saved.filter((item) => item && item.id && item.name).map((item) => ({
        product: new Product(item),
        quantity: Math.max(1, Number(item.quantity) || 1)
    }));
}

function readShoppingList() {
    const saved = BrowserStore.get("techzone-shopping-list", []);
    if (!Array.isArray(saved)) return [];
    return saved.filter((item) => item && item.name).map((item, index) => ({
        id: Number(item.id) || Date.now() + index,
        name: String(item.name),
        quantity: Math.max(1, Number(item.quantity) || 1)
    }));
}

function saveCart() {
    const saved = cart.map((item) => ({ ...item.product, quantity: item.quantity }));
    showStorageMessage(!BrowserStore.save("techzone-cart", saved));
}

function showStorageMessage(problem) {
    const message = document.querySelector("#storage-message");
    if (message) message.hidden = !problem;
}

function makeFallbackProducts() {
    return [
        new Product({ id: 1001, name: "iPhone 15", category: "Phones", description: "Apple smartphone with an A16 chip", price: 799, image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80" }),
        new Product({ id: 1002, name: "Samsung Galaxy S24", category: "Phones", description: "Android smartphone with helpful AI features", price: 699, image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&q=80", sale: true }),
        new Product({ id: 1003, name: "MacBook Air M3", category: "Computers", description: "Light laptop for work and study", price: 1099, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80" }),
        new Product({ id: 1004, name: "AirPods Pro 2", category: "Audio", description: "Wireless earbuds with noise cancellation", price: 249, image: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=500&q=80" }),
        new Product({ id: 1005, name: "iPad Air", category: "Tablets", description: "Tablet for work and entertainment", price: 599, image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&q=80" }),
        new Product({ id: 1006, name: "Apple Watch SE", category: "Wearables", description: "Smartwatch with activity tracking", price: 249, image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500&q=80" })
    ];
}

async function loadProducts() {
    const status = document.querySelector("#catalog-status");
    status.textContent = "Loading products from the product API…";
    status.className = "alert alert-info";
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`API request failed (${response.status})`);
        const data = await response.json();
        const electronics = data.products.filter((item) => ["smartphones", "laptops", "tablets", "mobile-accessories", "mens-watches", "womens-watches"].includes(item.category));
        products = electronics.map((item) => Product.fromApi(item));
        renderCategoryOptions();
        renderProducts();
        status.textContent = products.length ? `Loaded ${products.length} products from the live catalog.` : "The API returned no electronics products.";
        status.className = products.length ? "alert alert-success" : "alert alert-warning";
    } catch (error) {
        products = makeFallbackProducts();
        renderCategoryOptions();
        renderProducts();
        status.textContent = "The live catalog could not be loaded. Showing the included demo products instead.";
        status.className = "alert alert-warning";
    }
}

function getVisibleProducts() {
    const query = document.querySelector("#product-search").value.trim().toLowerCase();
    const category = document.querySelector("#category-filter").value;
    const favoriteOnly = document.querySelector("#favorites-filter").getAttribute("aria-pressed") === "true";
    const sort = document.querySelector("#sort-products").value;
    const visible = products.filter((product) => {
        const matchesText = `${product.name} ${product.description} ${product.category}`.toLowerCase().includes(query);
        return matchesText && (category === "all" || product.category === category) && (!favoriteOnly || favorites.has(product.id));
    });
    if (sort === "price-low") visible.sort((a, b) => a.price - b.price);
    if (sort === "price-high") visible.sort((a, b) => b.price - a.price);
    return visible;
}

function addText(parent, tagName, text, className = "") {
    const element = document.createElement(tagName);
    element.textContent = text;
    if (className) element.className = className;
    parent.append(element);
    return element;
}

function renderCategoryOptions() {
    const select = document.querySelector("#category-filter");
    const selectedCategory = select.value;
    select.replaceChildren();
    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "All categories";
    select.append(allOption);
    const categories = [...new Set(products.map((product) => product.category))].sort();
    for (const category of categories) {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        select.append(option);
    }
    select.value = categories.includes(selectedCategory) ? selectedCategory : "all";
}

function safeImageUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === "https:" ? url.href : "";
    } catch (error) {
        return "";
    }
}

function makeProductCard(product) {
    const column = document.createElement("div");
    column.className = "col-md-4 col-sm-6";
    const card = document.createElement("article");
    card.className = "product-card h-100";
    card.dataset.productId = product.id;
    if (product.sale) addText(card, "span", "SALE", "sale-badge");

    const image = document.createElement("img");
    image.src = safeImageUrl(product.image);
    image.alt = product.name;
    image.loading = "lazy";
    card.append(image);
    addText(card, "p", product.category, "product-category");
    addText(card, "h3", product.name);
    addText(card, "p", product.description);
    addText(card, "p", product.getFormattedPrice(), "price");
    if (product.rating) addText(card, "p", `Rating: ${product.rating} / 5`, "text-muted");

    const actions = document.createElement("div");
    actions.className = "d-flex flex-wrap gap-2 justify-content-center";
    const addButton = addText(actions, "button", "Add to cart", "btn btn-primary add-to-cart");
    addButton.type = "button";
    const favoriteButton = addText(actions, "button", favorites.has(product.id) ? "♥ Saved" : "♡ Save", "btn btn-outline-danger favorite-button");
    favoriteButton.type = "button";
    favoriteButton.setAttribute("aria-pressed", String(favorites.has(product.id)));
    favoriteButton.setAttribute("aria-label", `${favorites.has(product.id) ? "Remove from" : "Add to"} favorites`);
    card.append(actions);
    column.append(card);
    return column;
}

function renderProducts() {
    const list = document.querySelector("#product-list");
    list.replaceChildren();
    const visibleProducts = getVisibleProducts();
    for (const product of visibleProducts) list.append(makeProductCard(product));
    document.querySelector("#visible-count").textContent = visibleProducts.length;
    document.querySelector("#product-count").textContent = products.length;
    document.querySelector("#category-count").textContent = new Set(products.map((item) => item.category)).size;
    const average = products.length ? products.reduce((sum, item) => sum + item.price, 0) / products.length : 0;
    document.querySelector("#average-price").textContent = `$${average.toFixed(2)}`;
    document.querySelector("#favorite-count").textContent = favorites.size;
    if (!visibleProducts.length) document.querySelector("#empty-products").hidden = false;
    else document.querySelector("#empty-products").hidden = true;
}

function renderCart() {
    const list = document.querySelector("#cart-items");
    list.replaceChildren();
    let total = 0;
    let itemCount = 0;
    for (const item of cart) {
        total += item.product.price * item.quantity;
        itemCount += item.quantity;
        const row = document.createElement("li");
        row.className = "list-group-item d-flex flex-wrap gap-2 justify-content-between align-items-center";
        addText(row, "span", `${item.product.name} × ${item.quantity}`);
        addText(row, "strong", item.product.getFormattedPrice() + (item.quantity > 1 ? ` × ${item.quantity}` : ""));
        const removeButton = addText(row, "button", "Remove", "btn btn-sm btn-outline-secondary remove-cart-item");
        removeButton.type = "button";
        removeButton.dataset.id = item.product.id;
        list.append(row);
    }
    document.querySelector("#cart-count").textContent = itemCount;
    document.querySelector("#cart-total").textContent = `Total: $${total.toFixed(2)}`;
    document.querySelector("#clear-cart").disabled = cart.length === 0;
    document.querySelector("#saved-cart-status").textContent = cart.length ? "Cart is saved in this browser." : "Your cart is empty.";
}

function renderShoppingList() {
    const list = document.querySelector("#shopping-items");
    list.replaceChildren();
    for (const item of shoppingList) {
        const row = document.createElement("li");
        row.className = "list-group-item d-flex flex-wrap gap-2 align-items-center";
        addText(row, "span", item.name, "shopping-item-name");
        const quantityLabel = document.createElement("label");
        quantityLabel.className = "visually-hidden";
        quantityLabel.htmlFor = `shopping-quantity-${item.id}`;
        quantityLabel.textContent = `Quantity for ${item.name}`;
        row.append(quantityLabel);
        const quantity = document.createElement("input");
        quantity.id = quantityLabel.htmlFor;
        quantity.type = "number";
        quantity.min = "1";
        quantity.max = "99";
        quantity.value = item.quantity;
        quantity.className = "form-control shopping-quantity";
        quantity.dataset.id = item.id;
        quantity.setAttribute("aria-label", `Quantity for ${item.name}`);
        row.append(quantity);
        const saveButton = addText(row, "button", "Update", "btn btn-sm btn-outline-primary update-shopping-item");
        saveButton.type = "button";
        saveButton.dataset.id = item.id;
        const removeButton = addText(row, "button", "Delete", "btn btn-sm btn-outline-danger delete-shopping-item");
        removeButton.type = "button";
        removeButton.dataset.id = item.id;
        list.append(row);
    }
    document.querySelector("#shopping-empty").hidden = shoppingList.length > 0;
    document.querySelector("#clear-shopping-list").disabled = shoppingList.length === 0;
}

function showFieldError(field, message) {
    const error = document.querySelector(`#${field.id}-error`);
    error.textContent = message;
    field.classList.toggle("is-invalid", Boolean(message));
    field.setAttribute("aria-invalid", String(Boolean(message)));
    return !message;
}

function validateContactForm() {
    const name = document.querySelector("#name");
    const email = document.querySelector("#email");
    const subject = document.querySelector("#subject");
    const message = document.querySelector("#message");
    const validName = showFieldError(name, name.value.trim().length < 2 ? "Enter at least 2 characters for your name." : "");
    const validEmail = showFieldError(email, !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()) ? "Enter a valid email address, such as name@example.com." : "");
    const validSubject = showFieldError(subject, !subject.value ? "Choose a topic for your message." : "");
    const validMessage = showFieldError(message, message.value.trim().length < 20 ? "Write at least 20 characters so we can help you." : "");
    return validName && validEmail && validSubject && validMessage;
}

function setupCatalog() {
    renderCart();
    renderShoppingList();
    loadProducts();

    ["#product-search", "#category-filter", "#sort-products"].forEach((selector) => {
        const control = document.querySelector(selector);
        control.addEventListener(selector === "#product-search" ? "input" : "change", renderProducts);
    });
    document.querySelector("#favorites-filter").addEventListener("click", (event) => {
        const button = event.currentTarget;
        button.setAttribute("aria-pressed", String(button.getAttribute("aria-pressed") !== "true"));
        renderProducts();
    });
    document.querySelector("#product-list").addEventListener("click", (event) => {
        const card = event.target.closest(".product-card");
        if (!card) return;
        const product = products.find((item) => item.id === Number(card.dataset.productId));
        if (!product) return;
        if (event.target.closest(".add-to-cart")) {
            const existing = cart.find((item) => item.product.id === product.id);
            if (existing) existing.quantity += 1;
            else cart.push({ product, quantity: 1 });
            saveCart();
            renderCart();
            document.querySelector("#cart-title").classList.add("cart-updated");
        } else if (event.target.closest(".favorite-button")) {
            if (favorites.has(product.id)) favorites.delete(product.id);
            else favorites.add(product.id);
            BrowserStore.save("techzone-favorites", [...favorites]);
            renderProducts();
        }
    });
    document.querySelector("#cart-items").addEventListener("click", (event) => {
        const button = event.target.closest(".remove-cart-item");
        if (!button) return;
        const index = cart.findIndex((item) => item.product.id === Number(button.dataset.id));
        if (index !== -1) cart.splice(index, 1);
        saveCart();
        renderCart();
    });
    document.querySelector("#clear-cart").addEventListener("click", () => {
        cart.splice(0, cart.length);
        saveCart();
        renderCart();
    });
    setupShoppingList();
}

function setupShoppingList() {
    const form = document.querySelector("#shopping-form");
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const name = document.querySelector("#shopping-name").value.trim();
        const quantity = Number(document.querySelector("#shopping-new-quantity").value);
        if (name.length < 2 || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) return;
        shoppingList.push({ id: Date.now(), name, quantity });
        BrowserStore.save("techzone-shopping-list", shoppingList);
        form.reset();
        document.querySelector("#shopping-new-quantity").value = 1;
        renderShoppingList();
    });
    document.querySelector("#shopping-items").addEventListener("click", (event) => {
        const id = Number(event.target.dataset.id);
        if (event.target.closest(".update-shopping-item")) {
            const item = shoppingList.find((entry) => entry.id === id);
            const quantity = Number(document.querySelector(`#shopping-quantity-${id}`).value);
            if (item && Number.isInteger(quantity) && quantity >= 1 && quantity <= 99) item.quantity = quantity;
            else return;
        } else if (event.target.closest(".delete-shopping-item")) {
            const index = shoppingList.findIndex((entry) => entry.id === id);
            if (index !== -1) shoppingList.splice(index, 1);
        } else return;
        BrowserStore.save("techzone-shopping-list", shoppingList);
        renderShoppingList();
    });
    document.querySelector("#clear-shopping-list").addEventListener("click", () => {
        shoppingList.splice(0, shoppingList.length);
        BrowserStore.save("techzone-shopping-list", shoppingList);
        renderShoppingList();
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const navContainer = document.querySelector(".navbar .container");
    if (navContainer) {
        const themeButton = document.createElement("button");
        themeButton.id = "theme-toggle";
        themeButton.type = "button";
        themeButton.className = "btn btn-sm btn-outline-light ms-lg-3 mt-2 mt-lg-0";
        themeButton.textContent = "Toggle theme";
        navContainer.append(themeButton);
        document.body.classList.toggle("dark-theme", BrowserStore.get("techzone-theme", "light") === "dark");
        themeButton.setAttribute("aria-pressed", String(document.body.classList.contains("dark-theme")));
        themeButton.addEventListener("click", () => {
            document.body.classList.toggle("dark-theme");
            const theme = document.body.classList.contains("dark-theme") ? "dark" : "light";
            BrowserStore.save("techzone-theme", theme);
            themeButton.setAttribute("aria-pressed", String(theme === "dark"));
        });
    }

    if (document.querySelector("#product-list")) setupCatalog();

    const form = document.querySelector("#contact-form");
    if (form) {
        const fields = [...form.querySelectorAll("input, select, textarea")];
        fields.forEach((field) => field.addEventListener("blur", validateContactForm));
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const success = document.querySelector("#form-success");
            success.hidden = true;
            if (!validateContactForm()) {
                form.querySelector("[aria-invalid='true']")?.focus();
                return;
            }
            success.textContent = `Thank you, ${document.querySelector("#name").value.trim()}! Your message is ready. This demo does not send data to a server.`;
            success.hidden = false;
            if (window.jQuery) $(success).hide().fadeIn(250);
            form.reset();
            fields.forEach((field) => showFieldError(field, ""));
        });
    }
});

// jQuery opens the help text and updates the message length while typing.
if (window.jQuery) {
    $(document).on("click", ".jquery-help-toggle", function () {
        const panel = $(this).parent().find(".jquery-help");
        $(this).attr("aria-expanded", panel.is(":hidden") ? "true" : "false");
        panel.stop(true, true).slideToggle(180);
    });
    $(document).on("input", "#message", function () {
        const count = this.value.trim().length;
        $(this).closest(".field-wrap").children("#message-counter").text(`${count} / 20 characters minimum`).toggleClass("text-success", count >= 20);
    });
}
