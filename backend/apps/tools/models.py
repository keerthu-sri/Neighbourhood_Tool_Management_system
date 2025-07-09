from django.db import models
from django.conf import settings
import os


def tool_image_upload_path(instance, filename):
    """Generate upload path for tool images"""
    return f'tools/{instance.owner.id}/{filename}'


class Tool(models.Model):
    CATEGORY_CHOICES = [
        ('Power Tools', 'Power Tools'),
        ('Hand Tools', 'Hand Tools'),
        ('Garden Tools', 'Garden Tools'),
        ('Cleaning', 'Cleaning'),
        ('Automotive', 'Automotive'),
        ('Measuring', 'Measuring'),
        ('Other', 'Other'),
    ]
    
    CONDITION_CHOICES = [
        ('Excellent', 'Excellent'),
        ('Very Good', 'Very Good'),
        ('Good', 'Good'),
        ('Fair', 'Fair'),
    ]
    
    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to=tool_image_upload_path, blank=True, null=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES)
    is_available = models.BooleanField(default=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tools')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - {self.owner.username}"
    
    def delete(self, *args, **kwargs):
        # Delete image file when tool is deleted
        if self.image:
            if os.path.isfile(self.image.path):
                os.remove(self.image.path)
        super().delete(*args, **kwargs)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Tool'
        verbose_name_plural = 'Tools'