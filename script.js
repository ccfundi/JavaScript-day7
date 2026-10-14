// 1. DOM Elements
const searchInput = document.getElementById("search-input")
const categorySelect = document.getElementById("category-select")
const productList = document.getElementById("product-list")
const wishlistCounter = document.getElementById("wishlist-counter")

// 2. Application State
let allProducts = []
let wishlist = JSON.parse(localStorage.getItem("devStoreWishlist")) || []

// 3. Fetch Products from Fake Store API
const fetchProducts = async () => {
    try{
        productList.innerHTML = `<div class="loading">Loading store catalog...</div>`

        const response = await fetch("https://fakestoreapi.com/products")

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`)            
        }

        allProducts = await response.json()

        // Populate category filter options dynamically
        populateCategories(allProducts)

        // Render initial product catalog
        renderProducts(allProducts)
        updateWishlistCounter()
    }
    catch (error) {
        console.error(`Error loading products:`, error)

        productList.innerHTML = `<div class="loading" style="color: #dc3545;">Failed to load catalog. Please check your internet connection</div>`
    }
}

// 4. Populate Category Dropdown Dynamically
const populateCategories = (products) => {
    // Extract unique categories and add "all" option at the beginning
    const categories = ["all", ...new Set(products.map(p => p.category))]

    categorySelect.innerHTML = categories.map(cat => {
        // Capitalize category name nicely for UI display
        const displayName = cat.charAt(0).toUpperCase() + cat.slice(1);
        return `<option value="${cat}">${displayName}</option>`
    }).join("")
}

// 5. Render Products Function using .map()
const renderProducts = (productsToRender) => {
    if (productsToRender.length === 0) {
        productList.innerHTML = `<div class="loading">No products found matching your criteria.</div>`
        return
    }

    // Transform each product object into an HTML card string
    const productsHTML = productsToRender.map(product => {
        // Check if product is already saved in user's wishlist
        const isSaved = wishlist.some(item => item.id === product.id)

        return `
        <div class="product-card">
            <div>
                <h3>${product.title}</h3>
                <p class="price">$${product.price.toFixed(2)}</p>
                <p style="font-size: 0.85rem; color: #666; margin-bottom: 15px;">Category: ${product.category}</p>
            </div>
            <button class="wishlist-btn ${isSaved ? 'saved' : ''}" data-id="${product.id}">
            ${isSaved ? '❤️ Saved' : '🤍 Save to Wishlist'}
            </button>
        </div>        
        `
    }).join("")

    productList.innerHTML = productsHTML
}

// 6. Filter Products (Search + Category Combined)
const filterProducts = () => {
    const searchTerm = searchInput.value.toLowerCase().trim()
    const selectedCategory = categorySelect.value

    const filtered = allProducts.filter(product => {
        const matchesSearch = product.title.toLowerCase().includes(searchTerm)
        const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    renderProducts(filtered)
}

// 7. Toggle Wishlist Action
const toggleWishlist = (productId) => {
    const product = allProducts.find(p => p.id === productId)
    const index = wishlist.findIndex(item => item.id === productId)

    if (index > -1){
        // Remove if already saved
        wishlist.splice(index, 1)
    } else {
        wishlist.push(product)
    }

    // Save to browser LocalStorage
    localStorage.setItem("devStoreWishlist", JSON.stringify(wishlist))

    // Re-run filter to preserve current search state, and update badge counter
    filterProducts()
    updateWishlistCounter()
}

// 8. Update Wishlist Counter Badge
const updateWishlistCounter = () => {
    wishlistCounter.textContent = `❤️ Wishlist: ${wishlist.length} items`
}

// 9. Event Listeners
searchInput.addEventListener("input", filterProducts)
categorySelect.addEventListener("change", filterProducts)

// Event Delegation for Wishlist Buttons
productList.addEventListener("click", (e) => {
    if (e.target.classList.contains("wishlist-btn")){
        const productId = Number(e.target.getAttribute("data-id"))
        toggleWishlist(productId)
    }
})

// Initial App Launch
fetchProducts()