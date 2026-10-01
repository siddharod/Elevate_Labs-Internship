from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Project, ProjectFile, ProjectVersion, CodingActivity
from .serializers import (
    ProjectSerializer, ProjectFileSerializer,
    ProjectVersionSerializer, CodingActivitySerializer
)
from accounts.views import grant_badge_if_not_earned


DEFAULT_STARTER_FILES = {
    'html': [
        {
            'filename': 'index.html',
            'language': 'html',
            'is_main': True,
            'content': """<!DOCTYPE html>
<html>
<head>
    <title>CodeBuddy</title>
</head>
<body>
    <div class="card">
        <h1>Hello CodeBuddy!</h1>
        <p>Start building your first webpage.</p>
        <button onclick="changeMessage()">Click Me</button>
    </div>
</body>
</html>"""
        },
        {
            'filename': 'style.css',
            'language': 'css',
            'is_main': False,
            'content': """body {
    margin: 0;
    font-family: Arial, sans-serif;
    background: linear-gradient(135deg, #fff8f0, #ffebf3);
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}

.card {
    background: white;
    padding: 40px;
    border-radius: 20px;
    text-align: center;
}

h1 {
    color: #a259ff;
}

button {
    padding: 12px 20px;
    border: none;
    border-radius: 12px;
    cursor: pointer;
}"""
        },
        {
            'filename': 'script.js',
            'language': 'javascript',
            'is_main': False,
            'content': """function changeMessage() {
    alert("Great job! You are coding!");
}"""
        }
    ],
    'css': [
        {
            'filename': 'style.css',
            'language': 'css',
            'is_main': True,
            'content': """body {
    margin: 0;
    font-family: Arial, sans-serif;
    background: linear-gradient(135deg, #fff8f0, #ffebf3);
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}

.card {
    background: white;
    padding: 40px;
    border-radius: 20px;
    text-align: center;
}

h1 {
    color: #a259ff;
}

button {
    padding: 12px 20px;
    border: none;
    border-radius: 12px;
    cursor: pointer;
}"""
        }
    ],
    'javascript': [
        {
            'filename': 'script.js',
            'language': 'javascript',
            'is_main': True,
            'content': """function changeMessage() {
    alert("Great job! You are coding!");
}"""
        }
    ]
}


class ProjectListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        projects = Project.objects.filter(user=request.user).prefetch_related('files')
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)

    def post(self, request):
        name = request.data.get('name', 'My Awesome Project')
        description = request.data.get('description', '')
        language = request.data.get('language', 'html')
        custom_files = request.data.get('files', None)

        project = Project.objects.create(
            user=request.user,
            name=name,
            description=description,
            language=language
        )

        # Seed files
        if custom_files and isinstance(custom_files, list):
            for f in custom_files:
                ProjectFile.objects.create(
                    project=project,
                    filename=f.get('filename', 'untitled.txt'),
                    language=f.get('language', language),
                    content=f.get('content', ''),
                    is_main=f.get('is_main', False)
                )
        else:
            starters = DEFAULT_STARTER_FILES.get(language, DEFAULT_STARTER_FILES['html'])
            for f in starters:
                ProjectFile.objects.create(
                    project=project,
                    filename=f['filename'],
                    language=f['language'],
                    content=f['content'],
                    is_main=f['is_main']
                )

        # Create initial snapshot version
        project.create_snapshot_version(message="Initial Project Setup", user=request.user)

        # Log Activity
        CodingActivity.objects.create(
            user=request.user,
            project=project,
            activity_type='project_created',
            description=f"Created new project: {project.name}"
        )

        # Check badges
        user_projects_count = Project.objects.filter(user=request.user).count()
        if user_projects_count == 1:
            grant_badge_if_not_earned(request.user, 'first_project')
        elif user_projects_count >= 5:
            grant_badge_if_not_earned(request.user, 'project_builder')

        return Response(ProjectSerializer(project).data, status=status.HTTP_201_CREATED)


class ProjectDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk, user):
        return get_object_or_404(Project.objects.prefetch_related('files'), pk=pk, user=user)

    def get(self, request, pk):
        project = self.get_object(pk, request.user)
        return Response(ProjectSerializer(project).data)

    def patch(self, request, pk):
        project = self.get_object(pk, request.user)
        name = request.data.get('name')
        description = request.data.get('description')
        is_public = request.data.get('is_public')
        language = request.data.get('language')

        if name:
            project.name = name
        if description is not None:
            project.description = description
        if is_public is not None:
            project.is_public = is_public
        if language and language in ['html', 'css', 'javascript']:
            project.language = language
        project.save()

        return Response(ProjectSerializer(project).data)

    def delete(self, request, pk):
        project = self.get_object(pk, request.user)
        project_name = project.name
        project.delete()
        return Response({"message": f"Project '{project_name}' deleted successfully."})


class ProjectDuplicateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        original = get_object_or_404(Project, pk=pk, user=request.user)
        clone = Project.objects.create(
            user=request.user,
            name=f"Copy of {original.name}",
            description=original.description,
            language=original.language,
            is_public=original.is_public
        )
        for orig_file in original.files.all():
            ProjectFile.objects.create(
                project=clone,
                filename=orig_file.filename,
                language=orig_file.language,
                content=orig_file.content,
                is_main=orig_file.is_main
            )
        clone.create_snapshot_version(message="Cloned project", user=request.user)
        return Response(ProjectSerializer(clone).data, status=status.HTTP_201_CREATED)


