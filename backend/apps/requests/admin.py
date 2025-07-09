from django.contrib import admin
from .models import BorrowRequest


@admin.register(BorrowRequest)
class BorrowRequestAdmin(admin.ModelAdmin):
    list_display = ('tool', 'borrower', 'status', 'duration', 'return_date', 'created_at', 'is_overdue')
    list_filter = ('status', 'created_at', 'return_date')
    search_fields = ('tool__name', 'borrower__username', 'borrower__email')
    list_editable = ('status',)
    readonly_fields = ('created_at', 'updated_at', 'is_overdue')
    
    fieldsets = (
        ('Request Information', {
            'fields': ('tool', 'borrower', 'reason', 'duration')
        }),
        ('Status & Dates', {
            'fields': ('status', 'return_date')
        }),
        ('Notifications', {
            'fields': ('owner_notified', 'borrower_notified')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'is_overdue'),
            'classes': ('collapse',)
        }),
    )
    
    def is_overdue(self, obj):
        return obj.is_overdue
    is_overdue.boolean = True
    is_overdue.short_description = 'Overdue'