import asyncio
import httpx

async def run():
    async with httpx.AsyncClient() as client:
        resp = await client.post('http://localhost:8000/api/v1/auth/register', json={'name':'Test','email':'test1@test.com','password':'password123'})
        print(resp.status_code)
        print(resp.text)

asyncio.run(run())
