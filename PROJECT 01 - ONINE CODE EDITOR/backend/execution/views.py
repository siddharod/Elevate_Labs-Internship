from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .runner import ExecutionService
from projects.models import CodingActivity, Project
from accounts.views import grant_badge_if_not_earned

SUPPORTED_LANGUAGES = ['html', 'css', 'javascript', 'js']


class CodeExecutionView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        language = request.data.get('language', 'html').strip().lower()
        code = request.data.get('code', '')
        stdin = request.data.get('stdin', '')
        project_id = request.data.get('project_id')

        # Validate language - only HTML, CSS, JavaScript allowed
        if language not in SUPPORTED_LANGUAGES:
            return Response(
                {
                    "status": "error",
                    "stderr": f"Language '{language}' is not supported. Supported languages: HTML, CSS, JavaScript.",
                    "stdout": "",
                    "exit_code": 1,
                    "execution_time": 0,
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        result = ExecutionService.execute(language, code, stdin)

        # Log activity and reward badge if user is authenticated
        if request.user.is_authenticated:
            proj = None
            if project_id:
                try:
                    proj = Project.objects.get(id=project_id, user=request.user)
                except Project.DoesNotExist:
                    pass

            CodingActivity.objects.create(
                user=request.user,
                project=proj,
                activity_type='code_executed',
                description=f"Ran {language.upper()} code in browser sandbox",
                metadata={
                    "status": "client_side",
                    "time": result.get("execution_time", 0.05)
                }
            )
            grant_badge_if_not_earned(request.user, 'code_runner')

        return Response(result)
