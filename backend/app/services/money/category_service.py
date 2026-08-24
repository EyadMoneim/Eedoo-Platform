from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_
from fastapi import HTTPException
from uuid import UUID

from app.models.money import Category
from app.schemas.money import CategoryCreate, CategoryUpdate

DEFAULT_CATEGORIES = [
    {"name": "Food", "icon": "🍔"},
    {"name": "Transport", "icon": "🚗"},
    {"name": "Shopping", "icon": "🛍️"},
    {"name": "Bills", "icon": "🧾"},
    {"name": "Education", "icon": "📚"},
    {"name": "Entertainment", "icon": "🎬"},
    {"name": "Health", "icon": "⚕️"},
    {"name": "Other", "icon": "📦"},
]

async def seed_default_categories(db: AsyncSession, user_id: UUID):
    # Check if user already has categories
    result = await db.execute(select(Category).where(Category.user_id == user_id))
    existing = result.scalars().first()
    if existing:
        return

    # Add default categories scoped to this user
    for cat in DEFAULT_CATEGORIES:
        new_cat = Category(
            user_id=user_id,
            name=cat["name"],
            icon=cat["icon"],
            is_system=True
        )
        db.add(new_cat)
    
    await db.commit()

async def get_categories(db: AsyncSession, user_id: UUID) -> List[Category]:
    await seed_default_categories(db, user_id)
    
    result = await db.execute(
        select(Category)
        .where(or_(Category.user_id == user_id, Category.user_id == None))
        .order_by(Category.name)
    )
    return list(result.scalars().all())

async def get_category(db: AsyncSession, user_id: UUID, category_id: UUID) -> Category:
    result = await db.execute(
        select(Category)
        .where(
            or_(Category.user_id == user_id, Category.user_id == None),
            Category.id == category_id
        )
    )
    category = result.scalars().first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

async def create_category(db: AsyncSession, user_id: UUID, data: CategoryCreate) -> Category:
    new_cat = Category(
        user_id=user_id,
        name=data.name,
        icon=data.icon,
        is_system=False
    )
    db.add(new_cat)
    await db.commit()
    await db.refresh(new_cat)
    return new_cat

async def update_category(db: AsyncSession, user_id: UUID, category_id: UUID, data: CategoryUpdate) -> Category:
    category = await get_category(db, user_id, category_id)
    
    # Optional: Prevent editing system categories if desired
    # if category.is_system:
    #     raise HTTPException(status_code=400, detail="Cannot edit system category")
        
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(category, key, value)
        
    await db.commit()
    await db.refresh(category)
    return category

async def delete_category(db: AsyncSession, user_id: UUID, category_id: UUID):
    category = await get_category(db, user_id, category_id)
    
    # Prevent deleting system categories if desired, but user scoping means it's theirs
    # For now, allow deletion, we'll just set it to non-system if we want to restrict
    
    await db.delete(category)
    await db.commit()
