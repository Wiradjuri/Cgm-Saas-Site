from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    subscriptions = relationship("Subscription", back_populates="user", cascade="all, delete-orphan")
    license = relationship("License", back_populates="user", uselist=False, cascade="all, delete-orphan")


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    sku = Column(String, nullable=False)
    status = Column(String, nullable=False)
    start_date = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="subscriptions")


class License(Base):
    __tablename__ = "licenses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True, index=True)
    total_licenses = Column(Integer, nullable=False)
    used_licenses = Column(Integer, default=0, nullable=False)

    user = relationship("User", back_populates="license")
