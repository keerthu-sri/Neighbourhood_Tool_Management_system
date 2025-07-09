from rest_framework import serializers
from .models import Tool
from apps.users.serializers import UserSerializer


class ToolSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Tool
        fields = ('id', 'name', 'image', 'image_url', 'category', 'condition', 'is_available', 'owner', 'created_at', 'updated_at')
        read_only_fields = ('id', 'owner', 'created_at', 'updated_at')
    
    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
        return None
    
    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)


class ToolCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tool
        fields = ('name', 'image', 'category', 'condition')
    
    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)