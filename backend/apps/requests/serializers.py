from rest_framework import serializers
from .models import BorrowRequest
from apps.tools.serializers import ToolSerializer
from apps.users.serializers import UserSerializer


class BorrowRequestSerializer(serializers.ModelSerializer):
    tool = ToolSerializer(read_only=True)
    borrower = UserSerializer(read_only=True)
    is_overdue = serializers.ReadOnlyField()
    
    class Meta:
        model = BorrowRequest
        fields = ('id', 'tool', 'borrower', 'reason', 'duration', 'status', 'return_date', 
                 'created_at', 'updated_at', 'owner_notified', 'borrower_notified', 'is_overdue')
        read_only_fields = ('id', 'borrower', 'created_at', 'updated_at', 'return_date')


class BorrowRequestCreateSerializer(serializers.ModelSerializer):
    tool_id = serializers.IntegerField()
    
    class Meta:
        model = BorrowRequest
        fields = ('tool_id', 'reason', 'duration')
    
    def validate_tool_id(self, value):
        from apps.tools.models import Tool
        try:
            tool = Tool.objects.get(id=value, is_available=True)
            if tool.owner == self.context['request'].user:
                raise serializers.ValidationError("You cannot borrow your own tool")
            return value
        except Tool.DoesNotExist:
            raise serializers.ValidationError("Tool not found or not available")
    
    def validate_duration(self, value):
        if value < 1 or value > 30:
            raise serializers.ValidationError("Duration must be between 1 and 30 days")
        return value
    
    def create(self, validated_data):
        from apps.tools.models import Tool
        tool_id = validated_data.pop('tool_id')
        tool = Tool.objects.get(id=tool_id)
        
        # Check if user already has a pending request for this tool
        existing_request = BorrowRequest.objects.filter(
            tool=tool,
            borrower=self.context['request'].user,
            status='pending'
        ).exists()
        
        if existing_request:
            raise serializers.ValidationError("You already have a pending request for this tool")
        
        validated_data['tool'] = tool
        validated_data['borrower'] = self.context['request'].user
        return super().create(validated_data)


class BorrowRequestUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BorrowRequest
        fields = ('status',)
    
    def validate_status(self, value):
        if value not in ['approved', 'rejected']:
            raise serializers.ValidationError("Status can only be 'approved' or 'rejected'")
        return value