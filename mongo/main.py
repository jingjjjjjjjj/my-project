from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from models import Todo
from database import collection
from typing import List
from bson import ObjectId

app = FastAPI()

app.mount("/static", StaticFiles(directory="../static"), name="static")
templates = Jinja2Templates(directory="../templates")

# Helper to convert ObjectId to string
def todo_helper(todo) -> dict:
    return {
        "id": str(todo["_id"]),
        "name": todo["name"],
        "description": todo["description"],
        "completed": todo["completed"],
    }

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/todos/", response_model=dict)
def create_todo(todo: Todo):
    todo_dict = todo.dict()
    result = collection.insert_one(todo_dict)
    if result.inserted_id:
        # Retrieve the created document to return it with the ID
        created_todo = collection.find_one({"_id": result.inserted_id})
        return todo_helper(created_todo)
    raise HTTPException(status_code=400, detail="Todo could not be created")

@app.get("/todos/", response_model=List[dict])
def read_todos():
    todos = []
    for todo in collection.find():
        todos.append(todo_helper(todo))
    return todos

@app.put("/todos/{todo_id}")
def update_todo(todo_id: str, todo_data: Todo):
    if not ObjectId.is_valid(todo_id):
        raise HTTPException(status_code=400, detail=f"Invalid ObjectId: {todo_id}")

    result = collection.update_one(
        {"_id": ObjectId(todo_id)},
        {"$set": todo_data.dict(exclude_unset=True)}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail=f"Todo with id {todo_id} not found")

    if result.modified_count == 0:
        # This could mean the data sent was the same as the existing data
        return {"message": "No changes were made to the todo item."}

    updated_todo = collection.find_one({"_id": ObjectId(todo_id)})
    return todo_helper(updated_todo)

@app.delete("/todos/{todo_id}")
def delete_todo(todo_id: str):
    if not ObjectId.is_valid(todo_id):
        raise HTTPException(status_code=400, detail=f"Invalid ObjectId: {todo_id}")

    result = collection.delete_one({"_id": ObjectId(todo_id)})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail=f"Todo with id {todo_id} not found")

    return {"message": f"Todo with id {todo_id} has been deleted."}
