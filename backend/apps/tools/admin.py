from django.contrib import admin
from .models import Tool


@admin.register(Tool)
class ToolAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'condition', 'is_available', 'owner', 'created_at')
    list_filter = ('category', 'condition', 'is_available', 'created_at')
    search_fields = ('name', 'owner__username', 'owner__email')
    list_editable = ('is_available',)
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Tool Information', {
            'fields': ('name', 'image', 'category', 'condition')
        }),
        ('Availability', {
            'fields': ('is_available', 'owner')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )