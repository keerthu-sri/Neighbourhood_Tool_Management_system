from django.urls import path
from . import views

urlpatterns = [
    path('', views.borrow_request_list, name='borrow_request_list'),
    path('incoming/', views.incoming_requests, name='incoming_requests'),
    path('stats/', views.request_stats, name='request_stats'),
    path('notifications/', views.notifications, name='notifications'),
    path('notifications/read/', views.mark_notifications_read, name='mark_notifications_read'),
    path('<int:pk>/approve/', views.approve_request, name='approve_request'),
    path('<int:pk>/reject/', views.reject_request, name='reject_request'),
    path('<int:pk>/returned/', views.mark_returned, name='mark_returned'),
     path('borrowed/', views.borrowed_tools_view, name='borrowed-tools'),
    path('lent/', views.lent_tools_view, name='lent-tools'),

]