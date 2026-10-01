from rest_framework import serializers
from .models import SharedProject


class SharedProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = SharedProject
        fields = [
            'id', 'share_id', 'snapshot_name', 'snapshot_language',
            'snapshot_files', 'author_username', 'is_public',
            'views_count', 'created_at'
        ]
        read_only_fields = fields
