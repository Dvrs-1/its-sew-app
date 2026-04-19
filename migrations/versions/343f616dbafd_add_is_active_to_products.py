"""add is_active to products

Revision ID: 343f616dbafd
Revises: 6e5c6e7fa5d0
Create Date: 2026-04-19 17:39:03.780180

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '343f616dbafd'
down_revision: Union[str, Sequence[str], None] = '6e5c6e7fa5d0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column(
        "products",
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true"))
    )
    

def downgrade():
    op.drop_column("products", "is_active")