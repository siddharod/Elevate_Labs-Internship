from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import SharedProject
from .serializers import SharedProjectSerializer
from projects.models import Project, ProjectFile, CodingActivity
from accounts.views import grant_badge_if_not_earned


class ShareProjectCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, project_id):
        project = get_object_or_404(Project, id=project_id, user=request.user)
        shared = SharedProject.create_from_project(project)

        CodingActivity.objects.create(
            user=request.user,
            project=project,
            activity_type='project_shared',
            description=f"Created public share link for {project.name}",
            metadata={"share_id": shared.share_id}
        )
        grant_badge_if_not_earned(request.user, 'first_share')

        return Response(SharedProjectSerializer(shared).data, status=status.HTTP_201_CREATED)


class SharedProjectDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, share_id):
        shared = get_object_or_404(SharedProject, share_id=share_id, is_public=True)
        shared.views_count += 1
        shared.save(update_fields=['views_count'])
        return Response(SharedProjectSerializer(shared).data)


class RemixSharedProjectView(APIView):
    """Forks/remixes a shared project snapshot into the authenticated user's workspace."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, share_id):
        shared = get_object_or_404(SharedProject, share_id=share_id, is_public=True)

        new_project = Project.objects.create(
            user=request.user,
            name=f"{shared.snapshot_name} (Remix)",
            description=f"Remixed from @{shared.author_username}'s project",
            language=shared.snapshot_language
        )

        for file_data in shared.snapshot_files:
            ProjectFile.objects.create(
                project=new_project,
                filename=file_data.get('filename', 'file.txt'),
                language=file_data.get('language', shared.snapshot_language),
                content=file_data.get('content', ''),
                is_main=file_data.get('is_main', False)
            )

        new_project.create_snapshot_version(message="Remixed from shared project", user=request.user)

        CodingActivity.objects.create(
            user=request.user,
            project=new_project,
            activity_type='project_created',
            description=f"Remixed {shared.snapshot_name}"
        )

        return Response({
            "message": "Project remixed into your workspace! 🚀",
            "project_id": new_project.id
        }, status=status.HTTP_201_CREATED)
