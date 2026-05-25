import asyncio
import json
import random
from datetime import datetime
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Enable CORS so your React app can communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PRODUCTS = [
    {"name": "Wireless Headphones", "category": "Electronics", "price": 99.99},
    {"name": "Ergonomic Office Chair", "category": "Furniture", "price": 249.99},
    {"name": "Running Shoes", "category": "Apparel", "price": 85.00},
    {"name": "Mechanical Keyboard", "category": "Electronics", "price": 120.50},
    {"name": "Hydro Flask Water Bottle", "category": "Home & Kitchen", "price": 42.00},
]

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("Frontend client connected to live data stream!")
    
    try:
        while True:
            # Generate a simulated live purchase event
            product = random.choice(PRODUCTS)
            quantity = random.randint(1, 3)
            total_price = round(product["price"] * quantity, 2)
            
            event_data = {
                "timestamp": datetime.now().strftime("%H:%M:%S"),
                "product_name": product["name"],
                "category": product["category"],
                "quantity": quantity,
                "revenue": total_price,
            }
            
            # Broadcast the live transaction data to the frontend
            await websocket.send_text(json.dumps(event_data))
            
            # Control stream speed (sends 1 transaction every 1.5 seconds)
            await asyncio.sleep(1.5)
            
    except Exception as e:
        print(f"Client disconnected or error occurred: {e}")
    finally:
        await websocket.close()