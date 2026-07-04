import sqlite3
import uuid
from pathlib import Path

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

DB_PATH = Path("avelo.db")

app = FastAPI(title="Avelo FastAPI Server", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_conn()
    schema_path = Path("db/schema.sql")
    schema_sql = schema_path.read_text(encoding="utf-8")
    conn.executescript(schema_sql)
    conn.commit()

    def has_column(table_name: str, column_name: str) -> bool:
        rows = conn.execute(f"PRAGMA table_info({table_name})").fetchall()
        return any(row[1] == column_name for row in rows)

    if not has_column("users", "password"):
        conn.execute("ALTER TABLE users ADD COLUMN password TEXT NOT NULL DEFAULT ''")
    if not has_column("products", "badge"):
        conn.execute("ALTER TABLE products ADD COLUMN badge TEXT NOT NULL DEFAULT 'New'")
    if not has_column("products", "image"):
        conn.execute("ALTER TABLE products ADD COLUMN image TEXT NOT NULL DEFAULT '📦'")
    if not has_column("orders", "items"):
        conn.execute("ALTER TABLE orders ADD COLUMN items TEXT NOT NULL DEFAULT '[]'")

    conn.commit()
    conn.close()


init_db()


class Message(BaseModel):
    message: str


class RegisterPayload(BaseModel):
    email: str
    password: str
    name: str


class LoginPayload(BaseModel):
    email: str
    password: str


class ProductPayload(BaseModel):
    id: str
    name: str
    price: float
    stock: int
    description: str = ""
    badge: str = "New"
    image: str = "📦"


class OrderPayload(BaseModel):
    id: str
    user_id: str
    customer: str
    total: float
    status: str = "Pending"
    items: str = "[]"


class AnalyticsEventPayload(BaseModel):
    id: str
    event_type: str
    value: float = 0
    metadata: str = "{}"


SESSION_TOKENS: dict[str, dict] = {}


def authenticate(authorization: str | None):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = authorization.split(" ", 1)[1]
    user = SESSION_TOKENS.get(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user


@app.get("/")
def read_root():
    return {"message": "FastAPI server is running", "modules": ["auth", "products", "orders", "analytics"]}


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/echo")
def echo_message(payload: Message):
    return {"echo": payload.message}


@app.post("/auth/register")
def register_user(payload: RegisterPayload):
    conn = get_conn()
    try:
        existing = conn.execute("SELECT 1 FROM users WHERE email = ?", (payload.email,)).fetchone()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        uid = str(uuid.uuid4())
        conn.execute(
            "INSERT INTO users (uid, email, password, name, created_at) VALUES (?, ?, ?, ?, datetime('now'))",
            (uid, payload.email, payload.password, payload.name),
        )
        conn.commit()
        token = str(uuid.uuid4())
        SESSION_TOKENS[token] = {"uid": uid, "email": payload.email, "name": payload.name}
        return {"ok": True, "token": token, "user": {"uid": uid, "email": payload.email, "name": payload.name}}
    finally:
        conn.close()


@app.post("/auth/login")
def login_user(payload: LoginPayload):
    conn = get_conn()
    try:
        row = conn.execute("SELECT uid, email, name FROM users WHERE email = ? AND password = ?", (payload.email, payload.password)).fetchone()
        if not row:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        token = str(uuid.uuid4())
        user = dict(row)
        SESSION_TOKENS[token] = user
        return {"ok": True, "token": token, "user": user}
    finally:
        conn.close()


@app.get("/auth/me")
def me(authorization: str | None = Header(default=None)):
    return {"user": authenticate(authorization)}


@app.get("/products")
def list_products():
    conn = get_conn()
    try:
        rows = conn.execute("SELECT * FROM products ORDER BY created_at DESC").fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()


@app.post("/products")
def create_product(payload: ProductPayload, authorization: str | None = Header(default=None)):
    authenticate(authorization)
    conn = get_conn()
    try:
        conn.execute(
            "INSERT INTO products (id, name, price, stock, description, badge, image, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))",
            (payload.id, payload.name, payload.price, payload.stock, payload.description, payload.badge, payload.image),
        )
        conn.commit()
        return {"ok": True, "product": payload.model_dump()}
    finally:
        conn.close()


@app.put("/products/{product_id}")
def update_product(product_id: str, payload: ProductPayload, authorization: str | None = Header(default=None)):
    authenticate(authorization)
    conn = get_conn()
    try:
        cur = conn.execute(
            "UPDATE products SET name=?, price=?, stock=?, description=?, badge=?, image=? WHERE id=?",
            (payload.name, payload.price, payload.stock, payload.description, payload.badge, payload.image, product_id),
        )
        conn.commit()
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Product not found")
        return {"ok": True, "product": payload.model_dump()}
    finally:
        conn.close()


@app.delete("/products/{product_id}")
def delete_product(product_id: str, authorization: str | None = Header(default=None)):
    authenticate(authorization)
    conn = get_conn()
    try:
        cur = conn.execute("DELETE FROM products WHERE id = ?", (product_id,))
        conn.commit()
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Product not found")
        return {"ok": True}
    finally:
        conn.close()


@app.get("/orders")
def list_orders():
    conn = get_conn()
    try:
        rows = conn.execute("SELECT * FROM orders ORDER BY created_at DESC").fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()


@app.post("/orders")
def create_order(payload: OrderPayload, authorization: str | None = Header(default=None)):
    authenticate(authorization)
    conn = get_conn()
    try:
        conn.execute(
            "INSERT INTO orders (id, user_id, customer, total, status, items, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))",
            (payload.id, payload.user_id, payload.customer, payload.total, payload.status, payload.items),
        )
        conn.commit()
        return {"ok": True, "order": payload.model_dump()}
    finally:
        conn.close()


@app.put("/orders/{order_id}")
def update_order(order_id: str, payload: OrderPayload, authorization: str | None = Header(default=None)):
    authenticate(authorization)
    conn = get_conn()
    try:
        cur = conn.execute(
            "UPDATE orders SET user_id=?, customer=?, total=?, status=?, items=? WHERE id=?",
            (payload.user_id, payload.customer, payload.total, payload.status, payload.items, order_id),
        )
        conn.commit()
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Order not found")
        return {"ok": True, "order": payload.model_dump()}
    finally:
        conn.close()


@app.delete("/orders/{order_id}")
def delete_order(order_id: str, authorization: str | None = Header(default=None)):
    authenticate(authorization)
    conn = get_conn()
    try:
        cur = conn.execute("DELETE FROM orders WHERE id = ?", (order_id,))
        conn.commit()
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Order not found")
        return {"ok": True}
    finally:
        conn.close()


@app.get("/analytics/overview")
def analytics_overview():
    conn = get_conn()
    try:
        revenue = conn.execute("SELECT COALESCE(SUM(total), 0) FROM orders").fetchone()[0]
        orders_count = conn.execute("SELECT COUNT(*) FROM orders").fetchone()[0]
        products_count = conn.execute("SELECT COUNT(*) FROM products").fetchone()[0]
        events_count = conn.execute("SELECT COUNT(*) FROM analytics_events").fetchone()[0]
        return {
            "revenue": float(revenue),
            "orders": orders_count,
            "products": products_count,
            "events": events_count,
        }
    finally:
        conn.close()


@app.get("/analytics/events")
def analytics_events():
    conn = get_conn()
    try:
        rows = conn.execute("SELECT * FROM analytics_events ORDER BY created_at DESC LIMIT 20").fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()


@app.post("/analytics/events")
def create_analytics_event(payload: AnalyticsEventPayload, authorization: str | None = Header(default=None)):
    authenticate(authorization)
    conn = get_conn()
    try:
        conn.execute(
            "INSERT INTO analytics_events (id, event_type, value, metadata, created_at) VALUES (?, ?, ?, ?, datetime('now'))",
            (payload.id, payload.event_type, payload.value, payload.metadata),
        )
        conn.commit()
        return {"ok": True, "event": payload.model_dump()}
    finally:
        conn.close()
