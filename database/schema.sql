-- =========================================
-- CATEGORIES
-- =========================================
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    label VARCHAR(255) NOT NULL,
    description TEXT,
    image TEXT,
    display_order INTEGER,
    active BOOLEAN DEFAULT true
);

-- =========================================
-- PRODUCTS
-- =========================================
CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES categories(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- PRODUCT VARIANTS
-- =========================================
CREATE TABLE product_variants (
    id VARCHAR(100) PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(100) UNIQUE NOT NULL,
    size VARCHAR(100),
    price NUMERIC(10,2) NOT NULL,
    inventory INTEGER NOT NULL CHECK (inventory >= 0)
   
);

-- =========================================
-- PRODUCT IMAGES
-- =========================================
CREATE TABLE product_images (
   id SERIAL PRIMARY KEY,
    variant_id VARCHAR(100) REFERENCES product_variants(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt TEXT,
    description TEXT,
    role VARCHAR(50),
    display_order INTEGER,
    CONSTRAINT unique_variant_image UNIQUE (variant_id, url)
);

-- =========================================
-- TAGS
-- =========================================
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE UNIQUE INDEX tags_name_unique_lower
ON tags (LOWER(name));

-- =========================================
-- PRODUCT ↔ TAGS
-- =========================================
CREATE TABLE product_tags (
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, tag_id)
);

