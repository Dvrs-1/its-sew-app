"""${message}

Revision ID: ${up_revision}
Revises: ${down_revision | comma,n}
Create Date: ${create_date}

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
${imports if imports else ""}

# revision identifiers, used by Alembic.
revision: str = ${repr(up_revision)}
down_revision: Union[str, Sequence[str], None] = ${repr(down_revision)}
branch_labels: Union[str, Sequence[str], None] = ${repr(branch_labels)}
depends_on: Union[str, Sequence[str], None] = ${repr(depends_on)}


def upgrade():
    op.execute("""<
    
    -- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ===== Square Catalog =====
CREATE TABLE square_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  square_item_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category_id TEXT,
  image_url TEXT,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  version BIGINT,
  updated_at_square TIMESTAMPTZ,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_square_items_square_id ON square_items(square_item_id);

CREATE TABLE square_item_variations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  square_variation_id TEXT UNIQUE NOT NULL,
  square_item_id TEXT NOT NULL,
  name TEXT,
  sku TEXT,
  price_money INTEGER,
  currency TEXT,
  inventory_tracking BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at_square TIMESTAMPTZ,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT fk_square_item
    FOREIGN KEY (square_item_id) REFERENCES square_items(square_item_id)
    ON DELETE CASCADE
);

CREATE INDEX idx_square_variations_square_id ON square_item_variations(square_variation_id);
CREATE INDEX idx_square_variations_item_id ON square_item_variations(square_item_id);

-- ===== Inventory =====
CREATE TABLE square_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  square_variation_id TEXT NOT NULL,
  location_id TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  calculated_at_square TIMESTAMPTZ,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT fk_square_variation
    FOREIGN KEY (square_variation_id) REFERENCES square_item_variations(square_variation_id)
    ON DELETE CASCADE
);

CREATE INDEX idx_inventory_variation_id ON square_inventory(square_variation_id);
CREATE INDEX idx_inventory_location_id ON square_inventory(location_id);

-- ===== Orders =====
CREATE TABLE square_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  square_order_id TEXT UNIQUE NOT NULL,
  state TEXT,
  location_id TEXT,
  total_money INTEGER,
  currency TEXT,
  square_customer_id TEXT,
  created_at_square TIMESTAMPTZ,
  updated_at_square TIMESTAMPTZ,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_square_orders_order_id ON square_orders(square_order_id);
CREATE INDEX idx_square_orders_customer_id ON square_orders(square_customer_id);

CREATE TABLE square_order_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  square_order_id TEXT NOT NULL,
  square_variation_id TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  base_price_money INTEGER,
  total_money INTEGER,

  CONSTRAINT fk_order_line_order
    FOREIGN KEY (square_order_id) REFERENCES square_orders(square_order_id)
    ON DELETE CASCADE
);

CREATE INDEX idx_order_line_order_id ON square_order_line_items(square_order_id);

-- ===== Customers =====
CREATE TABLE square_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  square_customer_id TEXT UNIQUE NOT NULL,
  email TEXT,
  phone TEXT,
  given_name TEXT,
  family_name TEXT,
  created_at_square TIMESTAMPTZ,
  updated_at_square TIMESTAMPTZ,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_square_customers_square_id ON square_customers(square_customer_id);

-- ===== Webhook Event Log =====
CREATE TABLE square_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  object_id TEXT,
  payload JSONB NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_square_webhook_type ON square_webhook_events(event_type);

-- ===== App-Specific (Optional) =====
CREATE TABLE app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login_at TIMESTAMPTZ
);

CREATE TABLE identity_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider TEXT NOT NULL,
  status TEXT NOT NULL,
  score NUMERIC,
  raw_response_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT fk_identity_user
    FOREIGN KEY (user_id) REFERENCES app_users(id)
    ON DELETE CASCADE
);

CREATE TABLE app_product_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  square_item_id TEXT NOT NULL,
  tags JSONB,
  local_category TEXT,
  notes TEXT,

  CONSTRAINT fk_metadata_item
    FOREIGN KEY (square_item_id) REFERENCES square_items(square_item_id)
    ON DELETE CASCADE
);

CREATE INDEX idx_app_product_metadata_item_id ON app_product_metadata(square_item_id);>""")

def downgrade():
    op.execute("""DROP TABLE ...""")