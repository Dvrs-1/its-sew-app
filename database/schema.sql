-- =======
-- CATEGORIES
-- =======
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    label VARCHAR(255) NOT NULL,
    description TEXT,
    image TEXT,
    display_order INTEGER,
    active BOOLEAN DEFAULT true
);

-- =======
-- PRODUCTS
-- =======
CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES categories(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PRODUCT VARIANTS
CREATE TABLE product_variants (
    id VARCHAR(100) PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(100) UNIQUE NOT NULL,
    size VARCHAR(100),
    price NUMERIC(10,2) NOT NULL,
    inventory INTEGER NOT NULL CHECK (inventory >= 0)
   
);

-- PRODUCT IMAGES
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

-- TAGS
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE UNIQUE INDEX tags_name_unique_lower
ON tags (LOWER(name));

-- PRODUCT ↔ TAGS

CREATE TABLE product_tags (
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, tag_id)
);

-- =======
-- Documents
-- =======

CREATE TABLE documents(
    id SERIAL PRIMARY KEY,

    slug TEXT NOT NULL UNIQUE,    -- "terms-of-service"
    title TEXT NOT NULL,          -- "Terms of Service"

    description TEXT,             -- optional

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE document_versions (
    id SERIAL PRIMARY KEY,

    document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,

    version TEXT NOT NULL,   -- "1.0", "1.1", "2026-03"
    content TEXT NOT NULL,   -- FULL HTML

    is_current BOOLEAN NOT NULL DEFAULT FALSE,

    effective_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (document_id, version)
);

CREATE UNIQUE INDEX one_current_version_per_document
ON document_versions (document_id)
WHERE is_current = TRUE;

CREATE INDEX idx_documents_slug ON documents(slug);

CREATE INDEX idx_document_versions_document_id
ON document_versions(document_id);

CREATE INDEX idx_document_versions_current
ON document_versions(document_id, is_current);


CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON documents
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();