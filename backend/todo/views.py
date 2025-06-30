from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import os
from pymongo import MongoClient
from bson.objectid import ObjectId
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Connect to MongoDB Atlas
MONGO_URI = os.getenv('MONGO_URI')
client = MongoClient(MONGO_URI)
db = client['sample']           # Same name as in your URI
collection = db['todo']         # Collection to store tasks

@csrf_exempt
def task_list(request):
    if request.method == 'GET':
        tasks = list(collection.find())
        serialized_tasks = [
            {
                'id': str(task['_id']),
                'title': task['title'],
                'description': task.get('description', ''),
                'completed': task.get('completed', False)
            }
            for task in tasks
        ]
        return JsonResponse(serialized_tasks, safe=False)

    elif request.method == 'POST':
        data = json.loads(request.body)
        task = {
            'title': data.get('title'),
            'description': data.get('description', ''),
            'completed': False
        }
        result = collection.insert_one(task)
        task['_id'] = result.inserted_id
        return JsonResponse({
            'id': str(task['_id']),
            'title': task['title'],
            'description': task['description'],
            'completed': task['completed']
        }, status=201)

@csrf_exempt
def task_detail(request, task_id):
    if request.method == 'PUT':
        data = json.loads(request.body)
        result = collection.update_one(
            {'_id': ObjectId(task_id)},
            {'$set': {
                'title': data.get('title'),
                'description': data.get('description', ''),
                'completed': data.get('completed', False)
            }}
        )
        if result.modified_count == 1:
            return JsonResponse({'message': 'Task updated'}, status=200)
        else:
            return JsonResponse({'error': 'Task not found or not updated'}, status=404)

    elif request.method == 'DELETE':
        result = collection.delete_one({'_id': ObjectId(task_id)})
        if result.deleted_count == 1:
            return JsonResponse({'message': 'Task deleted'}, status=204)
        else:
            return JsonResponse({'error': 'Task not found'}, status=404)
