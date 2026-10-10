from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from pwdlib import PasswordHash

from database import get_connection


router = APIRouter(prefix="/auth", tags=["Authentication"])

password_hash = PasswordHash.recommended()


class FarmerSignup(BaseModel):
    name: str
    email: str
    password: str
    phone: str | None = None
    location: str | None = None
class FarmerLogin(BaseModel):
    email: str
    password: str


@router.post("/signup")
def signup(data: FarmerSignup):

    connection = get_connection()

    existing_farmer = connection.execute(
        "SELECT id FROM farmers WHERE email = ?",   
        (data.email,)
    ).fetchone()

    if existing_farmer:
        connection.close()
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    hashed_password = password_hash.hash(data.password)

    connection.execute(
        """
        INSERT INTO farmers
        (name, email, password, phone, location)
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            data.name,
            data.email,
            hashed_password,
            data.phone,
            data.location
        )
    )

    connection.commit()
    connection.close()

    return {
        "message": "Farmer registered successfully"
    }
@router.post("/login")
def login(data: FarmerLogin):

    connection = get_connection()

    farmer = connection.execute(
        "SELECT * FROM farmers WHERE email = ?",
        (data.email,)
    ).fetchone()

    if not farmer:
        connection.close()
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not password_hash.verify(data.password, farmer["password"]):
        connection.close()
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    connection.close()

    return {
        "message": "Login successful",
        "farmer_id": farmer["id"],
        "name": farmer["name"],
        "email": farmer["email"]
    }
