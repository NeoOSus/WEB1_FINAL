// Product is one clean object for both API products and our demo products.
class Product {
    constructor({ id, name, category, description, price, image, rating = 0, sale = false }) {
        this.id = Number(id);
        this.name = String(name || "Unnamed product");
        this.category = String(category || "Other");
        this.description = String(description || "No description available.");
        this.price = Number(price) || 0;
        this.image = String(image || "");
        this.rating = Number(rating) || 0;
        this.sale = Boolean(sale);
    }

    getFormattedPrice() {
        return `$${this.price.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
    }

    static fromApi(item) {
        const categoryNames = {
            smartphones: "Phones",
            laptops: "Computers",
            tablets: "Tablets",
            "mobile-accessories": "Accessories",
            "mens-watches": "Wearables",
            "womens-watches": "Wearables"
        };
        const category = categoryNames[item.category] || item.category;
        return new Product({
            id: item.id,
            name: item.title,
            category,
            description: item.description,
            price: item.price,
            image: item.thumbnail,
            rating: item.rating,
            sale: Number(item.discountPercentage) >= 10
        });
    }
}
