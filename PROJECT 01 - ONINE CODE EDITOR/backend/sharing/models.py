import secrets
from django.db import models
from projects.models import Project


class SharedProject(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='shares')
    share_id = models.CharField(max_length=64, unique=True, db_index=True)
    snapshot_name = models.CharField(max_length=255)
    snapshot_language = models.CharField(max_length=50, default='html')
    snapshot_files = models.JSONField(default=list)  # list of {filename, language, content, is_main}
    author_username = models.CharField(max_length=150)
    is_public = models.BooleanField(default=True)
    views_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    @classmethod
    def create_from_project(cls, project):
        share_id = secrets.token_urlsafe(8)
        files_data = [
            {
                'filename': f.filename,
                'language': f.language,
                'content': f.content,
                'is_main': f.is_main,
            }
            for f in project.files.all()
        ]
        return cls.objects.create(
            project=project,
            share_id=share_id,
            snapshot_name=project.name,
            snapshot_language=project.language,
            snapshot_files=files_data,
            author_username=project.user.username,
            is_public=True
        )

    def __str__(self):
        return f"Share: {self.snapshot_name} ({self.share_id})"