class ProjectSaveBatchView(APIView):
    """
    Saves multiple files at once with debounced save or manual Ctrl+S.
    Creates a version snapshot if create_version is True or changes are significant.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        project = get_object_or_404(Project, pk=pk, user=request.user)
        files_data = request.data.get('files', [])
        create_version = request.data.get('create_version', False)
        version_message = request.data.get('version_message', 'Saved changes')

        import json
        for f_data in files_data:
            if isinstance(f_data, str):
                try:
                    f_data = json.loads(f_data)
                except Exception:
                    continue
            if not isinstance(f_data, dict):
                continue
            fid = f_data.get('id')
            content = f_data.get('content')
            filename = f_data.get('filename')

            if fid:
                try:
                    pfile = ProjectFile.objects.get(id=fid, project=project)
                    if content is not None:
                        pfile.content = content
                    if filename:
                        pfile.filename = filename
                    pfile.save()
                except ProjectFile.DoesNotExist:
                    pass
            elif filename and content is not None:
                # New file added
                ProjectFile.objects.create(
                    project=project,
                    filename=filename,
                    language=f_data.get('language', 'javascript'),
                    content=content,
                    is_main=f_data.get('is_main', False)
                )

        project.save(update_fields=['updated_at'])

        version_data = None
        if create_version:
            new_version = project.create_snapshot_version(message=version_message, user=request.user)
            version_data = ProjectVersionSerializer(new_version).data
            CodingActivity.objects.create(
                user=request.user,
                project=project,
                activity_type='project_saved',
                description=f"Saved version {new_version.version_number} of {project.name}"
            )
            grant_badge_if_not_earned(request.user, 'first_save')

        return Response({
            "message": "Project saved successfully! ✓",
            "project": ProjectSerializer(project).data,
            "version": version_data
        })


class ProjectFileListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        project = get_object_or_404(Project, pk=pk, user=request.user)
        files = project.files.all()
        return Response(ProjectFileSerializer(files, many=True).data)

    def post(self, request, pk):
        project = get_object_or_404(Project, pk=pk, user=request.user)
        filename = request.data.get('filename', '').strip()
        language = request.data.get('language', 'javascript')
        content = request.data.get('content', '')

        if not filename:
            return Response({"error": "Filename is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Prevent path traversal
        if '..' in filename or filename.startswith('/') or filename.startswith('\\'):
            return Response({"error": "Invalid filename syntax."}, status=status.HTTP_400_BAD_REQUEST)

        if ProjectFile.objects.filter(project=project, filename=filename).exists():
            return Response({"error": f"A file named '{filename}' already exists in this project."}, status=status.HTTP_400_BAD_REQUEST)

        pfile = ProjectFile.objects.create(
            project=project,
            filename=filename,
            language=language,
            content=content
        )
        return Response(ProjectFileSerializer(pfile).data, status=status.HTTP_201_CREATED)


class ProjectFileDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, file_id):
        pfile = get_object_or_404(ProjectFile, id=file_id, project__user=request.user)
        filename = request.data.get('filename')
        content = request.data.get('content')
        language = request.data.get('language')

        if filename:
            filename = filename.strip()
            if '..' in filename or filename.startswith('/') or filename.startswith('\\'):
                return Response({"error": "Invalid filename syntax."}, status=status.HTTP_400_BAD_REQUEST)
            if ProjectFile.objects.filter(project=pfile.project, filename=filename).exclude(id=pfile.id).exists():
                return Response({"error": f"File '{filename}' already exists."}, status=status.HTTP_400_BAD_REQUEST)
            pfile.filename = filename

        if content is not None:
            pfile.content = content
        if language:
            pfile.language = language
        pfile.save()
        return Response(ProjectFileSerializer(pfile).data)

    def delete(self, request, file_id):
        pfile = get_object_or_404(ProjectFile, id=file_id, project__user=request.user)
        if pfile.project.files.count() <= 1:
            return Response({"error": "Cannot delete the only file in the project."}, status=status.HTTP_400_BAD_REQUEST)
        pfile.delete()
        return Response({"message": "File deleted successfully."})


class ProjectHistoryListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        project = get_object_or_404(Project, pk=pk, user=request.user)
        versions = project.versions.all()
        return Response(ProjectVersionSerializer(versions, many=True).data)


class ProjectHistoryDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk, version_number):
        project = get_object_or_404(Project, pk=pk, user=request.user)
        version = get_object_or_404(ProjectVersion, project=project, version_number=version_number)
        return Response(ProjectVersionSerializer(version).data)


class ProjectRestoreVersionView(APIView):
    """
    Restores the project to the given version without losing current work.
    First takes a snapshot of the current state, then overwrites the project files
    with the target version's contents, and creates a new version tagged 'Restored from Version X'.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk, version_number):
        project = get_object_or_404(Project, pk=pk, user=request.user)
        target_version = get_object_or_404(ProjectVersion, project=project, version_number=version_number)

        # 1. Snapshot current state before restore
        project.create_snapshot_version(
            message=f"Pre-restore backup before restoring v{version_number}",
            user=request.user
        )

        # 2. Delete existing files and recreate from target version files
        project.files.all().delete()
        for vfile in target_version.files.all():
            ProjectFile.objects.create(
                project=project,
                filename=vfile.filename,
                language=vfile.language,
                content=vfile.content,
                is_main=(vfile.filename in ['index.html', 'main.py', 'main.c', 'main.cpp', 'Main.java'])
            )

        # 3. Snapshot restored state as new version
        restored_version = project.create_snapshot_version(
            message=f"Restored from Version {version_number}",
            user=request.user
        )

        CodingActivity.objects.create(
            user=request.user,
            project=project,
            activity_type='version_restored',
            description=f"Restored {project.name} to version {version_number}"
        )

        return Response({
            "message": f"Project restored to Version {version_number} safely! ✨",
            "project": ProjectSerializer(project).data,
            "new_version": ProjectVersionSerializer(restored_version).data
        })


class CodingActivityListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        activities = CodingActivity.objects.filter(user=request.user)[:20]
        return Response(CodingActivitySerializer(activities, many=True).data)
