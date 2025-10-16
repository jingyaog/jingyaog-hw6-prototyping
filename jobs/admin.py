from django.contrib import admin
from .models import Job


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ['filename', 'status', 'created_at', 'updated_at', 'retry_count']
    list_filter = ['status', 'created_at']
    search_fields = ['filename']
    readonly_fields = ['id', 'created_at', 'updated_at']
