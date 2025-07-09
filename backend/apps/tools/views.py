from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from .models import Tool
from .serializers import ToolSerializer, ToolCreateSerializer


class ToolPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50


@api_view(['GET', 'POST'])
def tool_list(request):
    if request.method == 'GET':
        # Get all available tools from other users
        tools = Tool.objects.filter(is_available=True).exclude(owner=request.user)
        
        # Apply pagination
        paginator = ToolPagination()
        page = paginator.paginate_queryset(tools, request)
        
        if page is not None:
            serializer = ToolSerializer(page, many=True, context={'request': request})
            return paginator.get_paginated_response(serializer.data)
        
        serializer = ToolSerializer(tools, many=True, context={'request': request})
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = ToolCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            tool = serializer.save()
            response_serializer = ToolSerializer(tool, context={'request': request})
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def my_tools(request):
    tools = Tool.objects.filter(owner=request.user)
    serializer = ToolSerializer(tools, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET', 'PUT', 'DELETE'])
def tool_detail(request, pk):
    tool = get_object_or_404(Tool, pk=pk, owner=request.user)
    
    if request.method == 'GET':
        serializer = ToolSerializer(tool, context={'request': request})
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = ToolCreateSerializer(tool, data=request.data, context={'request': request})
        if serializer.is_valid():
            tool = serializer.save()
            response_serializer = ToolSerializer(tool, context={'request': request})
            return Response(response_serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        tool.delete()
        return Response({'message': 'Tool deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
def tool_stats(request):
    total_tools = Tool.objects.count()
    available_tools = Tool.objects.filter(is_available=True).count()
    my_tools_count = Tool.objects.filter(owner=request.user).count()
    
    return Response({
        'total_tools': total_tools,
        'available_tools': available_tools,
        'my_tools': my_tools_count,
    })