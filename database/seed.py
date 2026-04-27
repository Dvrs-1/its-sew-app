
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def get_connection():
    database_url = os.environ.get("DATABASE_URL")

    if database_url:
        return psycopg2.connect(database_url)
    else:
        return psycopg2.connect(
            dbname="itssewregina_dev",
            user="itssewregina_user",
            password="burnTToast0!",
            host="localhost",
            port="5432"
        )

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

CATEGORIES_PATH = os.path.join(BASE_DIR, "data", "categories.json")
PRODUCTS_PATH = os.path.join(BASE_DIR, "data", "productrefrence.json")



def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


DOCUMENTS = [
    {
        "slug": "terms-of-service",
        "title": "Terms of Service",
        "version": "1.1",
        "content": "<h1>Terms of Service</h1><p>Updated Version Test 1.1.</p>",
        "is_current": True
    },
    {
        "slug": "privacy-policy",
        "title": "Privacy Policy",
        "version": "1.0",
        "content": "<h1>Privacy Policy</h1><p>Your privacy policy.</p>",
        "is_current": True
    },
    {
        "slug": "refund-policy",
        "title": "Refund Policy",
        "version": "1.0",
        "content": "<h1>Refund Policy</h1><p>Your refund rules.</p>",
        "is_current": True
    }
]

def seed_documents(cur, documents):
    print("Seeding documents...")

    for doc in documents:

        # 1. UPSERT DOCUMENT
        cur.execute("""
            INSERT INTO documents (slug, title, is_active)
            VALUES (%s, %s, TRUE)
            ON CONFLICT (slug)
            DO UPDATE SET
                title = EXCLUDED.title,
                is_active = TRUE
            RETURNING id;
        """, (doc["slug"], doc["title"]))

        document_id = cur.fetchone()["id"]

        # 2. CLEAR OLD CURRENT FIRST (IMPORTANT)
        if doc["is_current"]:
            cur.execute("""
                UPDATE document_versions
                SET is_current = FALSE
                WHERE document_id = %s;
            """, (document_id,))

        # 3. UPSERT VERSION
        cur.execute("""
            INSERT INTO document_versions (
                document_id,
                version,
                content,
                is_current
            )
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (document_id, version)
            DO UPDATE SET
                content = EXCLUDED.content,
                is_current = EXCLUDED.is_current
            RETURNING id;
        """, (
            document_id,
            doc["version"],
            doc["content"],
            doc["is_current"]
        ))


def get_document_by_slug(slug):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute("""
            SELECT 
                d.slug,
                d.title,
                v.content,
                v.version,
                v.effective_date
            FROM documents d
            JOIN document_versions v
                ON d.id = v.document_id
            WHERE d.slug = %s
              AND d.is_active = TRUE
              AND v.is_current = TRUE
            LIMIT 1;
        """, (slug,))

        document = cur.fetchone()
        return document

    finally:
        cur.close()
        conn.close()





def seed_categories(cur, categories):
    print("Seeding categories...")

    for cat in categories:
        cur.execute("""
            INSERT INTO categories (slug, label, description, image, display_order, active)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (slug)
            DO UPDATE SET
                label = EXCLUDED.label,
                description = EXCLUDED.description,
                image = EXCLUDED.image,
                display_order = EXCLUDED.display_order,
                active = EXCLUDED.active;
        """, (
            cat["id"],
            cat["label"],
            cat.get("description"),
            cat.get("image"),
            cat.get("order"),
            cat.get("active", True)
        ))


def build_category_map(cur):
    cur.execute("SELECT id, slug FROM categories;")
    rows = cur.fetchall()
    return {row["slug"]: row["id"] for row in rows}

def seed_tags(cur, tags):
    tag_ids = {}

    for tag in tags:
        # Insert tag if it doesn't exist
        cur.execute("""
            INSERT INTO tags (name)
            VALUES (%s)
            ON CONFLICT (name) DO NOTHING;
        """, (tag,))

        # Fetch its ID
        cur.execute("SELECT id FROM tags WHERE name = %s;", (tag,))
        row = cur.fetchone()

        if row:
            tag_ids[tag] = row["id"]

    return tag_ids


def seed_products(cur, products):
    print("Seeding products...")

    #  Build once (faster + safer)
    category_map = build_category_map(cur)

    for product in products:

        category_slug = product.get("categoryId")

        if category_slug not in category_map:
            raise ValueError(f"Category slug '{category_slug}' not found in categories table")

        category_id = category_map[category_slug]

        # --- PRODUCT ---
        cur.execute("""
            INSERT INTO products (id, name, description, category_id)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (id)
            DO UPDATE SET
                name = EXCLUDED.name,
                description = EXCLUDED.description,
                category_id = EXCLUDED.category_id;
        """, (
            product["id"],
            product["name"],
            product.get("description"),
            category_id
        ))

        # --- TAGS ---
        tag_ids = seed_tags(cur, product.get("tags", []))

        cur.execute("DELETE FROM product_tags WHERE product_id = %s;", (product["id"],))

        for tag_id in tag_ids.values():
            cur.execute("""
                INSERT INTO product_tags (product_id, tag_id)
                VALUES (%s, %s)
                ON CONFLICT DO NOTHING;
            """, (product["id"], tag_id))

        # --- VARIANTS ---
        variant_ids = []

        for variant in product["variants"]:
            variant_ids.append(variant["id"])

            cur.execute("""
                INSERT INTO product_variants (id, product_id, sku, size, price, inventory)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (id)
                DO UPDATE SET
                    sku = EXCLUDED.sku,
                    size = EXCLUDED.size,
                    price = EXCLUDED.price,
                    inventory = EXCLUDED.inventory;
            """, (
                variant["id"],
                product["id"],
                variant["sku"],
                variant["size"],
                variant["price"],
                variant["inventory"]
            ))

        if variant_ids:
            cur.execute("""
                DELETE FROM product_variants
                WHERE product_id = %s
                AND id NOT IN %s;
            """, (product["id"], tuple(variant_ids)))

        # --- IMAGES ---
        for variant in product["variants"]:
            images = [img for img in product["images"] if img["variantId"] == variant["id"]]

            image_urls = []

            for img in images:
                image_urls.append(img["url"])

                cur.execute("""
                    INSERT INTO product_images
                    (variant_id, url, alt, description, role, display_order)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT (variant_id, url)
                    DO UPDATE SET
                        alt = EXCLUDED.alt,
                        description = EXCLUDED.description,
                        role = EXCLUDED.role,
                        display_order = EXCLUDED.display_order;
                """, (
                    variant["id"],
                    img["url"],
                    img.get("alt"),
                    img.get("description"),
                    img.get("role"),
                    img.get("order")
                ))

            if image_urls:
                cur.execute("""
                    DELETE FROM product_images
                    WHERE variant_id = %s
                    AND url NOT IN %s;
                """, (variant["id"], tuple(image_urls)))
def main():
    conn = get_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        categories = load_json(CATEGORIES_PATH)
        products = load_json(PRODUCTS_PATH)

        seed_categories(cur, categories)
        seed_products(cur, products)    
        seed_documents(cur, DOCUMENTS)

        conn.commit()
        print("Seed completed successfully.")


    except Exception as e:
        conn.rollback()
        print("Seed failed. Rolled back.")
        print(e)

    finally:
        cur.close()
        conn.close()



if __name__ == "__main__":
    main()