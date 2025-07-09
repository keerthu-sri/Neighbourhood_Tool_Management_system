from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.requests.models import BorrowRequest
from apps.tools.serializers import ToolSerializer
from django.contrib.auth import get_user_model
from apps.tools.models import Tool

from django.shortcuts import get_object_or_404
from .models import BorrowRequest
from .serializers import (
    BorrowRequestSerializer, 
    BorrowRequestCreateSerializer, 
    BorrowRequestUpdateSerializer
)


class RequestPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50


@api_view(['GET', 'POST'])
def borrow_request_list(request):
    if request.method == 'GET':
        # Get user's borrow requests
        requests = BorrowRequest.objects.filter(borrower=request.user)
        
        # Apply pagination
        paginator = RequestPagination()
        page = paginator.paginate_queryset(requests, request)
        
        if page is not None:
            serializer = BorrowRequestSerializer(page, many=True, context={'request': request})
            return paginator.get_paginated_response(serializer.data)
        
        serializer = BorrowRequestSerializer(requests, many=True, context={'request': request})
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = BorrowRequestCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            borrow_request = serializer.save()
            response_serializer = BorrowRequestSerializer(borrow_request, context={'request': request})
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def incoming_requests(request):
    # Get requests for user's tools
    requests = BorrowRequest.objects.filter(tool__owner=request.user)
    
    # Apply pagination
    paginator = RequestPagination()
    page = paginator.paginate_queryset(requests, request)
    
    if page is not None:
        serializer = BorrowRequestSerializer(page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)
    
    serializer = BorrowRequestSerializer(requests, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
def approve_request(request, pk):
    borrow_request = get_object_or_404(
        BorrowRequest, 
        pk=pk, 
        tool__owner=request.user, 
        status='pending'
    )
    
    # Update tool availability
    borrow_request.tool.is_available = False
    borrow_request.tool.save()
    
    # Update request status
    serializer = BorrowRequestUpdateSerializer(
        borrow_request, 
        data={'status': 'approved'}, 
        context={'request': request}
    )
    
    if serializer.is_valid():
        borrow_request = serializer.save()
        borrow_request.borrower_notified = False  # Reset notification flag
        borrow_request.save()
        
        response_serializer = BorrowRequestSerializer(borrow_request, context={'request': request})
        return Response({
            'message': 'Request approved successfully',
            'request': response_serializer.data
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def reject_request(request, pk):
    borrow_request = get_object_or_404(
        BorrowRequest, 
        pk=pk, 
        tool__owner=request.user, 
        status='pending'
    )
    
    serializer = BorrowRequestUpdateSerializer(
        borrow_request, 
        data={'status': 'rejected'}, 
        context={'request': request}
    )
    
    if serializer.is_valid():
        borrow_request = serializer.save()
        borrow_request.borrower_notified = False  # Reset notification flag
        borrow_request.save()
        
        response_serializer = BorrowRequestSerializer(borrow_request, context={'request': request})
        return Response({
            'message': 'Request rejected successfully',
            'request': response_serializer.data
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def mark_returned(request, pk):
    borrow_request = get_object_or_404(
        BorrowRequest, 
        pk=pk, 
        tool__owner=request.user, 
        status='approved'
    )
    
    # Mark tool as available again
    borrow_request.tool.is_available = True
    borrow_request.tool.save()
    
    # Update request status
    borrow_request.status = 'returned'
    borrow_request.save()
    
    serializer = BorrowRequestSerializer(borrow_request, context={'request': request})
    return Response({
        'message': 'Tool marked as returned successfully',
        'request': serializer.data
    })


@api_view(['GET'])
def request_stats(request):
    total_requests = BorrowRequest.objects.filter(borrower=request.user).count()
    pending_requests = BorrowRequest.objects.filter(borrower=request.user, status='pending').count()
    approved_requests = BorrowRequest.objects.filter(borrower=request.user, status='approved').count()
    incoming_pending = BorrowRequest.objects.filter(tool__owner=request.user, status='pending').count()
    
    return Response({
        'total_requests': total_requests,
        'pending_requests': pending_requests,
        'approved_requests': approved_requests,
        'incoming_pending': incoming_pending,
    })


@api_view(['GET'])
def notifications(request):
    # Get unread notifications for the user
    new_approvals = BorrowRequest.objects.filter(
        borrower=request.user,
        status__in=['approved', 'rejected'],
        borrower_notified=False
    ).count()
    
    new_requests = BorrowRequest.objects.filter(
        tool__owner=request.user,
        status='pending',
        owner_notified=False
    ).count()
    
    return Response({
        'new_approvals': new_approvals,
        'new_requests': new_requests,
        'total_notifications': new_approvals + new_requests
    })


@api_view(['POST'])
def mark_notifications_read(request):
    # Mark borrower notifications as read
    BorrowRequest.objects.filter(
        borrower=request.user,
        borrower_notified=False
    ).update(borrower_notified=True)
    
    # Mark owner notifications as read
    BorrowRequest.objects.filter(
        tool__owner=request.user,
        owner_notified=False
    ).update(owner_notified=True)
    
    return Response({'message': 'Notifications marked as read'})

@api_view(['GET'])
#@permission_classes([IsAuthenticated])
def lent_tools_view(request):
    lent_requests = BorrowRequest.objects.filter(tool__owner=request.user)
    serializer = BorrowRequestSerializer(lent_requests, many=True, context={'request': request})
    return Response({'results': serializer.data})


# views.py


@api_view(['GET'])
#@permission_classes([IsAuthenticated])
def borrowed_tools_view(request):
    borrowed = BorrowRequest.objects.filter(borrower=request.user)
    serializer = BorrowRequestSerializer(borrowed, many=True, context={'request': request})
    return Response({'results': serializer.data})

@api_view(['GET'])
def request_stats(request):
    total_requests = BorrowRequest.objects.all().count()
    total_users = get_user_model().objects.count()
    total_tools = Tool.objects.count()
    total_lent = BorrowRequest.objects.filter(tool__owner=request.user).count()
    total_borrowed = BorrowRequest.objects.filter(borrower=request.user).count()

    return Response({
        'total_requests': total_requests,
        'total_users': total_users,
        'total_tools': total_tools,
        'total_lent': total_lent,
        'total_borrowed': total_borrowed,
    })
