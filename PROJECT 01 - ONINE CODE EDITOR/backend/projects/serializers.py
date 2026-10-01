from rest_framework import serializers
from .models import Project, ProjectFile, ProjectVersion, ProjectVersionFile, CodingActivity


class ProjectFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectFile
        fields = ['id', 'project', 'filename', 'language', 'content', 'is_main', 'created_at', 'updated_at']
        read_only_fields = ['id', 'project', 'created_at', 'updated_at']


class ProjectVersionFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectVersionFile
        fields = ['id', 'filename', 'language', 'content']


class ProjectVersionSerializer(serializers.ModelSerializer):
    files = ProjectVersionFileSerializer(many=True, read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = ProjectVersion
        fields = ['id', 'version_number', 'message', 'created_at', 'created_by_username', 'files']


class ProjectSerializer(serializers.ModelSerializer):
    files = ProjectFileSerializer(many=True, read_only=True)
    author_username = serializers.CharField(source='user.username', read_only=True)
    versions_count = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id', 'author_username', 'name', 'description', 'language',
            'is_public', 'created_at', 'updated_at', 'files', 'versions_count'
        ]
        read_only_fields = ['id', 'author_username', 'created_at', 'updated_at']

    def get_versions_count(self, obj):
        return obj.versions.count()


class CodingActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = CodingActivity
        fields = ['id', 'activity_type', 'description', 'metadata', 'created_at']
