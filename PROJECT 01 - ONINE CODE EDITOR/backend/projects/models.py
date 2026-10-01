from django.db import models
from django.contrib.auth.models import User


class Project(models.Model):
    LANGUAGE_CHOICES = [
        ('html', 'HTML'),
        ('css', 'CSS'),
        ('javascript', 'JavaScript'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    language = models.CharField(max_length=50, choices=LANGUAGE_CHOICES, default='html')
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.name} ({self.language}) by {self.user.username}"

    def create_snapshot_version(self, message="Saved version", user=None):
        """Creates a snapshot version of all files in this project."""
        latest_version = self.versions.order_by('-version_number').first()
        next_ver_num = (latest_version.version_number + 1) if latest_version else 1

        version = ProjectVersion.objects.create(
            project=self,
            version_number=next_ver_num,
            message=message,
            created_by=user or self.user
        )

        for pfile in self.files.all():
            ProjectVersionFile.objects.create(
                version=version,
                filename=pfile.filename,
                language=pfile.language,
                content=pfile.content
            )
        return version


class ProjectFile(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='files')
    filename = models.CharField(max_length=255)
    language = models.CharField(max_length=50, default='javascript')
    content = models.TextField(blank=True, default='')
    is_main = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('project', 'filename')
        ordering = ['-is_main', 'filename']

    def __str__(self):
        return f"{self.project.name} / {self.filename}"


class ProjectVersion(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='versions')
    version_number = models.PositiveIntegerField()
    message = models.CharField(max_length=255, default='Saved version')
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        ordering = ['-version_number']
        unique_together = ('project', 'version_number')

    def __str__(self):
        return f"{self.project.name} - Version {self.version_number} ({self.message})"


class ProjectVersionFile(models.Model):
    version = models.ForeignKey(ProjectVersion, on_delete=models.CASCADE, related_name='files')
    filename = models.CharField(max_length=255)
    language = models.CharField(max_length=50, default='javascript')
    content = models.TextField(blank=True, default='')

    def __str__(self):
        return f"v{self.version.version_number} - {self.filename}"


class CodingActivity(models.Model):
    ACTIVITY_CHOICES = [
        ('project_created', 'Created Project'),
        ('project_saved', 'Saved Project'),
        ('code_executed', 'Ran Code'),
        ('version_restored', 'Restored Version'),
        ('project_shared', 'Shared Project'),
        ('project_downloaded', 'Downloaded Project'),
        ('challenge_passed', 'Completed Challenge'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True)
    activity_type = models.CharField(max_length=50, choices=ACTIVITY_CHOICES)
    description = models.CharField(max_length=255)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username}: {self.description} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"
