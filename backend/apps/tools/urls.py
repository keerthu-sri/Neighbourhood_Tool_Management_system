from django.urls import path
from . import views

urlpatterns = [
    path('', views.tool_list, name='tool_list'),
    path('my-tools/', views.my_tools, name='my_tools'),
    path('stats/', views.tool_stats, name='tool_stats'),
    path('<int:pk>/', views.tool_detail, name='tool_detail'),
]