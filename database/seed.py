
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


def get_connection():
    return psycopg2.connect(**DATABASE_CONFIG)


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


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


def get_category_id(cur, slug):
    cur.execute("SELECT id FROM categories WHERE slug = %s;", (slug,))
    row = cur.fetchone()
    return row["id"] if row else None


def seed_tags(cur, tags):
    tag_ids = {}
    for tag in tags:
        cur.execute("""
            INSERT INTO tags (name)
            VALUES (%s)
            ON CONFLICT (name) DO NOTHING;
        """, (tag,))

        cur.execute("SELECT id FROM tags WHERE name = %s;", (tag,))
        tag_ids[tag] = cur.fetchone()["id"]

    return tag_ids


def seed_products(cur, products):
    print("Seeding products...")

    for product in products:

        category_id = get_category_id(cur, product["categoryId"])

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

        # Delete removed variants
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
                    img["url"] or img.get("src"),
                    img.get("alt"),
                    img.get("description"),
                    img.get("role"),
                    img.get("order")
                ))

            # Delete removed images
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