from django.urls import path
from .views import task_list, task_detail

urlpatterns = [
    path('tasks/', task_list),                  # /api/tasks/
    path('tasks/<str:task_id>/', task_detail),  # /api/tasks/<id>/
]
