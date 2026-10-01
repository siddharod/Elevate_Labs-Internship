from django.contrib import admin
from .models import SharedProject

@admin.register(SharedProject)
class SharedProjectAdmin(admin.ModelAdmin):
    list_display = ('snapshot_name', 'share_id', 'author_username', 'snapshot_language', 'views_count', 'created_at')
    search_fields = ('share_id', 'snapshot_name', 'author_username')
