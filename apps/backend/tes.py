
import asyncio
from libsql_client import create_client

async def main():
    client = create_client(url="https://sipinjam-santosssaja.aws-ap-northeast-1.turso.io",auth_token="eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODQwNzUwOTgsImlkIjoiMDE5ZWZlZWQtZGQwMS03Y2FjLWJlZWEtYzA4YjU0OTg3ZWQxIiwia2lkIjoidmlFNkdpRVVoYk5rVjJKdnhEdkU5d3plbFZ0YzVZa2FYM1RUb1dtVlNKayIsInJpZCI6ImZjNTVhNTVlLTM1NGItNGVhYS1hM2FmLTkzMzE2YmZkYmZmNiJ9.u95ELuNHNjEzvbxgZPHMaWzIMYE1yNRT10KBYKTaG9P1V1tY5P0wl0aCjIMobkYzuah7tAelmKjQNjUGjvcPCw")

    rs = await client.execute("SELECT 1")
    print(rs)

    await client.close()

asyncio.run(main())
