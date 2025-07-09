from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta


class BorrowRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('returned', 'Returned'),
    ]
    
    tool = models.ForeignKey('tools.Tool', on_delete=models.CASCADE, related_name='borrow_requests')
    borrower = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='borrow_requests')
    reason = models.TextField()
    duration = models.PositiveIntegerField(help_text="Duration in days")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    return_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    owner_notified = models.BooleanField(default=False)
    borrower_notified = models.BooleanField(default=False)
    
    def save(self, *args, **kwargs):
        # Set return date when request is approved
        if self.status == 'approved' and not self.return_date:
            self.return_date = timezone.now().date() + timedelta(days=self.duration)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.borrower.username} wants to borrow {self.tool.name}"
    
    @property
    def is_overdue(self):
        if self.return_date and self.status == 'approved':
            return timezone.now().date() > self.return_date
        return False
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Borrow Request'
        verbose_name_plural = 'Borrow Requests'
        unique_together = ['tool', 'borrower', 'status']  # Prevent duplicate pending requests