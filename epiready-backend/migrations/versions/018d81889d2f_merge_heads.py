"""merge heads

Revision ID: 018d81889d2f
Revises: 46fa922462d3, 8f5d81158921, ed79fd52cc7a
Create Date: 2025-07-20 04:55:37.728860

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '018d81889d2f'
down_revision = ('46fa922462d3', '8f5d81158921', 'ed79fd52cc7a')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
