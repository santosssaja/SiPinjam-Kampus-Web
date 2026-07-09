import os
import sys

# Ensure the app module can be imported
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlmodel import Session, select
from app.db.session import engine, init_db
from app.models.user import User
from app.models.item import Item
from app.models.room import Room
from app.models.loan import Loan
from app.models.enums import UserRole, ResourceType, LoanStatus
from app.core.security import get_password_hash
from datetime import date, time, timedelta

def seed_data():
    init_db()
    with Session(engine) as session:
        # Check if users already exist to prevent duplicate seed
        user = session.exec(select(User)).first()
        if user:
            print("Database has already been seeded. Skipping.")
            return

        print("Seeding database...")

        # Create Admin
        admin = User(
            name="Admin Kampus",
            email="admin@kampus.ac.id",
            password_hash=get_password_hash("admin123"),
            role=UserRole.ADMIN
        )
        session.add(admin)

        # Create Normal Users
        user1 = User(
            name="Budi Mahasiswa",
            email="budi@kampus.ac.id",
            password_hash=get_password_hash("budi123"),
            role=UserRole.BORROWER
        )
        session.add(user1)

        user2 = User(
            name="Siti Dosen",
            email="siti@kampus.ac.id",
            password_hash=get_password_hash("siti123"),
            role=UserRole.BORROWER
        )
        session.add(user2)

        # Create Items
        items = [
            Item(code="IT-001", name="Proyektor Epson EB-X05", quantity=5, description="Proyektor resolusi XGA 3300 Lumens"),
            Item(code="IT-002", name="Kamera Canon EOS 60D", quantity=2, description="DSLR Camera dengan lensa kit 18-55mm"),
            Item(code="IT-003", name="Mikrofon Wireless Shure", quantity=10, description="Cocok untuk seminar dan kuliah umum"),
            Item(code="IT-004", name="Laser Pointer Logitech", quantity=15, description="Pointer presentasi wireless dengan timer"),
            Item(code="IT-005", name="Tripod Kamera Somita", quantity=3, description="Tripod kokoh untuk kamera DSLR/Mirrorless"),
            Item(code="IT-006", name="Kabel HDMI 10 Meter", quantity=8, description="Kabel HDMI panjang untuk aula besar"),
        ]
        for item in items:
            session.add(item)

        # Create Rooms
        rooms = [
            Room(code="R-101", name="Ruang Seminar A", capacity=100, description="Ruang seminar lengkap dengan sound system dan proyektor"),
            Room(code="R-102", name="Ruang Kelas Reguler 1", capacity=40, description="Ruang kelas standar untuk perkuliahan"),
            Room(code="R-103", name="Laboratorium Komputer 1", capacity=30, description="Lab komputasi dengan 30 PC i5 RAM 16GB"),
            Room(code="R-104", name="Laboratorium Fisika Dasar", capacity=25, description="Lab praktikum fisika dengan alat peraga lengkap"),
            Room(code="R-201", name="Aula Utama Gedung B", capacity=300, description="Aula luas untuk acara besar kampus"),
        ]
        for room in rooms:
            session.add(room)

        session.commit()

        # Add Loans (We need to refresh or get IDs first)
        session.refresh(admin)
        session.refresh(user1)
        session.refresh(user2)
        for item in items: session.refresh(item)
        for room in rooms: session.refresh(room)

        today = date.today()
        loans = [
            # Pending Loan for Budi
            Loan(
                borrower_id=user1.id,
                resource_type=ResourceType.ITEM,
                resource_id=items[0].id,
                date=today,
                start_time=time(10, 0),
                end_time=time(12, 0),
                purpose="Presentasi Tugas Akhir",
                status=LoanStatus.PENDING
            ),
            # Approved Loan for Siti (Room)
            Loan(
                borrower_id=user2.id,
                resource_type=ResourceType.ROOM,
                resource_id=rooms[0].id,
                date=today,
                start_time=time(13, 0),
                end_time=time(15, 0),
                purpose="Kuliah Umum Dosen Tamu",
                status=LoanStatus.APPROVED,
                approved_by=admin.id
            ),
            # Completed Loan for Budi (Yesterday)
            Loan(
                borrower_id=user1.id,
                resource_type=ResourceType.ITEM,
                resource_id=items[1].id,
                date=today - timedelta(days=1),
                start_time=time(8, 0),
                end_time=time(16, 0),
                purpose="Dokumentasi Acara Kampus",
                status=LoanStatus.COMPLETED,
                approved_by=admin.id
            ),
            # Rejected Loan for Siti
            Loan(
                borrower_id=user2.id,
                resource_type=ResourceType.ITEM,
                resource_id=items[5].id,
                date=today,
                start_time=time(9, 0),
                end_time=time(10, 0),
                purpose="Coba kabel untuk di rumah",
                status=LoanStatus.REJECTED,
                approved_by=admin.id,
                rejection_reason="Tidak diizinkan membawa pulang kabel ke rumah, peminjaman dibatasi area kampus."
            )
        ]
        
        for loan in loans:
            session.add(loan)

        session.commit()

        print("Database seeded successfully with Users, Items, Rooms, and Loans!")
        print("---")
        print("Admin Login: admin@kampus.ac.id / admin123")
        print("User Login : budi@kampus.ac.id / budi123")
        print("---")

if __name__ == "__main__":
    seed_data()
